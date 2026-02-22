# DOCUMENTACIÓN DE API - ACADEMIA PASALO (CORE & AUTH)

Esta documentación cubre exclusivamente los módulos de **Autenticación, Seguridad y Gestión de Usuarios**.
Para la documentación de Cursos, Materiales, Feedback y Calendario, consultar: [API_CONTENT_AND_FEEDBACK.md](./API_CONTENT_AND_FEEDBACK.md)

---

## Formato de Respuesta Estándar

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

### Convención de IDs en ejemplos

Los valores de ejemplo como `"123"`, `"course-cycle-id"` o `"pc1-id"` son placeholders de documentación.
No deben enviarse de forma literal.

Regla para frontend:

1. Primero obtener IDs reales desde endpoints de consulta (`/cycles`, `/courses`, `/evaluations`, `/enrollments/my-courses`).
2. Luego enviar esos IDs reales en endpoints de escritura (`POST`, `PATCH`, `DELETE`).
3. Todo campo `...Id` en request body o params espera un ID existente en BD.

---

## ÉPICA 1: Autenticación y Seguridad (Auth)

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
    "lastActiveRoleId": "2",
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

> [!WARNING]
> **Modo de Auditoría Pasiva (Fase Actual)**
> Aunque el estado `BLOCKED_PENDING_REAUTH` y el endpoint de re-autenticación están implementados y operativos, la lógica de inicio de sesión actual **opera en modo pasivo**. 
> Esto significa que las anomalías (viajes imposibles, etc.) se registran en el historial de seguridad pero **no bloquean la sesión del usuario** (la sesión se crea como `ACTIVE`).
> El flujo de re-autenticación debe considerarse como una capacidad latente para activarse en futuras fases de endurecimiento de seguridad.

---

### 2. Cambiar Perfil Activo (Switch Profile)
`POST /switch-profile`
*Requiere Authorization: Bearer <accessToken>*

**Purpose:** Permite al usuario cambiar su contexto de operación a otro rol que posea (ej. de Estudiante a Profesor). Esta acción invalida los tokens anteriores y emite nuevos.

**Request Body:**
```json
{
  "roleId": "string (ID del rol al que se desea cambiar)",
  "deviceId": "string"
}
```

**Response:**
`data`:
```json
{
  "accessToken": "JWT (Nuevo token con el rol activo actualizado)",
  "refreshToken": "JWT (Nuevo refresh token)",
  "expiresIn": 10800
}
```
*Nota: El frontend debe reemplazar inmediatamente los tokens almacenados y actualizar la UI.*

---

### 3. Resolver Sesión Concurrente
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

### 4. Re-autenticar Sesión Anómala
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

**Response:**
`data`: (Mismo objeto que Escenario A de Login)
```json
{
  "accessToken": "JWT",
  "refreshToken": "JWT",
  "expiresIn": 10800,
  "user": null
}
```

---

### 5. Renovar Token (Refresh)
`POST /refresh`

**Request Body:**
```json
{
  "refreshToken": "string",
  "deviceId": "string"
}
```

---

### 6. Cerrar Sesión (Logout)
`POST /logout`
*Requiere Authorization: Bearer <accessToken>*

---

## ÉPICA 2: Módulo de Usuarios (Users)

Base URL: `/api/v1/users`
*Todos los endpoints requieren JWT y una sesión activa en BD.*

**Nota sobre "Mi Perfil":** Para obtener los datos del usuario actual, el frontend debe usar el endpoint `GET /:id` utilizando el `id` retornado en la respuesta del Login.

### 1. Crear Usuario (Manual)
- **Endpoint:** `POST /`
- **Roles:** `ADMIN`, `SUPER_ADMIN`
- **Request Body:**
    ```json
    {
      "email": "string (email válido, max 255)",
      "firstName": "string (min 2, max 50, solo letras)",
      "lastName1": "string (opcional, max 50)",
      "lastName2": "string (opcional, max 50)",
      "phone": "string (opcional, max 20)",
      "career": "string (opcional, max 100)",
      "profilePhotoUrl": "string (opcional, url)",
      "photoSource": "google | uploaded | none"
    }
    ```

### 2. Listar Usuarios
- **Endpoint:** `GET /`
- **Roles:** `ADMIN`, `SUPER_ADMIN`
- **Response:** Array de objetos User.

