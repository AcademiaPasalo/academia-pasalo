// ============================================
// EVENT DETAIL MODAL - Modal de Detalle de Evento de Clase
// ============================================

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ClassEvent } from '@/types/classEvent';
import { classEventService } from '@/services/classEvent.service';
import { MdClose, MdVideocam, MdContentCopy, MdCheckCircle, MdCancel, MdSchedule, MdPerson } from 'react-icons/md';

interface EventDetailModalProps {
  event: ClassEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !event) return null;

  const handleJoinMeeting = () => {
    try {
      classEventService.joinMeeting(event);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al unirse a la reunión');
    }
  };

  const handleCopyLink = async () => {
    try {
      await classEventService.copyMeetingLink(event);
      setCopySuccess(true);
      setError(null);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al copiar el link');
    }
  };

  const getStatusBadge = () => {
    if (event.isCancelled) {
      return (
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-error-light rounded-full">
          <MdCancel className="w-4 h-4 text-text-error-primary" />
          <span className="text-sm font-medium text-text-error-primary">Cancelada</span>
        </div>
      );
    }

    switch (event.status) {
      case 'EN_CURSO':
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-success-light rounded-full">
            <div className="w-2 h-2 bg-success-solid rounded-full animate-pulse" />
            <span className="text-sm font-medium text-success-primary">En vivo</span>
          </div>
        );
      case 'FINALIZADA':
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-bg-secondary rounded-full">
            <MdCheckCircle className="w-4 h-4 text-text-tertiary" />
            <span className="text-sm font-medium text-text-tertiary">Finalizada</span>
          </div>
        );
      case 'PROGRAMADA':
        return (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-info-secondary-solid rounded-full">
            <MdSchedule className="w-4 h-4 text-text-white" />
            <span className="text-sm font-medium text-text-white">Programada</span>
          </div>
        );
      default:
        return null;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM, yyyy 'a las' h:mm a", { locale: es });
  };

  const formatTimeRange = () => {
    const start = new Date(event.startDatetime);
    const end = new Date(event.endDatetime);
    return `${format(start, 'h:mm a', { locale: es })} - ${format(end, 'h:mm a', { locale: es })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-bg-primary rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-bg-primary border-b border-stroke-primary">
          <h2 className="text-2xl font-semibold text-text-primary">Detalle del Evento</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
            aria-label="Cerrar"
          >
            <MdClose className="w-6 h-6 text-icon-primary" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs font-medium text-text-accent-primary bg-accent-light rounded">
                  Clase {event.sessionNumber}
                </span>
                <span className="text-xs text-text-tertiary">•</span>
                <span className="text-xs font-medium text-text-tertiary">{event.courseCode}</span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-1">{event.title}</h3>
              <p className="text-base text-text-secondary">{event.courseName}</p>
            </div>
            {getStatusBadge()}
          </div>

          <div className="p-4 bg-bg-secondary rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <MdSchedule className="w-5 h-5 text-icon-accent-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-primary">Horario</p>
                <p className="text-sm text-text-secondary">{formatTimeRange()}</p>
                <p className="text-xs text-text-tertiary mt-1">{formatDateTime(event.startDatetime)}</p>
              </div>
            </div>

            {event.topic && (
              <div className="pt-3 border-t border-stroke-primary">
                <p className="text-sm font-medium text-text-primary mb-1">Tema</p>
                <p className="text-sm text-text-secondary">{event.topic}</p>
              </div>
            )}
          </div>

          {event.creator && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text-primary">Creado por</h4>
              <div className="flex items-center gap-3">
                {event.creator.profilePhotoUrl ? (
                  <img
                    src={event.creator.profilePhotoUrl}
                    alt={`${event.creator.firstName} ${event.creator.lastName1}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center">
                    <MdPerson className="w-6 h-6 text-icon-accent-primary" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {event.creator.firstName} {event.creator.lastName1}
                  </p>
                  <p className="text-xs text-text-tertiary">Profesor</p>
                </div>
              </div>
            </div>
          )}

          {event.professors && event.professors.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text-primary">Profesores invitados</h4>
              <div className="flex flex-wrap gap-2">
                {event.professors.map((professor) => (
                  <div key={professor.id} className="flex items-center gap-2 px-3 py-2 bg-bg-secondary rounded-lg">
                    {professor.profilePhotoUrl ? (
                      <img
                        src={professor.profilePhotoUrl}
                        alt={`${professor.firstName} ${professor.lastName1}`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center">
                        <MdPerson className="w-5 h-5 text-icon-accent-primary" />
                      </div>
                    )}
                    <span className="text-sm text-text-primary">
                      {professor.firstName} {professor.lastName1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-error-light rounded-lg">
              <p className="text-sm text-text-error-primary">{error}</p>
            </div>
          )}

          {copySuccess && (
            <div className="p-4 bg-success-light rounded-lg flex items-center gap-2">
              <MdCheckCircle className="w-5 h-5 text-success-primary" />
              <p className="text-sm text-success-primary">Link copiado al portapapeles</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {event.canJoinMeeting && !event.isCancelled && (
              <button
                onClick={handleJoinMeeting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent-solid text-text-white rounded-lg font-medium hover:bg-accent-solid-hover transition-colors"
              >
                <MdVideocam className="w-5 h-5" />
                Unirse a la reunión
              </button>
            )}
            {event.canCopyLink && !event.isCancelled && (
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-bg-secondary text-text-accent-primary rounded-lg font-medium hover:bg-bg-secondary-hover border border-stroke-accent-primary transition-colors"
              >
                <MdContentCopy className="w-5 h-5" />
                Copiar link
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
