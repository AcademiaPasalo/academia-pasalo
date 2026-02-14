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

export default function CalendarioContent() {
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
    setBreadcrumbItems([{ icon: 'calendar', label: 'Calendario' }]);
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
        
    </div>
  );
}
