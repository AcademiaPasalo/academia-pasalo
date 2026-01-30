/**
 * Servicio para manejar operaciones relacionadas con cursos
 * Este servicio actúa como capa de abstracción entre los componentes y los datos
 * Facilita la migración futura a llamadas API reales
 */

import { Curso, CursoDetalle } from '@/types/curso';
import { cursosData, cursosDetalleData } from '@/data/cursos';

/**
 * Simula un delay de red (opcional)
 */
const simulateNetworkDelay = async (ms: number = 300) => {
  await new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Obtener todos los cursos (datos básicos)
 */
export async function getCursos(): Promise<Curso[]> {
  // TODO: Reemplazar con llamada real a la API
  // const response = await fetch('/api/cursos');
  // return response.json();
  
  await simulateNetworkDelay();
  return cursosData;
}

/**
 * Obtener un curso por su ID (datos básicos)
 */
export async function getCursoById(id: string): Promise<Curso | null> {
  // TODO: Reemplazar con llamada real a la API
  // const response = await fetch(`/api/cursos/${id}`);
  // return response.json();
  
  await simulateNetworkDelay();
  return cursosData.find(curso => curso.id === id) || null;
}

/**
 * Obtener detalles completos de un curso
 */
export async function getCursoDetalle(id: string): Promise<CursoDetalle | null> {
  // TODO: Reemplazar con llamada real a la API
  // const response = await fetch(`/api/cursos/${id}/detalle`);
  // return response.json();
  
  console.log('🔍 cursoService.getCursoDetalle - ID recibido:', id);
  console.log('🔍 Buscando en cursosDetalleData:', Object.keys(cursosDetalleData));
  
  await simulateNetworkDelay();
  const result = cursosDetalleData[id] || null;
  
  console.log('🔍 Resultado encontrado:', result ? result.nombre : 'NULL');
  
  return result;
}

/**
 * Obtener cursos del estudiante (filtrados por matrícula)
 */
export async function getCursosEstudiante(_userId: string): Promise<Curso[]> {
  // TODO: Reemplazar con llamada real a la API
  // const response = await fetch(`/api/estudiantes/${userId}/cursos`);
  // return response.json();
  
  await simulateNetworkDelay();
  // Por ahora devuelve todos los cursos
  return cursosData;
}

/**
 * Buscar cursos por nombre o código
 */
export async function searchCursos(query: string): Promise<Curso[]> {
  // TODO: Reemplazar con llamada real a la API
  // const response = await fetch(`/api/cursos/search?q=${query}`);
  // return response.json();
  
  await simulateNetworkDelay();
  const lowerQuery = query.toLowerCase();
  return cursosData.filter(curso => 
    curso.nombre.toLowerCase().includes(lowerQuery) ||
    curso.nombreCorto.toLowerCase().includes(lowerQuery) ||
    curso.id.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Obtener el nombre de un curso por su ID (útil para breadcrumbs)
 */
export function getCursoNombre(id: string): string {
  const curso = cursosData.find(c => c.id === id);
  return curso?.nombre || 'Curso no encontrado';
}

/**
 * Obtener el nombre corto de un curso por su ID
 */
export function getCursoNombreCorto(id: string): string {
  const curso = cursosData.find(c => c.id === id);
  return curso?.nombreCorto || id.toUpperCase();
}

/**
 * Validar si un curso existe
 */
export function cursoExists(id: string): boolean {
  return cursosData.some(curso => curso.id === id);
}
