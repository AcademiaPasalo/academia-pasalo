"use client";

import { useEffect, useState, useCallback } from "react";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { coursesService } from "@/services/courses.service";
import { enrollmentService } from "@/services/enrollment.service";
import { Enrollment } from "@/types/enrollment";
import {
  CurrentCycleResponse,
  CycleEvaluation,
  EvaluationLabel,
  PreviousCyclesResponse,
  PreviousCycleContentResponse,
  PreviousCycleEvaluation,
} from "@/types/curso";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

interface CursoContentProps {
  cursoId: string; // Este es el courseCycleId
}

type TabOption = "vigente" | "anteriores" | "banco";

// ============================================
// Helpers de estado visual para evaluaciones
// ============================================

function getEvalIcon(label: EvaluationLabel): string {
  switch (label) {
    case "Completado":
      return "check_circle";
    case "En curso":
      return "bookmark";
    case "Próximamente":
      return "watch_later";
    case "Bloqueado":
      return "lock";
  }
}

function getEvalIconBg(label: EvaluationLabel): string {
  switch (label) {
    case "Completado":
      return "bg-bg-success-light";
    case "En curso":
      return "bg-bg-accent-light";
    case "Próximamente":
      return "bg-bg-tertiary";
    case "Bloqueado":
      return "bg-bg-disabled";
  }
}

function getEvalIconColor(label: EvaluationLabel): string {
  switch (label) {
    case "Completado":
      return "text-icon-success-primary";
    case "En curso":
      return "text-icon-accent-primary";
    case "Próximamente":
      return "text-icon-tertiary";
    case "Bloqueado":
      return "text-icon-disabled";
  }
}

function getEvalBadgeBg(label: EvaluationLabel): string {
  switch (label) {
    case "Completado":
      return "bg-bg-success-light";
    case "En curso":
      return "bg-bg-accent-light";
    case "Próximamente":
      return "bg-bg-quartiary";
    case "Bloqueado":
      return "bg-bg-disabled";
  }
}

function getEvalBadgeText(label: EvaluationLabel): string {
  switch (label) {
    case "Completado":
      return "text-text-success-primary";
    case "En curso":
      return "text-text-accent-primary";
    case "Próximamente":
      return "text-text-secondary";
    case "Bloqueado":
      return "text-text-disabled";
  }
}

function getEvalCardBg(label: EvaluationLabel): string {
  return label === "Bloqueado" ? "bg-bg-tertiary" : "bg-bg-primary";
}

function isEvalDisabled(label: EvaluationLabel): boolean {
  return label === "Próximamente" || label === "Bloqueado";
}

// ============================================
// Componente de card de evaluación (Ciclo Vigente)
// ============================================

