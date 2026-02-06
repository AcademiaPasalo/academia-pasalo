/**
 * Sistema de configuración de navegación centralizado
 * Permite configurar navegación por roles y personalizar según contexto
 */

import { SidebarNavItem } from '@/components/dashboard/Sidebar';

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';

// Códigos de rol que vienen del backend
export type BackendRoleCode = 'STUDENT' | 'PROFESSOR' | 'ADMIN' | 'SUPER_ADMIN';

/**
 * Mapea códigos de rol del backend a códigos internos del frontend
 * El backend usa PROFESSOR pero internamente usamos TEACHER para consistencia
 */
export function mapBackendRoleToUserRole(backendCode: string): UserRole {
  const mapping: Record<string, UserRole> = {
    'STUDENT': 'STUDENT',
    'PROFESSOR': 'TEACHER', // ⚠️ Backend usa PROFESSOR, frontend usa TEACHER
    'ADMIN': 'ADMIN',
    'SUPER_ADMIN': 'SUPER_ADMIN'
  };

  return mapping[backendCode] || 'STUDENT';
}

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
      icon: 'notifications',
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
  ],

  ADMIN: [
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
      icon: 'notifications',
      label: 'Notificaciones',
      href: '/plataforma/notificaciones'
    }    
  ],

  SUPER_ADMIN: [
    {
      icon: 'home',
      label: 'Inicio',
      href: '/plataforma/inicio'
    },
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
