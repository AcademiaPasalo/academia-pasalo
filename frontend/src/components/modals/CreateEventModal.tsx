"use client";

import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { classEventService } from "@/services/classEvent.service";
import { evaluationsService } from "@/services/evaluations.service";
import type { CourseCycle, Evaluation } from "@/types/api";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  courseCycles: CourseCycle[];
}

export default function CreateEventModal({
  isOpen,
  onClose,
  onCreated,
  courseCycles,
}: CreateEventModalProps) {
  const [selectedCourseCycleId, setSelectedCourseCycleId] = useState("");
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState("");
  const [sessionNumber, setSessionNumber] = useState(1);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [liveMeetingUrl, setLiveMeetingUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load evaluations when course-cycle changes
  useEffect(() => {
    if (!selectedCourseCycleId) {
      setEvaluations([]);
      setSelectedEvaluationId("");
      return;
    }

    const loadEvaluations = async () => {
      setLoadingEvaluations(true);
      try {
        const data = await evaluationsService.findByCourseCycle(selectedCourseCycleId);
        setEvaluations(data);
        setSelectedEvaluationId("");
      } catch (err) {
        console.error("Error loading evaluations:", err);
        setEvaluations([]);
      } finally {
        setLoadingEvaluations(false);
      }
    };

    loadEvaluations();
  }, [selectedCourseCycleId]);

  // Auto-generate title based on RF-28
  useEffect(() => {
    if (!selectedEvaluationId || !sessionNumber) return;

    const evaluation = evaluations.find((e) => e.id === selectedEvaluationId);
    if (evaluation) {
      const evalName = evaluation.evaluationType
        ? `${evaluation.evaluationType.code}${evaluation.number}`
        : `Eval ${evaluation.number}`;
      setTitle(`${sessionNumber}° Clase - ${evalName}`);
    }
  }, [selectedEvaluationId, sessionNumber, evaluations]);

  // Sync end date with start date
  useEffect(() => {
    if (startDate && !endDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  const resetForm = () => {
    setSelectedCourseCycleId("");
    setEvaluations([]);
    setSelectedEvaluationId("");
    setSessionNumber(1);
    setTitle("");
    setTopic("");
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setLiveMeetingUrl("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedEvaluationId || !title || !topic || !startDate || !startTime || !endDate || !endTime || !liveMeetingUrl) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }

    const startDatetime = `${startDate}T${startTime}:00`;
    const endDatetime = `${endDate}T${endTime}:00`;

    if (new Date(endDatetime) <= new Date(startDatetime)) {
      setError("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }

    setSubmitting(true);
    try {
      await classEventService.createEvent({
        evaluationId: selectedEvaluationId,
        sessionNumber,
        title,
        topic,
        startDatetime,
        endDatetime,
        liveMeetingUrl,
      });
      resetForm();
      onCreated();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear el evento.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const getEvaluationLabel = (ev: Evaluation) => {
    if (ev.evaluationType) {
      return `${ev.evaluationType.code}${ev.number} - ${ev.evaluationType.name}`;
    }
    return `Evaluación ${ev.number}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <div className="relative w-full max-w-lg bg-bg-primary rounded-2xl shadow-xl border border-stroke-primary max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke-primary">
          <h2 className="text-lg font-semibold text-text-primary">
            Registrar Evento
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-bg-secondary transition-colors"
          >
            <MdClose className="w-5 h-5 text-icon-tertiary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="px-4 py-3 bg-error-light text-error-solid text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Course-Cycle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Curso *
            </label>
            <select
              value={selectedCourseCycleId}
              onChange={(e) => setSelectedCourseCycleId(e.target.value)}
              className="h-10 px-3 bg-bg-primary rounded-lg border border-stroke-primary text-sm text-text-primary focus:outline-none focus:border-accent-solid"
              required
            >
              <option value="">Selecciona un curso</option>
              {courseCycles.map((cc) => (
                <option key={cc.id} value={cc.id}>
                  {cc.course?.code} - {cc.course?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Evaluation */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Evaluación *
            </label>
            <select
              value={selectedEvaluationId}
              onChange={(e) => setSelectedEvaluationId(e.target.value)}
              className="h-10 px-3 bg-bg-primary rounded-lg border border-stroke-primary text-sm text-text-primary focus:outline-none focus:border-accent-solid disabled:opacity-50"
              disabled={!selectedCourseCycleId || loadingEvaluations}
              required
            >
              <option value="">
                {loadingEvaluations
                  ? "Cargando..."
                  : "Selecciona una evaluación"}
              </option>
              {evaluations.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {getEvaluationLabel(ev)}
                </option>
              ))}
            </select>
          </div>

          {/* Session Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">
              N° de Sesión *
            </label>
            <input
              type="number"
              min={1}
              value={sessionNumber}
              onChange={(e) => setSessionNumber(parseInt(e.target.value) || 1)}
              className="h-10 px-3 bg-bg-primary rounded-lg border border-stroke-primary text-sm text-text-primary focus:outline-none focus:border-accent-solid"
              required
            />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: 1° Clase - PC1"
              maxLength={255}
              className="h-10 px-3 bg-bg-primary rounded-lg border border-stroke-primary text-sm text-text-primary focus:outline-none focus:border-accent-solid"
              required
            />
          </div>

          {/* Topic */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Tema *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Tema de la clase"
              maxLength={120}
              className="h-10 px-3 bg-bg-primary rounded-lg border border-stroke-primary text-sm text-text-primary focus:outline-none focus:border-accent-solid"
              required
            />
          </div>

          {/* Date/Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Fecha inicio *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 px-3 bg-bg-primary rounded-lg border border-stroke-primary text-sm text-text-primary focus:outline-none focus:border-accent-solid"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Hora inicio *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-10 px-3 bg-bg-primary rounded-lg border border-stroke-primary text-sm text-text-primary focus:outline-none focus:border-accent-solid"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Fecha fin *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 px-3 bg-bg-primary rounded-lg border border-stroke-primary text-sm text-text-primary focus:outline-none focus:border-accent-solid"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">
                Hora fin *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-10 px-3 bg-bg-primary rounded-lg border border-stroke-primary text-sm text-text-primary focus:outline-none focus:border-accent-solid"
                required
              />
            </div>
          </div>

          {/* Live Meeting URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Link de reunión *
            </label>
            <input
              type="url"
              value={liveMeetingUrl}
              onChange={(e) => setLiveMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
              maxLength={500}
              className="h-10 px-3 bg-bg-primary rounded-lg border border-stroke-primary text-sm text-text-primary focus:outline-none focus:border-accent-solid"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-accent-solid text-white text-sm font-medium hover:bg-accent-solid/90 transition-colors disabled:opacity-50"
            >
              {submitting ? "Registrando..." : "Registrar Evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
