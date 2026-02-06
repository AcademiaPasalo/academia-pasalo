'use client';

// ============================================
// AUTH CONTEXT - GESTIÓN GLOBAL DE AUTENTICACIÓN
// ============================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { saveTokens, saveUser, getUser, clearAuth, hasStoredSession, saveLastActiveRole, getAccessToken } from '@/lib/storage';
import { extractActiveRoleFromToken } from '@/lib/jwtUtils';
import type { User, SessionStatus, AuthResponse } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionStatus: SessionStatus | null;
  concurrentSessionId: string | null;
  
  // Métodos
  loginWithGoogle: (code: string) => Promise<void>;
  switchProfile: (roleId: string) => Promise<void>;
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

    // Si userData está presente (solo en login, no en refresh/switch), guardarlo
    if (userData) {
      // Guardar el último rol activo del usuario para futuras referencias
      if (userData.lastActiveRoleId) {
        saveLastActiveRole(userData.lastActiveRoleId);
      }
      
      saveUser(userData);
      setUser(userData);
    }

    // Actualizar estado
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
      
      // Si es el error de sesión cerrada, NO lanzarlo (el modal ya se mostró)
      if (error instanceof Error && error.message.includes('Sesión cerrada')) {
        console.log('🔒 Sesión cerrada detectada durante login, modal ya mostrado');
        setIsLoading(false);
        return;
      }
      
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
   * Cambiar perfil activo (Switch Profile)
   */
  const switchProfile = useCallback(async (roleId: string) => {
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }

    if (!roleId || roleId.trim() === '') {
      throw new Error('El ID del rol no puede estar vacío');
    }

    try {
      setIsLoading(true);
      
      // 1. Cambiar el perfil (obtiene nuevos tokens)
      const switchResponse = await authService.switchProfile(roleId);
      
      // La respuesta de switch-profile NO incluye el objeto user
      // Solo trae accessToken, refreshToken y expiresIn
      if (!switchResponse || !switchResponse.accessToken || !switchResponse.refreshToken) {
        throw new Error('Respuesta inválida del servidor');
      }
      
      // 2. Guardar los nuevos tokens
      saveTokens(switchResponse.accessToken, switchResponse.refreshToken);
      
      // 3. Extraer el rol activo desde el nuevo accessToken
      const newActiveRoleId = extractActiveRoleFromToken(switchResponse.accessToken);
      
      if (!newActiveRoleId) {
        console.error('No se pudo extraer el rol activo del token después del switch');
        throw new Error('No se pudo extraer el rol activo del token');
      }
      
      // 4. Actualizar el usuario existente con el nuevo rol activo
      const updatedUser = {
        ...user, // Mantener todos los datos personales
        lastActiveRoleId: newActiveRoleId, // Solo actualizar el rol activo
      };
      
      // 5. Guardar el usuario actualizado
      saveUser(updatedUser);
      
      // 6. Guardar el último rol activo para restaurar en el próximo login
      saveLastActiveRole(newActiveRoleId);
      
      // 7. Actualizar el estado local
      setUser(updatedUser);
      setSessionStatus('ACTIVE');
      
      // 8. Recargar la página para refrescar toda la UI
      window.location.href = '/plataforma/inicio';
    } catch (error) {
      console.error('Error al cambiar de perfil:', error);
      setIsLoading(false);
      
      // Si es el error de sesión cerrada, NO lanzarlo (el modal ya se mostró)
      if (error instanceof Error && error.message.includes('Sesión cerrada')) {
        console.log('🔒 Sesión cerrada detectada, modal ya mostrado');
        // No hacer nada, el modal ya se mostró y el redirect está programado
        return;
      }
      
      // Para otros errores, sí lanzarlos
      throw error;
    }
  }, [user]);

  /**
   * Resolver sesión concurrente
   */
  const resolveConcurrentSession = useCallback(async (decision: 'KEEP_NEW' | 'KEEP_EXISTING') => {
    if (!pendingRefreshToken) {
      throw new Error('No hay sesión pendiente para resolver');
    }

    try {
      setIsLoading(true);
      const resolveData = await authService.resolveConcurrentSession(pendingRefreshToken, decision);
      
      console.log('🔄 Sesión concurrente resuelta:', resolveData);
      
      // Si no hay keptSessionId, significa que se canceló (KEEP_EXISTING en otra sesión)
      if (!resolveData.keptSessionId) {
        console.warn('⚠️ No se mantuvo ninguna sesión (usuario canceló)');
        setIsLoading(false);
        throw new Error('Sesión cancelada');
      }

      // Si hay tokens nuevos, guardarlos
      if (resolveData.accessToken && resolveData.refreshToken) {
        saveTokens(resolveData.accessToken, resolveData.refreshToken);
        
        // Actualizar el estado de la sesión
        setSessionStatus('ACTIVE');
        setConcurrentSessionId(null);
        setPendingRefreshToken(null);
        
        console.log('✅ Sesión resuelta correctamente, redirigiendo...');
        
        // Redirigir al dashboard (forzar recarga completa para actualizar todo el contexto)
        window.location.href = '/plataforma/inicio';
      } else {
        console.error('❌ No se recibieron tokens en la respuesta');
        setIsLoading(false);
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('❌ Error al resolver sesión concurrente:', error);
      setIsLoading(false);
      throw error;
    }
  }, [pendingRefreshToken]);

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
  const checkSession = useCallback(async () => {
    if (hasStoredSession()) {
      const storedUser = getUser<User>();
      const accessToken = getAccessToken();
      
      if (storedUser && storedUser.firstName && storedUser.email && accessToken) {
        // Extraer el rol activo actual del token
        const currentActiveRole = extractActiveRoleFromToken(accessToken);
        
        console.log('🔍 Verificando sesión guardada:', {
          storedUserLastActiveRole: storedUser.lastActiveRoleId,
          tokenActiveRole: currentActiveRole,
        });
        
        // Actualizar el lastActiveRoleId del usuario para que coincida con el token
        // (El token es la fuente de verdad)
        if (currentActiveRole) {
          storedUser.lastActiveRoleId = currentActiveRole;
          saveUser(storedUser);
        }
        
        // Usar el usuario almacenado
        setUser(storedUser);
        setSessionStatus('ACTIVE');
      } else {
        // Si el usuario almacenado no es válido, limpiar sesión
        console.error('Usuario almacenado inválido');
        clearAuth();
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
    switchProfile,
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