### 3. Obtener Usuario por ID
- **Endpoint:** `GET /:id`
- **Roles:** `ADMIN`, `SUPER_ADMIN` o el **Propietario** de la cuenta.
- **Response:** Objeto User.

### 4. Actualizar Usuario
- **Endpoint:** `PATCH /:id`
- **Roles:** `ADMIN`, `SUPER_ADMIN` o el **Propietario** de la cuenta.
- **Request Body:** Similar a `POST /` (todos los campos son opcionales).
- **Campo adicional de seguridad:** `isActive?: boolean`
    * `false` = cuenta inactiva (baneada)
    * `true` = cuenta activa

### 5. Banear Usuario (Admin Action)
- **Endpoint:** `PATCH /:id/ban`
- **Roles:** `ADMIN`, `SUPER_ADMIN`
- **Request Body:** No requiere body.
- **Purpose:** Desactivar una cuenta de usuario de forma inmediata por razones operativas o de seguridad.
- **Reglas de negocio:**
    * El administrador **no puede banearse a sí mismo** (`403`).
    * El baneo marca `user.isActive = false`.
    * Se invalidan identidades en caché y se revocan sesiones activas del usuario.
    * El usuario baneado queda bloqueado en `login`, `refresh` y validación de sesión con respuesta `403`.
- **Response (`data`):** Objeto `User` actualizado.
- **Errores esperados:**
    * `403` si intenta auto-banearse.
    * `404` si el usuario no existe.

#### Ejemplo de Response
```json
{
  "statusCode": 200,
  "message": "Usuario baneado exitosamente",
  "data": {
    "id": "25",
    "email": "estudiante@academia.com",
    "isActive": false,
    "roles": [{ "code": "STUDENT", "name": "Alumno" }]
  },
  "timestamp": "2026-02-12T23:50:00.000Z"
}
```

### 6. Eliminar Usuario
- **Endpoint:** `DELETE /:id`
- **Roles:** `ADMIN`, `SUPER_ADMIN`

### 7. Gestión de Roles
- **Asignar:** `POST /:id/roles/:roleCode`
    * **Roles:** `SUPER_ADMIN`
- **Remover:** `DELETE /:id/roles/:roleCode`
    * **Roles:** `SUPER_ADMIN`

---

## ÉPICA 3: Gestión Académica Core (Cycles & Courses)

Base URL: `/api/v1/cycles` | `/api/v1/courses`

