// ============================================
// CYCLES SERVICE - GESTIÓN DE CICLOS ACADÉMICOS
// ============================================

import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, AcademicCycle } from '@/types/api';

export const cyclesService = {
  /**
   * Listar todos los ciclos académicos (ADMIN/SUPER_ADMIN)
   */
  async findAll(): Promise<AcademicCycle[]> {
    const response = await apiClient.get<ApiResponse<AcademicCycle[]>>('/cycles');
    return response.data.data;
  },

  /**
   * Obtener el ciclo académico activo (Todos los usuarios autenticados)
   */
  async getActiveCycle(): Promise<AcademicCycle> {
    const response = await apiClient.get<ApiResponse<AcademicCycle>>('/cycles/active');
    return response.data.data;
  },

  /**
   * Obtener detalle de un ciclo académico (ADMIN/SUPER_ADMIN)
   */
  async findOne(id: string): Promise<AcademicCycle> {
    const response = await apiClient.get<ApiResponse<AcademicCycle>>(`/cycles/${id}`);
    return response.data.data;
  },
};
