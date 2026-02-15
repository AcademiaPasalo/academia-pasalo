// ============================================
// CALENDARIO CONTENT - Página de Calendario de Clases del Estudiante
// ============================================

'use client';

import { useState, useMemo } from 'react';
import { useCalendar } from '@/hooks/useCalendar';
import { useEnrollments } from '@/hooks/useEnrollments';
import type { ClassEvent } from '@/types/classEvent';
import EventDetailModal from '@/components/modals/EventDetailModal';
import { MdChevronLeft, MdChevronRight, MdExpandMore, MdCalendarViewWeek, MdCalendarViewMonth } from 'react-icons/md';

const HOURS = Array.from({ length: 23 }, (_, i) => i + 1);
const DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

const COURSE_COLORS = [
  { bg: 'bg-[#E0F2FE]', border: 'border-[#0891B2]' },
  { bg: 'bg-[#FCE7F3]', border: 'border-[#EC4899]' },
  { bg: 'bg-[#DCFCE7]', border: 'border-[#10B981]' },
  { bg: 'bg-[#FEF3C7]', border: 'border-[#F59E0B]' },
  { bg: 'bg-[#E9D5FF]', border: 'border-[#A855F7]' },
  { bg: 'bg-[#DBEAFE]', border: 'border-[#3B82F6]' },
];

