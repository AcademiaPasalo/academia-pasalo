"use client";

import { useEffect, useState } from "react";
import { classEventService } from "@/services/classEvent.service";
import { materialsService } from "@/services/materials.service";
import type { ClassEvent } from "@/types/classEvent";
import type { ClassEventMaterial } from "@/types/material";
import Icon from "@/components/ui/Icon";

interface EvaluationContentProps {
  evaluationId: string;
  evaluationName: string;
  evaluationFullName: string;
  onBack: () => void;
}

type EvalTabOption = "sesiones" | "material";

// ============================================
// Helpers de formato
// ============================================

function formatDate(iso: string): string {
  const date = new Date(iso);
  const formatted = date.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Lima",
  });
  // Capitalizar primera letra
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date
    .toLocaleTimeString("es-PE", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Lima",
    })
    .toUpperCase();
}

function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function calcDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${hours} hr${hours > 1 ? "s" : ""} ${minutes} min`;
}

function formatFileSize(sizeBytes: string): string {
  const bytes = parseInt(sizeBytes, 10);
  if (isNaN(bytes) || bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string): string {
  if (mimeType.includes("pdf")) return "picture_as_pdf";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "article";
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return "table_chart";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "slideshow";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "videocam";
  return "description";
}

// ============================================
// Material File Card
// ============================================

function MaterialCard({ material }: { material: ClassEventMaterial }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await materialsService.downloadMaterial(
        material.id,
        material.displayName || material.fileResource.originalName,
      );
    } catch (err) {
      console.error("Error al descargar:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-bg-primary rounded-xl outline outline-1 outline-offset-[-1px] outline-stroke-primary">
      {/* File icon */}
      <div className="p-2 bg-bg-accent-light rounded-lg flex items-center justify-center">
        <Icon
          name={getFileIcon(material.fileResource.mimeType)}
          size={20}
          className="text-icon-accent-primary"
        />
      </div>

      {/* File info */}
      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
        <span className="text-text-primary text-sm font-medium leading-4 truncate">
          {material.displayName || material.fileResource.originalName}
        </span>
        <span className="text-text-tertiary text-xs font-normal leading-3">
          {formatFileSize(material.fileResource.sizeBytes)}
        </span>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="p-2 rounded-lg hover:bg-bg-secondary transition-colors disabled:opacity-50"
        title="Descargar"
      >
        <Icon
          name={downloading ? "hourglass_empty" : "download"}
          size={20}
          className="text-icon-accent-primary"
        />
      </button>
    </div>
  );
}

// ============================================
// Class Session Card
// ============================================

function ClassSessionCard({
  event,
  materials,
  loadingMaterials,
}: {
  event: ClassEvent;
  materials: ClassEventMaterial[];
  loadingMaterials: boolean;
}) {
  const duration = calcDuration(event.startDatetime, event.endDatetime);
  const canWatch =
    event.canWatchRecording && event.recordingStatus === "READY";

  const handleWatchRecording = () => {
    if (canWatch && event.recordingUrl) {
      window.open(event.recordingUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="self-stretch p-6 bg-bg-primary rounded-2xl outline outline-1 outline-offset-[-1px] outline-stroke-primary flex flex-col gap-5">
      {/* Header: CLASE N + Duration badge */}
      <div className="flex items-center justify-between">
        <span className="text-text-primary text-lg font-semibold leading-5">
          CLASE {event.sessionNumber}
        </span>
        <div className="px-2.5 py-1.5 bg-bg-accent-light rounded-full flex items-center gap-1">
          <Icon name="watch_later" size={14} className="text-icon-accent-primary" />
          <span className="text-text-accent-primary text-xs font-medium leading-3">
            {duration}
          </span>
        </div>
      </div>

      {/* Topic */}
      <div className="text-text-secondary text-sm font-normal leading-5">
        {event.topic}
      </div>

      {/* Date & Time */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Icon
            name="calendar_today"
            size={18}
            className="text-icon-secondary"
          />
          <span className="text-text-secondary text-sm font-normal leading-4">
            {formatDate(event.startDatetime)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Icon
            name="watch_later"
            size={18}
            className="text-icon-secondary"
          />
          <span className="text-text-secondary text-sm font-normal leading-4">
            {formatTimeRange(event.startDatetime, event.endDatetime)}
          </span>
        </div>
      </div>

      {/* Ver Grabación button */}
      <div>
        <button
          onClick={handleWatchRecording}
          disabled={!canWatch}
          className={`px-4 py-2.5 rounded-xl inline-flex items-center gap-2 transition-colors ${
            canWatch
              ? "bg-bg-accent-solid text-text-white hover:bg-bg-accent-solid-hover"
              : "bg-bg-disabled text-text-disabled cursor-not-allowed"
          }`}
        >
          <Icon
            name="play_circle"
            size={18}
            className={canWatch ? "text-icon-white" : "text-icon-disabled"}
          />
          <span className="text-sm font-medium leading-4">Ver Grabación</span>
        </button>
      </div>

      {/* Materials section */}
      {(materials.length > 0 || loadingMaterials) && (
        <div className="border-l-2 border-stroke-accent-primary pl-4 flex flex-col gap-3">
          <span className="text-text-primary text-sm font-semibold leading-4">
            Materiales de clase
          </span>
          {loadingMaterials ? (
            <div className="flex items-center gap-2 py-2">
              <div className="w-4 h-4 border-2 border-accent-solid border-t-transparent rounded-full animate-spin" />
              <span className="text-text-tertiary text-xs">
                Cargando materiales...
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {materials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Componente principal
// ============================================

export default function EvaluationContent({
  evaluationId,
  evaluationName,
  evaluationFullName,
  onBack,
}: EvaluationContentProps) {
  const [activeTab, setActiveTab] = useState<EvalTabOption>("sesiones");
  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorEvents, setErrorEvents] = useState<string | null>(null);

  // Materiales por classEventId
  const [materialsByEvent, setMaterialsByEvent] = useState<
    Record<string, ClassEventMaterial[]>
  >({});
  const [loadingMaterialsMap, setLoadingMaterialsMap] = useState<
    Record<string, boolean>
  >({});

  // Cargar sesiones de clase
  useEffect(() => {
    async function loadEvents() {
      setLoadingEvents(true);
      setErrorEvents(null);
      try {
        const data =
          await classEventService.getEvaluationEvents(evaluationId);
        setEvents(data);
      } catch (err) {
        console.error("Error al cargar sesiones:", err);
        setErrorEvents("Error al cargar las sesiones de clase");
      } finally {
        setLoadingEvents(false);
      }
    }

    loadEvents();
  }, [evaluationId]);

  // Cargar materiales para cada sesión
  useEffect(() => {
    if (events.length === 0) return;

    async function loadMaterialsForEvent(eventId: string) {
      setLoadingMaterialsMap((prev) => ({ ...prev, [eventId]: true }));
      try {
        const materials =
          await materialsService.getClassEventMaterials(eventId);
        setMaterialsByEvent((prev) => ({ ...prev, [eventId]: materials }));
      } catch (err) {
        console.error(
          `Error al cargar materiales para evento ${eventId}:`,
          err,
        );
        setMaterialsByEvent((prev) => ({ ...prev, [eventId]: [] }));
      } finally {
        setLoadingMaterialsMap((prev) => ({ ...prev, [eventId]: false }));
      }
    }

    events.forEach((event) => {
      loadMaterialsForEvent(event.id);
    });
  }, [events]);

  // Sub-tabs config
  const evalTabs: { key: EvalTabOption; label: string }[] = [
    { key: "sesiones", label: "Sesiones de Clase" },
    { key: "material", label: "Material Adicional" },
  ];

  return (
    <div className="w-full inline-flex flex-col justify-start items-start overflow-hidden">
      {/* ========================================
          BACK LINK
          ======================================== */}
      <div className="self-stretch px-12 mb-6">
        <button
          onClick={onBack}
          className="p-1 rounded-lg hover:bg-bg-secondary transition-colors inline-flex items-center gap-1"
        >
          <Icon
            name="arrow_back"
            size={20}
            className="text-icon-accent-primary"
          />
          <span className="text-text-accent-primary text-sm font-medium leading-4">
            Volver al Ciclo Vigente
          </span>
        </button>
      </div>

      {/* ========================================
          BANNER
          ======================================== */}
      <div
        className="self-stretch mx-12 mb-8 px-8 py-6 rounded-2xl flex flex-col justify-center items-start gap-1"
        style={{
          background:
            "linear-gradient(135deg, var(--muted-indigo-800) 0%, var(--muted-indigo-200) 100%)",
        }}
      >
        <span className="text-white text-2xl font-bold leading-7">
          {evaluationName}
        </span>
        <span className="text-white/80 text-sm font-normal leading-5">
          {evaluationFullName}
        </span>
      </div>

      {/* ========================================
          SUB-TABS + CONTENT
          ======================================== */}
      <div className="self-stretch px-12 inline-flex flex-col justify-start items-start gap-8">
        {/* Sub-tabs */}
        <div className="w-[400px] p-1 bg-bg-primary rounded-xl outline outline-1 outline-offset-[-1px] outline-stroke-primary inline-flex justify-start items-start gap-2">
          {evalTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-2 py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors ${
                activeTab === tab.key
                  ? "bg-bg-accent-primary-solid"
                  : "bg-bg-primary hover:bg-bg-secondary"
              }`}
            >
              <span
                className={`text-center text-[15px] leading-4 whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-text-white"
                    : "text-text-secondary"
                }`}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* ========================================
            TAB: Sesiones de Clase
            ======================================== */}
        {activeTab === "sesiones" && (
          <div className="self-stretch flex flex-col justify-start items-start gap-6 overflow-hidden">
            {/* Section Title */}
            <div className="self-stretch h-7 inline-flex justify-start items-center gap-4">
              <span className="text-text-primary text-2xl font-semibold leading-7">
                Sesiones de Clase
              </span>
            </div>

            {/* Loading */}
            {loadingEvents && (
              <div className="self-stretch flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-accent-solid border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Error */}
            {errorEvents && (
              <div className="self-stretch p-12 bg-bg-secondary rounded-2xl border border-stroke-primary flex flex-col items-center justify-center gap-4">
                <Icon
                  name="error"
                  size={64}
                  className="text-icon-tertiary"
                />
                <div className="text-center">
                  <p className="text-text-primary font-semibold mb-2">
                    {errorEvents}
                  </p>
                  <p className="text-text-secondary text-sm">
                    Intenta recargar la página
                  </p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loadingEvents && !errorEvents && events.length === 0 && (
              <div className="self-stretch p-12 bg-bg-secondary rounded-2xl border border-stroke-primary flex flex-col items-center justify-center gap-4">
                <Icon
                  name="event_available"
                  size={64}
                  className="text-icon-tertiary"
                />
                <div className="text-center">
                  <p className="text-text-primary font-semibold mb-2">
                    No hay sesiones de clase
                  </p>
                  <p className="text-text-secondary text-sm">
                    Las sesiones aparecerán aquí cuando sean programadas
                  </p>
                </div>
              </div>
            )}

            {/* Session Cards */}
            {!loadingEvents && !errorEvents && events.length > 0 && (
              <div className="self-stretch flex flex-col gap-6">
                {events.map((event) => (
                  <ClassSessionCard
                    key={event.id}
                    event={event}
                    materials={materialsByEvent[event.id] || []}
                    loadingMaterials={loadingMaterialsMap[event.id] || false}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================
            TAB: Material Adicional (placeholder)
            ======================================== */}
        {activeTab === "material" && (
          <div className="self-stretch flex flex-col justify-start items-start gap-6 overflow-hidden">
            <div className="self-stretch h-7 inline-flex justify-start items-center gap-4">
              <span className="text-text-primary text-2xl font-semibold leading-7">
                Material Adicional
              </span>
            </div>

            <div className="self-stretch p-12 bg-bg-secondary rounded-2xl border border-stroke-primary flex flex-col items-center justify-center gap-4">
              <Icon
                name="folder_open"
                size={64}
                className="text-icon-tertiary"
              />
              <div className="text-center">
                <p className="text-text-primary font-semibold mb-2">
                  Próximamente
                </p>
                <p className="text-text-secondary text-sm">
                  Esta sección estará disponible pronto
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
