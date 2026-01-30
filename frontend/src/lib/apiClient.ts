// ============================================
// API CLIENT - FETCH WRAPPER CON INTERCEPTORES
// ============================================

import { getAccessToken, getRefreshToken, saveTokens, clearAuth } from '@/lib/storage';
import { getDeviceId } from '@/lib/deviceId';
import type { ApiResponse, ApiError, RefreshTokenRequest } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  constructor(baseURL?: string) {
    this.baseURL = baseURL || API_BASE_URL;
  }

  /**
   * Procesa la cola de peticiones fallidas después de renovar el token
   */
  private processQueue(error: Error | null, token: string | null = null): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token!);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Intenta renovar el access token usando el refresh token
   */
  private async refreshAccessToken(): Promise<string> {
    const refreshToken = getRefreshToken();
    const deviceId = getDeviceId();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
        deviceId,
      } as RefreshTokenRequest),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data: ApiResponse<{ accessToken: string; refreshToken: string }> = await response.json();
    
    // Guardar nuevos tokens
    saveTokens(data.data.accessToken, data.data.refreshToken);

    return data.data.accessToken;
  }

  /**
   * Realiza una petición HTTP con manejo automático de tokens
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = getAccessToken();

    // Headers por defecto
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Copiar headers adicionales
    if (options.headers) {
      const optHeaders = options.headers as Record<string, string>;
      Object.assign(headers, optHeaders);
    }

    // Agregar token si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Manejar 401 (Token expirado o inválido)
      if (response.status === 401) {
        // Si ya estamos refrescando, esperar
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({
              resolve: async (newToken: string) => {
                // Reintentar con el nuevo token
                headers['Authorization'] = `Bearer ${newToken}`;
                const retryResponse = await fetch(url, { ...options, headers });
                const data = await retryResponse.json();
                resolve(data);
              },
              reject,
            });
          });
        }

        this.isRefreshing = true;

        try {
          const newToken = await this.refreshAccessToken();
          this.processQueue(null, newToken);
          this.isRefreshing = false;

          // Reintentar la petición original con el nuevo token
          headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, { ...options, headers });
          return await retryResponse.json();
        } catch (refreshError) {
          this.processQueue(refreshError as Error, null);
          this.isRefreshing = false;
          
          // Si falla el refresh, limpiar y redirigir al login
          clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/plataforma';
          }
          throw refreshError;
        }
      }

      // Parsear respuesta
      const data = await response.json();

      // Si es un error del backend, lanzarlo
      if (!response.ok) {
        const error = data as ApiError;
        throw new Error(error.message || 'Error en la petición');
      }

      return data as ApiResponse<T>;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Instancia global del cliente
export const apiClient = new ApiClient();
