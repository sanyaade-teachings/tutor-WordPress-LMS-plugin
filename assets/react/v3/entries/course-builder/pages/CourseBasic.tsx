import { css } from '@emotion/react';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import CourseBasicSidebar from '@CourseBuilderComponents/course-basic/CourseBasicSidebar';
import CourseSettings from '@CourseBuilderComponents/course-basic/CourseSettings';
import Navigator from '@CourseBuilderComponents/layouts/Navigator';
import FormEditableAlias from '@TutorShared/components/fields/FormEditableAlias';
import FormInput from '@TutorShared/components/fields/FormInput';
import FormWPEditor from '@TutorShared/components/fields/FormWPEditor';

import {
  type CourseDetailsResponse,
  type CourseFormData,
  convertCourseDataToPayload,
  useUpdateCourseMutation,
} from '@CourseBuilderServices/course';
import { getCourseId } from '@CourseBuilderUtils/utils';
import { tutorConfig } from '@TutorShared/config/config';
import { CURRENT_VIEWPORT } from '@TutorShared/config/constants';
import { Breakpoint, colorTokens, headerHeight, spacing, zIndex } from '@TutorShared/config/styles';
import { typography } from '@TutorShared/config/typography';
import Show from '@TutorShared/controls/Show';
import { useUnlinkPageBuilderMutation } from '@TutorShared/services/course';
import { styleUtils } from '@TutorShared/utils/style-utils';
import { convertToSlug, determinePostStatus } from '@TutorShared/utils/util';
import { maxLimitRule, requiredRule } from '@TutorShared/utils/validation';

const courseId = getCourseId();
let hasAliasChanged = false;

const CourseBasic = () => {
  const form = useFormContext<CourseFormData>();
  const queryClient = useQueryClient();
  const isCourseDetailsFetching = useIsFetching({
    queryKey: ['CourseDetails', courseId],
  });
  const updateCourseMutation = useUpdateCourseMutation();
  const unlinkPageBuilder = useUnlinkPageBuilderMutation();

  const [isWpEditorFullScreen, setIsWpEditorFullScreen] = useState(false);

  const courseDetails = queryClient.getQueryData(['CourseDetails', courseId]) as CourseDetailsResponse;
  const isTutorPro = !!tutorConfig.tutor_pro_url;
  const isOpenAiEnabled = tutorConfig.settings?.chatgpt_enable === 'on';

  const postStatus = form.watch('post_status');

  const editorUsed = form.watch('editor_used');

  return (
    <div css={styles.wrapper}>
      <div css={styles.mainForm({ isWpEditorFullScreen })}>
        <div css={styles.fieldsWrapper}>
          <div css={styles.titleAndSlug}>
            <Controller
              name="post_title"
              control={form.control}
              rules={{ ...requiredRule(), ...maxLimitRule(255) }}
              render={(controllerProps) => (
                <FormInput
                  {...controllerProps}
                  label={__('Title', 'tutor')}
                  placeholder={__('ex. Learn Photoshop CS6 from scratch', 'tutor')}
                  isClearable
                  selectOnFocus
                  generateWithAi={!isTutorPro || isOpenAiEnabled}
                  loading={!!isCourseDetailsFetching && !controllerProps.field.value}
                  onChange={(value) => {
                    if (postStatus === 'draft' && !hasAliasChanged) {
                      form.setValue('post_name', convertToSlug(String(value)), {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }
                  }}
                />
              )}
            />

            <Controller
              name="post_name"
              control={form.control}
              render={(controllerProps) => (
                <FormEditableAlias
                  {...controllerProps}
                  label={__('Course URL', 'tutor')}
                  baseURL={`${tutorConfig.home_url}/${tutorConfig.settings?.course_permalink_base}`}
                  onChange={() => {
                    hasAliasChanged = true;
                  }}
                />
              )}
            />
          </div>

          <Controller
            name="post_content"
            control={form.control}
            render={(controllerProps) => (
              <FormWPEditor
                {...controllerProps}
                label={__('Description', 'tutor')}
                loading={!!isCourseDetailsFetching && !controllerProps.field.value}
                max_height={280}
                generateWithAi={!isTutorPro || isOpenAiEnabled}
                hasCustomEditorSupport
                editorUsed={editorUsed}
                editors={courseDetails?.editors}
                onCustomEditorButtonClick={() => {
                  return form.handleSubmit((data) => {
                    const payload = convertCourseDataToPayload(data);

                    return updateCourseMutation.mutateAsync({
                      course_id: courseId,
                      ...payload,
                      post_status: determinePostStatus(
                        form.getValues('post_status') as 'trash' | 'future' | 'draft',
                        form.getValues('visibility') as 'private' | 'password_protected',
                      ),
                    });
                  })();
                }}
                onBackToWPEditorClick={async (builder: string) => {
                  return unlinkPageBuilder
                    .mutateAsync({
                      courseId: courseId,
                      builder: builder,
                    })
                    .then((response) => {
                      form.setValue('editor_used', {
                        name: 'classic',
                        label: __('Classic Editor', 'tutor'),
                        link: '',
                      });
                      return response;
                    });
                }}
                onFullScreenChange={(isFullScreen) => {
                  setIsWpEditorFullScreen(isFullScreen);
                }}
              />
            )}
          />

          <CourseSettings />
        </div>
        <Show when={CURRENT_VIEWPORT.isAboveTablet}>
          <Navigator styleModifier={styles.navigator} />
        </Show>
      </div>

      <CourseBasicSidebar />
      <Show when={!CURRENT_VIEWPORT.isAboveTablet}>
        <Navigator styleModifier={styles.navigator} />
      </Show>
    </div>
  );
};

export default CourseBasic;

const styles = {
  wrapper: css`
    display: grid;
    grid-template-columns: 1fr 338px;
    gap: ${spacing[32]};
    width: 100%;

    ${Breakpoint.smallTablet} {
      grid-template-columns: 1fr;
      gap: 0;
    }
  `,
  mainForm: ({ isWpEditorFullScreen }: { isWpEditorFullScreen: boolean }) => css`
    padding-block: ${spacing[32]} ${spacing[24]};
    align-self: start;
    top: ${headerHeight}px;
    position: sticky;

    ${isWpEditorFullScreen &&
    css`
      z-index: ${zIndex.header + 1};
    `}

    ${Breakpoint.smallTablet} {
      padding-top: ${spacing[16]};
      position: unset;
    }
  `,

  fieldsWrapper: css`
    display: flex;
    flex-direction: column;
    gap: ${spacing[24]};
  `,
  titleAndSlug: css`
    display: flex;
    flex-direction: column;
    gap: ${spacing[8]};
  `,
  sidebar: css`
    border-left: 1px solid ${colorTokens.stroke.divider};
    min-height: calc(100vh - ${headerHeight}px);
    padding-left: ${spacing[32]};
    padding-block: ${spacing[24]};
    display: flex;
    flex-direction: column;
    gap: ${spacing[16]};
  `,
  priceRadioGroup: css`
    display: flex;
    align-items: center;
    gap: ${spacing[36]};
  `,
  coursePriceWrapper: css`
    display: flex;
    align-items: flex-start;
    gap: ${spacing[16]};
  `,
  navigator: css`
    margin-top: ${spacing[40]};

    ${Breakpoint.smallTablet} {
      margin-top: 0;
    }
  `,
  statusAndDate: css`
    ${styleUtils.display.flex('column')};
    gap: ${spacing[4]};
  `,
  updatedOn: css`
    ${typography.caption()};
    color: ${colorTokens.text.hints};
  `,
};
