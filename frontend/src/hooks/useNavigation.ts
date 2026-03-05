/**
 * Hook personalizado para gestionar la navegación del dashboard
 * Proporciona navegación configurada según rol y ruta actual
 */

import { useMemo, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { enrollmentService } from '@/services/enrollment.service';
import { Enrollment } from '@/types/enrollment';
import {
  getNavigationForRole,
  setActiveNavItem,
  roleAvatarColors,
  roleLabels,
  mapBackendRoleToUserRole,
  type UserRole
} from '@/config/navigation';
import type { SidebarNavItem, SidebarUser } from '@/components/dashboard/Sidebar';
import type { TopBarUser } from '@/components/dashboard/TopBar';

export interface NavigationData {
  navItems: SidebarNavItem[];
  sidebarUser: SidebarUser;
  topBarUser: TopBarUser;
  currentRole: UserRole;
}

/**
 * Hook que proporciona toda la configuración de navegación
 * basada en el usuario autenticado y la ruta actual
 */
export function useNavigation(): NavigationData | null {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [dynamicNavItems, setDynamicNavItems] = useState<SidebarNavItem[]>([]);
  const [isLoadingCursos, setIsLoadingCursos] = useState(true);

  // Obtener rol activo del usuario (basado en lastActiveRoleId o el primero por defecto)
  const getActiveRole = (): UserRole => {
    if (!user || !user.roles || user.roles.length === 0) {
      return 'STUDENT';
    }

    // Si hay un lastActiveRoleId, buscar ese rol
    if (user.lastActiveRoleId) {
      const activeRole = user.roles.find(
        r => (r.id || r.code) === user.lastActiveRoleId
      );
      if (activeRole) {
        // Mapear código del backend a código interno
        return mapBackendRoleToUserRole(activeRole.code);
      }
    }

    // Si no, usar el primer rol
    const firstRole = user.roles[0];
    return firstRole ? mapBackendRoleToUserRole(firstRole.code) : 'STUDENT';
  };

  const primaryRole = getActiveRole();

  // Cargar cursos dinámicamente desde la API real
  useEffect(() => {
    async function loadCursos() {
      if (!isAuthenticated || !user) {
        setIsLoadingCursos(false);
        return;
      }

      try {
        const baseNavItems = getNavigationForRole(primaryRole);

        // Solo cargar cursos para STUDENT (otros roles no tienen "Mis Cursos")
        if (primaryRole === 'STUDENT') {
          const response = await enrollmentService.getMyCourses();
          const enrollments: Enrollment[] = Array.isArray(response) ? response : response.data || [];

          // Actualizar el item "Mis Cursos" con los cursos reales
          const updatedNavItems = baseNavItems.map(item => {
            if (item.label === 'Mis Cursos' && item.expandable) {
              return {
                ...item,
                subItems: enrollments.map(enrollment => ({
                  icon: 'circle',
                  label: enrollment.courseCycle.course.name,
                  href: `/plataforma/curso/${enrollment.courseCycle.id}`
                }))
              };
            }
            return item;
          });

          setDynamicNavItems(updatedNavItems);
        } else {
          setDynamicNavItems(baseNavItems);
        }
      } catch (error) {
        console.error('Error al cargar cursos para navegación:', error);
        setDynamicNavItems(getNavigationForRole(primaryRole));
      } finally {
        setIsLoadingCursos(false);
      }
    }

    loadCursos();
  }, [isAuthenticated, user, primaryRole]);

  return useMemo(() => {
    if (!isAuthenticated || !user || isLoadingCursos) {
      return null;
    }

    // Validar que el usuario tenga los campos requeridos
    if (!user.firstName || !user.email) {
      console.warn('Usuario sin firstName o email, esperando datos completos...');
      return null;
    }

    // Obtener navegación (ya con cursos cargados)
    const navItemsToUse = dynamicNavItems.length > 0 ? dynamicNavItems : getNavigationForRole(primaryRole);

    // Marcar items activos según ruta actual
    const navItems = setActiveNavItem(navItemsToUse, pathname || '/plataforma/inicio');

    // Construir nombre completo
    const fullName = `${user.firstName} ${user.lastName1 || ''}`.trim();

    // Generar iniciales de forma segura
    const firstInitial = user.firstName.charAt(0) || '';
    const lastInitial = user.lastName1?.charAt(0) || '';
    const initials = `${firstInitial}${lastInitial}`.toUpperCase();

    // Obtener color de avatar según rol
    const avatarColor = roleAvatarColors[primaryRole];

    // Obtener etiqueta de rol
    const roleLabel = roleLabels[primaryRole];

    // Configurar usuario para Sidebar
    const sidebarUser: SidebarUser = {
      name: fullName,
      initials: initials,
      role: roleLabel,
      avatarColor: avatarColor
    };

    // Configurar usuario para TopBar
    const topBarUser: TopBarUser = {
      name: fullName,
      initials: initials,
      role: roleLabel,
      avatarColor: avatarColor,
      isOnline: true
    };

    return {
      navItems,
      sidebarUser,
      topBarUser,
      currentRole: primaryRole
    };
  }, [user, isAuthenticated, pathname, dynamicNavItems, isLoadingCursos, primaryRole]);
}

/**
 * Hook para obtener solo los items de navegación
 */
export function useNavigationItems(): SidebarNavItem[] {
  const navigation = useNavigation();
  return navigation?.navItems || [];
}

/**
 * Hook para obtener el usuario del sidebar
 */
export function useSidebarUser(): SidebarUser | null {
  const navigation = useNavigation();
  return navigation?.sidebarUser || null;
}

/**
 * Hook para obtener el usuario del topbar
 */
export function useTopBarUser(): TopBarUser | null {
  const navigation = useNavigation();
  return navigation?.topBarUser || null;
}
