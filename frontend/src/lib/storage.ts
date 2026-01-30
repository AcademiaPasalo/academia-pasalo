// ============================================
// STORAGE MANAGER (localStorage wrapper seguro)
// ============================================

const TOKEN_KEY = 'pasalo_access_token';
const REFRESH_TOKEN_KEY = 'pasalo_refresh_token';
const USER_KEY = 'pasalo_user';

/**
 * Guarda los tokens de autenticación
 */
export function saveTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Obtiene el access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Obtiene el refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Guarda los datos del usuario
 */
export function saveUser(user: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Obtiene los datos del usuario
 */
export function getUser<T>(): T | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as T;
  } catch {
    return null;
  }
}

/**
 * Limpia toda la información de autenticación
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Verifica si hay una sesión guardada
 */
export function hasStoredSession(): boolean {
  return !!getAccessToken() && !!getRefreshToken();
}
