/**
 * Hook para manejar enrutamiento basado en roles
 * Proporciona validación de acceso y selección automática de componentes
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/config/navigation';
import {
  hasRouteAccess,
  getComponentForRoute,
  getRedirectOnDenied,
  normalizeRoute,
  sanitizeRouteParam
} from '@/lib/roleBasedRouting';

export interface RouteGuardResult {
  hasAccess: boolean;
  componentPath: string | null;
  isLoading: boolean;
  userRole: UserRole | null;
}

/**
 * Hook que protege rutas y selecciona el componente correcto según el rol
 * @param customRoute - Ruta personalizada (opcional, por defecto usa pathname)
 */
export function useRoleBasedRoute(customRoute?: string): RouteGuardResult {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const route = customRoute || pathname;
  const normalizedRoute = normalizeRoute(route || '');
  const userRole = (user?.roles?.[0]?.code as UserRole) || null;

  // Calcular estado de carga y acceso directamente
  const isLoading = authLoading;
  const hasAccess = !authLoading && isAuthenticated && userRole ? hasRouteAccess(normalizedRoute, userRole) : false;

  useEffect(() => {
    // Esperar a que la autenticación esté lista
    if (authLoading) {
      return;
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated || !user || !userRole) {
      router.push('/plataforma');
      return;
    }

    // Verificar acceso a la ruta
    if (!hasRouteAccess(normalizedRoute, userRole)) {
      console.warn(`⚠️ Acceso denegado a ${route} para rol ${userRole}`);
      const redirectTo = getRedirectOnDenied(normalizedRoute);
      router.push(redirectTo);
      return;
    }
  }, [authLoading, isAuthenticated, user, userRole, route, normalizedRoute, router]);

  // Obtener el componente que debe renderizarse
  const componentPath = userRole ? getComponentForRoute(normalizedRoute, userRole) : null;

  return {
    hasAccess,
    componentPath,
    isLoading,
    userRole
  };
}

/**
 * Hook simplificado que solo verifica si el usuario tiene acceso a una ruta
 */
export function useHasRouteAccess(route: string): boolean {
  const { user, isAuthenticated } = useAuth();
  const userRole = (user?.roles?.[0]?.code as UserRole) || null;
  const normalizedRoute = normalizeRoute(route);

  if (!isAuthenticated || !userRole) {
    return false;
  }

  return hasRouteAccess(normalizedRoute, userRole);
}

/**
 * Hook para sanitizar parámetros de ruta
 */
export function useSanitizedParam(param: string | undefined): string | null {
  if (!param) return null;
  return sanitizeRouteParam(param);
}
