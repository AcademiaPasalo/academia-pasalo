// ============================================
// AUTH SERVICE - ENDPOINTS DE AUTENTICACIÓN
// ============================================

import { apiClient } from '@/lib/apiClient';
import { getDeviceId } from '@/lib/deviceId';
import { normalizeRoleId } from '@/lib/roleMapping';
import type {
  AuthResponse,
  LoginRequest,
  ResolveConcurrentSessionRequest,
  ReauthAnomalousRequest,
} from '@/types/api';

export const authService = {
  /**
   * Login con Google OAuth
   */
  async loginWithGoogle(code: string): Promise<AuthResponse> {
    const deviceId = getDeviceId();
    
    const response = await apiClient.post<AuthResponse>('/auth/google', {
      code,
      deviceId,
    } as LoginRequest);

    return response.data;
  },

  /**
   * Resolver sesión concurrente
   */
  async resolveConcurrentSession(
    refreshToken: string,
    decision: 'KEEP_NEW' | 'KEEP_EXISTING'
  ): Promise<AuthResponse> {
    const deviceId = getDeviceId();

    const response = await apiClient.post<AuthResponse>(
      '/auth/sessions/resolve-concurrent',
      {
        refreshToken,
        deviceId,
        decision,
      } as ResolveConcurrentSessionRequest
    );

    return response.data;
  },

  /**
   * Re-autenticar sesión anómala
   */
  async reauthAnomalousSession(
    code: string,
    refreshToken: string
  ): Promise<AuthResponse> {
    const deviceId = getDeviceId();

    const response = await apiClient.post<AuthResponse>(
      '/auth/sessions/reauth-anomalous',
      {
        code,
        refreshToken,
        deviceId,
      } as ReauthAnomalousRequest
    );

    return response.data;
  },

  /**
   * Cambiar perfil activo (Switch Profile)
   * NOTA: Convierte el roleId de code a ID si es necesario
   */
  async switchProfile(roleId: string): Promise<AuthResponse> {
    const deviceId = getDeviceId();
    
    // Normalizar el roleId (convertir code a ID si es necesario)
    const normalizedRoleId = normalizeRoleId(roleId);

    const response = await apiClient.post<AuthResponse>('/auth/switch-profile', {
      roleId: normalizedRoleId,
      deviceId,
    });

    return response.data;
  },

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
