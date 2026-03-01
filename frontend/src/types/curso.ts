/**
 * Tipos para el sistema de cursos - Mapeados a la API del backend
 */

// ============================================
// LEGACY TYPES (usados por data/cursos.ts y cursoService.ts)
// TODO: Remover cuando se elimine el mock data
// ============================================

export interface Curso {
  id: string;
  nombre: string;
  nombreCorto: string;
  descripcion: string;
  color: string;
  icono?: string;
  profesor?: string;
  creditos?: number;
  horario?: string;
  aula?: string;
  periodo?: string;
}

export interface CursoDetalle extends Curso {
  contenido: {
    unidades: Array<{
      id: string;
      titulo: string;
      descripcion: string;
      orden: number;
      temas: Array<{
        id: string;
        titulo: string;
        descripcion: string;
        orden: number;
        tipo: 'video' | 'lectura' | 'ejercicio' | 'examen';
        completado?: boolean;
      }>;
    }>;
    evaluaciones: Array<{
      id: string;
      titulo: string;
      tipo: 'tarea' | 'examen' | 'proyecto' | 'quiz';
      fecha: string;
      calificacion?: number;
      estado: 'pendiente' | 'entregado' | 'calificado' | 'vencido';
    }>;
    materiales: Array<{
      id: string;
      titulo: string;
      tipo: 'pdf' | 'video' | 'presentacion' | 'documento';
      url: string;
      fechaSubida: string;
    }>;
  };
  progreso?: number;
  calificacion?: number;
}

// ============================================
// CICLO VIGENTE - GET /courses/cycle/:id/current
// ============================================

export type EvaluationLabel = 'Completado' | 'En curso' | 'Próximamente' | 'Bloqueado';

export interface CycleEvaluation {
  id: string;
  evaluationTypeCode: string; // PC, EX, etc.
  shortName: string;          // PC1, EX1, etc.
  fullName: string;           // "Práctica Calificada 1", "Examen Parcial"
  label: EvaluationLabel;
}

export interface CurrentCycleResponse {
  courseCycleId: string;
  cycleCode: string;         // "2026-1"
  canViewPreviousCycles: boolean;
  evaluations: CycleEvaluation[];
}

// ============================================
// CICLOS ANTERIORES - GET /courses/cycle/:id/previous-cycles
// ============================================

export interface PreviousCycle {
  cycleCode: string; // "2025-2", "2025-1"
}

export interface PreviousCyclesResponse {
  cycles: PreviousCycle[];
}

// ============================================
// CONTENIDO CICLO ANTERIOR - GET /courses/cycle/:id/previous-cycles/:cycleCode/content
// ============================================

export type PreviousCycleLabel = 'Archivado' | 'Bloqueado';

export interface PreviousCycleEvaluation {
  id: string;
  evaluationTypeCode: string;
  shortName: string;
  fullName: string;
  label: PreviousCycleLabel;
}

export interface PreviousCycleContentResponse {
  cycleCode: string;
  evaluations: PreviousCycleEvaluation[];
}
