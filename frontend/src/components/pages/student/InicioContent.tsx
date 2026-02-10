'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import CourseCard from '@/components/courses/CourseCard';
import AgendarTutoriaModal from '@/components/modals/AgendarTutoriaModal';
import DaySchedule from '@/components/dashboard/DaySchedule';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { enrollmentService } from '@/services/enrollment.service';
import { classEventService } from '@/services/classEvent.service';
import { Enrollment } from '@/types/enrollment';
import { ClassEvent } from '@/types/classEvent';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function InicioContent() {
  // Estado para controlar la vista activa
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<ClassEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [copyingLink, setCopyingLink] = useState<string | null>(null);
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
        
        // HOTFIX: El servicio está retornando el array directamente en lugar del objeto ApiResponse
        // Verificar si response es un array o un objeto con data
        if (Array.isArray(response)) {
          console.log('⚠️ Response es un array, usando directamente');
          setEnrollments(response);
        } else if (response && 'data' in response) {
          console.log('✅ Response es ApiResponse, usando response.data');
          setEnrollments(response.data || []);
        } else {
          console.error('❌ Response tiene formato inesperado:', response);
          setEnrollments([]);
        }
      } catch (err) {
        console.error('❌ Error al cargar matrículas:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar los cursos';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadEnrollments();
  }, []);

  // Cargar próximos eventos (próximos 7 días)
  useEffect(() => {
    async function loadUpcomingEvents() {
      setLoadingEvents(true);
      try {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        const start = today.toISOString().split('T')[0];
        const end = nextWeek.toISOString().split('T')[0];
        
        const response = await classEventService.getMySchedule({ start, end });
        
        // Manejar respuesta que puede ser array o ApiResponse
        let events: ClassEvent[] = [];
        if (Array.isArray(response)) {
          events = response;
        } else if (response && 'data' in response) {
          events = response.data || [];
        }
        
        // Filtrar solo eventos futuros o en curso, ordenados por fecha
        const futureEvents = events
          .filter(event => !event.isCancelled && event.status !== 'FINALIZADA')
          .sort((a, b) => new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime())
          .slice(0, 10); // Mostrar máximo 10 eventos próximos
        
        setUpcomingEvents(futureEvents);
      } catch (err) {
        console.error('Error al cargar eventos próximos:', err);
      } finally {
        setLoadingEvents(false);
      }
    }

    loadUpcomingEvents();
  }, []);

  const handleAgendarTutoria = (curso: string, tema: string) => {
    const mensaje = `¡Hola! Quisiera agendar una tutoría de ${curso} para la evaluación o tema ${tema}`;
    const url = `https://wa.me/903006775?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  // Manejar unirse a reunión
  const handleJoinMeeting = (event: ClassEvent) => {
    try {
      classEventService.joinMeeting(event);
    } catch (err) {
      console.error('Error al unirse a la reunión:', err);
      alert(err instanceof Error ? err.message : 'Error al abrir la reunión');
    }
  };

  // Manejar copiar link de reunión
  const handleCopyMeetingLink = async (event: ClassEvent) => {
    setCopyingLink(event.id);
    try {
      await classEventService.copyMeetingLink(event);
      // Feedback visual temporal (puedes usar un toast aquí si lo tienes configurado)
      setTimeout(() => setCopyingLink(null), 2000);
    } catch (err) {
      console.error('Error al copiar link:', err);
      alert(err instanceof Error ? err.message : 'Error al copiar el link');
      setCopyingLink(null);
    }
  };

  // Formatear fecha y hora del evento
  const formatEventDateTime = (startDatetime: string, endDatetime: string): string => {
    const start = parseISO(startDatetime);
    const end = parseISO(endDatetime);
    
    const dayName = format(start, 'EEEE', { locale: es });
    const day = format(start, 'd', { locale: es });
    const month = format(start, 'MMM', { locale: es });
    const startTime = format(start, 'h:mm a', { locale: es });
    const endTime = format(end, 'h:mm a', { locale: es });
    
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${day} ${month} • ${startTime} - ${endTime}`;
  };

  // Agrupar eventos por curso
  const eventsByCourse = upcomingEvents.reduce<Record<string, ClassEvent[]>>((acc, event) => {
    if (!acc[event.courseCode]) {
      acc[event.courseCode] = [];
    }
    acc[event.courseCode].push(event);
    return acc;
  }, {});

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
    const colors = ['#1E40A3', '#10B981', '#F13072', '#ffa726', '#ef5350'];
    return colors[hash % colors.length];
  };

  if (loading) {
    console.log('🔄 Estado: LOADING');
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
    console.log('❌ Estado: ERROR', error);
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
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-12">
      {/* Columna Izquierda: Cursos */}
      <div className="space-y-9">
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
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-6'} style={viewMode === 'grid' ? { gridAutoRows: '1fr' } : undefined}>
          {enrollments.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <Icon name="school" size={64} className="text-secondary mx-auto mb-4" />
              <p className="text-lg font-semibold text-primary mb-2">No tienes cursos matriculados</p>
              <p className="text-secondary">Contacta a tu coordinador para matricularte en cursos</p>
            </div>
          ) : (
            enrollments.map((enrollment) => {
              const courseCode = enrollment.courseCycle.course.code;
              const courseEvents = eventsByCourse[courseCode] || [];
              const nextEvent = courseEvents[0]; // Próximo evento de este curso

              console.log('🎓 Renderizando curso:', {
                id: enrollment.id,
                courseCode,
                courseName: enrollment.courseCycle.course.name,
                professorName: getProfessorName(enrollment),
                cycle: enrollment.courseCycle.course.cycleLevel.name,
                color: getCourseColor(courseCode)
              });

              return (
                <div key={enrollment.id} className="flex flex-col gap-3 h-full">
                  <CourseCard
                    headerColor={getCourseColor(courseCode)}
                    category="CIENCIAS"
                    cycle={enrollment.courseCycle.course.cycleLevel.name}
                    title={enrollment.courseCycle.course.name}
                    teachers={[
                      { 
                        initials: getProfessorInitials(enrollment), 
                        name: getProfessorName(enrollment), 
                        avatarColor: getCourseColor(courseCode)
                      }
                    ]}
                    onViewCourse={() => router.push(`/plataforma/curso/${enrollment.courseCycle.id}`)}
                    variant={viewMode}
                  />
                  
                  {/* Mostrar próximo evento si existe */}
                  {!loadingEvents && nextEvent && (
                    <div className="bg-white rounded-xl border border-stroke-primary p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon name="event" size={18} className="text-info-primary-solid" />
                          <span className="text-sm font-semibold text-primary">Próxima Clase</span>
                        </div>
                        {classEventService.isLive(nextEvent) && (
                          <span className="px-2 py-1 bg-error-solid text-white text-xs font-bold rounded-full animate-pulse">
                            EN VIVO
                          </span>
                        )}
                        {classEventService.isUpcoming(nextEvent) && (
                          <span className="px-2 py-1 bg-warning-solid text-white text-xs font-bold rounded-full">
                            PRÓXIMAMENTE
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-primary">{nextEvent.title}</h4>
                        {nextEvent.topic && (
                          <div className="flex items-center gap-1.5">
                            <Icon name="topic" size={14} className="text-tertiary" />
                            <span className="text-xs text-secondary">{nextEvent.topic}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Icon name="schedule" size={14} className="text-tertiary" />
                          <span className="text-xs text-secondary">
                            {formatEventDateTime(nextEvent.startDatetime, nextEvent.endDatetime)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {(() => {
                          // Verificar si puede unirse (30 min antes del inicio hasta el fin)
                          const now = new Date();
                          const startTime = parseISO(nextEvent.startDatetime);
                          const endTime = parseISO(nextEvent.endDatetime);
                          const thirtyMinutesBefore = new Date(startTime.getTime() - 30 * 60 * 1000);
                          
                          const canJoinNow = nextEvent.canJoinMeeting && 
                                             now >= thirtyMinutesBefore && 
                                             now <= endTime &&
                                             !nextEvent.isCancelled;
                          
                          return canJoinNow ? (
                            <button
                              onClick={() => handleJoinMeeting(nextEvent)}
                              className="flex-1 px-4 py-2 bg-accent-solid hover:bg-accent-solid-hover text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Icon name="video_call" size={16} className="text-white" />
                              Unirse
                            </button>
                          ) : null;
                        })()}
                        {nextEvent.canCopyLink && (
                          <button
                            onClick={() => handleCopyMeetingLink(nextEvent)}
                            disabled={copyingLink === nextEvent.id}
                            className="px-4 py-2 bg-white border border-stroke-primary hover:bg-secondary-hover text-primary text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            title="Copiar link de la reunión"
                          >
                            <Icon 
                              name={copyingLink === nextEvent.id ? "check" : "content_copy"} 
                              size={16} 
                              className={copyingLink === nextEvent.id ? "text-success-solid" : "text-primary"}
                            />
                          </button>
                        )}
                      </div>

                      {/* Mostrar eventos adicionales si hay */}
                      {courseEvents.length > 1 && (
                        <div className="pt-2 border-t border-stroke-primary">
                          <button
                            className="text-xs text-accent-primary hover:underline font-medium"
                            onClick={() => router.push(`/plataforma/curso/${enrollment.courseCycle.id}`)}
                          >
                            Ver {courseEvents.length - 1} evento{courseEvents.length > 2 ? 's' : ''} más →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
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
              className="w-full px-4 py-3 bg-magenta-violet-50 rounded-lg border border-magenta-violet-700 text-sm font-medium text-magenta-violet-700 transition-colors hover:bg-magenta-violet-100"
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
