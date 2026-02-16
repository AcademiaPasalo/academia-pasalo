# ESTRATEGIA DE INTEGRACIÓN: GOOGLE CALENDAR

## Introducción
Este documento detalla la estrategia técnica para integrar la plataforma Academia Pásalo con Google Calendar API. El objetivo es permitir que profesores y alumnos sincronicen automáticamente sus eventos de clase con sus calendarios personales de Google.

## Arquitectura Técnica
La integración se basa en el flujo OAuth 2.0 Incremental y el uso de Access Tokens de larga duración (Offline Access).

### Componentes Principales
1. **Infraestructura (Google Client):** Encapsulamiento de la librería `googleapis`.
2. **Persistencia:** Almacenamiento seguro de `refresh_tokens`.
3. **Sincronización:** Servicio de orquestación entre la base de datos local y la API externa.

## Estado de la Implementación

| Fase | Descripción | Estado |
| :--- | :--- | :--- |
| 1 | Infraestructura de Datos y Modelado | Pendiente |
| 2 | Cliente de Autenticación Google | Pendiente |
| 3 | Servicio de Integración con Calendar API | Pendiente |
| 4 | Lógica de Sincronización y Triggers | Pendiente |
| 5 | Endpoints de Usuario y Control | Pendiente |

## Detalle de Fases

### Fase 1: Infraestructura de Datos y Modelado
- Creación de tabla `user_google_auth`.
- Campos: `user_id`, `google_email`, `refresh_token`, `access_token`, `expires_at`, `is_active`.
- Justificación: Los tokens de Google deben persistir fuera de la sesión del usuario para permitir sincronización en segundo plano (background tasks).

### Fase 2: Cliente de Autenticación Google
- Implementación de `GoogleAuthService`.
- Configuración de `access_type: 'offline'` y `prompt: 'consent'` para obtención inicial de `refresh_token`.
- Lógica de refresco automático: Antes de cada llamada a la API, verificar `expires_at` y renovar si es necesario.

### Fase 3: Servicio de Integración con Calendar API
- Mapeo de `class_event` a `calendar.events`.
- Manejo de `google_event_id` para operaciones de actualización (PATCH) y eliminación (DELETE).
- Gestión de concurrencia y límites de cuota de Google Cloud.

### Fase 4: Lógica de Sincronización y Triggers
- Intercepción de eventos en `MaterialsService` / `EventsService`.
- Sincronización reactiva: Al crear/editar una sesión, se actualizan los calendarios de todos los alumnos matriculados con sincronización activa.

### Fase 5: Endpoints de Usuario y Control
- `GET /auth/google/calendar/url`: Genera URL de consentimiento.
- `POST /auth/google/calendar/callback`: Procesa el código y guarda tokens.
- `PATCH /user/settings/calendar`: Activa/Desactiva sincronización (is_active).

## Seguridad
- Los tokens se almacenarán en texto claro en la base de datos inicialmente, con recomendación de cifrado simétrico (AES-256) en fases posteriores si se requiere mayor seguridad.
- Los Scopes se limitarán estrictamente a `https://www.googleapis.com/auth/calendar.events`.
