/**
 * Página de Inicio para Docentes
 * TODO: Implementar diseño específico para docentes
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
        <Icon name="work" size={80} className="text-accent-secondary mx-auto" />
        <h1 className="text-3xl font-semibold text-primary">
          Panel de Docente
        </h1>
        <p className="text-lg text-secondary max-w-md">
          Esta página está en desarrollo. Pronto podrás ver tus cursos asignados, 
          calificaciones pendientes y más.
        </p>
      </div>

      <div className="bg-bg-tertiary rounded-xl p-6 max-w-lg">
        <h3 className="font-semibold text-primary mb-3">Próximas Funcionalidades:</h3>
        <ul className="space-y-2 text-secondary">
          <li className="flex items-start gap-2">
            <Icon name="check_circle" size={20} className="text-success-solid mt-0.5" />
            <span>Vista de cursos asignados</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="check_circle" size={20} className="text-success-solid mt-0.5" />
            <span>Calificaciones pendientes</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="check_circle" size={20} className="text-success-solid mt-0.5" />
            <span>Horario de clases</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="check_circle" size={20} className="text-success-solid mt-0.5" />
            <span>Estadísticas de estudiantes</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
