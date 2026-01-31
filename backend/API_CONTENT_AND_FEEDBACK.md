# ESPECIFICACIÓN TÉCNICA DE API: CONTENIDO, MATERIALES Y FEEDBACK
==================================================================

Esta API gestiona el núcleo de la experiencia académica: cursos, materiales educativos, testimonios y calendario de clases. Sigue el estándar de respuesta unificada del proyecto.

---

## 🏗️ Estándar de Comunicación
*   **Base URL:** `/api/v1`
*   **Auth:** Requiere `Authorization: Bearer <token>` (excepto en endpoints públicos).
*   **Respuesta Exitosa:**
    ```json
    {
      "statusCode": number,
      "message": "Mensaje en español para UI",
      "data": object | array | null,
      "timestamp": "ISO-8601"
    }
    ```

---

## 📅 ÉPICA: CALENDARIO Y CLASES EN VIVO (`/class-events`)

Gestión de sesiones sincrónicas (Zoom/Google Meet) vinculadas a evaluaciones. Incluye lógica de acceso dinámico según el rol y estado de la clase.

### 1. Calendario Unificado (Mi Horario)
Obtiene todas las sesiones programadas para el usuario (alumno o profesor) dentro de un rango de fechas específico. Diseñado para manejar la navegación por semanas o meses mediante flechas.
*   **Endpoint:** `GET /class-events/my-schedule`
*   **Query Params (Obligatorios para navegación):**
    *   `start`: Fecha de inicio del rango (ISO-8601, ej: `2026-02-01`).
    *   `end`: Fecha de fin del rango (ISO-8601, ej: `2026-02-07`).
*   **Casos de Uso (Paginación):**
    *   **Gadget Semanal:** El frontend debe calcular el domingo inicial y sábado final de la semana que desea mostrar y enviarlos como `start` y `end`.
    *   **Calendario Mensual:** El frontend envía el primer y último día del mes.
*   **Roles:** `STUDENT`, `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
*   **Caché:** 30 minutos (basado en el rango de fechas). Si el usuario regresa a una semana/mes anterior, la respuesta será instantánea.
*   **Lógica de Negocio:**
    *   **Alumnos:** Trae eventos de todos sus cursos con matrícula activa y no cancelada.
    *   **Profesores:** Trae eventos donde el usuario es el creador o ha sido invitado como profesor.
    *   **Bypass:** El staff (Admin/Profesor) tiene `canJoinMeeting: true` siempre para sus propios eventos.
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
        "meetingLink": string, // URL de Zoom/Meet. Enmascarada si canJoinMeeting es false.
        "isCancelled": boolean,
        "status": "PROGRAMADA" | "EN_CURSO" | "FINALIZADA" | "CANCELADA",
        "canJoinMeeting": boolean, // true si la clase está activa y el usuario tiene acceso
        "canCopyLink": boolean,    // true si el usuario puede copiar el link
        "courseName": string,      // e.g. "Física I"
        "courseCode": string,      // e.g. "FIS101"
        "creator": {
          "id": string,
          "firstName": string,
          "lastName1": string,
          "profilePhotoUrl": string | null
        },
        "professors": [
          {
            "id": string,
            "firstName": string,
            "lastName1": string,
            "profilePhotoUrl": string | null
          }
        ],
        "createdAt": "ISO-8601",
        "updatedAt": "ISO-8601" | null
      }
    ]
    ```

### 2. Listar Eventos de una Evaluación
Obtiene todas las sesiones programadas para un examen o unidad específica.
*   **Endpoint:** `GET /class-events/evaluation/:evaluationId`
*   **Roles:** `STUDENT`, `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
*   **Lógica de Acceso:** 
    *   Staff: Acceso total.
    *   Alumnos: Requiere matrícula activa en la evaluación.
*   **Data (Response):** `[ { ...ClassEventResponseDto } ]` (Ver estructura arriba).

### 3. Detalle de un Evento
*   **Endpoint:** `GET /class-events/:id`
*   **Roles:** `STUDENT`, `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
*   **Data (Response):**
    ```json
    {
      "id": string,
      "sessionNumber": number,
      "title": string,
      "topic": string,
      "startDatetime": "ISO-8601",
      "endDatetime": "ISO-8601",
      "meetingLink": string, // Enmascarado si canJoinMeeting es false
      "isCancelled": boolean,
      "status": "PROGRAMADA" | "EN_CURSO" | "FINALIZADA" | "CANCELADA",
      "canJoinMeeting": boolean, // true si la clase es hoy/ahora y tienes permiso
      "canCopyLink": boolean,
      "courseName": string,
      "courseCode": string,
      "creator": { "id": string, "firstName": string, "lastName1": string, "profilePhotoUrl": string | null },
      "professors": [ { "id": string, "firstName": string, "lastName1": string, "profilePhotoUrl": string | null } ]
    }
    ```

