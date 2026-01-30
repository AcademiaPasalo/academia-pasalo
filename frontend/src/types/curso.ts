/**
 * Tipos para el sistema de cursos
 */

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
    unidades: Unidad[];
    evaluaciones: Evaluacion[];
    materiales: Material[];
  };
  progreso?: number;
  calificacion?: number;
}

export interface Unidad {
  id: string;
  titulo: string;
  descripcion: string;
  orden: number;
  temas: Tema[];
}

export interface Tema {
  id: string;
  titulo: string;
  descripcion: string;
  orden: number;
  tipo: 'video' | 'lectura' | 'ejercicio' | 'examen';
  completado?: boolean;
}

export interface Evaluacion {
  id: string;
  titulo: string;
  tipo: 'tarea' | 'examen' | 'proyecto' | 'quiz';
  fecha: string;
  calificacion?: number;
  estado: 'pendiente' | 'entregado' | 'calificado' | 'vencido';
}

export interface Material {
  id: string;
  titulo: string;
  tipo: 'pdf' | 'video' | 'presentacion' | 'documento';
  url: string;
  fechaSubida: string;
}
