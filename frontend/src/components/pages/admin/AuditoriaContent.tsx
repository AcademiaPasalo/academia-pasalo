'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useAudit } from '@/hooks/useAudit';
import { usersService } from '@/services/users.service';
import Icon from '@/components/ui/Icon';
import ConfirmBanModal from '@/components/modals/ConfirmBanModal';
import type { AuditEntry, AuditHistoryParams, AuditSource } from '@/types/api';

// Colores de badge según tipo de acción
function getActionBadge(actionCode: string): { bg: string; text: string } {
  switch (actionCode) {
    case 'ANOMALOUS_LOGIN_DETECTED':
      return { bg: 'bg-error-secondary', text: 'text-error-solid' };
    case 'CONCURRENT_SESSION_DETECTED':
    case 'CONCURRENT_SESSION_RESOLVED':
      return { bg: 'bg-warning-secondary', text: 'text-warning-solid' };
    case 'LOGIN_SUCCESS':
    case 'LOGOUT_SUCCESS':
      return { bg: 'bg-success-secondary', text: 'text-success-solid' };
    case 'LOGIN_FAILED':
    case 'ACCESS_DENIED':
      return { bg: 'bg-error-secondary', text: 'text-error-solid' };
    default:
      return { bg: 'bg-bg-secondary', text: 'text-text-secondary' };
  }
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AuditoriaContent() {
  const { setBreadcrumbItems } = useBreadcrumb();
  const { entries, loading, error, loadHistory, exportToExcel } = useAudit();

  // Filtros
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sourceFilter, setSourceFilter] = useState<AuditSource | ''>('SECURITY');

  // Ban modal
  const [banTarget, setBanTarget] = useState<{ userId: string; userName: string } | null>(null);
  const [banLoading, setBanLoading] = useState(false);

  // Detalle expandido
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setBreadcrumbItems([{ icon: 'shield', label: 'Auditoría' }]);
  }, [setBreadcrumbItems]);

  const handleSearch = useCallback(() => {
    const params: AuditHistoryParams = {
      limit: 100,
    };
    if (startDate) params.startDate = new Date(`${startDate}T00:00:00`).toISOString();
    if (endDate) params.endDate = new Date(`${endDate}T23:59:59.999`).toISOString();
    loadHistory(params);
  }, [startDate, endDate, loadHistory]);

  // Carga inicial
  useEffect(() => {
    handleSearch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = () => {
    const params: AuditHistoryParams = {};
    if (startDate) params.startDate = new Date(`${startDate}T00:00:00`).toISOString();
    if (endDate) params.endDate = new Date(`${endDate}T23:59:59.999`).toISOString();
    exportToExcel(params);
  };

  const handleBan = async () => {
    if (!banTarget) return;
    setBanLoading(true);
    try {
      await usersService.ban(banTarget.userId);
      setBanTarget(null);
      handleSearch(); // Recargar
    } catch (err) {
      console.error('Error banning user:', err);
    } finally {
      setBanLoading(false);
    }
  };

  // Filtrar por source en el frontend (el endpoint no tiene filtro de source)
  const filteredEntries = sourceFilter
    ? entries.filter((e) => e.source === sourceFilter)
    : entries;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold text-text-primary">
        Auditoría de Seguridad
      </h1>

      {/* Filtros */}
      <div className="p-4 bg-bg-primary rounded-xl border border-stroke-primary">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-stroke-primary bg-bg-primary text-sm text-text-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-stroke-primary bg-bg-primary text-sm text-text-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Fuente</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as AuditSource | '')}
              className="h-10 px-3 rounded-lg border border-stroke-primary bg-bg-primary text-sm text-text-primary"
            >
              <option value="">Todas</option>
              <option value="SECURITY">Seguridad</option>
              <option value="AUDIT">Auditoría</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="h-10 px-4 rounded-lg bg-accent-solid text-white text-sm font-medium hover:bg-accent-solid/90 transition-colors disabled:opacity-50"
          >
            Buscar
          </button>
          <button
            onClick={handleExport}
            className="h-10 px-4 rounded-lg border border-stroke-accent-primary text-text-accent-primary text-sm font-medium hover:bg-accent-light transition-colors flex items-center gap-1.5"
          >
            <Icon name="download" size={16} />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-error-secondary border border-error-solid/20">
          <p className="text-sm text-error-solid">{error}</p>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-bg-primary rounded-xl border border-stroke-primary overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-accent-light border-t-accent-solid rounded-full animate-spin" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Icon name="search_off" size={48} className="text-text-tertiary" />
            <p className="text-text-secondary text-sm">No se encontraron eventos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke-primary bg-bg-secondary">
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Usuario</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Acción</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Fuente</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">IP</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry: AuditEntry) => {
                  const badge = getActionBadge(entry.actionCode);
                  const isExpanded = expandedId === entry.id;
                  const isAnomaly = entry.actionCode === 'ANOMALOUS_LOGIN_DETECTED';

                  return (
                    <Fragment key={entry.id}>
                      <tr className={`border-b border-stroke-secondary last:border-b-0 ${isExpanded ? 'bg-bg-secondary/50' : ''}`}>
                        <td className="px-4 py-3 text-text-primary whitespace-nowrap">
                          {formatDateTime(entry.datetime)}
                        </td>
                        <td className="px-4 py-3 text-text-primary">
                          {entry.userName}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                            {entry.actionName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {entry.source === 'SECURITY' ? 'Seguridad' : 'Auditoría'}
                        </td>
                        <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                          {entry.ipAddress || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                              className="p-1 rounded hover:bg-bg-secondary transition-colors"
                              title="Ver detalles"
                            >
                              <Icon name={isExpanded ? 'expand_less' : 'expand_more'} size={18} className="text-text-tertiary" />
                            </button>
                            {isAnomaly && (
                              <button
                                onClick={() => setBanTarget({ userId: entry.userId, userName: entry.userName })}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium text-error-solid bg-error-secondary border border-error-solid/20 hover:bg-error-solid hover:text-white transition-colors"
                                title="Desactivar cuenta"
                              >
                                Desactivar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && entry.metadata && (
                        <tr className="border-b border-stroke-secondary">
                          <td colSpan={6} className="px-4 py-3 bg-bg-secondary">
                            <p className="text-xs font-medium text-text-secondary mb-2">Metadata del evento:</p>
                            <pre className="text-xs text-text-primary bg-bg-primary p-3 rounded-lg overflow-x-auto border border-stroke-primary">
                              {JSON.stringify(entry.metadata, null, 2)}
                            </pre>
                            {entry.userAgent && (
                              <p className="text-xs text-text-tertiary mt-2">
                                User-Agent: {entry.userAgent}
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      <ConfirmBanModal
        isOpen={!!banTarget}
        userName={banTarget?.userName || ''}
        onConfirm={handleBan}
        onCancel={() => setBanTarget(null)}
        loading={banLoading}
      />
    </div>
  );
}
