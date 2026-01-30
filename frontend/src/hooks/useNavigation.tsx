'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { navigationConfig, type UserRole } from '@/config/navigation';
import { SidebarNavItem } from '@/components/dashboard/Sidebar';
import { SidebarUser } from '@/components/dashboard/Sidebar';
import { TopBarUser } from '@/components/dashboard/TopBar';
import { useDynamicNavigation } from '@/hooks/useDynamicNavigation';

interface NavigationData {
  navItems: SidebarNavItem[];
  sidebarUser: SidebarUser;
  topBarUser: TopBarUser;
}

/**
 * Hook para obtener la navegación basada en el rol del usuario
 * y marcar el elemento activo según la ruta actual
 */
export function useNavigation(): NavigationData | null {
  const { user } = useAuth();
  const pathname = usePathname();

  // Obtener navegación base según el rol
  const role = (user?.role?.toUpperCase() || 'STUDENT') as UserRole;
  const baseNavItems = navigationConfig[role] || navigationConfig.STUDENT;
  
  // Obtener navegación dinámica (con cursos cargados)
  // Este hook siempre se llama, incluso si user es null
  const dynamicNavItems = useDynamicNavigation(baseNavItems);

  // Si no hay usuario, retornar null después de llamar a todos los hooks
  if (!user) {
    return null;
  }

  // Función para marcar items activos
  const markActiveItems = (items: SidebarNavItem[]): SidebarNavItem[] => {
    return items.map(item => {
      // Si el item tiene subItems, procesar cada subitem
      if (item.subItems && item.subItems.length > 0) {
        const processedSubItems = item.subItems.map(subItem => ({
          ...subItem,
          active: pathname === subItem.href
        }));

        // El item padre está activo si algún subitem está activo
        const hasActiveSubItem = processedSubItems.some(subItem => subItem.active);

        return {
          ...item,
          active: hasActiveSubItem,
          subItems: processedSubItems
        };
      }

      // Para items sin subItems, comparar directamente con pathname
      // Ignorar items con href '#' (como "Mis Cursos")
      const isActive = item.href !== '#' && pathname === item.href;

      return {
        ...item,
        active: isActive
      };
    });
  };

  // Marcar items activos (usar navegación dinámica)
  const navItems = markActiveItems(dynamicNavItems);

  // Datos del usuario para el sidebar
  const sidebarUser: SidebarUser = {
    name: user.name || 'Usuario',
    initials: user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U',
    role: role === 'STUDENT' ? 'Alumno' : role === 'TEACHER' ? 'Profesor' : 'Administrador',
    avatarColor: '#0066CC' // Color por defecto
  };

  // Datos del usuario para el top bar
  const topBarUser: TopBarUser = {
    name: user.name || 'Usuario',
    initials: user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U',
    role: role === 'STUDENT' ? 'Alumno' : role === 'TEACHER' ? 'Profesor' : 'Administrador',
    avatarColor: '#0066CC'
  };

  return {
    navItems,
    sidebarUser,
    topBarUser
  };
}
