import { defineRoute } from '@TutorShared/config/route-configs';

export const CourseBuilderRouteConfigs = {
  Home: defineRoute('/'),
  CourseBasics: defineRoute('/basics'),
  CourseCurriculum: defineRoute('/curriculum'),
  CourseAdditional: defineRoute('/additional'),
  CourseCertificate: defineRoute('/certificate'),
  IconList: defineRoute('/icons'),
};
