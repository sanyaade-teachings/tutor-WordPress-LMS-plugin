import Button from '@TutorShared/atoms/Button';
import Checkbox from '@TutorShared/atoms/CheckBox';
import SVGIcon from '@TutorShared/atoms/SVGIcon';
import { borderRadius, colorTokens, shadow, spacing, zIndex } from '@TutorShared/config/styles';
import { Portal, usePortalPopover } from '@TutorShared/hooks/usePortalPopover';
import {
  type CategoryWithChildren,
  useCategoryListQuery,
  useCreateCategoryMutation,
} from '@TutorShared/services/category';
import type { FormControllerProps } from '@TutorShared/utils/form';
import { generateTree, getCategoryLeftBarHeight } from '@TutorShared/utils/util';
import { type SerializedStyles, css } from '@emotion/react';
import { produce } from 'immer';
import { useEffect, useState } from 'react';

import LoadingSpinner from '@TutorShared/atoms/LoadingSpinner';
import { isRTL } from '@TutorShared/config/constants';
import { typography } from '@TutorShared/config/typography';
import Show from '@TutorShared/controls/Show';
import { useFormWithGlobalError } from '@TutorShared/hooks/useFormWithGlobalError';
import { useIsScrolling } from '@TutorShared/hooks/useIsScrolling';
import { styleUtils } from '@TutorShared/utils/style-utils';
import { __ } from '@wordpress/i18n';
import { Controller, type FieldValues } from 'react-hook-form';

import FormFieldWrapper from './FormFieldWrapper';
import FormInput from './FormInput';
import FormMultiLevelSelect from './FormMultiLevelSelect';

interface FormMultiLevelInputProps extends FormControllerProps<number[]> {
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  helpText?: string;
  optionsWrapperStyle?: SerializedStyles;
}

const FormMultiLevelInput = ({
  label,
  field,
  fieldState,
  disabled,
  loading,
  placeholder,
  helpText,
  optionsWrapperStyle,
}: FormMultiLevelInputProps) => {
  const categoryListQuery = useCategoryListQuery();
  const createCategoryMutation = useCreateCategoryMutation();
  const [isOpen, setIsOpen] = useState(false);
  const { ref: scrollElementRef, isScrolling } = useIsScrolling<HTMLDivElement>();

  const form = useFormWithGlobalError<{
    name: string;
    parent: number | null;
  }>({
    shouldFocusError: true,
  });

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => {
        form.setFocus('name');
      }, 250);

      return () => {
        clearTimeout(timeout);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const { triggerRef, position, popoverRef } = usePortalPopover<HTMLDivElement, HTMLDivElement>({
    isOpen,
  });

  if (categoryListQuery.isLoading) {
    return <LoadingSpinner />;
  }

  const treeOptions = generateTree(categoryListQuery.data ?? []);

  const handleCreateCategory = (data: FieldValues) => {
    if (data.name) {
      createCategoryMutation.mutate({
        name: data.name,
        ...(data.parent && { parent: data.parent }),
      });

      form.reset();
      setIsOpen(false);
    }
  };

  return (
    <FormFieldWrapper
      label={label}
      field={field}
      fieldState={fieldState}
      loading={loading}
      placeholder={placeholder}
      helpText={helpText}
    >
      {() => {
        return (
          <>
            <div css={[styles.options, optionsWrapperStyle]}>
              <div css={styles.categoryListWrapper} ref={scrollElementRef}>
                <Show
                  when={treeOptions.length > 0}
                  fallback={<span css={styles.notFound}>{__('No categories found.', 'tutor')}</span>}
                >
                  {treeOptions.map((option, index) => (
                    <Branch
                      key={option.id}
                      disabled={disabled}
                      option={option}
                      value={field.value}
                      isLastChild={index === treeOptions.length - 1}
                      onChange={(id) => {
                        field.onChange(
                          produce(field.value, (draft) => {
                            if (Array.isArray(draft)) {
                              return draft.includes(id) ? draft.filter((item) => item !== id) : [...draft, id];
                            }
                            return [id];
                          }),
                        );
                      }}
                    />
                  ))}
                </Show>
              </div>

              <Show when={!disabled}>
                <div
                  ref={triggerRef}
                  css={styles.addButtonWrapper({ isActive: isScrolling, hasCategories: treeOptions.length > 0 })}
                >
                  <button disabled={disabled} type="button" css={styles.addNewButton} onClick={() => setIsOpen(true)}>
                    <SVGIcon width={24} height={24} name="plus" /> {__('Add', 'tutor')}
                  </button>
                </div>
              </Show>
            </div>

            <Portal isOpen={isOpen} onClickOutside={() => setIsOpen(false)} onEscape={() => setIsOpen(false)}>
              <div
                css={[styles.categoryFormWrapper, { [isRTL ? 'right' : 'left']: position.left, top: position.top }]}
                ref={popoverRef}
              >
                <Controller
                  name="name"
                  control={form.control}
                  rules={{
                    required: __('Category name is required', 'tutor'),
                  }}
                  render={(controllerProps) => (
                    <FormInput {...controllerProps} placeholder={__('Category name', 'tutor')} selectOnFocus />
                  )}
                />
                <Show when={treeOptions.length > 0}>
                  <Controller
                    name="parent"
                    control={form.control}
                    render={(controllerProps) => (
                      <FormMultiLevelSelect
                        {...controllerProps}
                        placeholder={__('Select parent', 'tutor')}
                        options={categoryListQuery.data ?? []}
                        clearable={!!controllerProps.field.value}
                      />
                    )}
                  />
                </Show>

                <div css={styles.categoryFormButtons}>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      setIsOpen(false);
                      form.reset();
                    }}
                  >
                    {__('Cancel', 'tutor')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    loading={createCategoryMutation.isPending}
                    onClick={form.handleSubmit(handleCreateCategory)}
                  >
                    {__('Ok', 'tutor')}
                  </Button>
                </div>
              </div>
            </Portal>
          </>
        );
      }}
    </FormFieldWrapper>
  );
};

