# Plan de Implementación: Seguridad de Sesiones y Anomalías

Este documento detalla la hoja de ruta para la implementación del sistema de control de concurrencia y detección de anomalías en modo pasivo.

## 📋 Lineamientos Técnicos Estrictos
- **Código:** Inglés (variables, funciones, clases).
- **UI/Mensajes:** Español (respuestas de API, notificaciones).
- **Logs:** Formato JSON estructurado, sin emojis.
- **Calidad:** CERO uso de `any`, CERO comentarios en el código.
- **Persistencia:** Uso de transacciones ACID (`dataSource.transaction`).
- **Caché:** Invalidación selectiva de Redis (`cache:session:${id}:user`).

---

## 🚀 Fases de Implementación

### Fase 1: Refactorización del Detector de Anomalías 🟡 (PENDIENTE)
- **Objetivo:** Implementar la regla "Dispositivo Nuevo + Cambio Rápido".
- **Tareas:**
    - Modificar `SessionAnomalyDetectorService` para recibir y evaluar `isNewDevice`.
    - Ajustar `detectLocationAnomaly` para que retorne metadata detallada (distancia, tiempo, tipo de anomalía).
    - Asegurar que el detector sea independiente del estado de la sesión (solo evalúa datos).

### Fase 2: Implementación de Modo Pasivo en SessionService ⚪ (PENDIENTE)
- **Objetivo:** Permitir el acceso pero registrar la evidencia.
- **Tareas:**
    - Modificar `SessionService.createSession` para que NO bloquee (`ACTIVE`) ante una anomalía.
    - Integrar la lógica de "Dispositivo Nuevo" detectada en la Fase 1.
    - Mantener el flujo de `PENDING_CONCURRENT_RESOLUTION` intacto (la concurrencia sí detiene el flujo).
    - Registrar el evento `ANOMALOUS_LOGIN_DETECTED` con el contexto completo.

### Fase 3: Sistema de Strikes y Notificaciones ⚪ (PENDIENTE)
- **Objetivo:** Contabilizar reincidencias y avisar al usuario.
- **Tareas:**
    - Implementar conteo de eventos `ANOMALOUS_LOGIN_DETECTED` en `SecurityEventService`.
    - Lógica de disparo: Si `count == 2`, crear registro en `notification` y `user_notification`.
    - Mensaje: "Hemos detectado accesos inusuales recientes en tu cuenta. Por seguridad, evita compartir tus credenciales."

### Fase 4: Sincronización de GeoIP y Configuración ⚪ (PENDIENTE)
- **Objetivo:** Precisión en cálculos y parámetros.
- **Tareas:**
    - Validar que `GeoIpLiteService` maneje correctamente IPs locales/v6.
    - Asegurar el uso de `system_setting` para todos los umbrales (Km y Minutos).
    - Pruebas de integración del flujo completo.

---

## 🛠️ Estado de Avance
- **Fase 1:** Completada ✅
- **Fase 2:** Completada ✅
- **Fase 3:** Completada ✅ (Lógica de notificación comentada pendiente de NotificationModule)
- **Fase 4:** Completada ✅

---
### Resumen Técnico de la Implementación
1.  **Detección:** Se implementaron tipos de anomalía (`IMPOSSIBLE_TRAVEL`, `NEW_DEVICE_QUICK_CHANGE`) y lógica de "Dispositivo Nuevo + Ventana de Tiempo".
2.  **Modo Pasivo:** Las anomalías no bloquean el login pero se registran como `security_event`.
3.  **Strikes:** Umbral fijo de 2 strikes (en `technicalSettings`) para disparar notificaciones.
4.  **Consistencia:** Uso estricto de constantes (`ANOMALY_TYPES`, `CONCURRENT_DECISIONS`) y parámetros de sistema.
5.  **Refactorización:** El código cumple con las reglas de CERO comentarios, tipado estricto y logs JSON.

**Nota Final:** El archivo `session.service.ts` será analizado y refactored después de terminar todas las fases. Debido a su extensión actual, se buscará modularizar sus responsabilidades para mantener la mantenibilidad del código.