function EvaluationCard({
  evaluation,
  onSelect,
}: {
  evaluation: CycleEvaluation;
  onSelect?: (evaluation: CycleEvaluation) => void;
}) {
  const disabled = isEvalDisabled(evaluation.label);
  const isEnCurso = evaluation.label === "En curso";

  // La card de "En curso" tiene borde izquierdo accent y outline solo en top/right/bottom
  if (isEnCurso) {
    return (
      <div className="self-stretch bg-bg-primary rounded-2xl border-l-[3px] border-stroke-accent-primary inline-flex flex-col justify-start items-end">
        <div className="self-stretch p-6 rounded-2xl border-r border-t border-b border-stroke-primary flex flex-col justify-start items-end gap-4">
          {/* Icon + Badge */}
          <div className="self-stretch inline-flex justify-between items-start">
            <div
              className={`p-2 ${getEvalIconBg(evaluation.label)} rounded-full flex justify-start items-center`}
            >
              <Icon
                name={getEvalIcon(evaluation.label)}
                size={24}
                className={getEvalIconColor(evaluation.label)}
              />
            </div>
            <div className="flex justify-start items-start">
              <div
                className={`px-2.5 py-1.5 ${getEvalBadgeBg(evaluation.label)} rounded-full flex justify-center items-center gap-1`}
              >
                <span
                  className={`text-xs font-medium leading-3 ${getEvalBadgeText(evaluation.label)}`}
                >
                  {evaluation.label}
                </span>
              </div>
            </div>
          </div>

          {/* Title + Description */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="self-stretch text-text-primary text-lg font-semibold leading-5">
              {evaluation.shortName}
            </div>
            <div className="self-stretch text-text-secondary text-xs font-normal leading-4">
              {evaluation.fullName}
            </div>
          </div>

          {/* Ver Clases Link */}
          <button
            onClick={() => onSelect?.(evaluation)}
            className="p-1 rounded-lg inline-flex justify-center items-center gap-1.5 hover:bg-bg-accent-light transition-colors"
          >
            <span className="text-text-accent-primary text-sm font-medium leading-4">
              Ver Clases
            </span>
            <Icon
              name="arrow_forward"
              size={16}
              className="text-icon-accent-primary"
            />
          </button>
        </div>
      </div>
    );
  }

  // Cards normales (Completado, Próximamente, Bloqueado)
  return (
    <div
      className={`self-stretch p-6 ${getEvalCardBg(evaluation.label)} rounded-2xl outline outline-1 outline-offset-[-1px] outline-stroke-primary inline-flex flex-col justify-start items-end gap-4`}
    >
      {/* Icon + Badge */}
      <div className="self-stretch inline-flex justify-between items-start">
        <div
          className={`p-2 ${getEvalIconBg(evaluation.label)} rounded-full flex justify-start items-center`}
        >
          <Icon
            name={getEvalIcon(evaluation.label)}
            size={24}
            className={getEvalIconColor(evaluation.label)}
          />
        </div>
        <div className="flex justify-start items-start">
          <div
            className={`px-2.5 py-1.5 ${getEvalBadgeBg(evaluation.label)} rounded-full flex justify-center items-center gap-1`}
          >
            <span
              className={`text-xs font-medium leading-3 ${getEvalBadgeText(evaluation.label)}`}
            >
              {evaluation.label}
            </span>
          </div>
        </div>
      </div>

      {/* Title + Description */}
      <div className="self-stretch flex flex-col justify-start items-start gap-1">
        <div
          className={`self-stretch text-lg font-semibold leading-5 ${disabled ? "text-text-secondary" : "text-text-primary"}`}
        >
          {evaluation.shortName}
        </div>
        <div
          className={`self-stretch text-xs font-normal leading-4 ${disabled ? "text-text-tertiary" : "text-text-secondary"}`}
        >
          {evaluation.fullName}
        </div>
      </div>

      {/* Ver Clases Link */}
      <button
        disabled={disabled}
        onClick={() => !disabled && onSelect?.(evaluation)}
        className={`p-1 rounded-lg inline-flex justify-center items-center gap-1.5 ${disabled ? "cursor-not-allowed" : "hover:bg-bg-accent-light transition-colors"}`}
      >
        <span
          className={`text-sm font-medium leading-4 ${disabled ? "text-text-disabled" : "text-text-accent-primary"}`}
        >
          Ver Clases
        </span>
        <Icon
          name="arrow_forward"
          size={16}
          className={
            disabled ? "text-icon-disabled" : "text-icon-accent-primary"
          }
        />
      </button>
    </div>
  );
}

// ============================================
// Card de ciclo anterior (lista de ciclos)
// ============================================

function PreviousCycleCard({
  cycleCode,
  onViewCycle,
}: {
  cycleCode: string;
  onViewCycle: (code: string) => void;
}) {
  return (
    <div className="self-stretch p-6 bg-bg-primary rounded-2xl outline outline-1 outline-offset-[-1px] outline-stroke-primary inline-flex flex-col justify-start items-end gap-4">
      {/* Icon */}
      <div className="self-stretch inline-flex justify-start items-start">
        <div className="p-3 bg-bg-quartiary rounded-xl flex justify-start items-center">
          <Icon
            name="calendar_today"
            size={24}
            className="text-icon-tertiary"
          />
        </div>
      </div>

      {/* Title + Description */}
      <div className="self-stretch flex flex-col justify-start items-start gap-1">
        <div className="self-stretch text-text-primary text-lg font-semibold leading-5">
          Ciclo {cycleCode}
        </div>
        <div className="self-stretch text-text-secondary text-xs font-normal leading-4">
          Contenido del ciclo {cycleCode}
        </div>
      </div>

      {/* Ver Ciclo Link */}
      <button
        onClick={() => onViewCycle(cycleCode)}
        className="p-1 rounded-lg inline-flex justify-center items-center gap-1.5 hover:bg-bg-accent-light transition-colors"
      >
        <span className="text-text-accent-primary text-sm font-medium leading-4">
          Ver Ciclo
        </span>
        <Icon
          name="arrow_forward"
          size={16}
          className="text-icon-accent-primary"
        />
      </button>
    </div>
  );
}

// ============================================
// Card de evaluación dentro de un ciclo anterior
// ============================================

function PreviousCycleEvaluationCard({
  evaluation,
}: {
  evaluation: PreviousCycleEvaluation;
}) {
  const isBlocked = evaluation.label === "Bloqueado";

  return (
    <div
      className={`self-stretch p-6 ${isBlocked ? "bg-bg-tertiary" : "bg-bg-primary"} rounded-2xl outline outline-1 outline-offset-[-1px] outline-stroke-primary inline-flex flex-col justify-start items-end gap-4`}
    >
      {/* Icon + Badge */}
      <div className="self-stretch inline-flex justify-between items-start">
        <div
          className={`p-2 ${isBlocked ? "bg-bg-disabled" : "bg-bg-quartiary"} rounded-full flex justify-start items-center`}
        >
          <Icon
            name={isBlocked ? "lock" : "inventory_2"}
            size={24}
            className={isBlocked ? "text-icon-disabled" : "text-icon-tertiary"}
          />
        </div>
        <div className="flex justify-start items-start">
          <div
            className={`px-2.5 py-1.5 ${isBlocked ? "bg-bg-disabled" : "bg-bg-quartiary"} rounded-full flex justify-center items-center gap-1`}
          >
            <span
              className={`text-xs font-medium leading-3 ${isBlocked ? "text-text-disabled" : "text-text-secondary"}`}
            >
              {evaluation.label}
            </span>
          </div>
        </div>
      </div>

      {/* Title + Description */}
      <div className="self-stretch flex flex-col justify-start items-start gap-1">
        <div
          className={`self-stretch text-lg font-semibold leading-5 ${isBlocked ? "text-text-secondary" : "text-text-primary"}`}
        >
          {evaluation.shortName}
        </div>
        <div
          className={`self-stretch text-xs font-normal leading-4 ${isBlocked ? "text-text-tertiary" : "text-text-secondary"}`}
        >
          {evaluation.fullName}
        </div>
      </div>

      {/* Ver Clases Link */}
      <button
        disabled={isBlocked}
        className={`p-1 rounded-lg inline-flex justify-center items-center gap-1.5 ${isBlocked ? "cursor-not-allowed" : "hover:bg-bg-accent-light transition-colors"}`}
      >
        <span
          className={`text-sm font-medium leading-4 ${isBlocked ? "text-text-disabled" : "text-text-accent-primary"}`}
        >
          Ver Clases
        </span>
        <Icon
          name="arrow_forward"
          size={16}
          className={
            isBlocked ? "text-icon-disabled" : "text-icon-accent-primary"
          }
        />
      </button>
    </div>
  );
}

// ============================================
// Card de categoría para Banco de Enunciados
// ============================================

const bancoCategories = [
  {
    key: "PD",
    title: "Prácticas Dirigidas",
    description: "Material de práctica y ejercicios dirigidos del curso",
    icon: "description",
    iconBg: "bg-bg-info-primary-light",
    iconColor: "text-icon-info-primary",
  },
  {
    key: "PC",
    title: "Prácticas Calificadas",
    description: "Enunciados de prácticas calificadas de ciclos anteriores",
    icon: "quiz",
    iconBg: "bg-bg-info-secondary-light",
    iconColor: "text-icon-info-secondary",
  },
  {
    key: "EX",
    title: "Exámenes",
    description:
      "Enunciados de exámenes parciales y finales de ciclos anteriores",
    icon: "school",
    iconBg: "bg-bg-success-light",
    iconColor: "text-icon-success-primary",
  },
];

function BancoCategoryCard({
  category,
}: {
  category: (typeof bancoCategories)[number];
}) {
  return (
    <div className="self-stretch p-6 bg-bg-primary rounded-2xl outline outline-1 outline-offset-[-1px] outline-stroke-primary inline-flex flex-col justify-start items-end gap-4">
      {/* Icon */}
      <div className="self-stretch inline-flex justify-start items-start">
        <div
          className={`p-3 ${category.iconBg} rounded-xl flex justify-start items-center`}
        >
          <Icon name="folder" size={24} className={category.iconColor} />
        </div>
      </div>

      {/* Title + Description */}
      <div className="self-stretch flex flex-col justify-start items-start gap-1">
        <div className="self-stretch text-text-primary text-lg font-semibold leading-5">
          {category.title}
        </div>
        <div className="self-stretch text-text-secondary text-xs font-normal leading-4">
          {category.description}
        </div>
      </div>

      {/* Ver Enunciados Link */}
      <button className="p-1 rounded-lg inline-flex justify-center items-center gap-1.5 hover:bg-bg-accent-light transition-colors">
        <span className="text-text-accent-primary text-sm font-medium leading-4">
          Ver Enunciados
        </span>
        <Icon
          name="arrow_forward"
          size={16}
          className="text-icon-accent-primary"
        />
      </button>
    </div>
  );
}

// ============================================
// Componente principal
// ============================================

export default function CursoContent({ cursoId }: CursoContentProps) {
  const router = useRouter();
  const { setBreadcrumbItems } = useBreadcrumb();

  // Datos del enrollment (para header: nombre, profesor, tipo, nivel)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);

  // Tab activo
  const [activeTab, setActiveTab] = useState<TabOption>("vigente");

  // Datos del ciclo vigente
  const [currentCycle, setCurrentCycle] = useState<CurrentCycleResponse | null>(
    null,
  );
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [errorCurrent, setErrorCurrent] = useState<string | null>(null);

  // Datos de ciclos anteriores
  const [previousCycles, setPreviousCycles] =
    useState<PreviousCyclesResponse | null>(null);
  const [loadingPrevious, setLoadingPrevious] = useState(false);
  // Vista de detalle de ciclo anterior
  const [viewingCycleCode, setViewingCycleCode] = useState<string | null>(null);
  const [previousCycleContent, setPreviousCycleContent] =
    useState<PreviousCycleContentResponse | null>(null);
  const [loadingPreviousContent, setLoadingPreviousContent] = useState(false);

  // Loading general (enrollment)
  const [loadingEnrollment, setLoadingEnrollment] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener datos del enrollment para el header
  useEffect(() => {
    async function loadEnrollment() {
      setLoadingEnrollment(true);
      setError(null);
      try {
        const response = await enrollmentService.getMyCourses();
        const enrollments = Array.isArray(response)
          ? response
          : response.data || [];
        const found = enrollments.find(
          (e: Enrollment) => e.courseCycle.id === cursoId,
        );
        if (found) {
          setEnrollment(found);
          setBreadcrumbItems([
            { label: "Cursos" },
            { label: found.courseCycle.course.name },
          ]);
        } else {
          setError("No se encontró la matrícula para este curso");
        }
      } catch (err) {
        console.error("Error al cargar matrícula:", err);
        setError("Error al cargar los datos del curso");
      } finally {
        setLoadingEnrollment(false);
      }
    }

    if (cursoId) loadEnrollment();
  }, [cursoId, setBreadcrumbItems]);

  // Obtener evaluaciones del ciclo vigente
  useEffect(() => {
    async function loadCurrentCycle() {
      setLoadingCurrent(true);
      setErrorCurrent(null);
      try {
        const data = await coursesService.getCurrentCycleContent(cursoId);
        setCurrentCycle(data);
      } catch (err) {
        console.error("Error al cargar ciclo vigente:", err);
        setErrorCurrent("Error al cargar las evaluaciones del ciclo vigente");
      } finally {
        setLoadingCurrent(false);
      }
    }

    if (cursoId) loadCurrentCycle();
  }, [cursoId]);

  // Cargar lista de ciclos anteriores cuando canViewPreviousCycles = true
  useEffect(() => {
    async function loadPreviousCycles() {
      if (!currentCycle?.canViewPreviousCycles) return;
      setLoadingPrevious(true);
      try {
        const data = await coursesService.getPreviousCycles(cursoId);
        setPreviousCycles(data);
      } catch (err) {
        console.error("Error al cargar ciclos anteriores:", err);
      } finally {
        setLoadingPrevious(false);
      }
    }

    loadPreviousCycles();
  }, [cursoId, currentCycle?.canViewPreviousCycles]);

  // Cargar contenido de un ciclo anterior específico
  const handleViewCycle = useCallback(
    async (cycleCode: string) => {
      setViewingCycleCode(cycleCode);
      setLoadingPreviousContent(true);
      setPreviousCycleContent(null);
      try {
        const data = await coursesService.getPreviousCycleContent(
          cursoId,
          cycleCode,
        );
        setPreviousCycleContent(data);
      } catch (err) {
        console.error(`Error al cargar contenido del ciclo ${cycleCode}:`, err);
      } finally {
        setLoadingPreviousContent(false);
      }
    },
    [cursoId],
  );

  // Helpers
  const getInitials = (firstName: string, lastName1: string) => {
    return `${firstName[0] || ""}${lastName1[0] || ""}`.toUpperCase();
  };

  const getProfessorName = () => {
    if (!enrollment) return "";
    const profs = enrollment.courseCycle.professors;
    if (profs.length === 0) return "Sin asignar";
    return `${profs[0].firstName} ${profs[0].lastName1}`;
  };

  const getProfessorInitials = () => {
    if (!enrollment) return "";
    const profs = enrollment.courseCycle.professors;
    if (profs.length === 0) return "XX";
    return getInitials(profs[0].firstName, profs[0].lastName1);
  };

  // ============================================
  // Loading state
  // ============================================

  if (loadingEnrollment || loadingCurrent) {
    return (
      <div className="w-full inline-flex flex-col justify-start items-start overflow-hidden">
        <div className="self-stretch px-12 animate-pulse">
          <div className="flex gap-8">
            <div className="flex-1 space-y-5">
              <div className="flex gap-2">
                <div className="h-7 w-24 bg-bg-secondary rounded-full" />
                <div className="h-7 w-20 bg-bg-secondary rounded-full" />
              </div>
              <div className="h-12 bg-bg-secondary rounded w-3/4" />
              <div className="h-6 bg-bg-secondary rounded w-1/3" />
            </div>
            <div className="flex-1 h-44 bg-bg-secondary rounded-lg" />
          </div>
          <div className="mt-8 h-12 w-[575px] bg-bg-secondary rounded-xl" />
          <div className="mt-8 space-y-0">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 bg-bg-secondary rounded-2xl border border-stroke-primary"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // Error state
  // ============================================

  if (error || errorCurrent || !enrollment) {
    return (
      <div className="bg-white rounded-2xl border border-stroke-primary p-12 text-center">
        <Icon
          name="error"
          size={64}
          className="text-error-solid mb-4 mx-auto"
        />
        <h1 className="text-2xl font-bold text-primary mb-2">
          {error || errorCurrent || "Curso no encontrado"}
        </h1>
        <p className="text-secondary mb-6">
          El curso solicitado no está disponible.
        </p>
      </div>
    );
  }

  // Datos derivados del enrollment
  const courseName = enrollment.courseCycle.course.name;
  const courseTypeName =
    enrollment.courseCycle.course.courseType?.name || "CIENCIAS";
  const cycleLevelName = enrollment.courseCycle.course.cycleLevel?.name || "";

  // Tab config
  const tabs: { key: TabOption; label: string; disabled?: boolean }[] = [
    { key: "vigente", label: "Ciclo Vigente" },
    { key: "anteriores", label: "Ciclos Pasados" },
    { key: "banco", label: "Banco de Enunciados" },
  ];

  return (
    <div className="w-full inline-flex flex-col justify-start items-start overflow-hidden">
      {/* ========================================
          HEADER SECTION
          ======================================== */}
      <div className="self-stretch px-12 inline-flex justify-start items-start gap-8 overflow-hidden mb-8">
        {/* Left: Course Info */}
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-5">
          {/* Tags */}
          <div className="inline-flex justify-start items-center gap-2">
            <div className="px-2.5 py-1.5 bg-bg-success-light rounded-full flex justify-center items-center gap-1">
              <span className="text-text-success-primary text-xs font-medium leading-3">
                {courseTypeName.toUpperCase()}
              </span>
            </div>
            <div className="px-2.5 py-1.5 bg-bg-quartiary rounded-full flex justify-center items-center gap-1">
              <span className="text-text-secondary text-xs font-medium leading-3">
                {cycleLevelName.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="self-stretch inline-flex justify-start items-center gap-2">
            <div className="flex-1 text-text-primary text-4xl font-bold leading-[48px]">
              {courseName}
            </div>
          </div>

          {/* Teacher */}
          <div className="self-stretch flex flex-col justify-start items-start gap-4">
            <div className="self-stretch inline-flex justify-start items-center gap-2">
              <div className="w-6 h-6 p-1 bg-bg-success-solid rounded-full flex justify-center items-center gap-2">
                <span className="text-center text-text-white text-[10px] font-medium leading-3">
                  {getProfessorInitials()}
                </span>
              </div>
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5">
                <span className="text-text-secondary text-[10px] font-medium leading-3">
                  ASESOR
                </span>
                <span className="self-stretch text-text-secondary text-base font-normal leading-4 line-clamp-1">
                  {getProfessorName()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Video Placeholder */}
        <div className="flex-1 px-5 py-14 bg-bg-tertiary rounded-lg outline outline-1 outline-offset-[-1px] outline-stroke-primary inline-flex flex-col justify-center items-center gap-6 overflow-hidden">
          <div className="p-3 bg-bg-accent-primary-solid rounded-full inline-flex justify-start items-center gap-2">
            <Icon name="play_arrow" size={32} className="text-icon-white" />
          </div>
          <div className="self-stretch flex flex-col justify-center items-center gap-1">
            <div className="self-stretch inline-flex justify-center items-center gap-1">
              <span className="text-center text-text-secondary text-xs font-medium leading-4">
                Video:
              </span>
              <span className="text-center text-text-secondary text-xs font-medium leading-4">
                Curso
              </span>
              <span className="text-center text-text-secondary text-xs font-medium leading-4">
                - Clase introductoria
              </span>
            </div>
            <div className="self-stretch inline-flex justify-center items-center gap-1">
              <span className="text-center text-text-tertiary text-xs font-normal leading-4">
                Profesor(a):
              </span>
              <span className="text-center text-text-tertiary text-xs font-normal leading-4 line-clamp-1">
                {getProfessorName()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          TABS + CONTENT SECTION
          ======================================== */}
      <div className="self-stretch px-12 inline-flex flex-col justify-start items-start gap-8">
        {/* Horizontal Pill Tabs */}
        <div className="w-[567px] p-1 bg-bg-primary rounded-xl outline outline-1 outline-offset-[-1px] outline-stroke-primary inline-flex justify-start items-start gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && setActiveTab(tab.key)}
              className={`flex-1 px-2 py-2.5 rounded-lg flex justify-start items-center gap-2 transition-colors ${
                tab.disabled
                  ? "bg-bg-primary cursor-not-allowed opacity-50"
                  : activeTab === tab.key
                    ? "bg-bg-accent-primary-solid"
                    : "bg-bg-primary hover:bg-bg-secondary"
              }`}
            >
              <div className="flex-1 flex justify-start items-center gap-2">
                <span
                  className={`flex-1 text-center text-[15px] leading-4 whitespace-nowrap ${
                    tab.disabled
                      ? "text-text-disabled"
                      : activeTab === tab.key
                        ? "text-text-white"
                        : "text-text-secondary"
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* ========================================
            TAB CONTENT: Ciclo Vigente
            ======================================== */}
        {activeTab === "vigente" && (
          <div className="self-stretch flex flex-col justify-start items-start gap-6 overflow-hidden">
            {/* Section Title */}
            <div className="self-stretch h-7 inline-flex justify-start items-center gap-4">
              <span className="text-text-primary text-2xl font-semibold leading-7">
                Ciclo Vigente {currentCycle?.cycleCode || ""}
              </span>
            </div>

            {/* Evaluation Cards (4-column grid with gap) */}
            {currentCycle && currentCycle.evaluations.length > 0 ? (
              <div className="self-stretch grid grid-cols-3 gap-8">
                {currentCycle.evaluations.map((evaluation) => (
                  <EvaluationCard
                    key={evaluation.id}
                    evaluation={evaluation}
                    onSelect={(eval_) =>
                      router.push(
                        `/plataforma/curso/${cursoId}/evaluacion/${eval_.id}`,
                      )
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="self-stretch p-12 bg-bg-secondary rounded-2xl border border-stroke-primary flex flex-col items-center justify-center gap-4">
                <Icon
                  name="event_available"
                  size={64}
                  className="text-icon-tertiary"
                />
                <div className="text-center">
                  <p className="text-text-primary font-semibold mb-2">
                    No hay evaluaciones disponibles
                  </p>
                  <p className="text-text-secondary text-sm">
                    Las evaluaciones aparecerán aquí cuando sean creadas
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================
            TAB CONTENT: Ciclos Pasados
            ======================================== */}
        {activeTab === "anteriores" && (
          <div className="self-stretch flex flex-col justify-start items-start gap-6 overflow-hidden">
            {/* Detalle de un ciclo específico */}
            {viewingCycleCode ? (
              <>
                {/* Back + Title */}
                <div className="self-stretch inline-flex justify-start items-center gap-4">
                  <button
                    onClick={() => {
                      setViewingCycleCode(null);
                      setPreviousCycleContent(null);
                    }}
                    className="p-1 rounded-lg hover:bg-bg-secondary transition-colors inline-flex items-center gap-1"
                  >
                    <Icon
                      name="arrow_back"
                      size={20}
                      className="text-icon-accent-primary"
                    />
                    <span className="text-text-accent-primary text-sm font-medium leading-4">
                      Volver
                    </span>
                  </button>
                  <span className="text-text-primary text-2xl font-semibold leading-7">
                    Ciclo {viewingCycleCode}
                  </span>
                </div>

                {loadingPreviousContent ? (
                  <div className="self-stretch flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-accent-solid border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : previousCycleContent &&
                  previousCycleContent.evaluations.length > 0 ? (
                  <div className="self-stretch inline-flex flex-col justify-start items-start">
                    {previousCycleContent.evaluations.map((evaluation) => (
                      <PreviousCycleEvaluationCard
                        key={evaluation.id}
                        evaluation={evaluation}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="self-stretch p-12 bg-bg-secondary rounded-2xl border border-stroke-primary flex flex-col items-center justify-center gap-4">
                    <Icon
                      name="history"
                      size={64}
                      className="text-icon-tertiary"
                    />
                    <div className="text-center">
                      <p className="text-text-primary font-semibold mb-2">
                        Sin evaluaciones en este ciclo
                      </p>
                      <p className="text-text-secondary text-sm">
                        No hay evaluaciones disponibles para este ciclo
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Section Title */}
                <div className="self-stretch h-7 inline-flex justify-start items-center gap-4">
                  <span className="text-text-primary text-2xl font-semibold leading-7">
                    Ciclos Pasados
                  </span>
                </div>

                {loadingPrevious ? (
                  <div className="self-stretch flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-accent-solid border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : previousCycles && previousCycles.cycles.length > 0 ? (
                  <div className="self-stretch grid grid-cols-3 gap-8">
                    {previousCycles.cycles.map((cycle) => (
                      <PreviousCycleCard
                        key={cycle.cycleCode}
                        cycleCode={cycle.cycleCode}
                        onViewCycle={handleViewCycle}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="self-stretch p-12 bg-white rounded-2xl border border-stroke-primary flex flex-col items-center justify-center gap-4">
                    <Icon
                      name="history"
                      size={64}
                      className="text-icon-tertiary"
                    />
                    <div className="text-center">
                      <p className="text-text-primary font-semibold mb-2">
                        No hay ciclos pasados disponibles
                      </p>
                      <p className="text-text-secondary text-sm">
                        Los ciclos pasados aparecerán aquí cuando estén
                        disponibles
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ========================================
            TAB CONTENT: Banco de Enunciados
            ======================================== */}
        {activeTab === "banco" && (
          <div className="self-stretch flex flex-col justify-start items-start gap-6 overflow-hidden">
            {/* Section Title */}
            <div className="self-stretch h-7 inline-flex justify-start items-center gap-4">
              <span className="text-text-primary text-2xl font-semibold leading-7">
                Banco de Enunciados
              </span>
            </div>

            {/* Category Cards */}
            <div className="self-stretch grid grid-cols-3 gap-8">
              {bancoCategories.map((category) => (
                <BancoCategoryCard key={category.key} category={category} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
