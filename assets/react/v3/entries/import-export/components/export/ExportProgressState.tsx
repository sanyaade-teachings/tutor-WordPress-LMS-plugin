import { css } from '@emotion/react';
import { __ } from '@wordpress/i18n';

import { borderRadius, colorTokens, spacing } from '@TutorShared/config/styles';
import { typography } from '@TutorShared/config/typography';
import { styleUtils } from '@TutorShared/utils/style-utils';

import exportInProgressImage from '@SharedImages/import-export/export-inprogress.webp';

interface ExportProgressStateProps {
  progress: number;
  message?: string;
}

const ExportProgressState = ({ progress, message }: ExportProgressStateProps) => {
  return (
    <div css={styles.progress}>
      <img src={exportInProgressImage} alt={__('Exporting...', 'tutor')} />
      <div css={styles.progressHeader}>
        <div css={typography.caption()}>{__('Getting your files ready!', 'tutor')}</div>
        <div css={styles.progressCount}>{progress}%</div>
      </div>
      <div css={styles.progressBar({ progress })} />
      <div css={styles.progressInfo} key={message}>
        {message || __('Exporting...', 'tutor')}
      </div>
    </div>
  );
};

export default ExportProgressState;

const styles = {
  progress: css`
    width: 100%;
    ${styleUtils.display.flex('column')};
    gap: ${spacing[4]};
    padding: ${spacing[32]} 91px ${spacing[48]} 91px;

    img {
      align-self: center;
      width: 120px;
      height: 'auto';
      object-fit: contain;
      object-position: center;
      margin-bottom: ${spacing[36]};
    }
  `,
  progressHeader: css`
    ${styleUtils.display.flex()};
    justify-content: space-between;
  `,
  progressCount: css`
    ${styleUtils.flexCenter()};
    ${typography.tiny('bold')};
    padding: ${spacing[2]} ${spacing[8]};
    background-color: ${colorTokens.background.status.success};
    color: ${colorTokens.text.success};
    border-radius: ${borderRadius[12]};
  `,
  progressBar: ({ progress = 0 }) => css`
    position: relative;
    width: 100%;
    height: 6px;
    background-color: ${colorTokens.color.black[10]};
    border-radius: ${borderRadius[50]};
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: ${colorTokens.bg.success};
      border-radius: ${borderRadius[50]};
      transition: width 0.3s ease-in;
      width: ${progress}%;
    }
  `,
  progressInfo: css`
    ${typography.small()};
    color: ${colorTokens.text.subdued};
  `,
};
