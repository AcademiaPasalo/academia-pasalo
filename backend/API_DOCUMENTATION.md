# DOCUMENTACIÓN DE API - ACADEMIA PASALO (CORE & AUTH)

Esta documentación cubre exclusivamente los módulos de **Autenticación, Seguridad y Gestión de Usuarios**.
Para la documentación de Cursos, Materiales, Feedback y Calendario, consultar: [API_CONTENT_AND_FEEDBACK.md](./API_CONTENT_AND_FEEDBACK.md)

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
*Acción Front: Bloquear Dashboard y pedir re-login con Google para confirmar identidad.*

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

## 👥 ÉPICA 2: Módulo de Usuarios (Users)

Base URL: `/api/v1/users`
*Todos los endpoints requieren JWT y una sesión activa en BD.*

**Nota sobre "Mi Perfil":** Para obtener los datos del usuario actual, el frontend debe usar el endpoint `GET /:id` utilizando el `id` retornado en la respuesta del Login.

### 1. Crear Usuario (Manual)
*   **Endpoint:** `POST /`
*   **Roles:** `ADMIN`, `SUPER_ADMIN`
*   **Request Body:**
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
*   **Endpoint:** `GET /`
*   **Roles:** `ADMIN`, `SUPER_ADMIN`
*   **Response:** Array de objetos User.

### 3. Obtener Usuario por ID
*   **Endpoint:** `GET /:id`
*   **Roles:** `ADMIN`, `SUPER_ADMIN` o el **Propietario** de la cuenta.
*   **Response:** Objeto User.

### 4. Actualizar Usuario
*   **Endpoint:** `PATCH /:id`
*   **Roles:** `ADMIN`, `SUPER_ADMIN` o el **Propietario** de la cuenta.
*   **Request Body:** Similar a `POST /` (todos los campos son opcionales).

### 5. Eliminar Usuario
*   **Endpoint:** `DELETE /:id`
*   **Roles:** `ADMIN`, `SUPER_ADMIN`

### 6. Gestión de Roles
*   **Asignar:** `POST /:id/roles/:roleCode`
    *   **Roles:** `SUPER_ADMIN`
*   **Remover:** `DELETE /:id/roles/:roleCode`
    *   **Roles:** `SUPER_ADMIN`

---

## 📅 ÉPICA 3: Gestión Académica Core (Cycles & Courses)

Base URL: `/api/v1/cycles` | `/api/v1/courses`