export default function CalendarioContent() {
  const {
    events,
    loading,
    view,
    selectedCourseId,
    goToNext,
    goToPrevious,
    goToToday,
    changeView,
    filterByCourse,
    getCurrentMonthYear,
    getWeekDays,
    isToday,
  } = useCalendar();

  const { uniqueCourses, loading: loadingCourses } = useEnrollments();
  const [selectedEvent, setSelectedEvent] = useState<ClassEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const weekDays = getWeekDays();

  const courseColorMap = useMemo(() => {
    const map = new Map<string, typeof COURSE_COLORS[0]>();
    uniqueCourses.forEach((course: { id: string; code: string; name: string }, index: number) => {
      map.set(course.code, COURSE_COLORS[index % COURSE_COLORS.length]);
    });
    return map;
  }, [uniqueCourses]);

  const getEventsByDay = (day: Date) => {
    if (!events || events.length === 0) return [];

    return events.filter((event) => {
      const eventDate = new Date(event.startDatetime);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  const getEventPosition = (event: ClassEvent) => {
    const start = new Date(event.startDatetime);
    const end = new Date(event.endDatetime);

    const startHour = start.getHours();
    const startMinutes = start.getMinutes();
    const endHour = end.getHours();
    const endMinutes = end.getMinutes();

    const startPosition = (startHour - 1) * 80 + (startMinutes / 60) * 80;
    const duration = (endHour - startHour) * 80 + ((endMinutes - startMinutes) / 60) * 80;

    return {
      top: startPosition,
      height: Math.max(duration, 40),
    };
  };

  const formatEventTime = (event: ClassEvent) => {
    const start = new Date(event.startDatetime);
    const end = new Date(event.endDatetime);

    const startHour = start.getHours();
    const startMin = start.getMinutes();
    const endHour = end.getHours();
    const endMin = end.getMinutes();

    const formatHour = (hour: number, min: number) => {
      const period = hour >= 12 ? 'pm' : 'am';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return min > 0 ? `${displayHour}:${min.toString().padStart(2, '0')}${period}` : `${displayHour}${period}`;
    };

    return `${formatHour(startHour, startMin)} - ${formatHour(endHour, endMin)}`;
  };

  const handleEventClick = (event: ClassEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const selectedCourseName = selectedCourseId
    ? uniqueCourses.find((c: { code: string }) => c.code === selectedCourseId)?.name || 'Curso seleccionado'
    : 'Filtrar por Curso';

  return (
    <div className="flex flex-col gap-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-text-primary">Calendario de Clases</h1>

        <div className="relative w-64">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full h-12 px-3 py-3.5 bg-bg-primary rounded border border-stroke-primary flex justify-between items-center gap-2 hover:bg-bg-secondary transition-colors"
            disabled={loadingCourses}
          >
            <span className={`flex-1 text-left text-base ${selectedCourseId ? 'text-text-primary' : 'text-text-tertiary'}`}>
              {selectedCourseName}
            </span>
            <MdExpandMore className={`w-5 h-5 text-icon-tertiary transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {isFilterOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-bg-primary rounded-lg shadow-2xl border border-stroke-primary z-20 max-h-80 overflow-y-auto">
              <button
                onClick={() => {
                  filterByCourse(null);
                  setIsFilterOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-bg-secondary transition-colors ${!selectedCourseId ? 'bg-accent-light text-text-accent-primary' : 'text-text-primary'}`}
              >
                Todos los cursos
              </button>
              {uniqueCourses.map((course: { id: string; code: string; name: string }) => (
                <button
                  key={course.id}
                  onClick={() => {
                    filterByCourse(course.code);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-bg-secondary transition-colors ${selectedCourseId === course.code ? 'bg-accent-light text-text-accent-primary' : 'text-text-primary'}`}
                >
                  <div className="font-medium">{course.code}</div>
                  <div className="text-sm text-text-secondary">{course.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-bg-primary rounded-xl border border-stroke-primary">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button
              onClick={goToToday}
              className="px-4 py-3 bg-bg-primary rounded-lg border border-stroke-accent-primary text-sm font-medium text-text-accent-primary hover:bg-accent-light transition-colors"
            >
              Hoy
            </button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevious}
                  className="p-1 rounded-lg hover:bg-bg-secondary transition-colors"
                  aria-label="Anterior"
                >
                  <MdChevronLeft className="w-4 h-4 text-icon-accent-primary" />
                </button>
                <button
                  onClick={goToNext}
                  className="p-1 rounded-lg hover:bg-bg-secondary transition-colors"
                  aria-label="Siguiente"
                >
                  <MdChevronRight className="w-4 h-4 text-icon-accent-primary" />
                </button>
              </div>

              <div className="flex items-center gap-1 capitalize">
                <span className="text-xl font-medium text-text-primary">{getCurrentMonthYear()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => changeView('weekly')}
              className={`px-2.5 py-2 rounded flex items-center gap-1 text-sm font-medium transition-colors ${
                view === 'weekly'
                  ? 'bg-bg-accent-primary-solid text-text-white'
                  : 'bg-bg-primary text-text-accent-primary border border-stroke-accent-primary hover:bg-accent-light'
              }`}
            >
              <MdCalendarViewWeek className="w-4 h-4" />
              Semanal
            </button>
            <button
              onClick={() => changeView('monthly')}
              className={`px-2.5 py-2 rounded flex items-center gap-1 text-sm font-medium transition-colors ${
                view === 'monthly'
                  ? 'bg-bg-accent-primary-solid text-text-white'
                  : 'bg-bg-primary text-text-accent-primary border border-stroke-accent-primary hover:bg-accent-light'
              }`}
            >
              <MdCalendarViewMonth className="w-4 h-4" />
              Mensual
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-accent-light border-t-accent-solid rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Cargando eventos...</p>
          </div>
        </div>
      ) : view === 'weekly' ? (
        <div className="bg-bg-primary rounded-2xl border border-stroke-primary overflow-hidden">
          <div className="flex border-b border-stroke-primary">
            <div className="w-16" />
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`flex-1 p-4 flex flex-col items-center gap-px ${index < 6 ? 'border-r border-stroke-primary' : ''} ${isToday(day) ? 'bg-info-secondary-solid/10' : ''}`}
              >
                <div className="text-xs font-medium text-text-tertiary">{DAY_NAMES[index]}</div>
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-full ${
                    isToday(day) ? 'bg-info-primary-solid text-text-white' : ''
                  }`}
                >
                  <span className="text-xl font-medium text-text-primary">{day.getDate()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex overflow-x-auto">
            <div className="w-16 flex flex-col">
              {HOURS.map((hour) => {
                const period = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour > 12 ? hour - 12 : hour === 12 ? 12 : hour;
                return (
                  <div
                    key={hour}
                    className="h-20 px-4 py-3 border-b border-stroke-primary flex justify-end items-start gap-1"
                  >
                    <span className="text-xs font-medium text-text-tertiary">{displayHour}</span>
                    <span className="text-xs font-medium text-text-tertiary">{period}</span>
                  </div>
                );
              })}
            </div>

            {weekDays.map((day, dayIndex) => {
              const dayEvents = getEventsByDay(day);

              return (
                <div
                  key={dayIndex}
                  className={`flex-1 relative ${dayIndex < 6 ? 'border-r border-stroke-secondary' : ''}`}
                  style={{ minWidth: '140px' }}
                >
                  {HOURS.map((hour, hourIndex) => (
                    <div
                      key={hour}
                      className={`h-20 pr-4 ${hourIndex < HOURS.length - 1 ? 'border-b border-stroke-secondary' : ''}`}
                    />
                  ))}

                  {dayEvents.map((event) => {
                    const position = getEventPosition(event);
                    const colors = courseColorMap.get(event.courseCode) || COURSE_COLORS[0];

                    return (
                      <div
                        key={event.id}
                        className={`absolute left-0 right-4 ${colors.bg} rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-sm`}
                        style={{
                          top: `${position.top}px`,
                          height: `${position.height}px`,
                        }}
                        onClick={() => handleEventClick(event)}
                      >
                        <div className={`h-full px-2.5 py-1.5 rounded-l-lg border-l-4 ${colors.border} flex flex-col gap-1`}>
                          <div className="flex items-start gap-0.5 flex-wrap">
                            <span className="text-[10px] font-medium text-text-primary line-clamp-1">
                              Clase {event.sessionNumber}
                            </span>
                            <span className="text-[10px] font-medium text-text-primary">-</span>
                            <span className="text-[10px] font-medium text-text-primary line-clamp-1">
                              {event.title}
                            </span>
                          </div>
                          <div className="flex-1 min-h-0">
                            <p className="text-xs font-medium text-text-primary line-clamp-3">
                              {event.courseName}
                            </p>
                          </div>
                          <div className="text-xs text-text-secondary">
                            {formatEventTime(event)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-bg-primary rounded-2xl border border-stroke-primary p-12 text-center">
          <p className="text-text-tertiary">Vista mensual en desarrollo</p>
        </div>
      )}

      <EventDetailModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
}
