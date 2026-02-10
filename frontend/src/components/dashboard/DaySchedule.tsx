'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { classEventService } from '@/services/classEvent.service';
import { ClassEvent } from '@/types/classEvent';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DaySchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calcular inicio y fin de la semana
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Domingo
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 }); // Sábado

  // Generar array de días de la semana
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    loadSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const loadSchedule = async () => {
    setLoading(true);
    setError(null);

    try {
      const start = format(weekStart, 'yyyy-MM-dd');
      const end = format(weekEnd, 'yyyy-MM-dd');
      
      const today = format(new Date(), 'yyyy-MM-dd');
      console.log('📅 DaySchedule - Hoy es:', today);
      console.log('📅 DaySchedule - Cargando eventos del:', start, 'al', end);
      console.log('📅 DaySchedule - WeekStart:', weekStart);
      console.log('📅 DaySchedule - WeekEnd:', weekEnd);
      
      const response = await classEventService.getMySchedule({ start, end });
      
      console.log('📅 DaySchedule - Response completa:', response);
      console.log('📅 DaySchedule - Tipo:', typeof response, Array.isArray(response));
      
      // Manejar respuesta que puede ser array o ApiResponse
      let eventsData: ClassEvent[] = [];
      if (Array.isArray(response)) {
        console.log('✅ Response es array directo');
        eventsData = response;
      } else if (response && 'data' in response) {
        console.log('✅ Response es ApiResponse con data');
        eventsData = response.data || [];
      }
      
      console.log('📅 DaySchedule - Eventos recibidos:', eventsData.length, eventsData);
      setEvents(eventsData);
    } catch (err) {
      console.error('❌ Error al cargar la agenda:', err);
      setError('Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Filtrar eventos del día actual
  const todayEvents = events.filter(event => 
    isSameDay(parseISO(event.startDatetime), currentDate)
  );

  const getEventColor = (courseName: string): { bg: string; border: string } => {
    // Hash simple del nombre del curso para colores consistentes
    const hash = courseName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      { bg: 'bg-[#e6f7ed]', border: 'border-[#68d391]' },
      { bg: 'bg-[#fce4f2]', border: 'border-[#cd45e8]' },
      { bg: 'bg-[#e3f2fd]', border: 'border-[#42a5f5]' },
      { bg: 'bg-[#fff3e0]', border: 'border-[#ffa726]' },
    ];
    return colors[hash % colors.length];
  };

  const formatTimeRange = (start: string, end: string) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    
    const startMinutes = startDate.getMinutes();
    const endMinutes = endDate.getMinutes();
    
    // Si ambos tienen minutos = 0, mostrar solo horas
    if (startMinutes === 0 && endMinutes === 0) {
      const startTime = format(startDate, 'h', { locale: es });
      const endTime = format(endDate, 'h a', { locale: es }).toLowerCase();
      return `${startTime} - ${endTime}`;
    }
    
    // Si alguno tiene minutos, mostrar formato completo
    const startTime = format(startDate, startMinutes === 0 ? 'h' : 'h:mm', { locale: es });
    const endTime = format(endDate, endMinutes === 0 ? 'h a' : 'h:mm a', { locale: es }).toLowerCase();
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-stroke-primary overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-stroke-primary flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Icon name="event" size={20} className="text-magenta-violet-500" />
          <h2 className="text-sm font-semibold text-primary">Agenda del Día</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {/* Mostrar rango de meses si la semana cruza meses */}
            {format(weekStart, 'M') !== format(weekEnd, 'M') ? (
              <>
                <span className="text-sm text-primary capitalize">
                  {format(weekStart, 'MMM', { locale: es })}
                </span>
                <span className="text-sm text-primary">-</span>
                <span className="text-sm text-primary capitalize">
                  {format(weekEnd, 'MMM', { locale: es })}
                </span>
              </>
            ) : (
              <span className="text-sm text-primary capitalize">
                {format(currentDate, 'MMM', { locale: es })}
              </span>
            )}
            <span className="text-sm text-primary">
              {format(currentDate, 'yyyy')}
            </span>
          </div>
          <div className="flex items-center">
            <button 
              onClick={goToPreviousWeek}
              className="p-1 rounded-lg hover:bg-secondary-hover flex items-center justify-center"
              aria-label="Semana anterior"
            >
              <Icon name="chevron_left" size={16} className="text-accent-primary" />
            </button>
            <button 
              onClick={goToNextWeek}
              className="p-1 rounded-lg hover:bg-secondary-hover flex items-center justify-center"
              aria-label="Semana siguiente"
            >
              <Icon name="chevron_right" size={16} className="text-accent-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Mini Calendario Semanal */}
      <div className="p-3 flex items-center gap-1">
        {weekDays.map((day, index) => {
          const isSelected = isSameDay(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={index}
              onClick={() => setCurrentDate(day)}
              className={`flex-1 px-2 py-1.5 rounded-xl flex flex-col items-center gap-px transition-colors ${
                isSelected ? 'bg-muted-indigo-50' : 'bg-white hover:bg-secondary-hover'
              }`}
            >
              <span className={`text-[8px] font-semibold uppercase ${
                isToday || isSelected ? 'text-info-primary-solid' : 'text-tertiary'
              }`}>
                {format(day, 'EEE', { locale: es }).substring(0, 3)}
              </span>
              <div className={`w-5 h-5 p-0.5 rounded-full inline-flex justify-center items-center ${isToday ? 'bg-info-primary-solid' : ''
              }`}>
                <span className={`text-xs font-medium ${isToday ? 'text-white' : isToday || isSelected ? 'text-info-primary-solid' : 'text-primary'
                }`}>
                  {format(day, 'd')}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Eventos del Día */}
      <div className="px-3 pb-3 space-y-3">
        {loading ? (
          <div className="p-6 text-center">
            <div className="w-8 h-8 border-4 border-info-primary-solid border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-secondary">Cargando eventos...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <Icon name="error" size={32} className="text-error-solid mx-auto mb-2" />
            <p className="text-sm text-error-solid">{error}</p>
            <button 
              onClick={loadSchedule}
              className="mt-2 text-sm text-accent-primary hover:underline"
            >
              Reintentar
            </button>
          </div>
        ) : todayEvents.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-600">No tienes clases programadas</p>
          </div>
        ) : (
          todayEvents.map((event) => {
            const colors = getEventColor(event.courseName);
            const isNow = event.status === 'EN_CURSO';
            
            // Verificar si puede unirse (30 min antes del inicio hasta el fin)
            const now = new Date();
            const startTime = parseISO(event.startDatetime);
            const endTime = parseISO(event.endDatetime);
            const thirtyMinutesBefore = new Date(startTime.getTime() - 30 * 60 * 1000);
            
            const canJoinNow = event.canJoinMeeting && 
                               now >= thirtyMinutesBefore && 
                               now <= endTime &&
                               !event.isCancelled;

            return (
              <div
                key={event.id}
                className={`${colors.bg} rounded-xl border-l-4 ${colors.border} overflow-hidden`}
              >
                <div className="px-3 py-2.5 flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start gap-1">
                      <span className="text-[10px] font-medium text-primary">
                        {event.title}
                      </span>
                      {isNow && (
                        <span className="px-1.5 py-0.5 bg-error-solid text-white text-[8px] font-bold rounded">
                          EN VIVO
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-medium text-primary truncate">
                        {event.courseName}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span className="text-xs text-secondary">
                        {formatTimeRange(event.startDatetime, event.endDatetime)}
                      </span>
                    </div>
                  </div>
                  {canJoinNow && (
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg hover:bg-white/70 transition-colors"
                    >
                      <span className="text-sm font-medium text-accent-primary">Unirse</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
