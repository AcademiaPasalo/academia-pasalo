// ============================================
// EVALUATIONS SERVICE - GESTIÓN DE EVALUACIONES
// ============================================

import { apiClient } from '@/lib/apiClient';
import type { Evaluation } from '@/types/api';

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
    const response = await apiClient.post<Evaluation>(
      '/evaluations',
      data
    );
    return response.data;
  },

  /**
   * Listar evaluaciones de un curso en un ciclo específico
   */
  async findByCourseCycle(courseCycleId: string): Promise<Evaluation[]> {
    const response = await apiClient.get<Evaluation[]>(
      `/evaluations/course-cycle/${courseCycleId}`
    );
    return response.data;
  },
};
