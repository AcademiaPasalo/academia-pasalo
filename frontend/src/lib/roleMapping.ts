// ============================================
// ROLE MAPPING - MAPEO TEMPORAL DE CODES A IDS
// ============================================
// NOTA: Esto es una solución temporal mientras el backend
// no retorna los IDs en el array de roles del usuario.
// Una vez que el backend incluya los IDs, este archivo
// puede ser eliminado.

import { RoleCode } from '@/types/api';

/**
 * Mapeo de códigos de rol a IDs según la base de datos
 * Estos valores deben coincidir con la tabla `role` en el backend
 */
export const ROLE_CODE_TO_ID: Record<RoleCode, string> = {
  SUPER_ADMIN: '1',
  ADMIN: '2',
  PROFESSOR: '3',
  TEACHER: '3', // Alias para PROFESSOR
  STUDENT: '4',
};

/**
 * Convierte un code de rol a su ID correspondiente
 * @param code Código del rol (STUDENT, TEACHER, etc.)
 * @returns ID del rol como string
 */
export function getRoleIdFromCode(code: RoleCode): string {
  return ROLE_CODE_TO_ID[code];
}

/**
 * Determina si un string es un code o un ID
 * @param value String a verificar
 * @returns true si es un code, false si es un ID
 */
export function isRoleCode(value: string): boolean {
  return Object.keys(ROLE_CODE_TO_ID).includes(value);
}

/**
 * Convierte un valor (code o id) a un ID válido para el backend
 * @param value Code o ID del rol
 * @returns ID del rol como string
 */
export function normalizeRoleId(value: string): string {
  if (isRoleCode(value)) {
    return getRoleIdFromCode(value as RoleCode);
  }
  return value;
}
