// ============================================
// DEVICE FINGERPRINTING
// ============================================

const DEVICE_ID_KEY = 'pasalo_device_id';

/**
 * Genera o recupera el Device ID único del navegador
 * Este ID se usa para control de sesiones concurrentes
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  // Intentar recuperar de localStorage
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    // Generar nuevo UUID v4
    deviceId = generateUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Genera un UUID v4 simple
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Limpia el Device ID (útil para logout completo)
 */
export function clearDeviceId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DEVICE_ID_KEY);
  }
}
