'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import CourseCard from '@/components/courses/CourseCard';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { getCursos } from '@/services/cursoService';
import { Curso } from '@/types/curso';

export default function InicioContent() {
  // Estado para controlar la vista activa
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [courses, setCourses] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Configurar breadcrumb
  const { setBreadcrumbItems } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbItems([{ icon: 'home', label: 'Inicio' }]);
  }, [setBreadcrumbItems]);

  // Cargar cursos
  useEffect(() => {
    async function loadCursos() {
      setLoading(true);
      try {
        const cursosData = await getCursos();
        setCourses(cursosData);
      } catch (error) {
        console.error('Error al cargar cursos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCursos();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-solid border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
      {/* Columna Izquierda: Cursos */}
      <div className="space-y-6">
        {/* Header: Mis Cursos con toggles */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icon name="class" size={32} variant="rounded" className="text-accent-secondary" />
            <h1 className="text-3xl font-semibold text-primary">Mis Cursos</h1>
          </div>

          {/* Toggle Galería/Lista */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-2 rounded flex items-center gap-1 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-accent-solid'
                  : 'bg-white border border-accent-primary hover:bg-accent-light'
              }`}
            >
              <Icon
                name="grid_view"
                size={16}
                variant="rounded"
                className={viewMode === 'grid' ? 'text-white' : 'text-accent-primary'}
              />
              <span className={`text-sm font-medium ${viewMode === 'grid' ? 'text-white' : 'text-accent-primary'}`}>
                Galería
              </span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-2 rounded flex items-center gap-1 transition-colors ${
                viewMode === 'list'
                  ? 'bg-accent-solid'
                  : 'bg-white border border-accent-primary hover:bg-accent-light'
              }`}
            >
              <Icon
                name="view_list"
                size={16}
                variant="rounded"
                className={viewMode === 'list' ? 'text-white' : 'text-accent-primary'}
              />
              <span className={`text-sm font-medium ${viewMode === 'list' ? 'text-white' : 'text-accent-primary'}`}>
                Lista
              </span>
            </button>
          </div>
        </div>

        {/* Grid de Cursos */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-6'}>
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              headerColor={course.color}
              category="CIENCIAS"
              cycle={course.periodo || '1° CICLO'}
              title={course.nombre}
              teachers={[
                { 
                  initials: course.profesor?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'XX', 
                  name: course.profesor || 'Profesor', 
                  avatarColor: course.color 
                }
              ]}
              onViewCourse={() => router.push(`/plataforma/curso/${course.id}`)}
              variant={viewMode}
            />
          ))}
        </div>
      </div>

      {/* Columna Derecha: Agenda + CTA */}
      <div className="space-y-6">
        {/* Agenda del Día */}
        <div className="bg-white rounded-2xl border border-stroke-primary overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-stroke-primary flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Icon name="event" size={20} variant="rounded" className="text-info-secondary-solid" />
              <h2 className="text-sm font-semibold text-primary">Agenda del Día</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                <span className="text-xs text-primary">Mar</span>
                <span className="text-xs text-primary">2026</span>
              </div>
              <div className="flex items-center">
                <button className="p-1 rounded-lg hover:bg-secondary-hover">
                  <Icon name="chevron_left" size={16} variant="rounded" className="text-accent-primary" />
                </button>
                <button className="p-1 rounded-lg hover:bg-secondary-hover">
                  <Icon name="chevron_right" size={16} variant="rounded" className="text-accent-primary" />
                </button>
              </div>
            </div>
          </div>

          {/* Mini Calendario */}
          <div className="p-3 flex items-center gap-1">
            {[
              { day: 'DOM', date: '22', active: false },
              { day: 'LUN', date: '23', active: false },
              { day: 'MAR', date: '24', active: false },
              { day: 'MIÉ', date: '25', active: true },
              { day: 'JUE', date: '26', active: false },
              { day: 'VIE', date: '27', active: false },
              { day: 'SÁB', date: '28', active: false },
            ].map((item, index) => (
              <div
                key={index}
                className={`flex-1 px-2 py-1.5 rounded-xl flex flex-col items-center gap-px ${
                  item.active ? 'bg-info-primary-solid/10' : 'bg-white'
                }`}
              >
                <span className={`text-[8px] font-semibold ${item.active ? 'text-info-primary-solid' : 'text-tertiary'}`}>
                  {item.day}
                </span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.active ? 'bg-info-primary-solid' : ''}`}>
                  <span className={`text-xs font-medium ${item.active ? 'text-white' : 'text-primary'}`}>
                    {item.date}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Eventos */}
          <div className="px-3 pb-3 space-y-3">
            {/* Evento 1 */}
            <div className="bg-[#e6f7ed] rounded-xl border-l-4 border-[#68d391] overflow-hidden">
              <div className="px-3 py-2.5 flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-start gap-1">
                    <span className="text-[10px] font-medium text-primary">2° Clase - PC1</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-primary truncate">Fundamentos de Física</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="text-xs text-secondary">6 - 8pm</span>
                  </div>
                </div>
                <button className="px-1 py-1.5 rounded-lg hover:bg-black/5 transition-colors">
                  <span className="text-base font-medium text-accent-primary">Unirse</span>
                </button>
              </div>
            </div>

            {/* Evento 2 */}
            <div className="bg-[#fce4f2] rounded-xl border-l-4 border-[#cd45e8] overflow-hidden">
              <div className="px-3 py-2.5 flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-start gap-1">
                    <span className="text-[10px] font-medium text-primary">2° Clase - PC1</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-primary truncate">Fundamentos de Cálculo</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="text-xs text-secondary">8 - 10pm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Tutoría */}
        <div className="relative bg-info-secondary-solid rounded-2xl p-6 flex flex-col gap-5 overflow-hidden">
          {/* Icono decorativo de fondo */}
          <div className="absolute right-0 top-24 w-40 h-40 opacity-20">
            <Icon name="star_half" size={160} variant="rounded" className="text-white" />
          </div>

          {/* Contenido */}
          <div className="relative z-10">
            <Icon name="auto_awesome" size={48} variant="rounded" filled className="text-white" />
          </div>

          <div className="relative z-10 space-y-3">
            <h2 className="text-xl font-semibold text-white">¿Necesitas ayuda extra?</h2>
            <p className="text-sm text-white">
              Agenda una tutoría personalizada con nuestros docentes y despeja todas tus dudas hoy mismo.
            </p>
          </div>

          <div className="relative z-10 flex justify-end">
            <button className="px-6 py-4 bg-info-secondary-solid/20 rounded-lg border border-white/20 text-base font-medium text-white hover:bg-info-secondary-solid/30 transition-colors">
              Agendar Tutoría
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
