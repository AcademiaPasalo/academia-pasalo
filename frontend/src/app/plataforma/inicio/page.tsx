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

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-[1fr_360px] gap-6">
              {/* Left Column */}
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-deep-blue-600 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[24px]">school</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Mis Cursos</h1>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border-2 border-deep-blue-600 text-deep-blue-600 rounded-lg font-semibold text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">grid_view</span>
                      Galería
                    </button>
                    <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">list</span>
                      Lista
                    </button>
                  </div>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-2 gap-5">
                  {/* Course 1 */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="h-36 bg-gradient-to-br from-blue-700 to-blue-500 relative">
                      <div className="absolute top-3 left-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                        <span className="text-white text-xs font-semibold">CIENCIAS</span>
                      </div>
                      <div className="absolute top-3 right-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                        <span className="text-white text-xs font-semibold">1° CICLO</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 text-base">Álgebra Matricial y Geometría Analítica</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-bold text-green-700">AM</span>
                        </div>
                        <span className="text-sm text-gray-600">Docente: Ana Martínez</span>
                      </div>
                      <button className="w-full py-2.5 bg-deep-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-deep-blue-700">
                        Ver Curso
                      </button>
                    </div>
                  </div>

                  {/* Course 2 */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="h-36 bg-gradient-to-br from-pink-700 to-pink-500 relative">
                      <div className="absolute top-3 left-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                        <span className="text-white text-xs font-semibold">CIENCIAS</span>
                      </div>
                      <div className="absolute top-3 right-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                        <span className="text-white text-xs font-semibold">1° CICLO</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 text-base">Fundamentos de Cálculo</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-bold text-blue-700">LG</span>
                        </div>
                        <span className="text-sm text-gray-600">Docente: Luis García & María Romero</span>
                      </div>
                      <button className="w-full py-2.5 bg-deep-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-deep-blue-700">
                        Ver Curso
                      </button>
                    </div>
                  </div>

                  {/* Course 3 */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="h-36 bg-gradient-to-br from-green-700 to-green-500 relative">
                      <div className="absolute top-3 left-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                        <span className="text-white text-xs font-semibold">CIENCIAS</span>
                      </div>
                      <div className="absolute top-3 right-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                        <span className="text-white text-xs font-semibold">1° CICLO</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 text-base">Fundamentos de Física</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-bold text-orange-700">CL</span>
                        </div>
                        <span className="text-sm text-gray-600">Docente: Carmen López</span>
                      </div>
                      <button className="w-full py-2.5 bg-deep-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-deep-blue-700">
                        Ver Curso
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                {/* Agenda */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-deep-blue-600 text-[22px]">calendar_today</span>
                      Agenda del Día
                    </h2>
                    <div className="flex items-center gap-1 text-sm">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <span className="material-symbols-outlined text-gray-600 text-[18px]">chevron_left</span>
                      </button>
                      <span className="font-semibold text-gray-900 text-xs">mar 22 - mar 28</span>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <span className="material-symbols-outlined text-gray-600 text-[18px]">chevron_right</span>
                      </button>
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    <div className="text-center"><div className="text-xs text-gray-500 font-medium mb-1">DOM</div><div className="w-9 h-9 flex items-center justify-center text-sm text-gray-400">22</div></div>
                    <div className="text-center"><div className="text-xs text-gray-500 font-medium mb-1">LUN</div><div className="w-9 h-9 flex items-center justify-center text-sm text-gray-700">23</div></div>
                    <div className="text-center"><div className="text-xs text-gray-500 font-medium mb-1">MAR</div><div className="w-9 h-9 flex items-center justify-center text-sm text-gray-700">24</div></div>
                    <div className="text-center"><div className="text-xs text-deep-blue-600 font-bold mb-1">MIÉ</div><div className="w-9 h-9 flex items-center justify-center text-sm bg-deep-blue-600 text-white font-bold rounded-lg">25</div></div>
                    <div className="text-center"><div className="text-xs text-gray-500 font-medium mb-1">JUE</div><div className="w-9 h-9 flex items-center justify-center text-sm text-gray-700">26</div></div>
                    <div className="text-center"><div className="text-xs text-gray-500 font-medium mb-1">VIE</div><div className="w-9 h-9 flex items-center justify-center text-sm text-gray-700">27</div></div>
                    <div className="text-center"><div className="text-xs text-gray-500 font-medium mb-1">SÁB</div><div className="w-9 h-9 flex items-center justify-center text-sm text-gray-400">28</div></div>
                  </div>

                  {/* Events */}
                  <div className="space-y-3">
                    <div className="border-l-4 border-cyan-500 bg-cyan-50 rounded-r-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-gray-900 text-sm">2° Clase - PCI</p>
                        <button><span className="material-symbols-outlined text-[16px] text-gray-600">more_vert</span></button>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">Fundamentos de Física</p>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        <span>6 - 8pm</span>
                      </div>
                      <button className="w-full py-1.5 bg-deep-blue-600 text-white rounded-lg text-xs font-semibold">Unirse</button>
                    </div>

                    <div className="border-l-4 border-pink-500 bg-pink-50 rounded-r-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-gray-900 text-sm">2° Clase - PCI</p>
                        <button><span className="material-symbols-outlined text-[16px] text-gray-600">more_vert</span></button>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">Fundamentos de Cálculo</p>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        <span>8 - 10pm</span>
                      </div>
                      <button className="w-full py-1.5 bg-deep-blue-600 text-white rounded-lg text-xs font-semibold">Unirse</button>
                    </div>
                  </div>
                </div>

                {/* Help Box */}
                <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[26px]">auto_awesome</span>
                    </div>
                    <h3 className="font-bold text-xl mb-2">¿Necesitas ayuda extra?</h3>
                    <p className="text-sm text-white/90 mb-4 leading-relaxed">Agenda una tutoría personalizado con nuestros docentes y despeja todas tus dudas hoy mismo.</p>
                    <button className="w-full py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-50">Agendar Tutoría</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
