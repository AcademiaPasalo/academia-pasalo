// ============================================
// EVALUATIONS SERVICE - GESTIÓN DE EVALUACIONES
// ============================================

import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, Evaluation } from '@/types/api';

export const evaluationsService = {
  /**
   * Crear una nueva evaluación (ADMIN/SUPER_ADMIN)
   * ⚠️ Al crearla, si hay alumnos matriculados FULL, se les otorga acceso automático
   */
  async create(data: {
    courseCycleId: string;
    evaluationTypeId: string;
    number: number;
    startDate: string;
    endDate: string;
  }): Promise<Evaluation> {
    const response = await apiClient.post<ApiResponse<Evaluation>>(
      '/evaluations',
      data
    );
    return response.data.data;
  },

  /**
   * Listar evaluaciones de un curso en un ciclo específico (ADMIN/SUPER_ADMIN)
   */
  async findByCourseCycle(courseCycleId: string): Promise<Evaluation[]> {
    const response = await apiClient.get<ApiResponse<Evaluation[]>>(
      `/evaluations/course-cycle/${courseCycleId}`
    );
    return response.data.data;
  },
};
