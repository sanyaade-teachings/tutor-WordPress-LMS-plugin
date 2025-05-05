import Button from '@TutorShared/atoms/Button';
import SVGIcon from '@TutorShared/atoms/SVGIcon';
import FormInput from '@TutorShared/components/fields/FormInput';
import { colorTokens, shadow, spacing, zIndex } from '@TutorShared/config/styles';
import { useFormWithGlobalError } from '@TutorShared/hooks/useFormWithGlobalError';
import { css } from '@emotion/react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import { type ModalProps, useModal } from '@TutorShared/components/modals/Modal';
import { typography } from '@TutorShared/config/typography';
import For from '@TutorShared/controls/For';
import Show from '@TutorShared/controls/Show';
import {
  euCountryCode,
  getCountryByCode,
  getCountryListAsOptions,
  getStatesByCountryAsOptions,
} from '@TutorShared/utils/countries';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect } from 'react';
import TaxCheckbox from '../../atoms/TaxCheckbox';
import type { TaxSettings } from '../../services/tax';
import TaxModalWrapper from './TaxModalWrapper';

interface CountrySelectModalProps extends ModalProps {
  form: UseFormReturn<TaxSettings>;
  closeModal: (props?: { action: 'CONFIRM' | 'CLOSE' }) => void;
}

type CountryCode = string;
type State = number;

interface RegionStateForm {
  searchValue: string;
  selectedCountries: Record<CountryCode, State[]>;
  activeCountry: CountryCode;
}

