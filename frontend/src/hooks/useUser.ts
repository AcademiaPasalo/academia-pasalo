// ============================================
// USE USER HOOK - GESTIÓN DE PERFIL DE USUARIO
// ============================================

import { useState, useEffect } from 'react';
import { usersService } from '@/services/users.service';
import type { User } from '@/types/api';

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCurrentUser() {
      setLoading(true);
      setError(null);
      try {
        const data = await usersService.getCurrentUser();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar perfil');
        console.error('Error loading current user:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  const updateProfile = async (data: {
    firstName?: string;
    lastName1?: string;
    lastName2?: string;
    phone?: string;
    career?: string;
    profilePhotoUrl?: string;
  }) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const updated = await usersService.update(user.id, data);
      setUser(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar perfil');
      console.error('Error updating profile:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    updateProfile,
  };
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.findAll();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: {
    email: string;
    firstName: string;
    lastName1?: string;
    lastName2?: string;
    phone?: string;
    career?: string;
    profilePhotoUrl?: string;
    roleIds?: string[];
  }) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await usersService.create(data);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear usuario');
      console.error('Error creating user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await usersService.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario');
      console.error('Error deleting user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    deleteUser,
  };
}
