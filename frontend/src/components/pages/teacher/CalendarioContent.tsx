"use client";

import { useState, useEffect } from "react";
import { useCalendar } from "@/hooks/useCalendar";
import { useTeacherCourses } from "@/hooks/useTeacherCourses";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { useAuth } from "@/contexts/AuthContext";
import type { ClassEvent } from "@/types/classEvent";
import EventDetailModal from "@/components/modals/EventDetailModal";
import CreateEventModal from "@/components/modals/CreateEventModal";
import EditEventModal from "@/components/modals/EditEventModal";
import CancelEventDialog from "@/components/modals/CancelEventDialog";
import {
  CalendarHeader,
  CalendarWeeklyView,
  CalendarMonthlyView,
  CalendarLoading,
} from "@/components/calendar";
import { MdAdd } from "react-icons/md";

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
    refreshEvents,
  } = useCalendar();

  const { courseCycles, uniqueCourses, loading: loadingCourses } = useTeacherCourses();
  const { setBreadcrumbItems } = useBreadcrumb();
  const { user } = useAuth();

  // Detail modal state
  const [selectedEvent, setSelectedEvent] = useState<ClassEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState<
    { x: number; y: number } | undefined
  >();

  // CRUD modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<ClassEvent | null>(null);
  const [eventToCancel, setEventToCancel] = useState<ClassEvent | null>(null);

  const weekDays = getWeekDays();

  useEffect(() => {
    setBreadcrumbItems([{ icon: "event", label: "Calendario" }]);
  }, [setBreadcrumbItems]);

  const isEventOwner = (event: ClassEvent) => {
    if (!user) return false;
    return (
      event.creator?.id === user.id ||
      event.professors?.some((p) => p.id === user.id)
    );
  };

  const handleEventClick = (event: ClassEvent, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAnchorPosition({
      x: rect.right - 16,
      y: rect.top - 24,
    });
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  const handleEdit = () => {
    if (selectedEvent) {
      setEventToEdit(selectedEvent);
      setIsEditOpen(true);
    }
  };

  const handleCancel = () => {
    if (selectedEvent) {
      setEventToCancel(selectedEvent);
      setIsCancelOpen(true);
    }
  };

  const handleEventMutated = () => {
    refreshEvents();
    setSelectedEvent(null);
    setEventToEdit(null);
    setEventToCancel(null);
  };

  const ownerOfSelected = selectedEvent ? isEventOwner(selectedEvent) : false;

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
        actions={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-3 rounded-lg bg-accent-solid text-white text-sm font-medium hover:bg-accent-solid/90 transition-colors"
          >
            <MdAdd className="w-5 h-5" />
            Registrar Evento
          </button>
        }
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

      {/* Event Detail Modal (with edit/cancel for owned events) */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isDetailOpen}
        anchorPosition={anchorPosition}
        canEdit={ownerOfSelected}
        canCancel={ownerOfSelected}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedEvent(null);
          setAnchorPosition(undefined);
        }}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleEventMutated}
        courseCycles={courseCycles}
      />

      {/* Edit Event Modal */}
      <EditEventModal
        isOpen={isEditOpen}
        event={eventToEdit}
        onClose={() => {
          setIsEditOpen(false);
          setEventToEdit(null);
        }}
        onUpdated={handleEventMutated}
      />

      {/* Cancel Event Dialog */}
      <CancelEventDialog
        isOpen={isCancelOpen}
        event={eventToCancel}
        onClose={() => {
          setIsCancelOpen(false);
          setEventToCancel(null);
        }}
        onCancelled={handleEventMutated}
      />
    </div>
  );
}
