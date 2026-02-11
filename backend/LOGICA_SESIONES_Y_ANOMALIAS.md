# Lógica de Seguridad de Sesiones: Detección de Anomalías y Concurrencia

Este documento describe la arquitectura lógica y técnica para la gestión de sesiones de usuario, enfocado en prevenir el uso compartido de cuentas (Account Sharing) mediante dos capas de seguridad: **Control de Concurrencia** y **Detección de Anomalías por Comportamiento**.

## 1. Conceptos Clave

### Device ID
Identificador único (UUID) generado por el Frontend y almacenado persistentemente en el navegador del usuario (`localStorage`). Permite identificar físicamente al dispositivo independientemente de la IP.

### Modo Silencioso (Pasivo)
Estrategia elegida para la detección de anomalías. El sistema **NO bloquea** el acceso al usuario legítimo ni al intruso, pero **registra** la evidencia y **notifica** al usuario tras acumular reincidencias. La acción punitiva (bloqueo/desactivación) queda a discreción del Administrador.

---

## 2. Capas de Seguridad

El proceso de inicio de sesión atraviesa dos filtros secuenciales.

### CAPA 1: Control de Concurrencia (Anti-Simultaneidad)
Impide que dos personas usen la cuenta al mismo tiempo.

*   **Regla:** Si existe una sesión con estado `ACTIVE` en un `device_id` diferente al actual.
*   **Acción:** El login actual se detiene. El usuario debe decidir si cierra la otra sesión o cancela el intento.
*   **Efectividad:** 100% para evitar uso simultáneo.

### CAPA 2: Detección de Anomalías (Anti-Relevo Rápido)
Detecta cuando una cuenta pasa de un dispositivo a otro sospechosamente rápido (ej. Usuario cierra en casa y 2 minutos después "alguien" entra desde otro distrito).

*   **Regla "Dispositivo Nuevo + Cambio Rápido":**
    *   **SI** el dispositivo es NUEVO (no existe en el historial de sesiones del usuario).
    *   **Y** el tiempo transcurrido desde la última actividad es menor a **30 minutos** (Valor de `GEO_GPS_ANOMALY_TIME_WINDOW_MINUTES`).
    *   **ENTONCES** es una Anomalía.
*   **Acción:**
    1.  Permitir el acceso (`ACTIVE`).
    2.  Registrar evento de seguridad `ANOMALOUS_LOGIN_DETECTED`.
    3.  Verificar contador de strikes.

---

## 3. Lógica de Negocio Detallada (Flujo de Anomalía)

Ubicación: `src/modules/auth/application/session.service.ts` (Método `createSession`).

### Algoritmo de Decisión

1.  **Entrada:** `userId`, `deviceId`, `lastActivityAt` (de última sesión).
2.  **Verificación de Historial:**
    ```sql
    -- ¿Es dispositivo conocido?
    SELECT COUNT(*) FROM user_session 
    WHERE user_id = ? AND device_id = ?
    ```
3.  **Cálculo de Tiempo:**
    ```typescript
    diffMinutes = (Now - lastActivityAt) / 60000
    threshold = system_setting('GEO_GPS_ANOMALY_TIME_WINDOW_MINUTES') // 30 min
    ```
4.  **Evaluación:**
    *   Si `KnownDevice == false` AND `diffMinutes < threshold`: **ANOMALÍA**.
    *   Caso contrario: **NORMAL**.

### Sistema de Notificaciones (Strikes)

Tras detectar una anomalía, el sistema cuenta la reincidencia:

1.  **Conteo:**
    ```sql
    SELECT COUNT(*) FROM security_event 
    WHERE user_id = ? 
      AND security_event_type_code = 'ANOMALOUS_LOGIN_DETECTED'
    ```
2.  **Disparador:**
    *   Si `Count == 2`: Insertar registro en tabla `notification` y `user_notification`.
    *   Mensaje: "Hemos detectado accesos inusuales recientes en tu cuenta. Por seguridad, evita compartir tus credenciales."

---

## 4. Casos de Uso (Matriz de Comportamiento)

| Escenario | Condición Técnica | Resultado Sesión | ¿Genera Strike? | ¿Notifica? |
| :--- | :--- | :--- | :--- | :--- |
| **Usuario Legítimo (Misma PC)** | Device conocido. | **ACTIVE** | No | No |
| **Usuario Legítimo (PC Nueva, lento)** | Device nuevo, tiempo > 30 min. | **ACTIVE** | No | No |
| **Usuario Legítimo (PC Nueva, rápido)** | Device nuevo, tiempo < 30 min. | **ACTIVE** | **SÍ (Falso Positivo)** | Solo si es la 2da vez. |
| **Intruso 1 (PC Amigo A)** | Device nuevo, tiempo < 30 min. | **ACTIVE** | **SÍ** | Solo si es la 2da vez. |
| **Intruso 1 (Recurrente)** | Device ya registrado (Día 2). | **ACTIVE** | No (Ya es de confianza) | No |
| **Intruso 2 (PC Amigo B)** | Device nuevo, tiempo < 30 min. | **ACTIVE** | **SÍ** | **SÍ (Strike acumulado)** |

---

## 5. Arquitectura de Datos

### Tablas Involucradas

1.  **`user_session`**
    *   Uso: Historial de dispositivos conocidos (`device_id`) y cálculo de tiempos (`last_activity_at`).
2.  **`security_event`**
    *   Uso: Registro de evidencia (`ANOMALOUS_LOGIN_DETECTED`).
3.  **`system_setting`**
    *   Clave: `GEO_GPS_ANOMALY_TIME_WINDOW_MINUTES`
    *   Valor: `30` (minutos).
4.  **`notification` / `user_notification`**
    *   Uso: Comunicación asíncrona con el usuario tras alcanzar el umbral de strikes.

### Archivos Afectados

1.  `src/modules/auth/application/session.service.ts`: Orquestación principal.
2.  `src/modules/auth/application/session-anomaly-detector.service.ts`: Lógica de evaluación de tiempo y dispositivo.
3.  `src/modules/auth/infrastructure/user-session.repository.ts`: Queries de verificación de historial.

---

## 6. Supervisión Administrativa

Dado que el sistema es Pasivo (no bloquea), la responsabilidad final recae en el Administrador.

*   **Herramienta:** Endpoint `GET /api/v1/audit/history`.
*   **Filtro:** Eventos `ANOMALOUS_LOGIN_DETECTED`.
*   **Acción:** Si el admin observa un patrón de abuso (ej. 5 dispositivos nuevos en 1 semana), debe proceder a la desactivación manual del usuario (`UPDATE user SET isActive = false`).
