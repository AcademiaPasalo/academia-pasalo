// ============================================
// JWT UTILS - DECODIFICACIÓN Y VALIDACIÓN DE TOKENS
// ============================================

import type { User } from '@/types/api';

interface JwtPayload {
  sub: string; // userId
  sessionId: string;
  email: string;
  roles: string[]; // ⚠️ Backend envía array de STRINGS (códigos), no objetos
  activeRole: string; // ⚠️ Backend usa 'activeRole', no 'lastActiveRoleId'
  iat: number;
  exp: number;
}

/**
 * Decodifica un JWT sin verificar la firma
 * NOTA: Esto es seguro porque el backend ya validó el token
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('JWT malformado: no tiene 3 partes', { parts: parts.length });
      return null;
    }

    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error al decodificar JWT:', error);
    return null;
  }
}

/**
 * Extrae SOLO el rol activo desde el payload del JWT
 * ⚠️ IMPORTANTE: El JWT del backend NO contiene firstName, lastName, etc.
 * Solo contiene: sub, email, roles[], activeRole, sessionId
 */
export function extractActiveRoleFromToken(token: string): string | null {
  const payload = decodeJwt(token);
  
  if (!payload) {
    console.warn('No se pudo decodificar el JWT');
    return null;
  }

  return payload.activeRole || null;
}

/**
 * Extrae la información del usuario desde el payload del JWT
 * ⚠️ OBSOLETA: El JWT del backend NO contiene información personal completa
 * @deprecated Usar extractActiveRoleFromToken() en su lugar
 */
export function extractUserFromToken(token: string): User | null {
  console.warn('⚠️ extractUserFromToken() está obsoleta. El JWT no contiene firstName, lastName, etc.');
  
  const payload = decodeJwt(token);
  
  if (!payload) {
    console.warn('No se pudo decodificar el JWT');
    return null;
  }

  // Validar campos MÍNIMOS requeridos
  if (!payload.sub || !payload.email) {
    console.warn('JWT no contiene los campos mínimos (sub, email)');
    return null;
  }

  // Validar que haya al menos un rol
  if (!payload.roles || payload.roles.length === 0) {
    console.warn('JWT no contiene roles');
    return null;
  }

  // Convertir roles de strings a objetos
  const roles = payload.roles.map((roleCode) => ({
    code: roleCode as import('@/types/api').RoleCode,
    name: roleCode, // Usamos el code como name temporalmente
  }));

  return {
    id: payload.sub,
    email: payload.email,
    roles,
    lastActiveRoleId: payload.activeRole,
    firstName: '???', // ❌ NO EXISTE EN JWT
    lastName1: undefined,
    lastName2: undefined,
    profilePhotoUrl: undefined,
    photoSource: 'none',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Verifica si un token está expirado
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  
  if (!payload || !payload.exp) {
    return true;
  }

  // exp está en segundos, Date.now() en milisegundos
  const expirationTime = payload.exp * 1000;
  return Date.now() >= expirationTime;
}

/**
 * Obtiene el tiempo restante de un token en segundos
 */
export function getTokenTimeRemaining(token: string): number {
  const payload = decodeJwt(token);
  
  if (!payload || !payload.exp) {
    return 0;
  }

  const expirationTime = payload.exp * 1000;
  const timeRemaining = Math.max(0, Math.floor((expirationTime - Date.now()) / 1000));
  
  return timeRemaining;
}
