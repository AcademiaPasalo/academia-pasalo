// ============================================
// CLASS EVENT SERVICE - Gestión de Eventos
// ============================================

import { apiClient } from '@/lib/apiClient';
import type { ClassEventResponse } from '@/types/classEvent';

export const classEventService = {
  /**
   * Obtener la agenda del usuario (eventos programados)
   * @param start Fecha de inicio del rango (ISO-8601)
   * @param end Fecha de fin del rango (ISO-8601)
   */
  async getMySchedule(start: string, end: string): Promise<ClassEventResponse> {
    const response = await apiClient.get<ClassEventResponse>(
      `/class-events/my-schedule?start=${start}&end=${end}`
    );
    return response.data;
  },
};
