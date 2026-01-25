# DOCUMENTACIÓN DE API - ACADEMIA PASALO

Esta API sigue el estándar de respuestas unificadas y manejo de errores centralizado.

---

## 🏗️ Formato de Respuesta Estándar

Todas las respuestas exitosas (200, 201) tienen esta estructura:
```json
{
  "statusCode": 200,
  "message": "Operación exitosa",
  "data": { ... },
  "timestamp": "2026-01-24T20:00:00.000Z"
}
```

Los errores (400, 401, 403, 404, 409, 500) tienen esta estructura:
```json
{
  "statusCode": 400,
  "message": "Descripción amigable del error",
  "error": "Bad Request",
  "timestamp": "2026-01-24T20:00:00.000Z",
  "path": "/api/v1/..."
}
```

---

## 🔐 ÉPICA 1: Autenticación y Seguridad (Auth)

Base URL: `/api/v1/auth`

### 1. Login con Google
`POST /google`

**Request Body:**
```json
{
  "code": "string (Código de autorización devuelto por el hook useGoogleLogin)",
  "deviceId": "string (Identificador único del navegador/dispositivo)"
}
```

**Escenario A: Login Exitoso (Directo)**
`data`:
```json
{
  "accessToken": "JWT",
  "refreshToken": "JWT",
  "expiresIn": 10800, 
  "sessionStatus": "ACTIVE",
  "concurrentSessionId": null,
  "user": {
    "id": "1",
    "email": "alumno@academia.com",
    "roles": [ { "code": "STUDENT", "name": "Alumno" } ],
    "firstName": "Joseph",
    ...
  }
}
```
*Nota: `expiresIn` se calcula dinámicamente desde la tabla `system_setting`.*

**Escenario B: Sesión Concurrente Detectada**
`data`:
```json
{
  "accessToken": "JWT",
  "refreshToken": "JWT",
  "expiresIn": 10800,
  "sessionStatus": "PENDING_CONCURRENT_RESOLUTION",
  "concurrentSessionId": "55",
  "user": { ... }
}
```
*Acción Front: Mostrar popup de decisión. Los tokens entregados NO permiten navegación hasta resolver.*

**Escenario C: Anomalía de Geolocalización Detectada**
`data`:
```json
{
  "accessToken": "JWT",
  "refreshToken": "JWT",
  "expiresIn": 10800,
  "sessionStatus": "BLOCKED_PENDING_REAUTH",
  "concurrentSessionId": null,
  "user": { ... }
}
```
*Acción Front: Bloquear Dashboard y pedir re-login con Google para confirmar identidad.*

---

### 2. Resolver Sesión Concurrente
`POST /sessions/resolve-concurrent`

**Purpose:** Decide qué sesión mantener tras una detección concurrente.

**Request Body:**
```json
{
  "refreshToken": "string",
  "deviceId": "string",
  "decision": "KEEP_NEW | KEEP_EXISTING"
}
```

---

### 3. Re-autenticar Sesión Anómala
`POST /sessions/reauth-anomalous`

**Purpose:** Desbloquear una sesión bloqueada por geolocalización.

**Request Body:**
```json
{
  "code": "string (Nuevo Auth Code obtenido de Google)",
  "refreshToken": "string (Token de la sesión bloqueada)",
  "deviceId": "string"
}
```

---

### 4. Renovar Token (Refresh)
`POST /refresh`

**Request Body:**
```json
{
  "refreshToken": "string",
  "deviceId": "string"
}
```

---

### 5. Cerrar Sesión (Logout)
`POST /logout`
*Requiere Authorization: Bearer <accessToken>*

---

## 👥 Módulo de Usuarios (Users)

Base URL: `/api/v1/users`
*Todos los endpoints requieren JWT y una sesión activa en BD.*

| Método | Endpoint | Roles / Permisos | Descripción |
| :--- | :--- | :--- | :--- |
| GET | `/` | ADMIN, SUPER_ADMIN | Listar todos los usuarios del sistema. |
| GET | `/:id` | Propietario o ADMIN, SUPER_ADMIN | Obtener perfil (Solo propio o si eres Admin). |
| POST | `/` | ADMIN, SUPER_ADMIN | Crear un usuario de forma manual. |
| PATCH | `/:id` | Propietario o ADMIN, SUPER_ADMIN | Actualizar datos (Solo propio o si eres Admin). |
| DELETE | `/:id` | ADMIN, SUPER_ADMIN | Eliminar un usuario del sistema. |
| POST | `/:id/roles/:code` | SUPER_ADMIN | Asignar un rol específico (Operación atómica). |
| DELETE | `/:id/roles/:code` | SUPER_ADMIN | Remover un rol específico (Operación atómica). |

---

## 💡 Notas Técnicas Críticas para Frontend
1. **Tipado de IDs:** El backend envía y recibe IDs como **strings** (ej. `"10"`). No convertirlos a números.
2. **Validación de Sesión:** Si el `accessToken` es válido pero la sesión está bloqueada en la BD, recibirás un **401 Unauthorized**. El Front debe manejar esto redirigiendo a la pantalla de resolución correspondiente.
3. **Flujo Google:** El Front debe usar `flow: 'auth-code'` al llamar a la librería de Google para obtener el `code` que el Back espera.
4. **Seguridad Activa:** Si recibes `sessionStatus` diferente de `ACTIVE`, no permitas la navegación interna.