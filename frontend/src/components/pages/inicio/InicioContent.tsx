'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import CourseCard from '@/components/courses/CourseCard';
import AgendarTutoriaModal from '@/components/modals/AgendarTutoriaModal';
import DaySchedule from '@/components/dashboard/DaySchedule';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { enrollmentService } from '@/services/enrollment.service';
import { Enrollment } from '@/types/enrollment';

export default function InicioContent() {
  // Estado para controlar la vista activa
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  
  // Configurar breadcrumb
  const { setBreadcrumbItems } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbItems([{ icon: 'home', label: 'Inicio' }]);
  }, [setBreadcrumbItems]);

  // Cargar cursos matriculados
  useEffect(() => {
    async function loadEnrollments() {
      setLoading(true);
      setError(null);
      try {
        const response = await enrollmentService.getMyCourses();
        setEnrollments(response.data || []);
      } catch (err) {
        console.error('Error al cargar matrículas:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar los cursos';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadEnrollments();
  }, []);

  const handleAgendarTutoria = (curso: string, tema: string) => {
    const mensaje = `¡Hola! Quisiera agendar una tutoría de ${curso} para la evaluación o tema ${tema}`;
    const url = `https://wa.me/903006775?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  // Obtener iniciales del profesor
  const getProfessorInitials = (enrollment: Enrollment): string => {
    const professors = enrollment.courseCycle.professors;
    if (professors.length === 0) return 'XX';
    const prof = professors[0];
    return `${prof.firstName[0]}${prof.lastName1[0]}`.toUpperCase();
  };

  // Obtener nombre completo del profesor
  const getProfessorName = (enrollment: Enrollment): string => {
    const professors = enrollment.courseCycle.professors;
    if (professors.length === 0) return 'Sin asignar';
    const prof = professors[0];
    return `${prof.firstName} ${prof.lastName1}`;
  };

  // Obtener color consistente para un curso
  const getCourseColor = (courseCode: string): string => {
    const hash = courseCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['#68d391', '#cd45e8', '#42a5f5', '#ffa726', '#ef5350'];
    return colors[hash % colors.length];
  };

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon name="error" size={64} className="text-error-solid mb-4 mx-auto" />
          <p className="text-lg font-semibold text-primary mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-accent-solid text-white rounded-lg hover:bg-accent-solid-hover transition-colors"
          >
            Reintentar
          </button>
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
            <Icon name="class" size={32} className="text-accent-secondary" />
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
          {enrollments.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <Icon name="school" size={64} className="text-secondary mx-auto mb-4" />
              <p className="text-lg font-semibold text-primary mb-2">No tienes cursos matriculados</p>
              <p className="text-secondary">Contacta a tu coordinador para matricularte en cursos</p>
            </div>
          ) : (
            enrollments.map((enrollment) => (
              <CourseCard
                key={enrollment.id}
                headerColor={getCourseColor(enrollment.courseCycle.course.code)}
                category="CIENCIAS"
                cycle={enrollment.courseCycle.course.cycleLevel.name}
                title={enrollment.courseCycle.course.name}
                teachers={[
                  { 
                    initials: getProfessorInitials(enrollment), 
                    name: getProfessorName(enrollment), 
                    avatarColor: getCourseColor(enrollment.courseCycle.course.code)
                  }
                ]}
                onViewCourse={() => router.push(`/plataforma/curso/${enrollment.courseCycle.id}`)}
                variant={viewMode}
              />
            ))
          )}
        </div>
      </div>

      {/* Columna Derecha: Agenda + CTA */}
      <div className="space-y-6">
        {/* Agenda del Día - Componente funcional */}
        <DaySchedule />

        {/* CTA Tutoría */}
        <div className="relative bg-info-secondary-solid rounded-2xl p-6 flex flex-col gap-5 overflow-hidden">
          {/* Icono decorativo de fondo */}
          <div className="absolute right-0 top-24 w-40 h-40 opacity-20">
            <Icon name="star_half" size={160} className="text-white" />
          </div>

          {/* Contenido */}
          <div className="relative z-10">
            <Icon name="auto_awesome" size={48} className="text-white" />
          </div>

          <div className="relative z-10 space-y-3">
            <h2 className="text-xl font-semibold text-white">¿Necesitas ayuda extra?</h2>
            <p className="text-sm text-white">
              Agenda una tutoría personalizada con nuestros docentes y despeja todas tus dudas hoy mismo.
            </p>
          </div>

            <div className="relative z-10 flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-4 bg-magenta-violet-50 rounded-lg border border-magenta-violet-700 text-base font-medium text-magenta-violet-700 transition-colors hover:bg-magenta-violet-100"
            >
              Agendar Tutoría
            </button>
            </div>
        </div>
      </div>

      {/* Modal de Agendar Tutoría */}
      <AgendarTutoriaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAgendarTutoria}
      />
    </div>
  );
}
