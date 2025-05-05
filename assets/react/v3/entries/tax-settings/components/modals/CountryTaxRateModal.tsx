import Button from '@TutorShared/atoms/Button';
import FormInputWithContent from '@TutorShared/components/fields/FormInputWithContent';
import FormSelectInput from '@TutorShared/components/fields/FormSelectInput';
import { type ModalProps, useModal } from '@TutorShared/components/modals/Modal';
import { colorTokens, shadow, spacing, zIndex } from '@TutorShared/config/styles';
import { useFormWithGlobalError } from '@TutorShared/hooks/useFormWithGlobalError';
import { europeanUnionData, getStatesByCountryAsOptions, isEuropeanUnion } from '@TutorShared/utils/countries';
import { styleUtils } from '@TutorShared/utils/style-utils';
import { requiredRule } from '@TutorShared/utils/validation';
import { css } from '@emotion/react';
import { __ } from '@wordpress/i18n';
import { Controller, type UseFormReturn } from 'react-hook-form';
import type { TaxSettings } from '../../services/tax';
import TaxModalWrapper from './TaxModalWrapper';

interface CountryTaxRateModalProps extends ModalProps {
  form: UseFormReturn<TaxSettings>;
  closeModal: (props?: { action: 'CONFIRM' | 'CLOSE' }) => void;
}

interface TaxRateForm {
  selectedOption: string;
  taxRate: number;
}

const CountryTaxRateModal = ({ form, closeModal, title }: CountryTaxRateModalProps) => {
  const taxRateForm = useFormWithGlobalError<TaxRateForm>({
    defaultValues: {
      selectedOption: '',
      taxRate: 0,
    },
  });
  const activeCountryCode = form.watch('active_country');
  const activeCountryRate = form.getValues('rates').find((rate) => String(rate.country) === String(activeCountryCode));
  const isEU = isEuropeanUnion(activeCountryCode ?? '');

  function handleModalClose({ action }: { action: 'CLOSE' | 'CONFIRM' }) {
    return () => {
      closeModal({ action });
    };
  }

  return (
    <TaxModalWrapper
      onClose={handleModalClose({ action: 'CLOSE' })}
      title={title}
      modalStyle={styles.modalWrapperStyle}
    >
      <form
        onSubmit={taxRateForm.handleSubmit(async (values) => {
          const selectedOption = values.selectedOption;

          const updatedRates = form.getValues('rates').map((rate) =>
            String(rate.country) === String(activeCountryCode) && selectedOption
              ? {
                  ...rate,
                  states: [
                    ...rate.states,
                    {
                      id: taxRateForm.getValues('selectedOption'),
                      rate: taxRateForm.getValues('taxRate'),
                      apply_on_shipping: false,
                    },
                  ],
                }
              : rate,
          );

          form.setValue('rates', updatedRates);

          closeModal({ action: 'CONFIRM' });
        })}
      >
        <div css={styles.modalBody}>
          <Controller
            control={taxRateForm.control}
            name="selectedOption"
            rules={requiredRule()}
            render={(controllerProps) => {
              const activeCountryStates = activeCountryRate?.states.map((state) => `${state.id}`);
              let options = [];

              if (isEU) {
                options = europeanUnionData.states.map((state) => ({ label: state.name, value: state.numeric_code }));
              } else {
                options = getStatesByCountryAsOptions(activeCountryCode ?? '');
              }

              options = options.filter((option) => !activeCountryStates?.includes(option.value));

              return (
                <FormSelectInput
                  {...controllerProps}
                  label={isEU ? __('Region', 'tutor') : __('State', 'tutor')}
                  options={options}
                  placeholder={__('Select state', 'tutor')}
                />
              );
            }}
          />
          <Controller
            control={taxRateForm.control}
            name="taxRate"
            rules={requiredRule()}
            render={(controllerProps) => {
              return (
                <FormInputWithContent
                  {...controllerProps}
                  type="number"
                  content="%"
                  contentCss={styleUtils.inputCurrencyStyle}
                  contentPosition="right"
                />
              );
            }}
          />
        </div>
        <div css={styles.buttonWrapper}>
          <Button variant="secondary" onClick={handleModalClose({ action: 'CLOSE' })}>
            {__('Cancel', 'tutor')}
          </Button>
          <Button type="submit" variant="primary">
            {__('Apply', 'tutor')}
          </Button>
        </div>
      </form>
    </TaxModalWrapper>
  );
};

export const useCountryTaxRateModal = () => {
  const { showModal } = useModal();

  const openCountryTaxRateModal = (props: Omit<CountryTaxRateModalProps, 'closeModal'>) => {
    return showModal({ component: CountryTaxRateModal, props, depthIndex: zIndex.highest });
  };

  return { openCountryTaxRateModal };
};

const styles = {
  modalWrapperStyle: css`
    position: relative;
    width: 100%;
    max-width: 560px;
  `,
  modalBody: css`
    display: flex;
    flex-direction: column;
    gap: ${spacing[12]};
    margin-bottom: ${spacing[72]};
    padding: ${spacing[20]};
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

export default CountryTaxRateModal;
