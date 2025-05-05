import { css } from '@emotion/react';
import { __ } from '@wordpress/i18n';
import { Controller, useFormContext } from 'react-hook-form';

import Button from '@TutorShared/atoms/Button';
import SVGIcon from '@TutorShared/atoms/SVGIcon';

import FormRadioGroup from '@TutorShared/components/fields/FormRadioGroup';

import type { CourseFormData } from '@CourseBuilderServices/course';
import config, { tutorConfig } from '@TutorShared/config/config';
import { Addons } from '@TutorShared/config/constants';
import { Breakpoint, colorTokens, spacing } from '@TutorShared/config/styles';
import { typography } from '@TutorShared/config/typography';
import { isAddonEnabled } from '@TutorShared/utils/util';

const ContentDripSettings = () => {
  const form = useFormContext<CourseFormData>();

  const contentDropOptions = [
    {
      label: __('Schedule course content by date', 'tutor'),
      value: 'unlock_by_date',
    },
    {
      label: __('Content available after X days from enrollment', 'tutor'),
      value: 'specific_days',
    },
    {
      label: __('Course content available sequentially', 'tutor'),
      value: 'unlock_sequentially',
    },
    {
      label: __('Course content unlocked after finishing prerequisites', 'tutor'),
      value: 'after_finishing_prerequisites',
      labelCss: css`
        align-items: start;

        span {
          top: 3px;
        }
      `,
    },
    {
      label: __('None', 'tutor'),
      value: '',
    },
  ];

  if (!tutorConfig.tutor_pro_url) {
    return (
      <div css={styles.dripNoProWrapper}>
        <SVGIcon name="crown" width={72} height={72} />
        <h6 css={typography.body('medium')}>{__('Content Drip is a pro feature', 'tutor')}</h6>
        <p css={styles.dripNoProDescription}>
          {__('You can schedule your course content using  content drip options', 'tutor')}
        </p>
        <Button
          icon={<SVGIcon name="crown" width={24} height={24} />}
          onClick={() => {
            window.open(config.TUTOR_PRICING_PAGE, '_blank', 'noopener');
          }}
        >
          {__('Get Tutor LMS Pro', 'tutor')}
        </Button>
      </div>
    );
  }

  if (!isAddonEnabled(Addons.CONTENT_DRIP)) {
    return (
      <div css={styles.dripNoProWrapper}>
        <SVGIcon name="contentDrip" width={72} height={72} style={styles.dripIcon} />
        <h6 css={typography.body('medium')}>{__('Activate the “Content Drip” addon to use this feature.', 'tutor')}</h6>
        <p css={styles.dripNoProDescription}>
          {__('Control when students can access lessons and quizzes using the Content Drip feature.', 'tutor')}
        </p>

        <Button
          variant="secondary"
          icon={<SVGIcon name="linkExternal" width={24} height={24} />}
          onClick={() => {
            window.open(config.TUTOR_ADDONS_PAGE, '_blank', 'noopener');
          }}
        >
          {__('Enable Content Drip Addon', 'tutor')}
        </Button>
      </div>
    );
  }
  return (
    <div css={styles.dripWrapper}>
      <h6 css={styles.dripTitle}>{__('Content Drip Type', 'tutor')}</h6>
      <p css={styles.dripSubTitle}>
        {__('You can schedule your course content using one of the following Content Drip options', 'tutor')}
      </p>

      <Controller
        name="contentDripType"
        control={form.control}
        render={(controllerProps) => (
          <FormRadioGroup {...controllerProps} options={contentDropOptions} wrapperCss={styles.radioWrapper} />
        )}
      />
    </div>
  );
};

export default ContentDripSettings;

const styles = {
  dripWrapper: css`
    background-color: ${colorTokens.background.white};
    padding: ${spacing[16]} ${spacing[24]} ${spacing[32]} ${spacing[32]};
    min-height: 400px;

    ${Breakpoint.smallMobile} {
      padding: ${spacing[16]};
    }
  `,
  dripTitle: css`
    ${typography.body('medium')};
    margin-bottom: ${spacing[4]};
  `,
  dripSubTitle: css`
    ${typography.small()};
    color: ${colorTokens.text.hints};
    margin-bottom: ${spacing[16]};
  `,
  radioWrapper: css`
    display: flex;
    flex-direction: column;
    gap: ${spacing[8]};
  `,
  dripNoProWrapper: css`
    min-height: 400px;
    background: ${colorTokens.background.white};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${spacing[4]};
    padding: ${spacing[24]};
    text-align: center;
  `,
  dripNoProDescription: css`
    ${typography.caption()};
    color: ${colorTokens.text.subdued};
    max-width: 320px;
    margin: 0 auto ${spacing[12]};
  `,
  dripIcon: css`
    color: ${colorTokens.icon.brand};
  `,
};
