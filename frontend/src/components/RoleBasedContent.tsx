/**
 * Componente que renderiza dinámicamente el contenido según el rol del usuario
 * Proporciona seguridad y modularidad al sistema de páginas
 */

'use client';

import { useRoleBasedRoute } from '@/hooks/useRoleBasedRoute';
import Icon from '@/components/ui/Icon';

// Importar componentes de estudiante
import StudentInicioContent from '@/components/pages/student/InicioContent';
import StudentCursoContent from '@/components/pages/student/CursoContent';
import StudentCalendarioContent from '@/components/pages/student/CalendarioContent';

// Importar componentes de docente
import TeacherInicioContent from '@/components/pages/teacher/InicioContent';

// Importar componentes de admin
import AdminInicioContent from '@/components/pages/admin/InicioContent';

/**
 * Mapa de componentes disponibles
 * Cada entrada corresponde a un componente específico de rol
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentMap: Record<string, React.ComponentType<any>> = {
  // Estudiante
  'student/InicioContent': StudentInicioContent,
  'student/CursoContent': StudentCursoContent,
  'student/CalendarioContent': StudentCalendarioContent,
  
  // Docente
  'teacher/InicioContent': TeacherInicioContent,
  
  // Admin
  'admin/InicioContent': AdminInicioContent,
};

interface RoleBasedContentProps {
  customRoute?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  componentProps?: Record<string, any>;
}

/**
 * Componente que renderiza el contenido correcto según el rol y la ruta
 */
export default function RoleBasedContent({ 
  customRoute, 
  componentProps = {} 
}: RoleBasedContentProps) {
  const { hasAccess, componentPath, isLoading, userRole } = useRoleBasedRoute(customRoute);

  // Estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-solid border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Sin acceso
  if (!hasAccess || !componentPath) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Icon name="block" size={80} className="text-error-solid mx-auto" />
          <h2 className="text-2xl font-semibold text-primary">
            Acceso Denegado
          </h2>
          <p className="text-secondary max-w-md">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  // Obtener el componente del mapa
  const Component = componentMap[componentPath];

  // Componente no encontrado
  if (!Component) {
    console.error(`⚠️ Componente no encontrado: ${componentPath}`);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Icon name="construction" size={80} className="text-warning-solid mx-auto" />
          <h2 className="text-2xl font-semibold text-primary">
            Página en Construcción
          </h2>
          <p className="text-secondary max-w-md">
            Esta página aún no ha sido implementada para tu rol ({userRole}).
          </p>
        </div>
      </div>
    );
  }

  // Renderizar el componente con sus props
  return <Component {...componentProps} />;
}