### 3. Crear Nuevo Evento (Docente/Admin)
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
      "meetingLink": string // URL válida de Zoom/Meet/Teams
    }
    ```

### 4. Actualizar / Cancelar Evento
*   **Patch:** `PATCH /class-events/:id` (Actualiza campos opcionales).
*   **Cancel:** `DELETE /class-events/:id/cancel` (Marca como cancelada).
*   **Roles:** `PROFESSOR` (solo si es el creador), `ADMIN`, `SUPER_ADMIN`.

### 5. Gestión de Profesores Invitados (Admin)
Permite que otros profesores también sean anfitriones del evento.
*   **POST /class-events/:id/professors:** `body: { professorUserId: string }`
*   **DELETE /class-events/:id/professors/:professorId:** Quitar acceso.
*   **Roles:** `ADMIN`, `SUPER_ADMIN`.

---

## 📚 ÉPICA: CURSOS Y NAVEGACIÓN ACADÉMICA (`/courses`, `/enrollments`)

### 1. Dashboard: Mis Cursos Matriculados
Obtiene el listado de cursos donde el alumno tiene una matrícula activa.
*   **Endpoint:** `GET /enrollments/my-courses`
*   **Roles:** `STUDENT`, `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
*   **Caché:** 1 hora.
*   **Data (Response):**
    ```json
    [
      {
        "id": string, // ID de la matrícula
        "enrolledAt": string, // Fecha ISO
        "courseCycle": {
          "id": string, // ID para usar en detalle de curso
          "course": {
            "id": string,
            "code": string,
            "name": string,
            "courseType": { "code": string, "name": string }, // e.g. CIENCIAS
            "cycleLevel": { "name": string } // e.g. Ciclo 1
          },
          "academicCycle": {
            "id": string,
            "code": string, // e.g. 2026-1
            "isCurrent": boolean
          },
          "professors": [
            {
              "id": string,
              "firstName": string,
              "lastName1": string,
              "profilePhotoUrl": string | null
            }
          ]
        }
      }
    ]
    ```

### 2. Detalle de Curso: Estructura y Estados de Acceso
Obtiene todas las evaluaciones del curso y calcula dinámicamente si el usuario puede entrar.
*   **Endpoint:** `GET /courses/cycle/:courseCycleId/content`
*   **Roles:** `STUDENT`, `PROFESSOR`, `ADMIN`
*   **Data (Response):**
    ```json
    {
      "courseCycleId": string,
      "courseName": string,
      "courseCode": string,
      "cycleCode": string,
      "isCurrentCycle": boolean,
      "evaluations": [
        {
          "id": string,
          "name": string,
          "evaluationType": string, // e.g. "PRÁCTICA CALIFICADA"
          "startDate": string,
          "endDate": string,
          "userStatus": {
            "status": "LOCKED" | "UPCOMING" | "IN_PROGRESS" | "COMPLETED",
            "hasAccess": boolean, // true si pagó por esta evaluación
            "accessStart": string | null,
            "accessEnd": string | null
          }
        }
      ]
    }
    ```

---

## 📁 ÉPICA: REPOSITORIO DE MATERIALES (`/materials`)

### 1. Navegación de Carpetas (Explorador)
Permite navegar la jerarquía de una evaluación. Requiere matrícula en la evaluación.
*   **Endpoints:**
    *   `GET /materials/folders/evaluation/:evaluationId` (Carpetas raíz)
    *   `GET /materials/folders/:folderId` (Contenido de una carpeta)
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
          "createdAt": string
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
    *   `body: { file: Buffer, materialFolderId: string, displayName: string }`
*   **POST /materials/:id/versions:** Actualizar versión de archivo existente.
    *   `body: { file: Buffer }`
*   **POST /materials/request-deletion:** Flujo seguro de borrado.
    *   `body: { entityType: 'material' | 'folder', entityId: string, reason: string }`

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
