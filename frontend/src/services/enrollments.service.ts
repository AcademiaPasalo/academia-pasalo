// ============================================
// ENROLLMENTS SERVICE - GESTIÓN DE MATRÍCULAS
// ============================================

import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, Enrollment } from '@/types/api';
import type { Enrollment as MyEnrollment } from '@/types/enrollment';

export const enrollmentsService = {
  /**
   * Obtener mis cursos matriculados (alumno autenticado)
   *
   * Endpoint: GET /enrollments/my-courses
   * Cache: 1 hora (gestionado por backend)
   */
  async getMyEnrollments(): Promise<MyEnrollment[]> {
    const response = await apiClient.get<MyEnrollment[]>('/enrollments/my-courses');
    return response.data;
  },

  /**
   * Matricular un alumno en un curso (ADMIN/SUPER_ADMIN)
   *
   * Tipos de matrícula:
   * - FULL: Acceso a todo el ciclo actual + histórico
   * - PARTIAL: Acceso solo a evaluaciones pagadas + Banco (con vigencia recortada)
   *
   * ⚠️ El backend calcula automáticamente los accesos iniciales según el tipo
   */
  async enroll(data: {
    userId: string;
    courseCycleId: string;
    enrollmentTypeId: string;
  }): Promise<Enrollment> {
    const response = await apiClient.post<ApiResponse<Enrollment>>(
      '/enrollments',
      data
    );
    return response.data.data;
  },
};
