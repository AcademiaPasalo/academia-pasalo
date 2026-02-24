// ============================================
// COURSES SERVICE - GESTIÓN DE CURSOS
// ============================================

import { apiClient } from '@/lib/apiClient';
import type {
  ApiResponse,
  Course,
  CourseType,
  CycleLevel,
  CourseCycle,
} from '@/types/api';

export const coursesService = {
  /**
   * Crear una nueva materia (ADMIN/SUPER_ADMIN)
   */
  async create(data: {
    code: string;
    name: string;
    courseTypeId: string;
    cycleLevelId: string;
  }): Promise<Course> {
    const response = await apiClient.post<ApiResponse<Course>>('/courses', data);
    return response.data.data;
  },

  /**
   * Listar todas las materias (ADMIN/SUPER_ADMIN)
   */
  async findAll(): Promise<Course[]> {
    const response = await apiClient.get<ApiResponse<Course[]>>('/courses');
    return response.data.data;
  },

  /**
   * Obtener detalle de una materia (ADMIN/SUPER_ADMIN)
   */
  async findOne(id: string): Promise<Course> {
    const response = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data.data;
  },

  /**
   * Listar tipos de curso (Ciencias, Letras, Facultad)
   */
  async getCourseTypes(): Promise<CourseType[]> {
    const response = await apiClient.get<ApiResponse<CourseType[]>>('/courses/types');
    return response.data.data;
  },

  /**
   * Listar niveles académicos (1er Ciclo, 2do Ciclo, etc.)
   */
  async getCourseLevels(): Promise<CycleLevel[]> {
    const response = await apiClient.get<ApiResponse<CycleLevel[]>>('/courses/levels');
    return response.data.data;
  },

  /**
   * Asignar materia a un ciclo académico (ADMIN/SUPER_ADMIN)
   * Esto "apertura" la materia en un ciclo específico
   */
  async assignToCycle(data: {
    courseId: string;
    academicCycleId: string;
  }): Promise<CourseCycle> {
    const response = await apiClient.post<ApiResponse<CourseCycle>>(
      '/courses/assign-cycle',
      data
    );
    return response.data.data;
  },

  /**
   * Obtener los cursos-ciclo asignados al profesor actual (PROFESSOR)
   */
  async getMyCourseCycles(): Promise<CourseCycle[]> {
    const response = await apiClient.get<CourseCycle[]>('/courses/my-courses');
    return response.data;
  },

  /**
   * Obtener los profesores asignados a un curso-ciclo
   */
  async getProfessorsByCourseCycle(courseCycleId: string): Promise<Array<{
    id: string;
    firstName: string;
    lastName1: string;
    profilePhotoUrl: string | null;
  }>> {
    const response = await apiClient.get<Array<{
      id: string;
      firstName: string;
      lastName1: string;
      profilePhotoUrl: string | null;
    }>>(`/courses/cycle/${courseCycleId}/professors`);
    return response.data;
  },
};
