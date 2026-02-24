"use client";

import { useState, useEffect } from "react";
import { useCalendar } from "@/hooks/useCalendar";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import type { ClassEvent } from "@/types/classEvent";
import EventDetailModal from "@/components/modals/EventDetailModal";
import {
  CalendarHeader,
  CalendarWeeklyView,
  CalendarMonthlyView,
  CalendarLoading,
} from "@/components/calendar";

export default function CalendarioContent() {
  const {
    events,
    loading,
    view,
    selectedCourseId,
    currentDate,
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
  const [anchorPosition, setAnchorPosition] = useState<
    { x: number; y: number } | undefined
  >();

  const weekDays = getWeekDays();

  useEffect(() => {
    setBreadcrumbItems([{ icon: "event", label: "Calendario" }]);
  }, [setBreadcrumbItems]);

  const handleEventClick = (event: ClassEvent, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAnchorPosition({
      x: rect.right - 16,
      y: rect.top - 24,
    });
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-8 max-h-[calc(100vh-152px)] overflow-hidden">
      <CalendarHeader
        title="Calendario de Clases"
        currentMonthYear={getCurrentMonthYear()}
        view={view}
        selectedCourseId={selectedCourseId}
        courses={uniqueCourses}
        loadingCourses={loadingCourses}
        onViewChange={changeView}
        onNext={goToNext}
        onPrevious={goToPrevious}
        onToday={goToToday}
        onCourseChange={filterByCourse}
      />

      {loading ? (
        <CalendarLoading />
      ) : view === "weekly" ? (
        <CalendarWeeklyView
          weekDays={weekDays}
          events={events}
          loading={loading}
          currentDate={currentDate}
          isToday={isToday}
          onEventClick={handleEventClick}
        />
      ) : (
        <CalendarMonthlyView
          currentDate={currentDate}
          events={events}
          isToday={isToday}
          onEventClick={handleEventClick}
        />
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
