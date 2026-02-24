/**
 * Sistema de enrutamiento basado en roles
 * Define qué componentes debe ver cada rol en cada ruta
 */

import { UserRole } from '@/config/navigation';

export type RouteAccess = {
  allowedRoles: UserRole[];
  component: string; // Nombre del componente a renderizar
  redirectOnDenied?: string; // Ruta de redirección si no tiene acceso
};

/**
 * Configuración de acceso por ruta
 * Define qué roles pueden acceder a cada ruta y qué componente deben ver
 */
export const routeAccessConfig: Record<string, RouteAccess> = {
  '/plataforma/inicio': {
    allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN'],
    component: 'InicioContent',
    redirectOnDenied: '/plataforma/inicio'
  },
  '/plataforma/curso/[id]': {
    allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'],
    component: 'CursoContent',
    redirectOnDenied: '/plataforma/inicio'
  },
  '/plataforma/calendario': {
    allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN'],
    component: 'CalendarioContent',
    redirectOnDenied: '/plataforma/inicio'
  },
  '/plataforma/notificaciones': {
    allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN'],
    component: 'NotificacionesContent',
    redirectOnDenied: '/plataforma/inicio'
  },
  // Rutas de administración
  '/plataforma/admin/usuarios': {
    allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    component: 'UsuariosContent',
    redirectOnDenied: '/plataforma/inicio'
  },
  '/plataforma/admin/auditoria': {
    allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    component: 'AuditoriaContent',
    redirectOnDenied: '/plataforma/inicio'
  },
  '/plataforma/admin/configuracion': {
    allowedRoles: ['SUPER_ADMIN'],
    component: 'ConfiguracionContent',
    redirectOnDenied: '/plataforma/inicio'
  },
  // Ruta compartida para todos los roles
  '/plataforma/perfil': {
    allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN'],
    component: 'PerfilContent',
    redirectOnDenied: '/plataforma/inicio'
  }
};

/**
 * Componentes específicos por rol para cada ruta
 * Permite que la misma ruta renderice diferentes componentes según el rol
 */
export const roleBasedComponents: Record<string, Partial<Record<UserRole, string>>> = {
  '/plataforma/inicio': {
    STUDENT: 'student/InicioContent',
    TEACHER: 'teacher/InicioContent',
    ADMIN: 'admin/InicioContent',
    SUPER_ADMIN: 'admin/InicioContent'
  },
  '/plataforma/curso/[id]': {
    STUDENT: 'student/CursoContent',
    TEACHER: 'teacher/CursoContent',
    ADMIN: 'admin/CursoContent'
  },
  '/plataforma/calendario': {
    STUDENT: 'student/CalendarioContent',
    TEACHER: 'teacher/CalendarioContent',
    ADMIN: 'admin/CalendarioContent'
  },
  '/plataforma/notificaciones': {
    STUDENT: 'student/NotificacionesContent',
    TEACHER: 'teacher/NotificacionesContent',
    ADMIN: 'admin/NotificacionesContent',
    SUPER_ADMIN: 'admin/NotificacionesContent'
  },
  '/plataforma/admin/auditoria': {
    ADMIN: 'admin/AuditoriaContent',
    SUPER_ADMIN: 'admin/AuditoriaContent'
  }
};

/**
 * Verifica si un rol tiene acceso a una ruta específica
 */
export function hasRouteAccess(route: string, userRole: UserRole): boolean {
  const access = routeAccessConfig[route];
  if (!access) {
    // Si no está definida, denegar acceso por defecto (seguridad)
    console.warn(`⚠️ Ruta no configurada en routeAccessConfig: ${route}`);
    return false;
  }
  return access.allowedRoles.includes(userRole);
}

/**
 * Obtiene el componente que debe renderizar un rol en una ruta específica
 */
export function getComponentForRoute(route: string, userRole: UserRole): string | null {
  const components = roleBasedComponents[route];
  if (!components) {
    console.warn(`⚠️ Componentes no configurados para la ruta: ${route}`);
    return null;
  }

  const component = components[userRole];
  if (!component) {
    console.warn(`⚠️ Componente no configurado para ${userRole} en ${route}`);
    return null;
  }

  return component;
}

/**
 * Obtiene la ruta de redirección si el usuario no tiene acceso
 */
export function getRedirectOnDenied(route: string): string {
  const access = routeAccessConfig[route];
  return access?.redirectOnDenied || '/plataforma/inicio';
}

/**
 * Valida y sanitiza parámetros dinámicos de rutas
 * Previene ataques de inyección y path traversal
 */
export function sanitizeRouteParam(param: string): string {
  // Remover caracteres peligrosos
  return param.replace(/[^a-zA-Z0-9-_]/g, '');
}

/**
 * Normaliza una ruta dinámica para buscarla en la configuración
 * Ejemplo: /plataforma/curso/123 -> /plataforma/curso/[id]
 */
export function normalizeRoute(route: string): string {
  return route.replace(/\/[0-9a-f-]+(?=\/|$)/gi, '/[id]');
}
