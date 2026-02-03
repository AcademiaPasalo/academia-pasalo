/**
 * Sistema de configuración de navegación centralizado
 * Permite configurar navegación por roles y personalizar según contexto
 */

import { SidebarNavItem } from '@/components/dashboard/Sidebar';

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';

/**
 * Configuración de navegación por rol
 */
export const navigationConfig: Record<UserRole, SidebarNavItem[]> = {
  STUDENT: [
    {
      icon: 'home',
      label: 'Inicio',
      href: '/plataforma/inicio'
    },
    {
      icon: 'class',
      label: 'Mis Cursos',
      href: '#',
      expandable: true,
      subItems: []
    },
    {
      icon: 'event',
      label: 'Calendario',
      href: '/plataforma/calendario'
    },
    {
      icon: 'notifications_unread',
      label: 'Notificaciones',
      href: '/plataforma/notificaciones'
    }
  ],

  TEACHER: [
    {
      icon: 'home',
      label: 'Inicio',
      href: '/plataforma/inicio'
    },
    {
      icon: 'school',
      label: 'Mis Clases',
      href: '/plataforma/clases',
      expandable: true,
      subItems: [
        { icon: 'circle', label: 'Activas', href: '/plataforma/clases/activas' },
        { icon: 'circle', label: 'Programadas', href: '/plataforma/clases/programadas' },
        { icon: 'circle', label: 'Historial', href: '/plataforma/clases/historial' }
      ]
    },
    {
      icon: 'groups',
      label: 'Estudiantes',
      href: '/plataforma/estudiantes'
    },
    {
      icon: 'assignment',
      label: 'Tareas',
      href: '/plataforma/tareas',
      expandable: true,
      subItems: [
        { icon: 'circle', label: 'Pendientes', href: '/plataforma/tareas/pendientes' },
        { icon: 'circle', label: 'Calificadas', href: '/plataforma/tareas/calificadas' },
        { icon: 'circle', label: 'Crear Nueva', href: '/plataforma/tareas/nueva' }
      ]
    },
    {
      icon: 'folder',
      label: 'Materiales',
      href: '/plataforma/materiales'
    },
    {
      icon: 'analytics',
      label: 'Reportes',
      href: '/plataforma/reportes'
    }
  ],

  ADMIN: [
    {
      icon: 'dashboard',
      label: 'Dashboard',
      href: '/plataforma/dashboard'
    },
    {
      icon: 'groups',
      label: 'Usuarios',
      href: '/plataforma/usuarios',
      expandable: true,
      subItems: [
        { icon: 'circle', label: 'Estudiantes', href: '/plataforma/usuarios/estudiantes' },
        { icon: 'circle', label: 'Docentes', href: '/plataforma/usuarios/docentes' },
        { icon: 'circle', label: 'Administradores', href: '/plataforma/usuarios/administradores' }
      ]
    },
    {
      icon: 'school',
      label: 'Cursos',
      href: '/plataforma/cursos',
      expandable: true,
      subItems: [
        { icon: 'circle', label: 'Ver Todos', href: '/plataforma/cursos/todos' },
        { icon: 'circle', label: 'Crear Curso', href: '/plataforma/cursos/nuevo' },
        { icon: 'circle', label: 'Categorías', href: '/plataforma/cursos/categorias' }
      ]
    },
    {
      icon: 'event',
      label: 'Calendario',
      href: '/plataforma/calendario'
    },
    {
      icon: 'folder',
      label: 'Materiales',
      href: '/plataforma/materiales'
    },
    {
      icon: 'analytics',
      label: 'Reportes',
      href: '/plataforma/reportes',
      expandable: true,
      subItems: [
        { icon: 'circle', label: 'Estudiantes', href: '/plataforma/reportes/estudiantes' },
        { icon: 'circle', label: 'Cursos', href: '/plataforma/reportes/cursos' },
        { icon: 'circle', label: 'Finanzas', href: '/plataforma/reportes/finanzas' }
      ]
    },
    {
      icon: 'settings',
      label: 'Configuración',
      href: '/plataforma/configuracion'
    }
  ],

  SUPER_ADMIN: [
    {
      icon: 'admin_panel_settings',
      label: 'Admin Panel',
      href: '/plataforma/admin'
    },
    {
      icon: 'groups',
      label: 'Gestión de Usuarios',
      href: '/plataforma/usuarios',
      expandable: true,
      subItems: [
        { icon: 'circle', label: 'Todos los Usuarios', href: '/plataforma/usuarios/todos' },
        { icon: 'circle', label: 'Roles y Permisos', href: '/plataforma/usuarios/roles' },
        { icon: 'circle', label: 'Sesiones Activas', href: '/plataforma/usuarios/sesiones' }
      ]
    },
    {
      icon: 'domain',
      label: 'Organizaciones',
      href: '/plataforma/organizaciones'
    },
    {
      icon: 'security',
      label: 'Seguridad',
      href: '/plataforma/seguridad',
      expandable: true,
      subItems: [
        { icon: 'circle', label: 'Logs de Auditoría', href: '/plataforma/seguridad/logs' },
        { icon: 'circle', label: 'Políticas', href: '/plataforma/seguridad/politicas' },
        { icon: 'circle', label: 'Backups', href: '/plataforma/seguridad/backups' }
      ]
    },
    {
      icon: 'analytics',
      label: 'Analytics',
      href: '/plataforma/analytics'
    },
    {
      icon: 'settings',
      label: 'Sistema',
      href: '/plataforma/sistema',
      expandable: true,
      subItems: [
        { icon: 'circle', label: 'Configuración', href: '/plataforma/sistema/configuracion' },
        { icon: 'circle', label: 'Integraciones', href: '/plataforma/sistema/integraciones' },
        { icon: 'circle', label: 'Mantenimiento', href: '/plataforma/sistema/mantenimiento' }
      ]
    }
  ]
};

/**
 * Obtener navegación según rol
 */
export function getNavigationForRole(role: UserRole): SidebarNavItem[] {
  return navigationConfig[role] || navigationConfig.STUDENT;
}

/**
 * Marcar item activo según ruta actual
 */
export function setActiveNavItem(
  items: SidebarNavItem[], 
  currentPath: string
): SidebarNavItem[] {
  return items.map(item => {
    // Verificar si el item principal está activo
    const isActive = currentPath === item.href || 
                     (item.subItems?.some(sub => currentPath === sub.href) ?? false);
    
    return {
      ...item,
      active: isActive,
      subItems: item.subItems?.map(sub => ({
        ...sub,
        active: currentPath === sub.href
      }))
    };
  });
}

/**
 * Colores de avatar según rol
 */
export const roleAvatarColors: Record<UserRole, string> = {
  STUDENT: 'bg-[#7C3AED]',     // Purple
  TEACHER: 'bg-[#059669]',     // Green
  ADMIN: 'bg-[#DC2626]',       // Red
  SUPER_ADMIN: 'bg-[#EA580C]'  // Orange
};

/**
 * Etiquetas de rol en español
 */
export const roleLabels: Record<UserRole, string> = {
  STUDENT: 'Alumno',
  TEACHER: 'Docente',
  ADMIN: 'Administrador',
  SUPER_ADMIN: 'Super Admin'
};
