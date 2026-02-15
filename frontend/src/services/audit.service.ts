// ============================================
// AUDIT SERVICE - HISTORIAL DE AUDITORÍA Y SEGURIDAD
// ============================================

import { apiClient } from '@/lib/apiClient';
import { getAccessToken } from '@/lib/storage';
import type { AuditEntry, AuditHistoryParams } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function buildQueryString(params?: AuditHistoryParams): string {
  if (!params) return '';
  const query = new URLSearchParams();
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.userId) query.append('userId', params.userId);
  if (params.limit) query.append('limit', String(params.limit));
  const str = query.toString();
  return str ? `?${str}` : '';
}

export const auditService = {
  /**
   * Obtener historial de auditoría unificado (ADMIN/SUPER_ADMIN)
   * Endpoint: GET /audit/history
   */
  async getHistory(params?: AuditHistoryParams): Promise<AuditEntry[]> {
    const endpoint = `/audit/history${buildQueryString(params)}`;
    console.log('🔍 [auditService] GET', endpoint);
    const response = await apiClient.get<AuditEntry[]>(endpoint);
    console.log('🔍 [auditService] Raw response:', JSON.stringify(response).slice(0, 500));
    return response.data ?? [];
  },

  /**
   * Exportar historial a Excel (ADMIN/SUPER_ADMIN)
   * Endpoint: GET /audit/export
   * Usa fetch directo porque apiClient parsea JSON y este endpoint retorna binary stream
   */
  async exportToExcel(params?: AuditHistoryParams): Promise<Blob> {
    const url = `${API_BASE_URL}/audit/export${buildQueryString(params)}`;
    const token = getAccessToken();

    const response = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Error al exportar el historial de auditoría');
    }

    return response.blob();
  },
};
