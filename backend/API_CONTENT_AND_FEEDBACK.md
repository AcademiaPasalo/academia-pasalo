# API DOCUMENTATION: CONTENT & FEEDBACK MANAGEMENT
==================================================

Esta API gestiona dos pilares fundamentales de la experiencia educativa:
1.  **Materiales Educativos:** Repositorio de archivos, carpetas y versionado.
2.  **Feedback y Reputación:** Sistema de testimonios y calificación de cursos.

## 🔐 Autenticación Global
*   **Header:** `Authorization: Bearer <access_token>`
*   **Códigos de Respuesta Comunes:**
    *   `401 Unauthorized`: Token inválido o expirado.
    *   `403 Forbidden`: Rol insuficiente o falta de matrícula.
    *   `404 Not Found`: Recurso no existe.
    *   `500 Internal Server Error`: Error del servidor.

---

## 1. MÓDULO DE MATERIALES (`/materials`)

### A. Gestión de Carpetas

#### 1. Crear Carpeta
*   **Endpoint:** `POST /materials/folders`
*   **Roles:** `ADMIN`, `PROFESSOR`
*   **Body (JSON):**
    ```json
    {
      "evaluationId": "100",      // ID de la Evaluación contenedora
      "parentFolderId": "50",     // (Opcional) ID de carpeta padre. Null para raíz.
      "name": "Semana 1",
      "visibleFrom": "2026-02-01T00:00:00Z"
    }
    ```
*   **Respuesta (201):** Objeto `MaterialFolder` creado.

#### 2. Listar Carpetas Raíz
*   **Endpoint:** `GET /materials/folders/evaluation/:evaluationId`
*   **Roles:** `STUDENT` (Matriculado), `PROFESSOR`, `ADMIN`
*   **Respuesta (200):** Array de `MaterialFolder` que no tienen padre.

#### 3. Ver Contenido de Carpeta
*   **Endpoint:** `GET /materials/folders/:folderId`
*   **Roles:** `STUDENT` (Matriculado), `PROFESSOR`, `ADMIN`
*   **Respuesta (200):**
    ```json
    {
      "folders": [ ... ],   // Subcarpetas
      "materials": [ ... ]  // Archivos
    }
    ```

### B. Gestión de Archivos

#### 1. Subir Material (Upload)
*   **Endpoint:** `POST /materials`
*   **Roles:** `ADMIN`, `PROFESSOR`
*   **Content-Type:** `multipart/form-data`
*   **Body (Form-Data):**
    *   `file`: (Binary) Archivo a subir.
    *   `materialFolderId`: (String) ID de la carpeta destino.
    *   `displayName`: (String) Nombre visible.
*   **Respuesta (201):** Objeto `Material` creado.

#### 2. Descargar Material
*   **Endpoint:** `GET /materials/:id/download`
*   **Roles:** `STUDENT` (Matriculado), `PROFESSOR`, `ADMIN`
*   **Respuesta (200):** Stream binario del archivo.
    *   *Header:* `Content-Disposition: attachment; filename="..."`

#### 3. Solicitar Eliminación
*   **Endpoint:** `POST /materials/request-deletion`
*   **Roles:** `ADMIN`, `PROFESSOR`
*   **Body (JSON):**
    ```json
    {
      "entityType": "material", // o "folder"
      "entityId": "123",
      "reason": "Archivo duplicado"
    }
    ```
*   **Respuesta (200):** `{ message: "Solicitud registrada" }`

---

## 2. MÓDULO DE FEEDBACK (`/feedback`)

... (contenido anterior) ...

## 3. MÓDULO DE MATRÍCULAS (`/enrollments`)

### A. Alumnos (Dashboard)

#### 1. Ver mis Cursos Matriculados
Obtiene el listado completo de cursos donde el alumno está inscrito, con detalles del ciclo y profesores.
*   **Endpoint:** `GET /enrollments/my-courses`
*   **Roles:** `STUDENT`, `ADMIN`
*   **Caché:** 1 hora (Se invalida automáticamente al matricularse en un nuevo curso).
*   **Respuesta (200):**
    ```json
    {
      "statusCode": 200,
      "message": "Listado de cursos obtenido exitosamente",
      "data": [
        {
          "id": "1",
          "enrolledAt": "2026-01-20T10:00:00Z",
          "courseCycle": {
            "id": "10",
            "course": {
              "id": "101",
              "code": "FIS-1",
              "name": "Física I"
            },
            "academicCycle": {
              "id": "5",
              "code": "2026-1",
              "startDate": "2026-01-01",
              "endDate": "2026-06-30",
              "isCurrent": true
            },
            "professors": [
              {
                "id": "15",
                "firstName": "Juan",
                "lastName1": "Pérez",
                "lastName2": "García",
                "profilePhotoUrl": "https://..."
              }
            ]
          }
        }
      ]
    }
    ```


### A. Alumnos (Creación)

#### 1. Crear Testimonio
Permite a un alumno calificar un curso/ciclo en el que está matriculado.
*   **Endpoint:** `POST /feedback`
*   **Roles:** `STUDENT`
*   **Content-Type:** `multipart/form-data` (Si sube foto) o `application/json` (Si no).
*   **Body:**
    *   `courseCycleId`: (String) ID del Ciclo del Curso.
    *   `rating`: (Int) 0 a 5.
    *   `comment`: (String) Opinión.
    *   `photoSource`: (Enum) `'uploaded'`, `'profile'`, `'none'`.
    *   `photo`: (Binary, Opcional) Solo si `photoSource` es `uploaded`.
*   **Validaciones:**
    *   Debe tener matrícula activa.
    *   No puede haber opinado antes sobre el mismo ciclo (Error 409 Conflict).
*   **Respuesta (201):** Objeto `CourseTestimony` creado.

### B. Público (Marketing)

#### 1. Listar Testimonios Públicos
Obtiene los testimonios destacados para mostrar en la web del curso.
*   **Endpoint:** `GET /feedback/public/course-cycle/:id`
*   **Roles:** Público (Sin Auth requerida).
*   **Cache:** Respuesta cacheada por 10 minutos.
*   **Respuesta (200):** Array de `FeaturedTestimony` (incluye datos del usuario y comentario).

### C. Administración (Moderación)

#### 1. Listar Todos los Testimonios
*   **Endpoint:** `GET /feedback/admin/course-cycle/:id`
*   **Roles:** `ADMIN`, `SUPER_ADMIN`
*   **Respuesta (200):** Todos los testimonios (ocultos y visibles).

#### 2. Destacar/Ocultar Testimonio
*   **Endpoint:** `POST /feedback/admin/:id/feature`
*   **Roles:** `ADMIN`, `SUPER_ADMIN`
*   **Body (JSON):**
    ```json
    {
      "isActive": true,      // true = Mostrar en web pública
      "displayOrder": 1      // Orden de aparición
    }
    ```
*   **Respuesta (200):** Objeto `FeaturedTestimony` actualizado.
*   **Efecto:** Invalida el caché público inmediatamente.
