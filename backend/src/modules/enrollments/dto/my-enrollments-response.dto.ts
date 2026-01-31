export class MyEnrollmentsResponseDto {
  id: string;
  enrolledAt: Date;
  courseCycle: {
    id: string;
    course: {
      id: string;
      code: string;
      name: string;
      courseType: {
        code: string;
        name: string;
      };
      cycleLevel: {
        name: string;
      };
    };
    academicCycle: {
      id: string;
      code: string;
      startDate: Date;
      endDate: Date;
      isCurrent: boolean;
    };
    professors: {
      id: string;
      firstName: string;
      lastName1: string;
      lastName2: string;
      profilePhotoUrl: string | null;
    }[];
  };
}
