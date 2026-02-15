// ============================================
// CALENDARIO CONTENT - Página de Calendario de Clases del Estudiante
// ============================================

"use client";

import { useState, useEffect } from "react";
import { useCalendar } from "@/hooks/useCalendar";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import type { ClassEvent } from "@/types/classEvent";
import EventDetailModal from "@/components/modals/EventDetailModal";
import {
  MdChevronLeft,
  MdChevronRight,
  MdExpandMore,
  MdCalendarViewWeek,
  MdCalendarViewMonth,
} from "react-icons/md";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { getCourseColor } from "@/lib/courseColors";

const HOURS = Array.from({ length: 23 }, (_, i) => i + 1);
const DAY_NAMES = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

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
  const { setBreadcrumbItems } = useBreadcrumb();
  const [selectedEvent, setSelectedEvent] = useState<ClassEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [anchorPosition, setAnchorPosition] = useState<{ x: number; y: number } | undefined>();

  const weekDays = getWeekDays();

  // Configurar breadcrumb
  useEffect(() => {
    setBreadcrumbItems([
      { icon: 'event', label: 'Calendario' }
    ]);
  }, [setBreadcrumbItems]);

  console.log("📊 [CalendarioContent] Renderizando con:", {
    eventos: events?.length || 0,
    cargando: loading,
    cursoSeleccionado: selectedCourseId,
    diasSemana: weekDays.map((d) => d.toLocaleDateString()),
  });

  // Actualizar la hora actual cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(timer);
  }, []);

  const getEventsByDay = (day: Date) => {
    if (!events || events.length === 0) return [];

    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.startDatetime);
      const eventLocal = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate(),
      );
      const dayLocal = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
      );

      return eventLocal.getTime() === dayLocal.getTime();
    });

    if (dayEvents.length > 0) {
      console.log(
        `📆 [getEventsByDay] Día ${day.toLocaleDateString()}:`,
        dayEvents.length,
        "eventos",
      );
    }

    return dayEvents;
  };

  const getEventPosition = (event: ClassEvent) => {
    const start = new Date(event.startDatetime);
    const end = new Date(event.endDatetime);

    const startHour = start.getHours();
    const startMinutes = start.getMinutes();
    const endHour = end.getHours();
    const endMinutes = end.getMinutes();

    const startPosition = (startHour - 1) * 80 + (startMinutes / 60) * 80;
    const duration =
      (endHour - startHour) * 80 + ((endMinutes - startMinutes) / 60) * 80;

    return {
      top: startPosition,
      height: Math.max(duration, 40),
    };
  };

  /**
   * Calcula el layout (ancho y posición) de un evento cuando hay solapamientos
   * Similar a Google Calendar / Notion
   */
  const getEventLayout = (event: ClassEvent, dayEvents: ClassEvent[]) => {
    // Filtrar eventos que se solapan temporalmente con este evento
    const overlappingEvents = dayEvents
      .filter((e) => {
        const start1 = new Date(event.startDatetime);
        const end1 = new Date(event.endDatetime);
        const start2 = new Date(e.startDatetime);
        const end2 = new Date(e.endDatetime);
        // Dos eventos se solapan si: start1 < end2 && start2 < end1
        return start1 < end2 && start2 < end1;
      })
      .sort((a, b) => {
        // Ordenar por hora de inicio, luego por ID para consistencia
        const startA = new Date(a.startDatetime).getTime();
        const startB = new Date(b.startDatetime).getTime();
        if (startA !== startB) return startA - startB;
        return a.id.localeCompare(b.id);
      });

    const totalColumns = overlappingEvents.length;
    const columnIndex = overlappingEvents.findIndex((e) => e.id === event.id);

    if (totalColumns === 1) {
      return {
        width: "calc(100% - 16px)", // 16px = right-4
        left: "0",
      };
    }

    const widthPercent = 100 / totalColumns;
    const leftPercent = widthPercent * columnIndex;

    return {
      width: `calc(${widthPercent}% - ${columnIndex === totalColumns - 1 ? 16 : 4}px)`,
      left: `${leftPercent}%`,
    };
  };

  const getCurrentTimePosition = () => {
    const now = currentTime;
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Posición relativa desde la 1 AM (hora 0 en nuestro array es 1 AM)
    const position = (hours - 1) * 80 + (minutes / 60) * 80;
    return position;
  };

  const formatTimeRange = (start: string, end: string) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);

    const startMinutes = startDate.getMinutes();
    const endMinutes = endDate.getMinutes();

    // Si ambos tienen minutos = 0, mostrar solo horas
    if (startMinutes === 0 && endMinutes === 0) {
      const startTime = format(startDate, "h", { locale: es });
      const endTime = format(endDate, "h a", { locale: es })
        .replace(" ", "") // 👈 quita espacio
        .toLowerCase();

      return `${startTime} - ${endTime}`;
    }

    // Si alguno tiene minutos, mostrar formato completo
    const startTime = format(startDate, startMinutes === 0 ? "h" : "h:mm", {
      locale: es,
    });

    const endTime = format(endDate, endMinutes === 0 ? "h a" : "h:mm a", {
      locale: es,
    })
      .replace(" ", "") // 👈 quita espacio
      .toLowerCase();

    return `${startTime} - ${endTime}`;
  };

  const handleEventClick = (event: ClassEvent, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAnchorPosition({
      x: rect.right,
      y: rect.top,
    });
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const selectedCourseName = selectedCourseId
    ? uniqueCourses.find((c: { code: string }) => c.code === selectedCourseId)
        ?.name || "Curso seleccionado"
    : "Filtrar por Curso";

  return (
    <div className="flex flex-col gap-8 max-h-[calc(100vh-120px)] overflow-hidden">
      <div className="flex justify-between items-center flex-shrink-0">
        <h1 className="text-3xl font-semibold text-text-primary">
          Calendario de Clases
        </h1>

        <div className="relative w-64">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full h-12 px-3 py-3.5 bg-bg-primary rounded border border-stroke-primary flex justify-between items-center gap-2 hover:bg-bg-secondary transition-colors"
            disabled={loadingCourses}
          >
            <span
              className={`flex-1 text-left text-base ${selectedCourseId ? "text-text-primary" : "text-text-tertiary"}`}
            >
              {selectedCourseName}
            </span>
            <MdExpandMore
              className={`w-5 h-5 text-icon-tertiary transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isFilterOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-bg-primary rounded-lg shadow-2xl border border-stroke-primary z-20 max-h-80 overflow-y-auto">
              <button
                onClick={() => {
                  filterByCourse(null);
                  setIsFilterOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-bg-secondary transition-colors ${!selectedCourseId ? "bg-accent-light text-text-accent-primary" : "text-text-primary"}`}
              >
                Todos los cursos
              </button>
              {uniqueCourses.map(
                (course: { id: string; code: string; name: string }) => (
                  <button
                    key={course.id}
                    onClick={() => {
                      filterByCourse(course.code);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-bg-secondary transition-colors ${selectedCourseId === course.code ? "bg-accent-light text-text-accent-primary" : "text-text-primary"}`}
                  >
                    <div className="font-medium">{course.code}</div>
                    <div className="text-sm text-text-secondary">
                      {course.name}
                    </div>
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-bg-primary rounded-xl border border-stroke-primary flex-shrink-0">
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
                <span className="text-xl font-medium text-text-primary">
                  {getCurrentMonthYear()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => changeView("weekly")}
              className={`px-2.5 py-2 rounded flex items-center gap-1 text-sm font-medium transition-colors ${
                view === "weekly"
                  ? "bg-deep-blue-700 text-white"
                  : "bg-bg-primary text-text-accent-primary border border-sroke-accent-primary hover:bg-accent-light"
              }`}
            >
              <MdCalendarViewWeek className="w-4 h-4" />
              Semanal
            </button>
            <button
              onClick={() => changeView("monthly")}
              className={`px-2.5 py-2 rounded flex items-center gap-1 text-sm font-medium transition-colors ${
                view === "monthly"
                  ? "bg-deep-blue-700 text-white"
                  : "bg-bg-primary text-text-accent-primary border border-stroke-accent-primary hover:bg-accent-light"
              }`}
            >
              <MdCalendarViewMonth className="w-4 h-4" />
              Mensual
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96 flex-shrink-0">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-accent-light border-t-accent-solid rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Cargando eventos...</p>
          </div>
        </div>
      ) : view === "weekly" ? (
        <div className="bg-bg-primary rounded-2xl border border-stroke-primary overflow-hidden flex-1 flex flex-col min-h-0">
          <div className="flex border-b border-stroke-primary flex-shrink-0">
            <div className="w-16" />
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`flex-1 p-4 flex flex-col items-center gap-px ${index < 6 ? "border-r border-stroke-primary" : ""} ${isToday(day) ? "bg-info-secondary-solid/10" : ""}`}
              >
                <div className="text-xs font-medium text-text-tertiary">
                  {DAY_NAMES[index]}
                </div>
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-full ${
                    isToday(day) ? "bg-info-primary-solid text-text-white" : ""
                  }`}
                >
                  <span className="text-xl font-medium">
                    {day.getDate()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div id="calendar-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex min-w-full">
              <div className="w-16 flex flex-col flex-shrink-0 bg-bg-primary sticky left-0 z-10">
                {HOURS.map((hour) => {
                  const period = hour >= 12 ? "PM" : "AM";
                  const displayHour =
                    hour > 12 ? hour - 12 : hour === 12 ? 12 : hour;
                  return (
                    <div
                      key={hour}
                      className="h-20 px-4 py-3 border-b border-stroke-primary flex justify-end items-start gap-1 flex-shrink-0"
                    >
                      <span className="text-xs font-medium text-text-tertiary">
                        {displayHour}
                      </span>
                      <span className="text-xs font-medium text-text-tertiary">
                        {period}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex-1 flex">
              {weekDays.map((day, dayIndex) => {
              const dayEvents = getEventsByDay(day);
              const isTodayColumn = isToday(day);
              const currentTimePos = getCurrentTimePosition();

              return (
                <div
                  key={dayIndex}
                  className={`flex-1 relative ${dayIndex < 6 ? "border-r border-stroke-secondary" : ""}`}
                  style={{ minWidth: "140px" }}
                >
                  {HOURS.map((hour, hourIndex) => (
                    <div
                      key={hour}
                      className={`h-20 pr-4 ${hourIndex < HOURS.length - 1 ? "border-b border-stroke-secondary" : ""}`}
                    />
                  ))}

                  {/* Marca de hora actual */}
                  {isTodayColumn && currentTimePos > 0 && (
                    <div
                      className="absolute left-0 right-0 flex items-center z-10"
                      style={{ top: `${currentTimePos}px` }}
                    >
                      <div className="w-2 h-2 bg-info-secondary-solid rounded-full" />
                      <div className="flex-1 h-0 border-t border-stroke-info-secondary" />
                    </div>
                  )}

                  {dayEvents.map((event) => {
                    const position = getEventPosition(event);
                    const layout = getEventLayout(event, dayEvents);
                    const colors = getCourseColor(event.courseCode);

                    return (
                      <div
                        key={event.id}
                        className="absolute rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                        style={{
                          top: `${position.top}px`,
                          height: `${position.height}px`,
                          left: layout.left,
                          width: layout.width,
                          backgroundColor: colors.secondary,
                        }}
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        <div
                          className="h-full px-2.5 py-1.5 rounded-l-lg border-l-4 flex flex-col gap-1"
                          style={{ borderLeftColor: colors.primary }}
                        >
                          <span className="text-[10px] font-medium text-text-primary line-clamp-1">
                            {event.title}
                          </span>
                          <div className="flex-1 min-h-0">
                            <p className="text-xs font-medium text-text-primary line-clamp-3">
                              {event.courseName}
                            </p>
                          </div>
                          <div className="text-xs text-text-secondary">
                            {formatTimeRange(event.startDatetime, event.endDatetime)}
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
          </div>
        </div>
      ) : (
        <div className="bg-bg-primary rounded-2xl border border-stroke-primary p-12 text-center flex-shrink-0">
          <p className="text-text-tertiary">Vista mensual en desarrollo</p>
        </div>
      )}

      <EventDetailModal
        event={selectedEvent}
        isOpen={isModalOpen}
        anchorPosition={anchorPosition}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
          setAnchorPosition(undefined);
        }}
      />
    </div>
  );
}
