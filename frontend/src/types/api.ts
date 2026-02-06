// ============================================
// TIPOS DE API - CONTRATOS CON EL BACKEND
// ============================================

// Formato de respuesta estándar del backend
export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path?: string;
}

// ============================================
// AUTH & SESSION
// ============================================

export type SessionStatus = 
  | 'ACTIVE' 
  | 'PENDING_CONCURRENT_RESOLUTION' 
  | 'BLOCKED_PENDING_REAUTH';

export type RoleCode = 
  | 'STUDENT' 
  | 'TEACHER' 
  | 'PROFESSOR' // Backend usa PROFESSOR en lugar de TEACHER
  | 'ADMIN' 
  | 'SUPER_ADMIN';

export interface Role {
  id?: string; // Opcional porque el backend no siempre lo retorna
  code: RoleCode;
  name: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName1?: string;
  lastName2?: string;
  phone?: string;
  career?: string;
  profilePhotoUrl?: string;
  photoSource: 'google' | 'uploaded' | 'none';
  roles: Role[];
  lastActiveRoleId?: string; // Opcional porque puede no venir del backend
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Segundos
  sessionStatus: SessionStatus;
  concurrentSessionId: string | null;
  user: User;
}

export interface ResolveSessionResponse {
  keptSessionId: string | null;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface LoginRequest {
  code: string; // Google OAuth code
  deviceId: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  deviceId: string;
}

export interface ResolveConcurrentSessionRequest {
  refreshToken: string;
  deviceId: string;
  decision: 'KEEP_NEW' | 'KEEP_EXISTING';
}

export interface ReauthAnomalousRequest {
  code: string;
  refreshToken: string;
  deviceId: string;
}

// ============================================
// COURSES & CYCLES
// ============================================

export interface CourseType {
  id: string;
  code: string;
  name: string;
}

export interface CycleLevel {
  id: string;
  levelNumber: number;
  name: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  courseTypeId: string;
  cycleLevelId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AcademicCycle {
  id: string;
  code: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CourseCycle {
  id: string;
  courseId: string;
  academicCycleId: string;
  course?: Course;
  academicCycle?: AcademicCycle;
}

// ============================================
// EVALUATIONS
// ============================================

export interface EvaluationType {
  id: string;
  code: string;
  name: string;
}

export interface Evaluation {
  id: string;
  courseCycleId: string;
  evaluationTypeId: string;
  number: number;
  startDate: string;
  endDate: string;
  evaluationType?: EvaluationType;
}

// ============================================
// ENROLLMENTS
// ============================================

export interface EnrollmentType {
  id: string;
  code: 'FULL' | 'PARTIAL';
  name: string;
}

export interface EnrollmentStatus {
  id: string;
  code: string;
  name: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseCycleId: string;
  enrollmentStatusId: string;
  enrollmentTypeId: string;
  enrolledAt: string;
  cancelledAt?: string;
  courseCycle?: CourseCycle;
  enrollmentStatus?: EnrollmentStatus;
  enrollmentType?: EnrollmentType;
}

export interface EnrollmentEvaluation {
  id: string;
  enrollmentId: string;
  evaluationId: string;
  accessStartDate: string;
  accessEndDate: string;
  isActive: boolean;
  revokedAt?: string;
  revokedBy?: string;
  evaluation?: Evaluation;
}

// ============================================
// MATERIALS
// ============================================

export interface MaterialFolder {
  id: string;
  evaluationId: string;
  parentFolderId?: string;
  name: string;
  visibleFrom?: string;
  visibleUntil?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Material {
  id: string;
  materialFolderId: string;
  displayName: string;
  visibleFrom?: string;
  visibleUntil?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// NOTIFICATIONS
// ============================================

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