### 1. Ciclos Académicos (`/cycles`)
*   **GET /**: Listar todos los ciclos (Admin).
*   **GET /active**: Obtener el ciclo académico actualmente activo (Público/Auth).
*   **GET /:id**: Obtener detalle de un ciclo (Admin).
    *   **Response:**
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
*   **Endpoint:** `POST /`
*   **Roles:** `ADMIN`, `SUPER_ADMIN`
*   **Request Body:**
    ```json
    {
      "code": "string (max 50)",
      "name": "string (max 100)",
      "courseTypeId": "string (ID)",
      "cycleLevelId": "string (ID)"
    }
    ```

#### Listar Materias
*   **Endpoint:** `GET /`
*   **Roles:** `ADMIN`, `SUPER_ADMIN`

#### Obtener Materia por ID
*   **Endpoint:** `GET /:id`
*   **Roles:** `ADMIN`, `SUPER_ADMIN`
*   **Response:** Objeto Course con su tipo y nivel.

#### Listar Tipos y Niveles
*   **GET /types**: Tipos de cursos (Ciencias, Letras, etc.).
*   **GET /levels**: Niveles (Ciclo 1, Ciclo 2, etc.).

#### Aperturar Materia en Ciclo
*   **Endpoint:** `POST /assign-cycle`
*   **Roles:** `ADMIN`, `SUPER_ADMIN`
*   **Request Body:**
    ```json
    {
      "courseId": "string",
      "academicCycleId": "string"
    }
    ```

#### Gestión de Profesores en Curso/Ciclo
*   **Asignar:** `POST /cycle/:id/professors`
    *   **Body:** `{ "professorUserId": "string" }`
*   **Remover:** `DELETE /cycle/:id/professors/:professorUserId`
*   **Roles:** `ADMIN`, `SUPER_ADMIN`

---

## 📝 ÉPICA 4: Evaluaciones Académicas (Evaluations)

Base URL: `/api/v1/evaluations`

### 1. Crear Evaluación
*   **Endpoint:** `POST /`
*   **Roles:** `ADMIN`, `SUPER_ADMIN`
*   **Request Body:**
    ```json
    {
      "courseCycleId": "string",
      "evaluationTypeId": "string",
      "number": number,
      "startDate": "ISO-8601 Date",
      "endDate": "ISO-8601 Date"
    }
    ```
*   **Nota:** Al crearla, si existen alumnos matriculados FULL, se les otorga acceso automático.

### 2. Listar Evaluaciones de Curso/Ciclo
*   **Endpoint:** `GET /course-cycle/:id`
*   **Roles:** `ADMIN`, `SUPER_ADMIN`

---

## 🎓 ÉPICA 5: Matrículas (Enrollments)

Base URL: `/api/v1/enrollments`

### 1. Matricular Alumno
*   **Endpoint:** `POST /`
*   **Roles:** `ADMIN`, `SUPER_ADMIN`
*   **Request Body:**
    ```json
    {
      "userId": "string",
      "courseCycleId": "string",
      "enrollmentTypeCode": "FULL | PARTIAL",
      "evaluationIds": ["string"],
      "historicalCourseCycleIds": ["string"]
    }
    ```

#### Tipos de Matrícula:

| Tipo | `evaluationIds` | `historicalCourseCycleIds` | Comportamiento |
|------|-----------------|---------------------------|----------------|
| **FULL** | Ignorado | Opcional | Acceso a TODAS las evaluaciones del ciclo actual + ciclos históricos |
| **PARTIAL** | **Requerido** | Opcional | Acceso SOLO a evaluaciones específicas (pueden ser de ciclos pasados) |

#### Ejemplos de Uso:

**1. FULL con acceso histórico:**
```json
{
  "userId": "123",
  "courseCycleId": "ciclo-2026-1",
  "enrollmentTypeCode": "FULL",
  "historicalCourseCycleIds": ["ciclo-2025-2", "ciclo-2025-1"]
}
```
*Resultado: Acceso a todas las evaluaciones del ciclo actual + todos los exámenes de los 2 ciclos anteriores.*

**2. PARTIAL solo ciclo actual:**
```json
{
  "userId": "456",
  "courseCycleId": "ciclo-2026-1",
  "enrollmentTypeCode": "PARTIAL",
  "evaluationIds": ["pc1-id", "pc2-id"]
}
```
*Resultado: Acceso solo a PC1 y PC2 del ciclo actual.*

**3. PARTIAL con evaluación de ciclo histórico:**
```json
{
  "userId": "789",
  "courseCycleId": "ciclo-2026-1",
  "enrollmentTypeCode": "PARTIAL",
  "evaluationIds": ["ex-final-2025-2"],
  "historicalCourseCycleIds": ["ciclo-2025-2"]
}
```
*Resultado: Acceso solo al examen final del ciclo 2025-2 para práctica.*

### 2. Cancelar Matrícula
*   **Endpoint:** `DELETE /:id`
*   **Roles:** `ADMIN`, `SUPER_ADMIN`
*   **Efecto:** Revoca accesos inmediatamente.

---

## 🛠️ ÉPICA 6: Sistema (System)

Base URL: `/api/v1`

### 1. Health Check
`GET /health`
*   **Roles:** Público.
*   **Descripción:** Verifica el estado de la API, conexión a BD y Redis.
*   **Response:** `{ "status": "ok", "info": { ... } }`

---

## 🔍 ÉPICA 7: Auditoría y Trazabilidad (Audit)

Base URL: `/api/v1/audit`
*Requiere Authorization: Bearer <accessToken>.*

### 1. Obtener Historial Unificado
`GET /history`

**Purpose:** Obtiene una vista cronológica consolidada de eventos de seguridad (logins, anomalías) y acciones de negocio (subida de archivos, gestión de usuarios).

**Query Parameters:**
*   `startDate` (ISO Date, opcional): Filtrar desde esta fecha.
*   `endDate` (ISO Date, opcional): Filtrar hasta esta fecha.
*   `userId` (string, opcional): Filtrar acciones de un usuario específico.
*   `limit` (number, opcional): Máximo de registros (Default: 50, Max Backend: 100).

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
*   `startDate`, `endDate`, `userId` (Mismos filtros que el historial).

**Response:**
*   **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
*   **Content-Disposition:** `attachment; filename=reporte-auditoria-YYYY-MM-DD.xlsx`
*   **Body:** Stream binario del archivo Excel.
