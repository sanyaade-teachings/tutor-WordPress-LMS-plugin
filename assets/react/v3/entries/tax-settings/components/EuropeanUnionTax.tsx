import Button from '@TutorShared/atoms/Button';
import SVGIcon from '@TutorShared/atoms/SVGIcon';
import FormInputWithContent from '@TutorShared/components/fields/FormInputWithContent';
import FormSelectInput from '@TutorShared/components/fields/FormSelectInput';
import { colorTokens, fontSize, fontWeight, spacing } from '@TutorShared/config/styles';
import Show from '@TutorShared/controls/Show';
import Table, { type Column } from '@TutorShared/molecules/Table';
import { euCountryCode, europeanUnionData } from '@TutorShared/utils/countries';
import { styleUtils } from '@TutorShared/utils/style-utils';
import { css } from '@emotion/react';
import { __ } from '@wordpress/i18n';
import { Controller, useFormContext } from 'react-hook-form';
import Card, { CardHeader } from '../molecules/Card';
import { EUTaxRegistrationTypes, type TaxSettings } from '../services/tax';
import { useCountryTaxRateModal } from './modals/CountryTaxRateModal';

interface ColumnDataType {
  countryId: number | string;
  rate: number | null;
  emoji?: string;
}

function EuropeanUnionTax() {
  const { openCountryTaxRateModal } = useCountryTaxRateModal();
  const form = useFormContext<TaxSettings>();
  const rates = form.watch('rates');
  const euIndex = rates.findIndex((rate) => String(rate.country) === String(euCountryCode));
  const euRate = rates[euIndex];

  const isMicroBusiness = euRate?.vat_registration_type === EUTaxRegistrationTypes.microBusiness;
  const isOneStopBusiness = euRate?.vat_registration_type === EUTaxRegistrationTypes.oneStop;

  if (isMicroBusiness && euRate.states.length) {
    euRate.states = [euRate.states[0]];
  }

  const tableData: ColumnDataType[] = euRate.states.map((euState) => {
    return {
      countryId: euState.id,
      rate: euState.rate,
      emoji: europeanUnionData.states.find((state) => String(state.numeric_code) === String(euState.id))?.emoji,
    };
  });

  const columns: Column<ColumnDataType>[] = [
    {
      Header: __('Region', 'tutor'),
      Cell: (item) => {
        const name = europeanUnionData.states.find(
          (state) => String(state.numeric_code) === String(item.countryId),
        )?.name;

        return (
          <div css={styles.nameWrapper}>
            <span css={styles.emoji}>{item.emoji}</span>
            <span>{name}</span>
          </div>
        );
      },
    },
    {
      Header: __('Tax rate', 'tutor'),
      Cell: (item) => {
        const euStateIndex = euRate?.states?.findIndex((euState) => String(euState.id) === String(item.countryId));

        return (
          <>
            <div css={[styles.rateWrapper, styles.col2]}>
              <span css={styles.rateValue} data-rate-field="plain">
                {!!item.rate || item.rate === 0 ? `${item.rate}%` : '0%'}
              </span>
              <div css={styles.editableWrapper} data-rate-field="editable">
                <Controller
                  control={form.control}
                  name={`rates.${euIndex}.states.${euStateIndex}.rate`}
                  render={(controllerProps) => {
                    return <FormInputWithContent {...controllerProps} content="%" contentPosition="right" />;
                  }}
                />
                <Button
                  variant="text"
                  icon={<SVGIcon name="delete" style={styles.deleteIcon} />}
                  onClick={() => {
                    const updatedRates = rates.map((rate) => {
                      if (String(rate.country) === String(euCountryCode)) {
                        rate.states = rate.states.filter((state) => state.id !== item.countryId);
                      }
                      return rate;
                    });
                    form.setValue('rates', updatedRates);
                  }}
                />
              </div>
            </div>
          </>
        );
      },
      width: 120,
    },
  ];

  return (
    <>
      <Card>
        <CardHeader
          title={__('VAT on sales', 'tutor')}
          subtitle={__('Add region you want to collect tax & their tax rates', 'tutor')}
        />
        <div css={styleUtils.cardInnerSection}>
          <Controller
            control={form.control}
            name={`rates.${euIndex}.vat_registration_type`}
            render={(controllerProps) => {
              return (
                <FormSelectInput
                  {...controllerProps}
                  label={__('VAT registration type', 'tutor')}
                  placeholder={__('Select VAT registration type', 'tutor')}
                  options={[
                    {
                      label: __('One-Stop Shop registration', 'tutor'),
                      value: EUTaxRegistrationTypes.oneStop,
                    },
                    {
                      label: __('Micro-business exemption', 'tutor'),
                      value: EUTaxRegistrationTypes.microBusiness,
                    },
                  ]}
                />
              );
            }}
          />
          <Show
            when={tableData.length}
            fallback={
              <div>
                <Button
                  variant="tertiary"
                  onClick={() => {
                    openCountryTaxRateModal({
                      form,
                      title: __('Add region & VAT rate', 'tutor'),
                    });
                  }}
                >
                  {__('Add Country & Tax rate', 'tutor')}
                </Button>
              </div>
            }
          >
            <Table
              data={tableData}
              columns={columns}
              isRounded={true}
              rowStyle={styles.rowStyle}
              renderInLastRow={
                (isOneStopBusiness && europeanUnionData.states.length !== euRate.states.length) ||
                (isMicroBusiness && !euRate.states.length) ? (
                  <Button
                    variant="tertiary"
                    onClick={() => {
                      openCountryTaxRateModal({
                        form,
                        title: __('Add region & VAT rate', 'tutor'),
                      });
                    }}
                  >
                    {__('Add Country & Tax rate', 'tutor')}
                  </Button>
                ) : undefined
              }
            />
          </Show>
        </div>
      </Card>
      {/* <Show when={euRate.states.length}>
        <TaxOverride />
      </Show> */}
    </>
  );
}

export default EuropeanUnionTax;

const styles = {
  nameWrapper: css`
    display: flex;
    gap: ${spacing[8]};
    color: ${colorTokens.text.primary};
    font-weight: ${fontWeight.medium};
  `,
  deleteIcon: css`
    color: ${colorTokens.icon.default};
  `,
  emoji: css`
    font-size: ${fontSize[24]};
  `,
  editableWrapper: css`
    display: none;
  `,
  rowStyle: css`
    &:hover {
      [data-rate-field='editable'] {
        display: flex;
        align-items: center;
        gap: ${spacing[8]};
      }
      [data-rate-field='plain'] {
        display: none;
      }
    }
  `,
  col2: css`
    width: 120px;
  `,
  rateWrapper: css`
    display: flex;
    align-items: center;
    height: 36px;
  `,
  rateValue: css`
    padding: ${spacing[6]} ${spacing[12]};
  `,
};
