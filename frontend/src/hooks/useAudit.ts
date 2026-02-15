// ============================================
// USE AUDIT HOOK - GESTIÓN DE HISTORIAL DE AUDITORÍA
// ============================================

import { useState, useCallback } from 'react';
import { auditService } from '@/services/audit.service';
import type { AuditEntry, AuditHistoryParams } from '@/types/api';

export function useAudit() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async (params?: AuditHistoryParams) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [useAudit] Fetching history with params:', params);
      const data = await auditService.getHistory(params);
      console.log('🔍 [useAudit] Response data:', data, 'type:', typeof data, 'isArray:', Array.isArray(data), 'length:', data?.length);
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar historial');
      console.error('Error loading audit history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportToExcel = useCallback(async (params?: AuditHistoryParams) => {
    try {
      const blob = await auditService.exportToExcel(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoria_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar');
      console.error('Error exporting audit:', err);
    }
  }, []);

  return {
    entries,
    loading,
    error,
    loadHistory,
    exportToExcel,
  };
}
