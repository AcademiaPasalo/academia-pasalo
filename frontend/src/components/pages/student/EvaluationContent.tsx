"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { classEventService } from "@/services/classEvent.service";
import { materialsService } from "@/services/materials.service";
import { enrollmentService } from "@/services/enrollment.service";
import type { ClassEvent } from "@/types/classEvent";
import type { ClassEventMaterial } from "@/types/material";
import type { Enrollment } from "@/types/enrollment";
import Icon from "@/components/ui/Icon";

interface EvaluationContentProps {
  cursoId: string;
  evalId: string;
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
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatTimeRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Lima",
  };
  // Solo mostrar am/pm en la hora final (ej. "8:00 - 10:00 am")
  const startStr = startDate
    .toLocaleTimeString("es-PE", opts)
    .replace(/ a\.\s?m\.| p\.\s?m\./i, "")
    .trim();
  const endStr = endDate
    .toLocaleTimeString("es-PE", opts)
    .replace(/a\.\s?m\./i, "am")
    .replace(/p\.\s?m\./i, "pm")
    .trim();
  return `${startStr} - ${endStr}`;
}

function calcDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatFileSize(sizeBytes: string): string {
  const bytes = parseInt(sizeBytes, 10);
  if (isNaN(bytes) || bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) return "";
  return fileName.substring(dotIndex);
}

function getFileNameWithoutExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) return fileName;
  return fileName.substring(0, dotIndex);
}

function getFileIconColor(mimeType: string): string {
  if (mimeType.includes("pdf")) return "bg-red-600";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "bg-sky-600";
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return "bg-green-600";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "bg-orange-500";
  if (mimeType.startsWith("image/")) return "bg-purple-500";
  return "bg-gray-500";
}

function getFileExtLabel(mimeType: string): string {
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("word") || mimeType.includes("document")) return "DOC";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "XLS";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "PPT";
  if (mimeType.startsWith("image/")) return "IMG";
  return "FILE";
}

// ============================================
// Material File Card (matches Figma)
// ============================================

function MaterialCard({ material }: { material: ClassEventMaterial }) {
  const [downloading, setDownloading] = useState(false);

  const fileName =
    material.displayName || material.fileResource.originalName;
  const nameWithoutExt = getFileNameWithoutExtension(fileName);
  const ext = getFileExtension(fileName);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await materialsService.downloadMaterial(material.id, fileName);
    } catch (err) {
      console.error("Error al descargar:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="self-stretch p-3 bg-bg-secondary rounded-lg inline-flex justify-start items-center gap-3">
      {/* File type icon */}
      <div className="flex-1 flex justify-start items-center gap-1">
        <div className="w-8 h-8 relative overflow-hidden flex items-center justify-center">
          <div
            className={`w-5 h-7 rounded-sm ${getFileIconColor(material.fileResource.mimeType)} flex items-center justify-center`}
          >
            <span className="text-white text-[6px] font-bold">
              {getFileExtLabel(material.fileResource.mimeType)}
            </span>
          </div>
        </div>

        {/* File info */}
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
          <div className="self-stretch inline-flex justify-start items-start">
            <span className="text-text-primary text-sm font-normal leading-4 line-clamp-1">
              {nameWithoutExt}
            </span>
            <span className="text-text-primary text-sm font-normal leading-4">
              {ext}
            </span>
          </div>
          <div className="self-stretch inline-flex justify-start items-center gap-2">
            <span className="text-text-tertiary text-[10px] font-normal leading-3">
              {formatFileSize(material.fileResource.sizeBytes)}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-start items-center gap-1">
        <button
          className="p-1 rounded-full flex justify-center items-center"
          title="Ver"
        >
          <Icon name="visibility" size={20} className="text-icon-tertiary" />
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="p-1 rounded-full flex justify-center items-center disabled:opacity-50"
          title="Descargar"
        >
          <Icon
            name={downloading ? "hourglass_empty" : "download"}
            size={20}
            className="text-icon-tertiary"
          />
        </button>
      </div>
    </div>
  );
}

