# ESPECIFICACIÓN TÉCNICA DE API: CONTENIDO, MATERIALES Y FEEDBACK
==================================================================

Esta API gestiona el núcleo de la experiencia académica: cursos, materiales educativos, testimonios y calendario de clases. Sigue el estándar de respuesta unificada del proyecto.

---

## 🏗️ Estándar de Comunicación
*   **Base URL:** `/api/v1`
*   **Auth:** Requiere `Authorization: Bearer <token>` (excepto en endpoints públicos).
*   **Contexto de Rol Activo:** Todos los endpoints (ej. `/my-schedule`, `/my-courses`) responden basándose en el **perfil activo** seleccionado mediante `POST /auth/switch-profile`. Si un usuario tiene roles de `STUDENT` y `PROFESSOR`, debe cambiar de perfil explícitamente para ver el contenido correspondiente a cada rol.
*   **Respuesta Exitosa:**
    ```json
    {
      "statusCode": number,
      "message": "Mensaje en español para UI",
      "data": object | array | null,
      "timestamp": "ISO-8601"
    }
    ```

### Convencion de IDs en ejemplos
Los IDs mostrados en ejemplos (`"123"`, `"pc1-id"`, `"courseCycleId"`) son referenciales.
No son valores literales para copiar/pegar.

Flujo esperado para frontend:

1. Consultar primero recursos base para obtener IDs reales.
2. Reutilizar esos IDs en operaciones de escritura.
3. Validar que cada `...Id` pertenezca al contexto correcto (curso/ciclo/evaluacion).

---

## 📅 ÉPICA: CALENDARIO Y CLASES EN VIVO (`/class-events`)

Gestión de sesiones sincrónicas vinculadas a evaluaciones. Incluye lógica de acceso dinámico diferenciando entre clase en vivo y grabaciones.

### 1. Calendario Unificado (Mi Horario)
Obtiene todas las sesiones programadas para el usuario (alumno o profesor) dentro de un rango de fechas específico.
*   **Endpoint:** `GET /class-events/my-schedule`
*   **Query Params (Obligatorios):** `start` (ISO), `end` (ISO).
*   **Roles:** `STUDENT`, `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
*   **Data (Response):** 
    ```json
    [
      {
        "id": string,
        "sessionNumber": number,
        "title": string,
        "topic": string,
        "startDatetime": "ISO-8601",
        "endDatetime": "ISO-8601",
        "liveMeetingUrl": string | null, // URL de Zoom/Meet. Enmascarada si canJoinLive es false.
        "recordingUrl": string | null,   // URL de grabación. Enmascarada si canWatchRecording es false.
        "recordingStatus": "NOT_AVAILABLE" | "PROCESSING" | "READY" | "FAILED",
        "isCancelled": boolean,
        "status": "PROGRAMADA" | "EN_CURSO" | "FINALIZADA" | "CANCELADA",
        "canJoinLive": boolean,       // true si la clase está activa y el usuario tiene acceso
        "canWatchRecording": boolean, // true si hay grabación disponible y el usuario tiene acceso
        "canCopyLiveLink": boolean,   // true si el usuario puede copiar el link de vivo
        "canCopyRecordingLink": boolean, // true si puede copiar el link de grabacion
        "courseName": string,
        "courseCode": string,
        "evaluationName": string, // e.g. "PC1"
        "creator": { "id": string, "firstName": string, "lastName1": string, "profilePhotoUrl": string | null },
        "professors": [ { "id": string, "firstName": string, "lastName1": string, "profilePhotoUrl": string | null } ]
      }
    ]
    ```

### 2. Listar Eventos de una Evaluación
*   **Endpoint:** `GET /class-events/evaluation/:evaluationId`
*   **Roles:** `STUDENT`, `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
*   **Data (Response):** `[ { ...ClassEventResponseDto } ]` (Ver estructura arriba).

### 3. Detalle de un Evento
*   **Endpoint:** `GET /class-events/:id`
*   **Data (Response):** Mismo objeto que en Calendario Unificado.

