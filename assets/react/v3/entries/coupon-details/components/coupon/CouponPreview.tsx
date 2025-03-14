import type { Coupon, CouponAppliesTo } from '@CouponServices/coupon';
import { css } from '@emotion/react';
import { tutorConfig } from '@TutorShared/config/config';
import { DateFormats } from '@TutorShared/config/constants';
import { borderRadius, Breakpoint, colorTokens, spacing } from '@TutorShared/config/styles';
import { typography } from '@TutorShared/config/typography';
import Show from '@TutorShared/controls/Show';
import { __, sprintf } from '@wordpress/i18n';
import { format, isToday, isTomorrow, isValid } from 'date-fns';
import { useFormContext } from 'react-hook-form';
import EmptyPreviewDetail from './EmptyPreviewDetail';
import EmptyPreviewTop from './EmptyPreviewTop';

const appliesToLabel: Record<CouponAppliesTo, string> = {
  all_courses_and_bundles: __('all courses', 'tutor'),
  all_bundles: __('all bundles', 'tutor'),
  specific_courses: __('specific courses', 'tutor'),
  specific_bundles: __('specific bundles', 'tutor'),
  all_courses: __('all courses', 'tutor'),
  specific_category: __('specific category', 'tutor'),
};

function CouponPreview() {
  const form = useFormContext<Coupon>();
  const { tutor_currency } = tutorConfig;

  const couponTitle = form.watch('coupon_title');
  const couponType = form.watch('coupon_type');
  const couponCode = form.watch('coupon_code');
  const discountType = form.watch('discount_type');
  const discountAmount = form.watch('discount_amount');
  const startDate = form.watch('start_date');
  const startTime = form.watch('start_time');
  const endDate = form.watch('end_date');
  const appliesTo = form.watch('applies_to');
  const perUserUsageLimit = form.watch('per_user_usage_limit');
  const couponUsedCount = form.watch('coupon_uses');

  const startDateTime = startDate && startTime ? `${startDate} ${startTime}` : '';
  const activeFromSuffix = isValid(new Date(startDateTime))
    ? `${
        isToday(new Date(startDateTime))
          ? __('today', 'tutor')
          : isTomorrow(new Date(startDateTime))
            ? __('tomorrow', 'tutor')
            : format(new Date(startDateTime), DateFormats.activityDate)
      }`
    : '';

  const discountText =
    discountType === 'flat' ? `${tutor_currency?.symbol ?? '$'}${discountAmount ?? 0}` : `${discountAmount ?? 0}%`;
  const totalUsedText = couponUsedCount ? sprintf(__('Total %d times used', 'tutor'), couponUsedCount) : '';
  const activeFromText = sprintf(__('Active from %s', 'tutor'), activeFromSuffix);

  return (
    <div css={styles.previewWrapper}>
      <Show when={couponTitle || discountAmount || couponCode} fallback={<EmptyPreviewTop />}>
        <div css={styles.previewTop}>
          <div css={styles.saleSection}>
            <div css={styles.couponName}>{couponTitle}</div>
            <Show when={discountAmount}>
              <div css={styles.discountText}>{`${discountText} ${__('OFF', 'tutor')}`}</div>
            </Show>
          </div>
          <h1 css={styles.couponCode}>{couponType === 'automatic' ? __('Automatic', 'tutor') : couponCode}</h1>
          {endDate && (
            <p css={styles.couponSubtitle}>
              {sprintf(__('Valid until %s', 'tutor'), format(new Date(endDate), DateFormats.validityDate))}
            </p>
          )}
        </div>
      </Show>
      <div css={styles.previewMiddle}>
        <span css={styles.leftCircle} />
        <span css={styles.rightCircle} />
        <svg
          width="100%"
          height="2"
          viewBox="0 0 100 2"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>{__('Right circle icon', 'tutor')}</title>
          <path
            d="M0 1L100 1"
            stroke={colorTokens.stroke.border}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="7 7"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <Show when={discountAmount || activeFromSuffix || totalUsedText} fallback={<EmptyPreviewDetail />}>
        <div css={styles.previewBottom}>
          <Show when={discountAmount}>
            <div>
              <h6 css={styles.previewListTitle}>{__('Type', 'tutor')}</h6>
              <ul css={styles.previewList} data-preview-list>
                <Show when={discountAmount}>
                  <li>{sprintf(__('%s off %s', 'tutor'), discountText, appliesToLabel[appliesTo])}</li>
                </Show>
              </ul>
            </div>
          </Show>
          <Show when={Number(perUserUsageLimit) === 1 || activeFromSuffix}>
            <div>
              <h6 css={styles.previewListTitle}>{__('Details', 'tutor')}</h6>
              <ul css={styles.previewList} data-preview-list>
                <Show when={Number(perUserUsageLimit) === 1}>
                  <li>{__('One use per customer', 'tutor')}</li>
                </Show>
                <Show when={activeFromSuffix}>
                  <li>{activeFromText}</li>
                </Show>
              </ul>
            </div>
          </Show>
          <Show when={new Date(startDateTime) > new Date() || totalUsedText}>
            <div>
              <h6 css={styles.previewListTitle}>{__('Activity', 'tutor')}</h6>
              <ul css={styles.previewList} data-preview-list>
                <Show when={new Date(startDateTime) > new Date()}>
                  <li>{__('Not active yet', 'tutor')}</li>
                </Show>
                <Show when={couponUsedCount}>
                  <li>{totalUsedText}</li>
                </Show>
              </ul>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}

export default CouponPreview;

const styles = {
  previewWrapper: css`
    display: flex;
    flex-direction: column;
    gap: ${spacing[20]};
    background-color: ${colorTokens.background.white};
    padding: ${spacing[20]} ${spacing[32]} ${spacing[64]};
    box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.25);
    border-radius: ${borderRadius[6]};
    position: sticky;
    top: 160px;

    ${Breakpoint.mobile} {
      overflow: hidden;
    }
  `,
  previewTop: css`
    display: flex;
    flex-direction: column;
    gap: ${spacing[6]};
    align-items: center;
  `,
  previewMiddle: css`
    position: relative;
    margin-block: ${spacing[16]};
    display: flex;
    width: 100%;
  `,
  leftCircle: css`
    position: absolute;
    left: -${spacing[48]};
    top: 50%;
    transform: translate(0, -50%);
    width: 32px;
    height: 32px;
    border-radius: ${borderRadius.circle};
    background-color: ${colorTokens.background.default};
    box-shadow: inset 0px 2px 3px 0px rgba(0, 0, 0, 0.25);

    &::before {
      content: '';
      position: absolute;
      width: 50%;
      height: 100%;
      background: ${colorTokens.background.default};
    }
  `,
  rightCircle: css`
    position: absolute;
    right: -${spacing[48]};
    top: 50%;
    transform: translate(0, -50%);
    width: 32px;
    height: 32px;
    border-radius: ${borderRadius.circle};
    background-color: ${colorTokens.background.default};
    box-shadow: inset 0px 2px 3px 0px rgba(0, 0, 0, 0.25);

    &::before {
      content: '';
      position: absolute;
      width: 50%;
      height: 100%;
      background: ${colorTokens.background.default};
      right: 0;
    }
  `,
  previewBottom: css`
    display: flex;
    flex-direction: column;
    gap: ${spacing[32]};
  `,
  saleSection: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  `,
  couponName: css`
    ${typography.heading6('medium')};
    color: ${colorTokens.text.primary};
  `,
  discountText: css`
    ${typography.body('medium')};
    color: ${colorTokens.text.warning};
  `,
  couponCode: css`
    ${typography.heading3('medium')};
    color: ${colorTokens.text.brand};
    margin-top: ${spacing[24]};
    word-break: break-all;
  `,
  couponSubtitle: css`
    ${typography.small()};
    color: ${colorTokens.text.hints};
  `,
  previewListTitle: css`
    ${typography.caption('medium')};
    color: ${colorTokens.text.primary};
  `,
  previewList: css`
    &[data-preview-list] {
      ${typography.caption()};
      color: ${colorTokens.text.title};
      list-style: disc;
      padding-left: ${spacing[24]};
    }
  `,
};