// ============================================
// Class Session Card (matches Figma)
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
    <div className="self-stretch p-6 bg-bg-primary rounded-2xl outline outline-1 outline-offset-[-1px] outline-stroke-primary flex flex-col justify-start items-start gap-4">
      {/* Content section */}
      <div className="self-stretch flex flex-col justify-start items-start gap-2">
        {/* Header + Topic */}
        <div className="self-stretch flex flex-col justify-start items-start gap-1">
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="flex justify-start items-start gap-1">
              <span className="text-text-accent-primary text-sm font-semibold leading-4">
                CLASE
              </span>
              <span className="text-text-accent-primary text-sm font-semibold leading-4">
                {event.sessionNumber}
              </span>
            </div>
            <div className="flex justify-start items-start">
              <div className="px-2 py-1 bg-bg-info-primary-light rounded-full flex justify-center items-center gap-1">
                <span className="text-text-info-primary text-[10px] font-semibold leading-3">
                  {duration}
                </span>
              </div>
            </div>
          </div>
          <div className="self-stretch text-text-primary text-lg font-semibold leading-5">
            {event.topic}
          </div>
        </div>

        {/* Date & Time */}
        <div className="self-stretch flex flex-col justify-start items-start gap-1">
          <div className="self-stretch inline-flex justify-start items-center gap-1">
            <Icon
              name="calendar_today"
              size={14}
              className="text-icon-secondary"
            />
            <span className="text-text-tertiary text-xs font-normal leading-4">
              {formatDate(event.startDatetime)}
            </span>
          </div>
          <div className="self-stretch inline-flex justify-start items-center gap-1">
            <Icon
              name="schedule"
              size={14}
              className="text-icon-secondary"
            />
            <span className="text-text-secondary text-xs font-normal leading-3">
              {formatTimeRange(event.startDatetime, event.endDatetime)}
            </span>
          </div>
        </div>
      </div>

      {/* Ver Grabación button (full width) */}
      <div className="self-stretch flex flex-col justify-start items-end gap-2.5">
        <button
          onClick={handleWatchRecording}
          disabled={!canWatch}
          className={`self-stretch px-4 py-3 rounded-lg inline-flex justify-center items-center gap-1.5 transition-colors ${
            canWatch
              ? "bg-bg-accent-primary-solid hover:bg-bg-accent-solid-hover"
              : "bg-bg-disabled cursor-not-allowed"
          }`}
        >
          <Icon
            name="play_arrow"
            size={16}
            className={canWatch ? "text-icon-white" : "text-icon-disabled"}
          />
          <span
            className={`text-sm font-medium leading-4 ${canWatch ? "text-text-white" : "text-text-disabled"}`}
          >
            Ver Grabación
          </span>
        </button>
      </div>

      {/* Materials section */}
      {(materials.length > 0 || loadingMaterials) && (
        <div className="self-stretch pl-3 border-l-2 border-stroke-primary flex flex-col justify-start items-start gap-3">
          <span className="self-stretch text-text-quartiary text-sm font-semibold leading-4">
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
            <div className="self-stretch flex flex-col justify-start items-start gap-2">
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
  cursoId,
  evalId,
}: EvaluationContentProps) {
  const { setBreadcrumbItems } = useBreadcrumb();

  const [activeTab, setActiveTab] = useState<EvalTabOption>("sesiones");
  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorEvents, setErrorEvents] = useState<string | null>(null);

  // Nombre del curso (desde enrollment)
  const [courseName, setCourseName] = useState<string>("");

  // Nombre de la evaluación (desde la respuesta del API de class events)
  const [evaluationName, setEvaluationName] = useState<string>("");

  // Materiales por classEventId
  const [materialsByEvent, setMaterialsByEvent] = useState<
    Record<string, ClassEventMaterial[]>
  >({});
  const [loadingMaterialsMap, setLoadingMaterialsMap] = useState<
    Record<string, boolean>
  >({});

  // Cargar nombre del curso desde enrollment
  useEffect(() => {
    async function loadCourseName() {
      try {
        const response = await enrollmentService.getMyCourses();
        const enrollments: Enrollment[] = Array.isArray(response)
          ? response
          : response.data || [];
        const found = enrollments.find(
          (e) => e.courseCycle.id === cursoId,
        );
        if (found) {
          setCourseName(found.courseCycle.course.name);
        }
      } catch (err) {
        console.error("Error al cargar nombre del curso:", err);
      }
    }

    loadCourseName();
  }, [cursoId]);

  // Breadcrumb: Cursos > Nombre del curso > Ciclo Vigente > PC1
  useEffect(() => {
    if (!courseName) return;
    setBreadcrumbItems([
      { label: "Cursos" },
      { label: courseName, href: `/plataforma/curso/${cursoId}` },
      { label: "Ciclo Vigente" },
      { label: evaluationName },
    ]);
  }, [setBreadcrumbItems, courseName, evaluationName, cursoId]);

  // Cargar sesiones de clase
  useEffect(() => {
    async function loadEvents() {
      setLoadingEvents(true);
      setErrorEvents(null);
      try {
        const data =
          await classEventService.getEvaluationEvents(evalId);
        setEvents(data);
        if (data.length > 0 && data[0].evaluationName) {
          setEvaluationName(data[0].evaluationName);
        }
      } catch (err) {
        console.error("Error al cargar sesiones:", err);
        setErrorEvents("Error al cargar las sesiones de clase");
      } finally {
        setLoadingEvents(false);
      }
    }

    loadEvents();
  }, [evalId]);

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
        <Link
          href={`/plataforma/curso/${cursoId}`}
          className="p-1 rounded-lg hover:bg-bg-secondary transition-colors inline-flex justify-center items-center gap-2"
        >
          <Icon
            name="arrow_back"
            size={20}
            className="text-icon-accent-primary"
          />
          <span className="text-text-accent-primary text-base font-medium leading-4">
            Volver al Ciclo Vigente
          </span>
        </Link>
      </div>

      {/* ========================================
          BANNER
          ======================================== */}
      <div
        className="self-stretch mx-12 mb-8 p-10 rounded-2xl inline-flex flex-col justify-center items-start gap-2 overflow-hidden"
        style={{
          background:
            "linear-gradient(to right, var(--muted-indigo-800), var(--muted-indigo-700), var(--muted-indigo-200))",
        }}
      >
        <div className="self-stretch flex flex-col justify-center items-start gap-1">
          <span className="self-stretch text-white text-3xl font-semibold leading-10">
            {evaluationName}
          </span>
        </div>
      </div>

      {/* ========================================
          SUB-TABS + CONTENT
          ======================================== */}
      <div className="self-stretch px-12 inline-flex flex-col justify-start items-start gap-8">
        {/* Sub-tabs */}
        <div className="w-[491px] p-1 bg-bg-primary rounded-xl outline outline-1 outline-offset-[-1px] outline-stroke-primary inline-flex justify-start items-start gap-2">
          {evalTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-2 py-2.5 rounded-lg flex justify-start items-center gap-2 transition-colors ${
                activeTab === tab.key
                  ? "bg-bg-accent-primary-solid"
                  : "bg-bg-primary hover:bg-bg-secondary"
              }`}
            >
              <div className="flex-1 flex justify-start items-center gap-2">
                <span
                  className={`flex-1 text-center text-base leading-4 whitespace-nowrap ${
                    activeTab === tab.key
                      ? "text-text-white font-medium"
                      : "text-text-secondary font-normal"
                  }`}
                >
                  {tab.label}
                </span>
              </div>
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
              <div className="bg-white self-stretch p-12 rounded-2xl border border-stroke-primary flex flex-col items-center justify-center gap-4">
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
              <div className="self-stretch flex flex-col justify-start items-start gap-6">
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

            <div className="self-stretch p-12 bg-white rounded-2xl border border-stroke-primary flex flex-col items-center justify-center gap-4">
              <Icon
                name="folder"
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