### 4. Crear Nuevo Evento (Docente/Admin)
*   **Endpoint:** `POST /class-events`
*   **Roles:** `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
*   **Request Body:**
    ```typescript
    {
      "evaluationId": string,
      "sessionNumber": number,
      "title": string,
      "topic": string,
      "startDatetime": "ISO-8601",
      "endDatetime": "ISO-8601",
      "liveMeetingUrl": string // URL válida de Zoom/Meet/Teams
    }
    ```

### 5. Actualizar / Cancelar Evento
*   **Patch:** `PATCH /class-events/:id` (Actualiza campos opcionales).
    *   **Fields:** `title`, `topic`, `startDatetime`, `endDatetime`, `liveMeetingUrl`, `recordingUrl`.
*   **Cancel:** `DELETE /class-events/:id/cancel` (Marca como cancelada).

### 5. Gestión de Profesores Invitados (Admin)
Permite que otros profesores también sean anfitriones del evento.
*   **POST /class-events/:id/professors:** `body: { professorUserId: string }`
*   **DELETE /class-events/:id/professors/:professorId:** Quitar acceso.
*   **Roles:** `ADMIN`, `SUPER_ADMIN`.

---

## 📅 ÉPICA: GESTIÓN ACADÉMICA CORE (`/cycles`, `/courses`)

### 1. Ciclos Académicos (`/cycles`)
*   **GET /api/v1/cycles**: Listar todos los ciclos. (Roles: `ADMIN`, `SUPER_ADMIN`).
*   **GET /api/v1/cycles/active**: Obtener el ciclo activo actual. (Roles: Público/Auth).
*   **GET /api/v1/cycles/:id**: Detalle de un ciclo. (Roles: `ADMIN`).
*   **Data (Response):**
    ```json
    {
      "id": "string",
      "code": "2026-1",
      "startDate": "2026-01-01T00:00:00Z",
      "endDate": "2026-06-30T23:59:59Z"
    }
    ```

### 2. Cursos y Materias (`/courses`)

#### Dashboard: Mis Cursos Matriculados
Obtiene el listado de cursos donde el alumno tiene una matrícula activa.
*   **Endpoint:** `GET /enrollments/my-courses`
*   **Roles:** `STUDENT`, `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
*   **Caché:** 1 hora.
*   **Data (Response):** (Ver estructura actual en Dashboard Alumno)

#### Detalle de Curso: Estructura y Estados de Acceso
*   **Endpoint:** `GET /courses/cycle/:courseCycleId/content`
*   **Roles:** `STUDENT`, `PROFESSOR`, `ADMIN` (Ver estructura actual)

#### Operaciones Administrativas (Admin/SuperAdmin)
*   **POST /courses**: Crear materia base.
    *   `body: { "code": "string", "name": "string", "courseTypeId": "ID", "cycleLevelId": "ID", "primaryColor": "string (permite null)", "secondaryColor": "string (permite null)" }`
*   **PATCH /courses/:id**: Actualizar materia (nombre, código, colores).
    *   **Nota:** Invalida automáticamente cachés de Dashboard y Horarios.
*   **POST /courses/assign-cycle**: Aperturar materia en un ciclo (Crea CourseCycle).
    *   `body: { "courseId": "ID", "academicCycleId": "ID" }`
*   **POST /courses/cycle/:id/professors**: Asignar profesor a la plana del curso.
    *   `body: { "professorUserId": "ID" }`
*   **DELETE /courses/cycle/:id/professors/:professorUserId**: Remover profesor del curso.

---

## 📝 ÉPICA: EVALUACIONES ACADÉMICAS (`/evaluations`)

Gestión de los hitos evaluativos (PC, EX, etc.) a los que se vinculan las sesiones y materiales.

### 1. Crear Evaluación (Admin)
Define una nueva evaluación dentro de un curso/ciclo.
*   **Endpoint:** `POST /evaluations`
*   **Roles:** `ADMIN`, `SUPER_ADMIN`
*   **Request Body:**
    ```json
    {
      "courseCycleId": "string",
      "evaluationTypeId": "string (ID obtenido de /courses/types)",
      "number": number, // e.g. 1 para PC1
      "startDate": "ISO-8601",
      "endDate": "ISO-8601"
    }
    ```
*   **Automatización:** Al crearla, todos los alumnos con matrícula `FULL` reciben acceso automáticamente.

### 2. Listar Evaluaciones de un Curso
*   **Endpoint:** `GET /evaluations/course-cycle/:courseCycleId`
*   **Roles:** `ADMIN`, `SUPER_ADMIN`
*   **Data (Response):** Array de evaluaciones con su tipo y fechas.

