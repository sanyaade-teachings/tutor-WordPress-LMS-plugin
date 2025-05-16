import FormCheckbox from '@TutorShared/components/fields/FormCheckbox';
import FormRadioGroup from '@TutorShared/components/fields/FormRadioGroup';
import { colorTokens, fontSize, fontWeight, spacing } from '@TutorShared/config/styles';
import { css } from '@emotion/react';
import { __ } from '@wordpress/i18n';
import { Controller, useFormContext } from 'react-hook-form';
import Card, { CardHeader } from '../molecules/Card';
import { TaxCollectionProcess, type TaxSettings } from '../services/tax';

function TaxSettingGlobal() {
  const form = useFormContext<TaxSettings>();

  const taxCollectionProcessOptions = [
    {
      label: __('Tax is already included in my prices', 'tutor'),
      value: TaxCollectionProcess.isTaxIncludedInPrice,
    },
    {
      label: __('Tax should be calculated and displayed on the checkout page', 'tutor'),
      value: TaxCollectionProcess.taxIsNotIncluded,
    },
  ];

  return (
    <>
      <div>
        <Card>
          <CardHeader
            title={__('Global Tax Settings', 'tutor')}
            subtitle={__('Set how taxes are displayed and applied to your courses.', 'tutor')}
          />
          <div css={styles.radioGroupWrapper}>
            <div>
              <Controller
                control={form.control}
                name="is_tax_included_in_price"
                render={(controllerProps) => {
                  return (
                    <FormRadioGroup
                      {...controllerProps}
                      options={taxCollectionProcessOptions}
                      wrapperCss={styles.radioGroupWrapperCss}
                    />
                  );
                }}
              />
            </div>
            <div css={styles.checkboxWrapper}>
              <Controller
                control={form.control}
                name="show_price_with_tax"
                render={(controllerProps) => {
                  return (
                    <div>
                      <FormCheckbox
                        {...controllerProps}
                        label={__('Display prices inclusive tax', 'tutor')}
                        labelCss={styles.checkboxLabel}
                      />
                      <span css={styles.checkboxSubText}>
                        {
                          // prettier-ignore
                          __('Show prices with tax included, so customers see the final amount they’ll pay upfront.', 'tutor')
                        }
                      </span>
                    </div>
                  );
                }}
              />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

export default TaxSettingGlobal;
const styles = {
  radioGroupWrapper: css`
    display: flex;
    flex-direction: column;
    gap: ${spacing[12]};
    padding: ${spacing[10]} ${spacing[24]} ${spacing[20]};
  `,
  checkboxLabel: css`
    font-size: ${fontSize[14]};
  `,

  checkboxSubText: css`
    font-size: ${fontSize[14]};
    color: ${colorTokens.text.hints};
    line-height: ${spacing[24]};
    font-weight: ${fontWeight.regular};
    padding-left: 28px;
  `,

  checkboxWrapper: css`
    display: flex;
    flex-direction: column;
    gap: ${spacing[12]};
  `,
  radioGroupWrapperCss: css`
    display: flex;
    flex-direction: column;
    gap: ${spacing[10]};
    margin-top: ${spacing[8]};
  `,
};
