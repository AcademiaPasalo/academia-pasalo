# ESPECIFICACIÓN TÉCNICA DE API: CONTENIDO, MATERIALES Y FEEDBACK
==================================================================

Esta API gestiona el núcleo de la experiencia académica: cursos, materiales educativos y testimonios. Sigue el estándar de respuesta unificada del proyecto.

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

## 📚 ÉPICA: CURSOS Y NAVEGACIÓN ACADÉMICA (`/courses`, `/enrollments`)

### 1. Dashboard: Mis Cursos Matriculados
Obtiene el listado de cursos donde el alumno tiene una matrícula activa.
*   **Endpoint:** `GET /enrollments/my-courses`
*   **Roles:** `STUDENT`, `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
*   **Caché:** 1 hora.
*   **Data (Response):**
    ```typescript
    Array<{
      id: string; // ID de la matrícula
      enrolledAt: string; // Fecha ISO
      courseCycle: {
        id: string; // ID para usar en detalle de curso
        course: {
          id: string;
          code: string;
          name: string;
          courseType: { code: string; name: string; }; // e.g. CIENCIAS
          cycleLevel: { name: string; }; // e.g. Ciclo 1
        };
        academicCycle: {
          id: string;
          code: string; // e.g. 2026-1
          isCurrent: boolean;
        };
        professors: Array<{
          id: string;
          firstName: string;
          lastName1: string;
          profilePhotoUrl: string | null;
        }>;
      };
    }>
    ```

### 2. Detalle de Curso: Estructura y Estados de Acceso
Obtiene todas las evaluaciones del curso y calcula dinámicamente si el usuario puede entrar.
*   **Endpoint:** `GET /courses/cycle/:courseCycleId/content`
*   **Roles:** `STUDENT`, `PROFESSOR`, `ADMIN`
*   **Data (Response):**
    ```typescript
    {
      "courseCycleId": string,
      "courseName": string,
      "courseCode": string,
      "cycleCode": string,
      "isCurrentCycle": boolean,
      "evaluations": Array<{
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
      }>
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
    ```typescript
    {
      "folders": Array<{ id: string, name: string, visibleFrom: string }>,
      "materials": Array<{
        id: string,
        displayName: string,
        fileVersionId: string,
        createdAt: string
      }>
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
    ```typescript
    Array<{
      id: string,
      displayOrder: number,
      courseTestimony: {
        rating: number,
        comment: string,
        photoUrl: string | null,
        user: { firstName: string, lastName1: string, profilePhotoUrl: string | null }
      }
    }>
    ```

### 3. Moderación (Administrador)
*   **GET /feedback/admin/course-cycle/:id:** Listado completo para gestión.
*   **POST /feedback/admin/:testimonyId/feature:** Destacar testimonio en la web.
    *   `body: { isActive: boolean, displayOrder: number }`
    *   **Efecto:** Invalida automáticamente el caché público.