---

## 📁 ÉPICA: REPOSITORIO DE MATERIALES (`/materials`)

### 1. Navegación de Carpetas (Explorador)
Permite navegar la jerarquía de una evaluación. Requiere matrícula en la evaluación.
*   **Endpoints:**
    *   `GET /materials/folders/evaluation/:evaluationId` (Carpetas raíz)
    *   `GET /materials/folders/:folderId` (Contenido de una carpeta)
*   **GET /materials/class-event/:classEventId**: Obtiene materiales vinculados a una sesión específica.
*   **Roles:** `STUDENT`, `PROFESSOR`, `ADMIN`
*   **Data (Response de Contenido):**
    ```json
    {
      "folders": [ { "id": string, "name": string, "visibleFrom": string } ],
      "materials": [
        {
          "id": string,
          "displayName": string,
          "fileVersionId": string,
          "createdAt": string,
          "classEventId": string | null
        }
      ]
    }
    ```

### 2. Descarga de Archivos
*   **Endpoint:** `GET /materials/:id/download`
*   **Roles:** `STUDENT` (con acceso), `PROFESSOR`, `ADMIN`
*   **Comportamiento:** Retorna stream binario con headers `Content-Type` y `Content-Disposition`.

### 3. Gestión Administrativa (Upload/Config)
*   **POST /materials/folders:** Crear carpeta.
    *   `body: { evaluationId: string, parentFolderId?: string, name: string, visibleFrom?: string }`
*   **POST /materials:** Subir archivo nuevo.
    *   `Content-Type: multipart/form-data`
    *   `body: { file: Buffer, materialFolderId: string, displayName: string, classEventId?: string }`
*   **POST /materials/:id/versions:** Actualizar versión de archivo existente.
    *   `body: { file: Buffer }`
*   **POST /materials/request-deletion:** Flujo seguro de borrado.
    *   `body: { entityType: 'material' | 'folder', entityId: string, reason: string }`

### 4. Gestión Administrativa Avanzada (Moderación)
*   **GET /admin/materials/requests/pending:** Listar solicitudes de eliminación pendientes.
    *   **Roles:** `ADMIN`, `SUPER_ADMIN`
*   **POST /admin/materials/requests/:id/review:** Aprobar o rechazar solicitud.
    *   **Roles:** `ADMIN`, `SUPER_ADMIN`
    *   `body: { action: 'APPROVE' | 'REJECT', rejectReason?: string }`
*   **DELETE /admin/materials/:id/hard-delete:** Eliminación física permanente (irreversible).
    *   **Roles:** `SUPER_ADMIN`

---

## 💬 ÉPICA: FEEDBACK Y REPUTACIÓN (`/feedback`)

### 1. Enviar Testimonio (Alumno)
*   **Endpoint:** `POST /feedback`
*   **Roles:** `STUDENT` (con matrícula activa)
*   **Content-Type:** `multipart/form-data` (Si incluye foto).
*   **Request Body:**
    *   `courseCycleId`: string
    *   `rating`: number (0-5)
    *   `comment`: string (min 10 caracteres)
    *   `photoSource`: 'uploaded' | 'profile' | 'none'
    *   `photo?`: File (Opcional, solo si source es 'uploaded')
*   **Validación:** Solo 1 opinión por curso/ciclo.

### 2. Listar Destacados (Público/Web)
*   **Endpoint:** `GET /feedback/public/course-cycle/:id`
*   **Auth:** No requerida.
*   **Caché:** 10 minutos.
*   **Data (Response):**
    ```json
    [
      {
        "id": string,
        "displayOrder": number,
        "courseTestimony": {
          "rating": number,
          "comment": string,
          "photoUrl": string | null,
          "user": { "firstName": string, "lastName1": string, "profilePhotoUrl": string | null }
        }
      }
    ]
    ```

### 3. Moderación (Administrador)
*   **GET /feedback/admin/course-cycle/:id:** Listado completo para gestión.
*   **POST /feedback/admin/:testimonyId/feature:** Destacar testimonio en la web.
    *   `body: { isActive: boolean, displayOrder: number }`
    *   **Efecto:** Invalida automáticamente el caché público.
