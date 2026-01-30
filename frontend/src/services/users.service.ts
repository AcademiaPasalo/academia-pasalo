// ============================================
// USERS SERVICE - GESTIÓN DE USUARIOS
// ============================================

import { apiClient } from '@/lib/apiClient';
import type { ApiResponse, User } from '@/types/api';

export const usersService = {
  /**
   * Crear un usuario manualmente (ADMIN/SUPER_ADMIN)
   */
  async create(data: {
    email: string;
    firstName: string;
    lastName1?: string;
    lastName2?: string;
    phone?: string;
    career?: string;
    profilePhotoUrl?: string;
    roleIds?: string[];
  }): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    return response.data.data;
  },

  /**
   * Listar todos los usuarios (ADMIN/SUPER_ADMIN)
   */
  async findAll(): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>('/users');
    return response.data.data;
  },

  /**
   * Obtener perfil de usuario
   * - Propietario puede ver su propio perfil
   * - ADMIN/SUPER_ADMIN pueden ver cualquier perfil
   */
  async findOne(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  /**
   * Actualizar datos de usuario
   * - Propietario puede actualizar su propio perfil
   * - ADMIN/SUPER_ADMIN pueden actualizar cualquier perfil
   */
  async update(
    id: string,
    data: {
      firstName?: string;
      lastName1?: string;
      lastName2?: string;
      phone?: string;
      career?: string;
      profilePhotoUrl?: string;
    }
  ): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data;
  },

  /**
   * Eliminar un usuario (ADMIN/SUPER_ADMIN)
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Asignar un rol específico a un usuario (SUPER_ADMIN)
   * Operación atómica
   */
  async assignRole(userId: string, roleCode: string): Promise<void> {
    await apiClient.post(`/users/${userId}/roles/${roleCode}`);
  },

  /**
   * Remover un rol específico de un usuario (SUPER_ADMIN)
   * Operación atómica
   */
  async removeRole(userId: string, roleCode: string): Promise<void> {
    await apiClient.delete(`/users/${userId}/roles/${roleCode}`);
  },

  /**
   * Obtener el perfil del usuario actual (desde el token)
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  },
};
