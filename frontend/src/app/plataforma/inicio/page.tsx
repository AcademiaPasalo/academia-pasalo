'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BreadcrumbItem } from '@/components/dashboard/Breadcrumb';

export default function InicioPage() {
  // Configuración del breadcrumb
  const breadcrumbItems: BreadcrumbItem[] = [
    { icon: 'home', label: 'Inicio' }
  ];

  return (
    <DashboardLayout 
      breadcrumbItems={breadcrumbItems}
      showSidebar={true}
      showTopBar={true}
      showBreadcrumb={true}
      showToggle={true}
    >
      {/* Contenido de la página */}
      <div className="space-y-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl border border-stroke-secondary p-6">
          <h1 className="text-2xl font-bold text-primary mb-2">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="text-secondary">
            Aquí encontrarás un resumen de tu actividad reciente
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-stroke-secondary p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-secondary text-sm font-medium">Cursos Activos</span>
              <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center">
                <span className="material-symbols-rounded text-accent-solid text-[20px]">class</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-primary">4</p>
            <p className="text-xs text-tertiary mt-1">+1 desde el mes pasado</p>
          </div>

          <div className="bg-white rounded-xl border border-stroke-secondary p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-secondary text-sm font-medium">Tareas Pendientes</span>
              <div className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center">
                <span className="material-symbols-rounded text-warning-solid text-[20px]">assignment</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-primary">7</p>
            <p className="text-xs text-tertiary mt-1">2 vencen esta semana</p>
          </div>

          <div className="bg-white rounded-xl border border-stroke-secondary p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-secondary text-sm font-medium">Promedio General</span>
              <div className="w-10 h-10 rounded-lg bg-success-light flex items-center justify-center">
                <span className="material-symbols-rounded text-success-solid text-[20px]">grade</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-primary">8.5</p>
            <p className="text-xs text-tertiary mt-1">+0.3 desde el mes pasado</p>
          </div>

          <div className="bg-white rounded-xl border border-stroke-secondary p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-secondary text-sm font-medium">Horas de Estudio</span>
              <div className="w-10 h-10 rounded-lg bg-info-secondary-solid/10 flex items-center justify-center">
                <span className="material-symbols-rounded text-info-secondary-solid text-[20px]">schedule</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-primary">24h</p>
            <p className="text-xs text-tertiary mt-1">Esta semana</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-stroke-secondary p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">
            Actividad Reciente
          </h2>
          <div className="space-y-3">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-secondary transition-colors">
                <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-rounded text-accent-solid text-[18px]">check_circle</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    Completaste la tarea de Matemáticas
                  </p>
                  <p className="text-xs text-tertiary">Hace 2 horas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
