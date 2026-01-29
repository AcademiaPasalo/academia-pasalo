'use client';

import { useState } from 'react';
import Sidebar, { SidebarNavItem, SidebarUser } from '@/components/dashboard/Sidebar';
import Breadcrumb, { BreadcrumbItem } from '@/components/dashboard/Breadcrumb';
import TopBar, { TopBarUser } from '@/components/dashboard/TopBar';

export default function InicioPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Configuración del usuario
  const user: SidebarUser & TopBarUser = {
    name: 'Nombre Apellido',
    initials: 'NA',
    role: 'Alumno',
    avatarColor: 'bg-[#7C3AED]',
    isOnline: true
  };

  // Configuración de navegación (puede variar por rol)
  const navItems: SidebarNavItem[] = [
    { 
      icon: 'home', 
      label: 'Inicio', 
      href: '#', 
      active: true,
      iconVariant: 'rounded',
      iconFilled: true
    },
    { 
      icon: 'class', 
      label: 'Cursos', 
      href: '#', 
      expandable: true,
      iconVariant: 'rounded',
      iconFilled: true,
      subItems: [
        { icon: 'circle', label: 'Mis Cursos', href: '#' },
        { icon: 'circle', label: 'Explorar', href: '#' }
      ]
    },
    { 
      icon: 'event', 
      label: 'Calendario', 
      href: '#',
      iconVariant: 'rounded',
      iconFilled: true
    },
    { 
      icon: 'notifications_unread', 
      label: 'Notificaciones', 
      href: '#',
      iconVariant: 'rounded',
      iconFilled: false
    }
  ];

  // Configuración del breadcrumb (puede variar por página)
  const breadcrumbItems: BreadcrumbItem[] = [
    { icon: 'home', label: 'Inicio' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <Sidebar 
        user={user}
        navItems={navItems}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <Breadcrumb 
            items={breadcrumbItems}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          <TopBar 
            user={user}
            notificationCount={2}
          />
        </header>


      </div>
    </div>
  );
}
