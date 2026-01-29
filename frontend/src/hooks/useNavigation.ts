/**
 * Hook personalizado para gestionar la navegación del dashboard
 * Proporciona navegación configurada según rol y ruta actual
 */

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getNavigationForRole, 
  setActiveNavItem,
  roleAvatarColors,
  roleLabels,
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

  return useMemo(() => {
    if (!isAuthenticated || !user) {
      return null;
    }

    // Obtener rol principal del usuario
    const primaryRole = user.roles[0]?.code as UserRole || 'STUDENT';

    // Obtener navegación para el rol
    const baseNavItems = getNavigationForRole(primaryRole);

    // Marcar items activos según ruta actual
    const navItems = setActiveNavItem(baseNavItems, pathname || '/plataforma/inicio');

    // Construir nombre completo
    const fullName = `${user.firstName} ${user.lastName1 || ''}`.trim();

    // Generar iniciales
    const initials = `${user.firstName.charAt(0)}${user.lastName1?.charAt(0) || ''}`.toUpperCase();

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
  }, [user, isAuthenticated, pathname]);
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
