// ============================================
// ENROLLMENT TYPES - Matrículas y Cursos
// ============================================

export interface CourseType {
  code: string;
  name: string;
}

export interface CycleLevel {
  name: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  courseType: CourseType;
  cycleLevel: CycleLevel;
}

export interface Professor {
  id: string;
  firstName: string;
  lastName1: string;
  profilePhotoUrl: string | null;
}

export interface AcademicCycle {
  id: string;
  code: string;
  isCurrent: boolean;
}

export interface CourseCycle {
  id: string;
  course: Course;
  academicCycle: AcademicCycle;
  professors: Professor[];
}

export interface Enrollment {
  id: string;
  enrolledAt: string;
  courseCycle: CourseCycle;
}

export interface EnrollmentResponse {
  data: Enrollment[];
  statusCode: number;
  message: string;
  timestamp: string;
}
