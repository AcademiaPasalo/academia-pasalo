// ============================================
// ENROLLMENTS SERVICE - GESTIÓN DE MATRÍCULAS
// ============================================

import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, Enrollment } from '@/types/api';

export const enrollmentsService = {
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