export default FormMultiLevelInput;

interface BranchProps {
  option: CategoryWithChildren;
  value: number | number[];
  onChange: (item: number) => void;
  isLastChild: boolean;
  disabled?: boolean;
}

const getTotalNestedChildrenCount = (option: CategoryWithChildren): number => {
  return option.children.reduce((total, child) => total + getTotalNestedChildrenCount(child), option.children.length);
};

export const Branch = ({ option, value, onChange, isLastChild, disabled }: BranchProps) => {
  const totalChildren = getTotalNestedChildrenCount(option);
  const hasChildren = totalChildren > 0;

  const leftBarHeight = getCategoryLeftBarHeight(isLastChild, totalChildren);

  const renderBranches = () => {
    if (!hasChildren) {
      return null;
    }

    return option.children.map((child, idx) => {
      return (
        <Branch
          key={child.id}
          option={child}
          value={value}
          onChange={onChange}
          isLastChild={idx === option.children.length - 1}
          disabled={disabled}
        />
      );
    });
  };

  return (
    <div css={styles.branchItem({ leftBarHeight, hasParent: option.parent !== 0 })}>
      <Checkbox
        checked={Array.isArray(value) ? value.includes(option.id) : value === option.id}
        label={option.name}
        onChange={() => {
          onChange(option.id);
        }}
        labelCss={styles.checkboxLabel}
        disabled={disabled}
      />

      {renderBranches()}
    </div>
  );
};

const styles = {
  options: css`
    border: 1px solid ${colorTokens.stroke.default};
    border-radius: ${borderRadius[8]};
    padding: ${spacing[8]} 0;
    background-color: ${colorTokens.bg.white};
  `,
  categoryListWrapper: css`
    ${styleUtils.overflowYAuto};
    max-height: 208px;
  `,
  notFound: css`
    ${styleUtils.display.flex()};
    align-items: center;
    ${typography.caption('regular')};
    padding: ${spacing[8]} ${spacing[16]};
    color: ${colorTokens.text.hints};
  `,
  checkboxLabel: css`
    line-height: 1.88rem !important;
  `,
  branchItem: ({ leftBarHeight, hasParent }: { leftBarHeight: string; hasParent: boolean }) => css`
    line-height: ${spacing[32]};
    position: relative;
    z-index: ${zIndex.positive};
    margin-left: ${spacing[20]};

    &:after {
      content: '';
      position: absolute;
      height: ${leftBarHeight};
      width: 1px;
      left: 9px;
      top: 26px;
      background-color: ${colorTokens.stroke.divider};
      z-index: ${zIndex.level};
    }

    ${hasParent &&
    css`
      &:before {
        content: '';
        position: absolute;
        height: 1px;
        width: 10px;
        left: -10px;
        top: ${spacing[16]};

        background-color: ${colorTokens.stroke.divider};
        z-index: ${zIndex.level};
      }
    `}
  `,
  addNewButton: css`
    ${styleUtils.resetButton};
    color: ${colorTokens.brand.blue};
    padding: 0 ${spacing[8]};
    display: flex;
    align-items: center;
    border-radius: ${borderRadius[2]};

    &:focus,
    &:active,
    &:hover {
      background: none;
      color: ${colorTokens.brand.blue};
    }

    &:focus-visible {
      outline: 2px solid ${colorTokens.stroke.brand};
      outline-offset: 1px;
    }

    &:disabled {
      color: ${colorTokens.text.disable};
    }
  `,
  categoryFormWrapper: css`
    position: absolute;
    background-color: ${colorTokens.background.white};
    box-shadow: ${shadow.popover};
    border-radius: ${borderRadius[6]};
    border: 1px solid ${colorTokens.stroke.border};
    padding: ${spacing[16]};
    min-width: 306px;

    display: flex;
    flex-direction: column;
    gap: ${spacing[12]};
  `,
  categoryFormButtons: css`
    display: flex;
    justify-content: end;
    gap: ${spacing[8]};
  `,
  addButtonWrapper: ({ isActive = false, hasCategories = false }) => css`
    transition: box-shadow 0.3s ease-in-out;
    padding-inline: ${spacing[8]};
    padding-block: ${hasCategories ? spacing[4] : '0px'};
    ${isActive &&
    css`
      box-shadow: ${shadow.scrollable};
    `}
  `,
};
