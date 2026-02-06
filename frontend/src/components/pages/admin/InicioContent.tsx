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
          Esta página está en desarrollo. Pronto podrás gestionar usuarios, 
          cursos, ciclos y configuración del sistema.
        </p>
      </div>

      <div className="bg-bg-tertiary rounded-xl p-6 max-w-lg">
        <h3 className="font-semibold text-primary mb-3">Próximas Funcionalidades:</h3>
        <ul className="space-y-2 text-secondary">
          <li className="flex items-start gap-2">
            <Icon name="check_circle" size={20} className="text-success-solid mt-0.5" />
            <span>Gestión de usuarios y roles</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="check_circle" size={20} className="text-success-solid mt-0.5" />
            <span>Administración de cursos y ciclos</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="check_circle" size={20} className="text-success-solid mt-0.5" />
            <span>Reportes y estadísticas</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="check_circle" size={20} className="text-success-solid mt-0.5" />
            <span>Configuración del sistema</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
