import { css } from '@emotion/react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import FormFillInTheBlanks from '@CourseBuilderComponents/fields/quiz/FormFillinTheBlanks';
import { useQuizModalContext } from '@CourseBuilderContexts/QuizModalContext';
import type { QuizForm } from '@CourseBuilderServices/quiz';
import { spacing } from '@TutorShared/config/styles';
import { styleUtils } from '@TutorShared/utils/style-utils';

const FillInTheBlanks = () => {
  const form = useFormContext<QuizForm>();
  const { activeQuestionIndex } = useQuizModalContext();

  const { fields: optionsFields } = useFieldArray({
    control: form.control,
    name: `questions.${activeQuestionIndex}.question_answers` as 'questions.0.question_answers',
  });

  return (
    <div css={styles.optionWrapper}>
      <Controller
        key={optionsFields.length ? JSON.stringify(optionsFields[0]) : ''}
        control={form.control}
        name={`questions.${activeQuestionIndex}.question_answers.0` as 'questions.0.question_answers.0'}
        render={(controllerProps) => <FormFillInTheBlanks {...controllerProps} />}
      />
    </div>
  );
};

export default FillInTheBlanks;

const styles = {
  optionWrapper: css`
    ${styleUtils.display.flex('column')};
    padding-left: ${spacing[40]};
  `,
};
