/**
 * Base de datos mock de cursos
 * Este archivo simula una respuesta de API
 * En producción, estos datos vendrán del backend
 */

import { Curso, CursoDetalle } from '@/types/curso';

/**
 * Lista de cursos disponibles (datos básicos)
 */
export const cursosData: Curso[] = [
  {
    id: 'amga',
    nombre: 'Química Matricial y Geometría Analítica',
    nombreCorto: 'AMGA',
    descripcion: 'Fundamentos de álgebra lineal y geometría analítica aplicada',
    color: '#7C3AED', // Purple
    icono: 'calculate',
    profesor: 'Dr. Carlos Méndez',
    creditos: 4,
    horario: 'Lunes y Miércoles 8:00-10:00',
    aula: 'A-301',
    periodo: '2026-1'
  },
  {
    id: 'fucal',
    nombre: 'Fundamentos de Cálculo',
    nombreCorto: 'FUCAL',
    descripcion: 'Introducción al cálculo diferencial e integral',
    color: '#059669', // Green
    icono: 'functions',
    profesor: 'Dra. María González',
    creditos: 5,
    horario: 'Martes y Jueves 10:00-12:00',
    aula: 'B-205',
    periodo: '2026-1'
  },
  {
    id: 'fufis',
    nombre: 'Fundamentos de Física',
    nombreCorto: 'FUFIS',
    descripcion: 'Principios fundamentales de la física clásica',
    color: '#DC2626', // Red
    icono: 'science',
    profesor: 'Dr. Roberto Silva',
    creditos: 4,
    horario: 'Lunes y Miércoles 14:00-16:00',
    aula: 'C-102',
    periodo: '2026-1'
  }
];

/**
 * Datos detallados de cursos (incluye contenido completo)
 */
export const cursosDetalleData: Record<string, CursoDetalle> = {
  'amga': {
    ...cursosData[0],
    progreso: 45,
    calificacion: 8.5,
    contenido: {
      unidades: [
        {
          id: 'u1',
          titulo: 'Vectores y Matrices',
          descripcion: 'Introducción a vectores y operaciones con matrices',
          orden: 1,
          temas: [
            {
              id: 't1',
              titulo: 'Introducción a vectores',
              descripcion: 'Definición y operaciones básicas con vectores',
              orden: 1,
              tipo: 'video',
              completado: true
            },
            {
              id: 't2',
              titulo: 'Operaciones con matrices',
              descripcion: 'Suma, resta y multiplicación de matrices',
              orden: 2,
              tipo: 'lectura',
              completado: true
            }
          ]
        },
        {
          id: 'u2',
          titulo: 'Sistemas de Ecuaciones',
          descripcion: 'Resolución de sistemas lineales',
          orden: 2,
          temas: [
            {
              id: 't3',
              titulo: 'Método de Gauss',
              descripcion: 'Eliminación gaussiana',
              orden: 1,
              tipo: 'video',
              completado: false
            }
          ]
        }
      ],
      evaluaciones: [
        {
          id: 'e1',
          titulo: 'Examen Parcial 1',
          tipo: 'examen',
          fecha: '2026-02-15',
          calificacion: 9.0,
          estado: 'calificado'
        },
        {
          id: 'e2',
          titulo: 'Tarea 3',
          tipo: 'tarea',
          fecha: '2026-02-20',
          estado: 'pendiente'
        }
      ],
      materiales: [
        {
          id: 'm1',
          titulo: 'Apuntes Unidad 1',
          tipo: 'pdf',
          url: '/materiales/amga-u1.pdf',
          fechaSubida: '2026-01-15'
        }
      ]
    }
  },
  'fucal': {
    ...cursosData[1],
    progreso: 62,
    calificacion: 9.2,
    contenido: {
      unidades: [
        {
          id: 'u1',
          titulo: 'Límites y Continuidad',
          descripcion: 'Conceptos fundamentales de límites',
          orden: 1,
          temas: [
            {
              id: 't1',
              titulo: 'Introducción a límites',
              descripcion: 'Definición y propiedades',
              orden: 1,
              tipo: 'video',
              completado: true
            }
          ]
        }
      ],
      evaluaciones: [
        {
          id: 'e1',
          titulo: 'Quiz 1',
          tipo: 'quiz',
          fecha: '2026-02-10',
          calificacion: 8.5,
          estado: 'calificado'
        }
      ],
      materiales: [
        {
          id: 'm1',
          titulo: 'Formulario de Derivadas',
          tipo: 'pdf',
          url: '/materiales/fucal-formulario.pdf',
          fechaSubida: '2026-01-20'
        }
      ]
    }
  },
  'fufis': {
    ...cursosData[2],
    progreso: 30,
    calificacion: 7.8,
    contenido: {
      unidades: [
        {
          id: 'u1',
          titulo: 'Cinemática',
          descripcion: 'Movimiento en una y dos dimensiones',
          orden: 1,
          temas: [
            {
              id: 't1',
              titulo: 'Movimiento Rectilíneo',
              descripcion: 'MRU y MRUV',
              orden: 1,
              tipo: 'video',
              completado: true
            }
          ]
        }
      ],
      evaluaciones: [
        {
          id: 'e1',
          titulo: 'Laboratorio 1',
          tipo: 'proyecto',
          fecha: '2026-02-18',
          estado: 'entregado'
        }
      ],
      materiales: [
        {
          id: 'm1',
          titulo: 'Guía de Laboratorio',
          tipo: 'pdf',
          url: '/materiales/fufis-lab1.pdf',
          fechaSubida: '2026-01-18'
        }
      ]
    }
  }
};
