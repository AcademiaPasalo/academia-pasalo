# Especificación Técnica de la API - Academia Pasalo

Esta documentación detalla los endpoints disponibles, sus contratos de datos y las reglas de negocio aplicadas. 

## Estándares Generales
- **Base URL:** `/api/v1`
- **Formato de IDs:** Todos los IDs se envían y reciben como `string` (Mapeo de BIGINT).
- **Formato de Respuesta Exitoso:**
  ```json
  {
    "statusCode": number,
    "message": "Mensaje descriptivo en español",
    "data": object | array | null,
    "timestamp": "ISO8601 Date"
  }
  ```
- **Formato de Error:**
  ```json
  {
    "statusCode": number,
    "message": "Mensaje amigable para el usuario",
    "error": "Nombre técnico del error",
    "timestamp": "ISO8601 Date",
    "path": "URL del endpoint"
  }
  ```

---

## 1. Módulo de Autenticación (`/auth`)

### Login con Google
`POST /auth/google`
- **Request:** `{ code: string, deviceId: string }`
- **Lógica:** Valida el código de Google, crea sesión y devuelve tokens.
- **Roles:** Cualquiera.

### Renovar Token
`POST /auth/refresh`
- **Request:** `{ refreshToken: string, deviceId: string }`
- **Lógica:** Invalida el caché anterior y genera un nuevo par de tokens.

### Resolver Sesión Concurrente
`POST /auth/sessions/resolve-concurrent`
- **Request:** `{ refreshToken: string, deviceId: string, decision: "KEEP_NEW" | "KEEP_EXISTING" }`

### Re-autenticar por Anomalía
`POST /auth/sessions/reauth-anomalous`
- **Request:** `{ code: string, refreshToken: string, deviceId: string }`

### Cerrar Sesión
`POST /auth/logout`
- **Auth:** Bearer Token requerido.
- **Lógica:** Revoca sesión en DB e invalida caché en Redis inmediatamente.

---

## 2. Módulo de Usuarios (`/users`)

### Listar Usuarios
`GET /users`
- **Roles:** ADMIN, SUPER_ADMIN.

### Obtener Perfil
`GET /users/:id`
- **Roles:** ADMIN, SUPER_ADMIN o Propietario del perfil.

### Actualizar Perfil
`PATCH /users/:id`
- **Request:** `{ firstName?, lastName1?, lastName2?, phone? }`
- **Roles:** Propietario o ADMIN.

---

## 3. Módulo de Ciclos Académicos (`/cycles`)

### Listar Ciclos
`GET /cycles`
- **Roles:** ADMIN, SUPER_ADMIN.

### Obtener Ciclo Activo
`GET /cycles/active`
- **Lógica:** Retorna el ciclo definido como activo en la configuración global.
- **Auth:** Requerido (Cualquier rol).

---

## 4. Módulo de Cursos (`/courses`)

### Crear Materia (Molde)
`POST /courses`
- **Request:** `{ code: string, name: string, courseTypeId: string, cycleLevelId: string }`
- **Roles:** ADMIN, SUPER_ADMIN.

### Vincular Curso a Ciclo (Instanciación)
`POST /courses/assign-cycle`
- **Request:** `{ courseId: string, academicCycleId: string }`
- **Lógica Crítica:** Crea el registro `course_cycle` y AUTOMÁTICAMENTE genera una evaluación tipo `BANCO_ENUNCIADOS` para ese curso.
- **Roles:** ADMIN, SUPER_ADMIN.

### Listar Catálogos
- `GET /courses/types`: Listar tipos (Teórico, Práctico).
- `GET /courses/levels`: Listar niveles (Básico, Intermedio).

---

## 5. Módulo de Evaluaciones (`/evaluations`)

### Crear Evaluación
`POST /evaluations`
- **Request:** `{ courseCycleId: string, evaluationTypeId: string, number: number, startDate: Date, endDate: Date }`
- **Regla:** Las fechas deben estar dentro del rango del ciclo académico.
- **Roles:** ADMIN, SUPER_ADMIN.

### Listar por Instancia de Curso
`GET /evaluations/course-cycle/:id`
- **Roles:** ADMIN, SUPER_ADMIN.

---

## 6. Módulo de Matrículas (`/enrollments`)

### Matricular Alumno
`POST /enrollments`
- **Request:**
  ```json
  {
    "userId": "string",
    "courseCycleId": "string",
    "isFullCourse": boolean,
    "evaluationIds": ["string"] // Solo si isFullCourse es false
  }
  ```
- **Lógica Crítica:**
  - Si es `isFullCourse`, da acceso a todas las evaluaciones.
  - El acceso al `BANCO_ENUNCIADOS` se otorga SIEMPRE por defecto.
  - Invalida caché de permisos en Redis para el usuario.
- **Roles:** ADMIN, SUPER_ADMIN.

---

## 7. Módulo de Materiales (`/materials`)

### Crear Carpeta
`POST /materials/folders`
- **Request:** `{ evaluationId: string, parentFolderId?: string, name: string, visibleFrom?: Date, visibleUntil?: Date }`
- **Lógica:** Permite crear jerarquías (subcarpetas) vinculadas a una evaluación.
- **Roles:** ADMIN, SUPER_ADMIN.

### Subir Archivo (Material)
`POST /materials/upload`
- **Format:** `multipart/form-data`
- **Campos:** `file` (archivo), `materialFolderId`, `displayName`, `visibleFrom?`, `visibleUntil?`.
- **Lógica Crítica:**
  - Calcula SHA-256 para deduplicar.
  - Si el archivo ya existe en el servidor, no se duplica el almacenamiento, se crea una nueva versión.
- **Roles:** ADMIN, SUPER_ADMIN.

### Consultar Estructura de Carpetas
`GET /materials/folders/evaluation/:id`
- **Roles:** ADMIN, SUPER_ADMIN.
- **Nota:** En la Fase 5, este endpoint se utilizará para que los alumnos vean su contenido autorizado.
