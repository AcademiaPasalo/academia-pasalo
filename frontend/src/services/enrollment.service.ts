// ============================================
// ENROLLMENT SERVICE - Gestión de Matrículas
// ============================================

import { apiClient } from '@/lib/apiClient';
import type { EnrollmentResponse } from '@/types/enrollment';

export const enrollmentService = {
  /**
   * Obtener los cursos matriculados del usuario actual
   */
  async getMyCourses(): Promise<EnrollmentResponse> {
    const response = await apiClient.get<EnrollmentResponse>('/enrollments/my-courses');
    return response.data;
  },
};
