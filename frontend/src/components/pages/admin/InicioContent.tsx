/**
 * Página de Inicio para Administradores
 * TODO: Implementar diseño específico para administradores
 */

'use client';

import { useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

export default function InicioContent() {
  const { setBreadcrumbItems } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbItems([{ icon: 'home', label: 'Inicio' }]);
  }, [setBreadcrumbItems]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="text-center space-y-4">
        <Icon name="admin_panel_settings" size={80} className="text-accent-secondary mx-auto" />
        <h1 className="text-3xl font-semibold text-primary">
          Panel de Administración
        </h1>
        <p className="text-lg text-secondary max-w-md">
          Esta página está en desarrollo.
        </p>
      </div>
    </div>
  );
}
