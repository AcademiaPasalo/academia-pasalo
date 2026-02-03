'use client';

// ============================================
// AUTH CONTEXT - GESTIÓN GLOBAL DE AUTENTICACIÓN
// ============================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { saveTokens, saveUser, getUser, clearAuth, hasStoredSession } from '@/lib/storage';
import type { User, SessionStatus, AuthResponse } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionStatus: SessionStatus | null;
  concurrentSessionId: string | null;
  
  // Métodos
  loginWithGoogle: (code: string) => Promise<void>;
  resolveConcurrentSession: (decision: 'KEEP_NEW' | 'KEEP_EXISTING') => Promise<void>;
  reauthAnomalousSession: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [concurrentSessionId, setConcurrentSessionId] = useState<string | null>(null);
  const [pendingRefreshToken, setPendingRefreshToken] = useState<string | null>(null);

  const isAuthenticated = !!user && sessionStatus === 'ACTIVE';

  /**
   * Procesa la respuesta de autenticación
   */
  const processAuthResponse = useCallback((authData: AuthResponse) => {
    const { accessToken, refreshToken, user: userData, sessionStatus: status, concurrentSessionId: sessionId } = authData;

    // Guardar tokens
    saveTokens(accessToken, refreshToken);
    saveUser(userData);

    // Actualizar estado
    setUser(userData);
    setSessionStatus(status);
    setConcurrentSessionId(sessionId);

    // Si hay sesión concurrente o bloqueada, guardar el refresh token para resolver después
    if (status === 'PENDING_CONCURRENT_RESOLUTION' || status === 'BLOCKED_PENDING_REAUTH') {
      setPendingRefreshToken(refreshToken);
    } else {
      setPendingRefreshToken(null);
    }
  }, []);

  /**
   * Login con Google OAuth
   */
  const loginWithGoogle = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const authData = await authService.loginWithGoogle(code);
      processAuthResponse(authData);

      // Redirigir según el estado de la sesión
      if (authData.sessionStatus === 'ACTIVE') {
        // Login exitoso, redirigir al dashboard con recarga
        window.location.href = '/plataforma/inicio';
      } else {
        // Si hay sesión concurrente o bloqueada, detener el loading
        setIsLoading(false);
      }
      // Si hay sesión concurrente o bloqueada, el componente de login debe mostrar el modal
    } catch (error) {
      console.error('Error en login:', error);
      // Limpiar el estado en caso de error para evitar redireccionamiento
      setUser(null);
      setSessionStatus(null);
      setConcurrentSessionId(null);
      setPendingRefreshToken(null);
      setIsLoading(false);
      throw error;
    }
  }, [processAuthResponse]);

  /**
   * Resolver sesión concurrente
   */
  const resolveConcurrentSession = useCallback(async (decision: 'KEEP_NEW' | 'KEEP_EXISTING') => {
    if (!pendingRefreshToken) {
      throw new Error('No hay sesión pendiente para resolver');
    }

    try {
      setIsLoading(true);
      const authData = await authService.resolveConcurrentSession(pendingRefreshToken, decision);
      processAuthResponse(authData);

      // Redirigir al dashboard
      if (authData.sessionStatus === 'ACTIVE') {
        window.location.href = '/plataforma/inicio';
      }
    } catch (error) {
      console.error('Error al resolver sesión concurrente:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [pendingRefreshToken, processAuthResponse]);

  /**
   * Re-autenticar sesión anómala
   */
  const reauthAnomalousSession = useCallback(async (code: string) => {
    if (!pendingRefreshToken) {
      throw new Error('No hay sesión bloqueada para re-autenticar');
    }

    try {
      setIsLoading(true);
      const authData = await authService.reauthAnomalousSession(code, pendingRefreshToken);
      processAuthResponse(authData);

      // Redirigir al dashboard
      if (authData.sessionStatus === 'ACTIVE') {
        window.location.href = '/plataforma/inicio';
      }
    } catch (error) {
      console.error('Error al re-autenticar:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [pendingRefreshToken, processAuthResponse]);

  /**
   * Cerrar sesión
   */
  const logout = useCallback(async () => {
    try {
      // Intentar cerrar sesión en el backend
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión en el backend:', error);
      // Continuar con el logout local incluso si el backend falla
    } finally {
      // Limpiar estado local PRIMERO
      clearAuth();
      setUser(null);
      setSessionStatus(null);
      setConcurrentSessionId(null);
      setPendingRefreshToken(null);
      
      // Usar window.location para forzar una recarga completa y evitar problemas de caché
      window.location.href = '/plataforma';
    }
  }, []);

  /**
   * Verifica si hay una sesión guardada al cargar la app
   */
  const checkSession = useCallback(() => {
    if (hasStoredSession()) {
      const storedUser = getUser<User>();
      if (storedUser) {
        setUser(storedUser);
        setSessionStatus('ACTIVE');
      }
    }
    setIsLoading(false);
  }, []);

  // Verificar sesión al montar el componente
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    sessionStatus,
    concurrentSessionId,
    loginWithGoogle,
    resolveConcurrentSession,
    reauthAnomalousSession,
    logout,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
