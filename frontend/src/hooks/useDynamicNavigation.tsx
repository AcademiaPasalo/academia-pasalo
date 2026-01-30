/**
 * Hook para obtener los items de navegación del sidebar de forma dinámica
 * Carga los cursos del estudiante y los inyecta en el menú "Mis Cursos"
 */

import { useEffect, useState } from 'react';
import { SidebarNavItem } from '@/components/dashboard/Sidebar';
import { getCursos } from '@/services/cursoService';

export function useDynamicNavigation(baseNavItems: SidebarNavItem[]): SidebarNavItem[] {
  const [navItems, setNavItems] = useState<SidebarNavItem[]>(baseNavItems);

  useEffect(() => {
    async function loadCursos() {
      try {
        const cursos = await getCursos();
        
        // Actualizar el item "Mis Cursos" con los cursos reales
        const updatedNavItems = baseNavItems.map(item => {
          if (item.label === 'Mis Cursos' && item.expandable) {
            return {
              ...item,
              subItems: cursos.map(curso => ({
                icon: 'circle',
                label: curso.nombre,
                href: `/plataforma/curso/${curso.id}`
              }))
            };
          }
          return item;
        });

        setNavItems(updatedNavItems);
      } catch (error) {
        console.error('Error al cargar cursos para navegación:', error);
        // En caso de error, mantener los items base
        setNavItems(baseNavItems);
      }
    }

    loadCursos();
  }, [baseNavItems]);

  return navItems;
}
