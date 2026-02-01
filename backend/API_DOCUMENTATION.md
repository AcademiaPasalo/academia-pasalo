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

## 👥 ÉPICA 2: Módulo de Usuarios (Users)

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

## 📚 ÉPICA 3: Cursos y Ciclos (Courses)

Base URL: `/api/v1/courses`
*Gestión del catálogo académico.*

| Método | Endpoint | Roles / Permisos | Descripción |
| :--- | :--- | :--- | :--- |
| POST | `/` | ADMIN, SUPER_ADMIN | **Crear Materia.** Registra una nueva materia en el sistema (ej. "Física I"). |
| GET | `/` | ADMIN, SUPER_ADMIN | **Listar Materias.** Obtiene todas las materias registradas. |
| GET | `/types` | ADMIN, SUPER_ADMIN | Listar tipos de cursos (Ciencias, Letras, Facultad). |
| GET | `/levels` | ADMIN, SUPER_ADMIN | Listar niveles académicos (1er Ciclo, etc.). |
| GET | `/:id` | ADMIN, SUPER_ADMIN | Obtener detalle de una materia. |
| POST | `/assign-cycle` | ADMIN, SUPER_ADMIN | **Aperturar Materia en Ciclo.** Vincula una materia a un ciclo académico (ej. Física I en 2026-0). Esto crea el `CourseCycle`. |
| POST | `/cycle/:id/professors` | ADMIN, SUPER_ADMIN | **Asignar Profesor a Materia en Ciclo.** Asigna (o reactiva) a un profesor para un `CourseCycle` específico (curso + ciclo académico). |
| DELETE | `/cycle/:id/professors/:professorUserId` | ADMIN, SUPER_ADMIN | **Remover Profesor de Materia en Ciclo.** Revoca al profesor de un `CourseCycle` específico. |

### 1. Asignar Profesor a Materia en Ciclo (CourseCycle)
`POST /cycle/:id/professors`

**Purpose:**
- Asociar un profesor a una materia aperturada en un ciclo académico específico (`course_cycle_professor`).
- Este permiso es el que habilita el acceso del profesor a eventos, contenido y recursos relacionados a ese `CourseCycle`.

**Roles:** `ADMIN`, `SUPER_ADMIN`

**Path Params:**
- `id`: `courseCycleId` (string)

**Request Body:**
```json
{
  "professorUserId": "string"
}
```

**Response:**
- `201 Created`
- `data`: `null`

**Notas:**
- Operación idempotente: si el profesor ya estaba asignado, se mantiene/actualiza el vínculo (y si estaba revocado, se reactiva).


### 2. Remover Profesor de Materia en Ciclo (CourseCycle)
`DELETE /cycle/:id/professors/:professorUserId`

**Purpose:**
- Revocar el acceso del profesor a esa materia en ese ciclo (`course_cycle_professor.revoked_at`).

**Roles:** `ADMIN`, `SUPER_ADMIN`

**Path Params:**
- `id`: `courseCycleId` (string)
- `professorUserId`: (string)

**Response:**
- `204 No Content`

**Notas:**
- Esta operación impacta directamente en las validaciones de acceso del profesor para eventos y recursos de ese `CourseCycle`.

---

## 📝 ÉPICA 4: Evaluaciones Académicas (Evaluations)

Base URL: `/api/v1/evaluations`
*Gestión de exámenes, PCs y estructura del curso.*

| Método | Endpoint | Roles / Permisos | Descripción |
| :--- | :--- | :--- | :--- |
| POST | `/` | ADMIN, SUPER_ADMIN | **Crear Evaluación.** Registra una PC, Examen o Banco. <br>⚠️ **Disparador:** Al crearla, si existen alumnos matriculados FULL, se les otorga acceso automático. |
| GET | `/course-cycle/:id` | ADMIN, SUPER_ADMIN | Listar todas las evaluaciones de un curso en un ciclo específico. |

---

## 🎓 ÉPICA 5: Matrículas (Enrollments)

Base URL: `/api/v1/enrollments`
*Proceso de inscripción y compra de accesos.*

| Método | Endpoint | Roles / Permisos | Descripción |
| :--- | :--- | :--- | :--- |
| POST | `/` | ADMIN, SUPER_ADMIN | **Matricular Alumno.** <br>Crea la matrícula y calcula los accesos iniciales según el tipo (`FULL` o `PARTIAL`). <br> - **FULL:** Acceso a todo el ciclo actual + histórico.<br> - **PARTIAL:** Acceso solo a evaluaciones pagadas + Banco (con vigencia recortada). |

---

## 💡 Notas Técnicas Críticas para Frontend
1. **Tipado de IDs:** El backend envía y recibe IDs como **strings** (ej. `"10"`). No convertirlos a números.
2. **Validación de Sesión:** Si el `accessToken` es válido pero la sesión está bloqueada en la BD, recibirás un **401 Unauthorized**. El Front debe manejar esto redirigiendo a la pantalla de resolución correspondiente.
3. **Flujo Google:** El Front debe usar `flow: 'auth-code'` al llamar a la librería de Google para obtener el `code` que el Back espera.
4. **Seguridad Activa:** Si recibes `sessionStatus` diferente de `ACTIVE`, no permitas la navegación interna.