### 1. Ciclos Académicos (`/cycles`)
- **GET /**: Listar todos los ciclos (Admin).
- **GET /active**: Obtener el ciclo académico actualmente activo (Público/Auth).
- **GET /:id**: Obtener detalle de un ciclo (Admin).
    * **Response:**
        ```json
        {
          "id": "string",
          "code": "string",
          "startDate": "Date",
          "endDate": "Date"
        }
        ```

### 2. Cursos (`/courses`)

#### Crear Materia
- **Endpoint:** `POST /`
- **Roles:** `ADMIN`, `SUPER_ADMIN`
- **Request Body:**
    ```json
    {
      "code": "string (max 50)",
      "name": "string (max 100)",
      "courseTypeId": "string (ID)",
      "cycleLevelId": "string (ID)",
      "primaryColor": "string (permite null, formato #RRGGBB)",
      "secondaryColor": "string (permite null, formato #RRGGBB)"
    }
    ```

#### Actualizar Materia
- **Endpoint:** `PATCH /:id`
- **Roles:** `ADMIN`, `SUPER_ADMIN`
- **Request Body:** Similar a `POST /` (todos los campos son opcionales).
- **Efecto en Caché:** Esta operación dispara una **invalidación global** de las cachés de Dashboard, Contenido de Curso y Calendarios para garantizar la consistencia visual inmediata en todos los usuarios.

- **GET /types**: Tipos de cursos (Ciencias, Letras, etc.).
- **GET /levels**: Niveles (Ciclo 1, Ciclo 2, etc.).

#### Aperturar Materia en Ciclo
- **Endpoint:** `POST /assign-cycle`
- **Roles:** `ADMIN`, `SUPER_ADMIN`
- **Request Body:**
    ```json
    {
      "courseId": "string",
      "academicCycleId": "string"
    }
    ```

#### Gestión de Profesores en Curso/Ciclo
- **Asignar:** `POST /cycle/:id/professors`
    * **Body:** `{ "professorUserId": "string" }`
- **Remover:** `DELETE /cycle/:id/professors/:professorUserId`
- **Roles:** `ADMIN`, `SUPER_ADMIN`

---
#### Vista de Curso para Alumno
Los endpoints de alumno para detalle de curso se separan en 3 piezas para optimizar carga, seguridad y UX por tabs.

1. `GET /courses/cycle/:courseCycleId/current`
- Rol: `STUDENT`
- Devuelve `courseCycleId`, `cycleCode`, `canViewPreviousCycles` y evaluaciones con `id`, `shortName`, `fullName`, `label`.
- Labels posibles: `Completado`, `En curso`, `Próximamente`, `Bloqueado`.

2. `GET /courses/cycle/:courseCycleId/previous-cycles`
- Rol: `STUDENT`
- Devuelve lista de ciclos anteriores: `[{ cycleCode }]`.
- Solo se habilita si `canViewPreviousCycles = true`.

3. `GET /courses/cycle/:courseCycleId/previous-cycles/:cycleCode/content`
- Rol: `STUDENT`
- Devuelve evaluaciones del ciclo anterior con `id`, `shortName`, `fullName`, `label`.
- Labels posibles: `Archivado`, `Bloqueado`.

Nota de seguridad:
`GET /courses/cycle/:courseCycleId/content` queda para `PROFESSOR`, `ADMIN`, `SUPER_ADMIN` (no para `STUDENT`).

## ÉPICA 4: Evaluaciones Académicas (Evaluations)

Base URL: `/api/v1/evaluations`

### 1. Crear Evaluación
- **Endpoint:** `POST /`
- **Roles:** `ADMIN`, `SUPER_ADMIN`
- **Request Body:**
    ```json
    {
      "courseCycleId": "string",
      "evaluationTypeId": "string",
      "number": number,
      "startDate": "ISO-8601 Date",
      "endDate": "ISO-8601 Date"
    }
    ```
- **Nota:** Al crearla, si existen alumnos matriculados FULL, se les otorga acceso automático.

### 2. Listar Evaluaciones de Curso/Ciclo
- **Endpoint:** `GET /course-cycle/:id`
- **Roles:** `ADMIN`, `SUPER_ADMIN`

---

## ÉPICA 5: Matrículas (Enrollments)

Base URL: `/api/v1/enrollments`

### 1. Matricular Alumno
- **Endpoint:** `POST /`
- **Roles:** `ADMIN`, `SUPER_ADMIN`
- **Request Body:**
    ```json
    {
      "userId": "string",
      "courseCycleId": "string",
      "enrollmentTypeCode": "FULL | PARTIAL",
      "evaluationIds": ["string"],
      "historicalCourseCycleIds": ["string"]
    }
    ```

#### Modelo de dominio (clave para Frontend)

La matrícula SIEMPRE se registra sobre un `courseCycleId` (un curso específico dentro de un ciclo académico).
La jerarquía correcta es:

1. `academicCycle` (ej. 2026-1)
2. `courseCycle` (ej. Álgebra en 2026-1)
3. `evaluation` (PC1, PC2, Final) perteneciente a ese `courseCycle`

No existe matrícula "directa a todo el ciclo académico" sin curso. Siempre hay un curso base (`courseCycleId`).

#### Tipos de Matrícula:

| Tipo | `evaluationIds` | `historicalCourseCycleIds` | Comportamiento |
|------|-----------------|---------------------------|----------------|
| **FULL** | Ignorado | Opcional | Acceso a TODAS las evaluaciones del `courseCycleId` base + acceso histórico de los `courseCycleId` enviados |
| **PARTIAL** | **Requerido** | Opcional | Acceso SOLO a las evaluaciones listadas en `evaluationIds` (del curso base o cursos históricos permitidos) |

Reglas de validación recomendadas para el Frontend:

1. `FULL`: no enviar `evaluationIds`.
2. `PARTIAL`: enviar al menos 1 `evaluationId`.
3. Cada `evaluationId` debe pertenecer al `courseCycleId` base o a uno de `historicalCourseCycleIds`.
4. `historicalCourseCycleIds` no crea matrícula independiente; solo amplia alcance para evaluaciones históricas.

> [!IMPORTANT]
> **Manejo de Fechas en Evaluaciones Históricas (PARTIAL)**
> Si un alumno se matricula en una evaluación pasada (ej. PC1 2025-1) bajo modalidad `PARTIAL`:
> 1. El sistema intentará igualar la fecha de acceso con su **símil del ciclo actual** (ej. PC1 2026-1).
> 2. Si NO encuentra un símil, usará la **fecha fin del ciclo actual** como fallback.
> 
> **Para el Frontend:** Si observan que `accessEndDate` de la matrícula es posterior a `evaluation.endDate` (fecha original del examen), significa que el sistema extendió automáticamente el acceso (fallback). Se recomienda mostrar una advertencia al usuario indicando la fecha límite de su acceso y que no encontró su símil actual (caso muy extraño).

#### Ejemplos de Uso:

**1. FULL con acceso histórico:**
```json
{
  "userId": "123",
  "courseCycleId": "algebra-2026-1",
  "enrollmentTypeCode": "FULL",
  "historicalCourseCycleIds": ["algebra-2025-2", "algebra-2025-1"]
}
```
*Resultado: Acceso a todas las evaluaciones de Álgebra 2026-1 + todos los exámenes de Álgebra en 2025-2 y 2025-1.*

**2. PARTIAL solo ciclo actual:**
```json
{
  "userId": "456",
  "courseCycleId": "algebra-2026-1",
  "enrollmentTypeCode": "PARTIAL",
  "evaluationIds": ["pc1-id", "pc2-id"]
}
```
*Resultado: Acceso solo a PC1 y PC2 de Álgebra 2026-1.*

**3. PARTIAL con evaluación de ciclo histórico:**
```json
{
  "userId": "789",
  "courseCycleId": "algebra-2026-1",
  "enrollmentTypeCode": "PARTIAL",
  "evaluationIds": ["algebra-final-2025-2"],
  "historicalCourseCycleIds": ["algebra-2025-2"]
}
```
*Resultado: Acceso solo al examen final de Álgebra 2025-2 para práctica.*

### 2. Cancelar Matrícula
- **Endpoint:** `DELETE /:id`
- **Roles:** `ADMIN`, `SUPER_ADMIN`
- **Efecto:** Revoca accesos inmediatamente.

---

## ÉPICA 6: Sistema (System)

Base URL: `/api/v1`

### 1. Health Check
`GET /health`
- **Roles:** Público.
- **Descripción:** Verifica el estado de la API, conexión a BD y Redis.
- **Response:** `{ "status": "ok", "info": { ... } }`

---

## ÉPICA 7: Auditoría y Trazabilidad (Audit)

Base URL: `/api/v1/audit`
*Requiere Authorization: Bearer <accessToken>.*

### 1. Obtener Historial Unificado
`GET /history`

**Purpose:** Obtiene una vista cronológica consolidada de eventos de seguridad (logins, anomalías) y acciones de negocio (subida de archivos, gestión de usuarios).

**Query Parameters:**
- `startDate` (ISO Date, opcional): Filtrar desde esta fecha.
- `endDate` (ISO Date, opcional): Filtrar hasta esta fecha.
- `userId` (string, opcional): Filtrar acciones de un usuario específico.
- `limit` (number, opcional): Máximo de registros (Default: 50, Max Backend: 100).

**Response:**
`data` (Array de objetos):
```json
[
  {
    "id": "aud-123 | sec-456",
    "datetime": "2026-02-07T15:00:00.000Z",
    "userId": "10",
    "userName": "Joseph Pasalo",
    "actionCode": "MATERIAL_UPLOAD | LOGIN_SUCCESS",
    "actionName": "Subida de Archivo | Inicio de Sesión",
    "source": "AUDIT | SECURITY",
    "entityType": "material (solo en AUDIT)",
    "entityId": "50 (solo en AUDIT)",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0... (solo en SECURITY)",
    "metadata": { ... }
  }
]
```

---

### 2. Exportar Historial a Excel
`GET /export`

**Purpose:** Descarga un reporte profesional en formato `.xlsx` con el historial filtrado. Soporta hasta 1000 registros por descarga.

**Query Parameters:**
- `startDate`, `endDate`, `userId` (Mismos filtros que el historial).

**Response:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename=reporte-auditoria-YYYY-MM-DD.xlsx`
- **Body:** Stream binario del archivo Excel.
  # DOCUMENTACIÓN DE API - ACADEMIA PASALO (CORE & AUTH)

  Esta documentación cubre exclusivamente los módulos de **Autenticación, Seguridad y Gestión de Usuarios**.
  Para la documentación de Cursos, Materiales, Feedback y Calendario, consultar: [API_CONTENT_AND_FEEDBACK.md](./API_CONTENT_AND_FEEDBACK.md)

  ---

  ## Formato de Respuesta Estándar

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

  ### Convención de IDs en ejemplos

  Los valores de ejemplo como `"123"`, `"course-cycle-id"` o `"pc1-id"` son placeholders de documentación.
  No deben enviarse de forma literal.

  Regla para frontend:

  1. Primero obtener IDs reales desde endpoints de consulta (`/cycles`, `/courses`, `/evaluations`, `/enrollments/my-courses`).
  2. Luego enviar esos IDs reales en endpoints de escritura (`POST`, `PATCH`, `DELETE`).
  3. Todo campo `...Id` en request body o params espera un ID existente en BD.

  ---

  ## ÉPICA 1: Autenticación y Seguridad (Auth)

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
      "lastActiveRoleId": "2",
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

  > [!WARNING]
  > **Modo de Auditoría Pasiva (Fase Actual)**
  > Aunque el estado `BLOCKED_PENDING_REAUTH` y el endpoint de re-autenticación están implementados y operativos, la lógica de inicio de sesión actual **opera en modo pasivo**. 
  > Esto significa que las anomalías (viajes imposibles, etc.) se registran en el historial de seguridad pero **no bloquean la sesión del usuario** (la sesión se crea como `ACTIVE`).
  > El flujo de re-autenticación debe considerarse como una capacidad latente para activarse en futuras fases de endurecimiento de seguridad.

  ---

  ### 2. Cambiar Perfil Activo (Switch Profile)
  `POST /switch-profile`
  *Requiere Authorization: Bearer <accessToken>*

  **Purpose:** Permite al usuario cambiar su contexto de operación a otro rol que posea (ej. de Estudiante a Profesor). Esta acción invalida los tokens anteriores y emite nuevos.

  **Request Body:**
  ```json
  {
    "roleId": "string (ID del rol al que se desea cambiar)",
    "deviceId": "string"
  }
  ```

  **Response:**
  `data`:
  ```json
  {
    "accessToken": "JWT (Nuevo token con el rol activo actualizado)",
    "refreshToken": "JWT (Nuevo refresh token)",
    "expiresIn": 10800
  }
  ```
  *Nota: El frontend debe reemplazar inmediatamente los tokens almacenados y actualizar la UI.*

  ---

  ### 3. Resolver Sesión Concurrente
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

  ### 4. Re-autenticar Sesión Anómala
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

  **Response:**
  `data`: (Mismo objeto que Escenario A de Login)
  ```json
  {
    "accessToken": "JWT",
    "refreshToken": "JWT",
    "expiresIn": 10800,
    "user": null
  }
  ```

  ---

  ### 5. Renovar Token (Refresh)
  `POST /refresh`

  **Request Body:**
  ```json
  {
    "refreshToken": "string",
    "deviceId": "string"
  }
  ```

  ---

  ### 6. Cerrar Sesión (Logout)
  `POST /logout`
  *Requiere Authorization: Bearer <accessToken>*

  ---

  ## ÉPICA 2: Módulo de Usuarios (Users)

  Base URL: `/api/v1/users`
  *Todos los endpoints requieren JWT y una sesión activa en BD.*

  **Nota sobre "Mi Perfil":** Para obtener los datos del usuario actual, el frontend debe usar el endpoint `GET /:id` utilizando el `id` retornado en la respuesta del Login.

  ### 1. Crear Usuario (Manual)
  - **Endpoint:** `POST /`
  - **Roles:** `ADMIN`, `SUPER_ADMIN`
  - **Request Body:**
      ```json
      {
        "email": "string (email válido, max 255)",
        "firstName": "string (min 2, max 50, solo letras)",
        "lastName1": "string (opcional, max 50)",
        "lastName2": "string (opcional, max 50)",
        "phone": "string (opcional, max 20)",
        "career": "string (opcional, max 100)",
        "profilePhotoUrl": "string (opcional, url)",
        "photoSource": "google | uploaded | none"
      }
      ```

  ### 2. Listar Usuarios
  - **Endpoint:** `GET /`
  - **Roles:** `ADMIN`, `SUPER_ADMIN`
  - **Response:** Array de objetos User.

  ### 3. Obtener Usuario por ID
  - **Endpoint:** `GET /:id`
  - **Roles:** `ADMIN`, `SUPER_ADMIN` o el **Propietario** de la cuenta.
  - **Response:** Objeto User.

  ### 4. Actualizar Usuario
  - **Endpoint:** `PATCH /:id`
  - **Roles:** `ADMIN`, `SUPER_ADMIN` o el **Propietario** de la cuenta.
  - **Request Body:** Similar a `POST /` (todos los campos son opcionales).
  - **Campo adicional de seguridad:** `isActive?: boolean`
      * `false` = cuenta inactiva (baneada)
      * `true` = cuenta activa

  ### 5. Banear Usuario (Admin Action)
  - **Endpoint:** `PATCH /:id/ban`
  - **Roles:** `ADMIN`, `SUPER_ADMIN`
  - **Request Body:** No requiere body.
  - **Purpose:** Desactivar una cuenta de usuario de forma inmediata por razones operativas o de seguridad.
  - **Reglas de negocio:**
      * El administrador **no puede banearse a sí mismo** (`403`).
      * El baneo marca `user.isActive = false`.
      * Se invalidan identidades en caché y se revocan sesiones activas del usuario.
      * El usuario baneado queda bloqueado en `login`, `refresh` y validación de sesión con respuesta `403`.
  - **Response (`data`):** Objeto `User` actualizado.
  - **Errores esperados:**
      * `403` si intenta auto-banearse.
      * `404` si el usuario no existe.

  #### Ejemplo de Response
  ```json
  {
    "statusCode": 200,
    "message": "Usuario baneado exitosamente",
    "data": {
      "id": "25",
      "email": "estudiante@academia.com",
      "isActive": false,
      "roles": [{ "code": "STUDENT", "name": "Alumno" }]
    },
    "timestamp": "2026-02-12T23:50:00.000Z"
  }
  ```

  ### 6. Eliminar Usuario
  - **Endpoint:** `DELETE /:id`
  - **Roles:** `ADMIN`, `SUPER_ADMIN`

  ### 7. Gestión de Roles
  - **Asignar:** `POST /:id/roles/:roleCode`
      * **Roles:** `SUPER_ADMIN`
  - **Remover:** `DELETE /:id/roles/:roleCode`
      * **Roles:** `SUPER_ADMIN`

  ---

  ## ÉPICA 3: Gestión Académica Core (Cycles & Courses)

  Base URL: `/api/v1/cycles` | `/api/v1/courses`

  ### 1. Ciclos Académicos (`/cycles`)
  - **GET /**: Listar todos los ciclos (Admin).
  - **GET /active**: Obtener el ciclo académico actualmente activo (Público/Auth).
  - **GET /:id**: Obtener detalle de un ciclo (Admin).
      * **Response:**
          ```json
          {
            "id": "string",
            "code": "string",
            "startDate": "Date",
            "endDate": "Date"
          }
          ```

  ### 2. Cursos (`/courses`)

  #### Crear Materia
  - **Endpoint:** `POST /`
  - **Roles:** `ADMIN`, `SUPER_ADMIN`
  - **Request Body:**
      ```json
      {
        "code": "string (max 50)",
        "name": "string (max 100)",
        "courseTypeId": "string (ID)",
        "cycleLevelId": "string (ID)",
        "primaryColor": "string (permite null, formato #RRGGBB)",
        "secondaryColor": "string (permite null, formato #RRGGBB)"
      }
      ```

  #### Actualizar Materia
  - **Endpoint:** `PATCH /:id`
  - **Roles:** `ADMIN`, `SUPER_ADMIN`
  - **Request Body:** Similar a `POST /` (todos los campos son opcionales).
  - **Efecto en Caché:** Esta operación dispara una **invalidación global** de las cachés de Dashboard, Contenido de Curso y Calendarios para garantizar la consistencia visual inmediata en todos los usuarios.

  - **GET /types**: Tipos de cursos (Ciencias, Letras, etc.).
  - **GET /levels**: Niveles (Ciclo 1, Ciclo 2, etc.).

  #### Aperturar Materia en Ciclo
  - **Endpoint:** `POST /assign-cycle`
  - **Roles:** `ADMIN`, `SUPER_ADMIN`
  - **Request Body:**
      ```json
      {
        "courseId": "string",
        "academicCycleId": "string"
      }
      ```

  #### Gestión de Profesores en Curso/Ciclo
  - **Asignar:** `POST /cycle/:id/professors`
      * **Body:** `{ "professorUserId": "string" }`
  - **Remover:** `DELETE /cycle/:id/professors/:professorUserId`
  - **Roles:** `ADMIN`, `SUPER_ADMIN`

  ---
  #### Vista de Curso para Alumno
  Los endpoints de alumno para detalle de curso se separan en 3 piezas para optimizar carga, seguridad y UX por tabs.

  1. `GET /courses/cycle/:courseCycleId/current`
  - Rol: `STUDENT`
  - Devuelve `courseCycleId`, `cycleCode`, `canViewPreviousCycles` y evaluaciones con `id`, `shortName`, `fullName`, `label`.
  - Labels posibles: `Completado`, `En curso`, `Próximamente`, `Bloqueado`.

  2. `GET /courses/cycle/:courseCycleId/previous-cycles`
  - Rol: `STUDENT`
  - Devuelve lista de ciclos anteriores: `[{ cycleCode }]`.
  - Solo se habilita si `canViewPreviousCycles = true`.

  3. `GET /courses/cycle/:courseCycleId/previous-cycles/:cycleCode/content`
  - Rol: `STUDENT`
  - Devuelve evaluaciones del ciclo anterior con `id`, `shortName`, `fullName`, `label`.
  - Labels posibles: `Archivado`, `Bloqueado`.

  Nota de seguridad:
  `GET /courses/cycle/:courseCycleId/content` queda para `PROFESSOR`, `ADMIN`, `SUPER_ADMIN` (no para `STUDENT`).

  ## ÉPICA 4: Evaluaciones Académicas (Evaluations)

  Base URL: `/api/v1/evaluations`

  ### 1. Crear Evaluación
  - **Endpoint:** `POST /`
  - **Roles:** `ADMIN`, `SUPER_ADMIN`
  - **Request Body:**
      ```json
      {
        "courseCycleId": "string",
        "evaluationTypeId": "string",
        "number": number,
        "startDate": "ISO-8601 Date",
        "endDate": "ISO-8601 Date"
      }
      ```
  - **Nota:** Al crearla, si existen alumnos matriculados FULL, se les otorga acceso automático.

  ### 2. Listar Evaluaciones de Curso/Ciclo
  - **Endpoint:** `GET /course-cycle/:id`
  - **Roles:** `ADMIN`, `SUPER_ADMIN`

  ---

  ## ÉPICA 5: Matrículas (Enrollments)

  Base URL: `/api/v1/enrollments`

  ### 1. Matricular Alumno
  - **Endpoint:** `POST /`
  - **Roles:** `ADMIN`, `SUPER_ADMIN`
  - **Request Body:**
      ```json
      {
        "userId": "string",
        "courseCycleId": "string",
        "enrollmentTypeCode": "FULL | PARTIAL",
        "evaluationIds": ["string"],
        "historicalCourseCycleIds": ["string"]
      }
      ```

  #### Modelo de dominio (clave para Frontend)

  La matrícula SIEMPRE se registra sobre un `courseCycleId` (un curso específico dentro de un ciclo académico).
  La jerarquía correcta es:

  1. `academicCycle` (ej. 2026-1)
  2. `courseCycle` (ej. Álgebra en 2026-1)
  3. `evaluation` (PC1, PC2, Final) perteneciente a ese `courseCycle`

  No existe matrícula "directa a todo el ciclo académico" sin curso. Siempre hay un curso base (`courseCycleId`).

  #### Tipos de Matrícula:

  | Tipo | `evaluationIds` | `historicalCourseCycleIds` | Comportamiento |
  |------|-----------------|---------------------------|----------------|
  | **FULL** | Ignorado | Opcional | Acceso a TODAS las evaluaciones del `courseCycleId` base + acceso histórico de los `courseCycleId` enviados |
  | **PARTIAL** | **Requerido** | Opcional | Acceso SOLO a las evaluaciones listadas en `evaluationIds` (del curso base o cursos históricos permitidos) |

  Reglas de validación recomendadas para el Frontend:

  1. `FULL`: no enviar `evaluationIds`.
  2. `PARTIAL`: enviar al menos 1 `evaluationId`.
  3. Cada `evaluationId` debe pertenecer al `courseCycleId` base o a uno de `historicalCourseCycleIds`.
  4. `historicalCourseCycleIds` no crea matrícula independiente; solo amplia alcance para evaluaciones históricas.

  > [!IMPORTANT]
  > **Manejo de Fechas en Evaluaciones Históricas (PARTIAL)**
  > Si un alumno se matricula en una evaluación pasada (ej. PC1 2025-1) bajo modalidad `PARTIAL`:
  > 1. El sistema intentará igualar la fecha de acceso con su **símil del ciclo actual** (ej. PC1 2026-1).
  > 2. Si NO encuentra un símil, usará la **fecha fin del ciclo actual** como fallback.
  > 
  > **Para el Frontend:** Si observan que `accessEndDate` de la matrícula es posterior a `evaluation.endDate` (fecha original del examen), significa que el sistema extendió automáticamente el acceso (fallback). Se recomienda mostrar una advertencia al usuario indicando la fecha límite de su acceso y que no encontró su símil actual (caso muy extraño).

  #### Ejemplos de Uso:

  **1. FULL con acceso histórico:**
  ```json
  {
    "userId": "123",
    "courseCycleId": "algebra-2026-1",
    "enrollmentTypeCode": "FULL",
    "historicalCourseCycleIds": ["algebra-2025-2", "algebra-2025-1"]
  }
  ```
  *Resultado: Acceso a todas las evaluaciones de Álgebra 2026-1 + todos los exámenes de Álgebra en 2025-2 y 2025-1.*

  **2. PARTIAL solo ciclo actual:**
  ```json
  {
    "userId": "456",
    "courseCycleId": "algebra-2026-1",
    "enrollmentTypeCode": "PARTIAL",
    "evaluationIds": ["pc1-id", "pc2-id"]
  }
  ```
  *Resultado: Acceso solo a PC1 y PC2 de Álgebra 2026-1.*

  **3. PARTIAL con evaluación de ciclo histórico:**
  ```json
  {
    "userId": "789",
    "courseCycleId": "algebra-2026-1",
    "enrollmentTypeCode": "PARTIAL",
    "evaluationIds": ["algebra-final-2025-2"],
    "historicalCourseCycleIds": ["algebra-2025-2"]
  }
  ```
  *Resultado: Acceso solo al examen final de Álgebra 2025-2 para práctica.*

  ### 2. Cancelar Matrícula
  - **Endpoint:** `DELETE /:id`
  - **Roles:** `ADMIN`, `SUPER_ADMIN`
  - **Efecto:** Revoca accesos inmediatamente.

  ---

  ## ÉPICA 6: Sistema (System)

  Base URL: `/api/v1`

  ### 1. Health Check
  `GET /health`
  - **Roles:** Público.
  - **Descripción:** Verifica el estado de la API, conexión a BD y Redis.
  - **Response:** `{ "status": "ok", "info": { ... } }`

  ---

  ## ÉPICA 7: Auditoría y Trazabilidad (Audit)

  Base URL: `/api/v1/audit`
  *Requiere Authorization: Bearer <accessToken>.*

  ### 1. Obtener Historial Unificado
  `GET /history`

  **Purpose:** Obtiene una vista cronológica consolidada de eventos de seguridad (logins, anomalías) y acciones de negocio (subida de archivos, gestión de usuarios).

  **Query Parameters:**
  - `startDate` (ISO Date, opcional): Filtrar desde esta fecha.
  - `endDate` (ISO Date, opcional): Filtrar hasta esta fecha.
  - `userId` (string, opcional): Filtrar acciones de un usuario específico.
  - `limit` (number, opcional): Máximo de registros (Default: 50, Max Backend: 100).

  **Response:**
  `data` (Array de objetos):
  ```json
  [
    {
      "id": "aud-123 | sec-456",
      "datetime": "2026-02-07T15:00:00.000Z",
      "userId": "10",
      "userName": "Joseph Pasalo",
      "actionCode": "MATERIAL_UPLOAD | LOGIN_SUCCESS",
      "actionName": "Subida de Archivo | Inicio de Sesión",
      "source": "AUDIT | SECURITY",
      "entityType": "material (solo en AUDIT)",
      "entityId": "50 (solo en AUDIT)",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0... (solo en SECURITY)",
      "metadata": { ... }
    }
  ]
  ```

  ---

  ### 2. Exportar Historial a Excel
  `GET /export`

  **Purpose:** Descarga un reporte profesional en formato `.xlsx` con el historial filtrado. Soporta hasta 1000 registros por descarga.

  **Query Parameters:**
  - `startDate`, `endDate`, `userId` (Mismos filtros que el historial).

  **Response:**
  - **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - **Content-Disposition:** `attachment; filename=reporte-auditoria-YYYY-MM-DD.xlsx`
  - **Body:** Stream binario del archivo Excel.




