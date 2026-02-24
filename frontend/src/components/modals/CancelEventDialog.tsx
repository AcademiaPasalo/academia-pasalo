"use client";

import { useState } from "react";
import { MdClose, MdWarning } from "react-icons/md";
import { classEventService } from "@/services/classEvent.service";
import type { ClassEvent } from "@/types/classEvent";

interface CancelEventDialogProps {
  isOpen: boolean;
  event: ClassEvent | null;
  onClose: () => void;
  onCancelled: () => void;
}

export default function CancelEventDialog({
  isOpen,
  event,
  onClose,
  onCancelled,
}: CancelEventDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!event) return;
    setError(null);
    setSubmitting(true);

    try {
      await classEventService.cancelEvent(event.id);
      onCancelled();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cancelar el evento.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-bg-primary rounded-2xl shadow-xl border border-stroke-primary">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke-primary">
          <h2 className="text-lg font-semibold text-text-primary">
            Cancelar Evento
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-bg-secondary transition-colors"
          >
            <MdClose className="w-5 h-5 text-icon-tertiary" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-error-light rounded-full flex-shrink-0">
              <MdWarning className="w-5 h-5 text-error-solid" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-text-primary">
                ¿Estás seguro de que deseas cancelar este evento?
              </p>
              <p className="text-sm text-text-secondary">
                <strong>{event.title}</strong> &middot; {event.courseName}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                Esta acción no se puede deshacer.
              </p>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-error-light text-error-solid text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-secondary transition-colors"
            >
              Volver
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-error-solid text-white text-sm font-medium hover:bg-error-solid/90 transition-colors disabled:opacity-50"
            >
              {submitting ? "Cancelando..." : "Confirmar Cancelación"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
