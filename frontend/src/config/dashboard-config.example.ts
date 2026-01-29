// Ejemplo de configuración para diferentes roles

import { SidebarNavItem, SidebarUser } from '@/components/dashboard/Sidebar';
import { TopBarUser } from '@/components/dashboard/TopBar';

// ========================================
// CONFIGURACIÓN PARA ALUMNO
// ========================================
export const alumnoConfig = {
  user: {
    name: 'Carlos Díaz',
    initials: 'CD',
    role: 'Alumno',
    avatarColor: 'bg-purple-600',
    roleColor: 'bg-blue-100 text-blue-700',
    isOnline: true
  } as SidebarUser & TopBarUser,
  
  navItems: [
    { icon: 'home', label: 'Inicio', href: '/plataforma/inicio', active: true },
    { icon: 'school', label: 'Cursos', href: '/plataforma/cursos' },
    { icon: 'calendar_month', label: 'Calendario', href: '/plataforma/calendario' },
    { icon: 'notifications', label: 'Notificaciones', href: '/plataforma/notificaciones' }
  ] as SidebarNavItem[]
};

// ========================================
// CONFIGURACIÓN PARA PROFESOR
// ========================================
export const profesorConfig = {
  user: {
    name: 'Ana Martínez',
    initials: 'AM',
    role: 'Profesor',
    avatarColor: 'bg-green-600',
    roleColor: 'bg-green-100 text-green-700',
    isOnline: true
  } as SidebarUser & TopBarUser,
  
  navItems: [
    { icon: 'home', label: 'Inicio', href: '/plataforma/inicio', active: true },
    { icon: 'school', label: 'Mis Cursos', href: '/plataforma/cursos' },
    { icon: 'people', label: 'Estudiantes', href: '/plataforma/estudiantes' },
    { icon: 'assignment', label: 'Evaluaciones', href: '/plataforma/evaluaciones' },
    { icon: 'calendar_month', label: 'Calendario', href: '/plataforma/calendario' },
    { icon: 'analytics', label: 'Reportes', href: '/plataforma/reportes' },
    { icon: 'notifications', label: 'Notificaciones', href: '/plataforma/notificaciones' }
  ] as SidebarNavItem[]
};

// ========================================
// CONFIGURACIÓN PARA ADMINISTRADOR
// ========================================
export const adminConfig = {
  user: {
    name: 'María González',
    initials: 'MG',
    role: 'Administrador',
    avatarColor: 'bg-red-600',
    roleColor: 'bg-red-100 text-red-700',
    isOnline: true
  } as SidebarUser & TopBarUser,
  
  navItems: [
    { icon: 'home', label: 'Inicio', href: '/plataforma/inicio', active: true },
    { icon: 'dashboard', label: 'Dashboard', href: '/plataforma/dashboard' },
    { icon: 'people', label: 'Usuarios', href: '/plataforma/usuarios' },
    { icon: 'school', label: 'Cursos', href: '/plataforma/cursos' },
    { icon: 'category', label: 'Ciclos', href: '/plataforma/ciclos' },
    { icon: 'analytics', label: 'Reportes', href: '/plataforma/reportes' },
    { icon: 'settings', label: 'Configuración', href: '/plataforma/configuracion' },
    { icon: 'notifications', label: 'Notificaciones', href: '/plataforma/notificaciones' }
  ] as SidebarNavItem[]
};

// ========================================
// EJEMPLOS DE BREADCRUMBS
// ========================================
export const breadcrumbExamples = {
  inicio: [
    { icon: 'home', label: 'Inicio' }
  ],
  
  cursoDetalle: [
    { icon: 'home', label: 'Inicio', href: '/plataforma/inicio' },
    { icon: 'school', label: 'Cursos', href: '/plataforma/cursos' },
    { label: 'Álgebra Matricial' }
  ],
  
  evaluacion: [
    { icon: 'home', label: 'Inicio', href: '/plataforma/inicio' },
    { icon: 'school', label: 'Cursos', href: '/plataforma/cursos' },
    { label: 'Álgebra Matricial', href: '/plataforma/cursos/1' },
    { icon: 'assignment', label: 'Evaluaciones', href: '/plataforma/cursos/1/evaluaciones' },
    { label: 'Examen Parcial 1' }
  ],
  
  configuracion: [
    { icon: 'home', label: 'Inicio', href: '/plataforma/inicio' },
    { icon: 'settings', label: 'Configuración' }
  ]
};