const CountrySelectModal = ({ form, closeModal, title }: CountrySelectModalProps) => {
  const regionStateForm = useFormWithGlobalError<RegionStateForm>({
    defaultValues: { searchValue: '', selectedCountries: {}, activeCountry: '' },
  });

  const selectedCountries = regionStateForm.watch('selectedCountries');
  const activeCountry = regionStateForm.watch('activeCountry');
  const searchValue = regionStateForm.watch('searchValue');

  let countries = getCountryListAsOptions([]);

  countries = countries.filter((country) => country.label.toLowerCase().includes(searchValue.trim().toLowerCase()));

  function handleModalClose({ action }: { action: 'CLOSE' | 'CONFIRM' }) {
    return () => {
      if (action === 'CONFIRM') {
        const formattedCountries = Object.entries(selectedCountries).map(([country, states]) => {
          const formCountry = form.getValues('rates').find((rate) => String(rate.country) === String(country));

          return {
            country,
            is_same_rate: false,
            rate: 0,
            ...formCountry,
            states:
              formCountry?.country !== euCountryCode
                ? states?.map((state) => {
                    const formStates = formCountry?.states ?? [];
                    const formState = formStates.find((formState) => String(formState.id) === String(state));

                    return { id: state, rate: 0, apply_on_shipping: false, ...formState };
                  })
                : formCountry.states,
          };
        });

        form.setValue('rates', formattedCountries, { shouldDirty: true });
      }
      closeModal({ action: 'CLOSE' });
    };
  }

  useEffect(() => {
    const rates = form.getValues('rates');
    const formattedCountries = rates.reduce((acc, rate) => {
      return {
        ...acc,
        [rate.country]:
          String(rate.country) === String(euCountryCode)
            ? []
            : rate.is_same_rate
              ? getCountryByCode(rate.country)?.states?.map((state) => state.id)
              : rate.states.map((state) => state.id),
      };
    }, {});

    regionStateForm.setValue('selectedCountries', formattedCountries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TaxModalWrapper
      onClose={handleModalClose({ action: 'CLOSE' })}
      title={title}
      modalStyle={styles.modalWrapperStyle}
    >
      <div css={styles.modalBody}>
        <Controller
          control={regionStateForm.control}
          name="searchValue"
          render={(controllerProps) => {
            return (
              <FormInput
                {...controllerProps}
                label={__('Search region', 'tutor')}
                placeholder={__('e.g. Arizona', 'tutor')}
              />
            );
          }}
        />
        <div css={styles.selectorWrapper}>
          <For each={countries}>
            {(country) => {
              const countryData = getCountryByCode(country.value);
              const states = countryData?.states ?? [];

              return (
                <div css={styles.checkBoxWrapper} key={country.value}>
                  <TaxCheckbox
                    label={
                      <div css={styles.labelWrapper}>
                        <span>{country.icon}</span>
                        <span>{country.label}</span>
                        <Show when={states.length}>
                          <Button
                            buttonCss={styles.dropdownButton}
                            variant={'text'}
                            icon={
                              <SVGIcon
                                name={String(activeCountry) === String(country.value) ? 'chevronUp' : 'chevronDown'}
                              />
                            }
                            iconPosition="right"
                            onClick={() => {
                              regionStateForm.setValue(
                                'activeCountry',
                                String(activeCountry) === String(country.value) ? '' : country.value,
                              );
                            }}
                          >
                            {sprintf(
                              '%s of %s provinces',
                              selectedCountries[country.value]?.length || 0,
                              getStatesByCountryAsOptions(country.value).length,
                            )}
                          </Button>
                        </Show>
                      </div>
                    }
                    checked={
                      !!selectedCountries[country.value] && selectedCountries[country.value]?.length === states.length
                    }
                    isIndeterminate={
                      !!selectedCountries[country.value]?.length &&
                      selectedCountries[country.value]?.length !== states.length
                    }
                    onChange={(isChecked) => {
                      if (!isChecked) {
                        delete selectedCountries[country.value];
                        regionStateForm.setValue('selectedCountries', { ...selectedCountries });
                        regionStateForm.setValue('activeCountry', '');
                      } else {
                        regionStateForm.setValue('selectedCountries', {
                          ...selectedCountries,
                          [country.value]: states.map((state) => state.id),
                        });
                        regionStateForm.setValue('activeCountry', country.value);
                      }
                    }}
                  />

                  <Show when={String(activeCountry) === String(country.value) && states.length}>
                    <For each={states}>
                      {(state) => {
                        return (
                          <div css={styles.statesWrapper} key={state.id}>
                            <TaxCheckbox
                              label={state.name}
                              checked={selectedCountries[activeCountry]?.includes(state.id)}
                              onChange={(isChecked) => {
                                const updatedStates = isChecked
                                  ? [...(selectedCountries[activeCountry] || []), state.id]
                                  : (selectedCountries[activeCountry] || []).filter((s) => s !== state.id);

                                regionStateForm.setValue('selectedCountries', {
                                  ...selectedCountries,
                                  [activeCountry]: updatedStates,
                                });
                              }}
                            />
                          </div>
                        );
                      }}
                    </For>
                  </Show>
                </div>
              );
            }}
          </For>
        </div>
      </div>
      <div css={styles.buttonWrapper}>
        <Button variant="tertiary" onClick={handleModalClose({ action: 'CLOSE' })}>
          {__('Cancel', 'tutor')}
        </Button>
        <Button variant="primary" onClick={handleModalClose({ action: 'CONFIRM' })}>
          {__('Apply', 'tutor')}
        </Button>
      </div>
    </TaxModalWrapper>
  );
};

export const useCountrySelectModal = () => {
  const { showModal } = useModal();

  const openCountrySelectModal = (props: Omit<CountrySelectModalProps, 'closeModal'>) => {
    return showModal({ component: CountrySelectModal, props, depthIndex: zIndex.highest });
  };

  return { openCountrySelectModal };
};

const styles = {
  modalWrapperStyle: css`
    position: relative;
    max-width: 560px;
    width: 100%;
  `,
  modalBody: css`
    margin-bottom: ${spacing[72]};
    padding: ${spacing[20]};
  `,
  selectorWrapper: css`
    margin-top: ${spacing[16]};
    max-height: calc(100vh - 320px);
    overflow-y: auto;
  `,
  checkBoxWrapper: css`
    padding-block: ${spacing[8]};
  `,
  statesWrapper: css`
    padding-block: ${spacing[8]};
    margin-left: ${spacing[32]};
  `,
  labelWrapper: css`
    ${typography.body()};
    display: flex;
    align-items: center;
    gap: ${spacing[8]};
    width: 100%;
  `,
  dropdownButton: css`
    margin-left: auto;
    color: ${colorTokens.text.subdued};

    &:hover {
      text-decoration: none;
      color: ${colorTokens.text.subdued};
    }
  `,
  buttonWrapper: css`
    position: absolute;
    bottom: 0;
    width: 100%;
    background-color: ${colorTokens.background.white};
    box-shadow: ${shadow.popover};
    display: flex;
    padding: ${spacing[16]} ${spacing[20]};
    justify-content: end;
    gap: ${spacing[16]};
    align-items: center;
  `,
};

export default CountrySelectModal;
