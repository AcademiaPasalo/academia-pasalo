# PLAN DE IMPLEMENTACIÓN - FASE 6: FEEDBACK Y REPUTACIÓN
========================================================

## OBJETIVO
Implementar el sistema de testimonios de cursos, permitiendo a los alumnos calificar su experiencia académica y a los administradores moderar/destacar estos comentarios para fines de marketing y calidad.

## ALCANCE TÉCNICO
Basado estrictamente en las tablas: `course_testimony` y `featured_testimony`.

---

## 1. LÓGICA DE NEGOCIO Y REGLAS (HARD RULES)

### A. Creación de Testimonios (Alumno)
1.  **Validación de Acceso:**
    *   Un usuario SOLO puede crear un testimonio para un `course_cycle_id` si posee una matrícula (`enrollment`) asociada a dicho ciclo.
    *   *Mecanismo:* Consultar `EnrollmentRepository` antes de insertar.
2.  **Unicidad (Anti-Spam):**
    *   Restricción de Base de Datos: `UNIQUE(user_id, course_cycle_id)`.
    *   Un alumno solo tiene un "voto" por ciclo cursado.
3.  **Manejo de Imágenes:**
    *   El usuario puede elegir usar su foto de perfil (`source='profile'`) o subir una nueva (`source='uploaded'`).
    *   Si es `uploaded`, se debe usar `StorageService` y guardar la URL resultante.
4.  **Escala de Valoración:**
    *   El `rating` debe ser un entero estricto entre 0 y 5.

### B. Moderación y Publicación (Administrador)
1.  **Visibilidad Pública:**
    *   Por defecto, un testimonio creado NO aparece en la Landing Page pública del curso.
    *   Para ser público, debe existir un registro en `featured_testimony` con `is_active = true`.
2.  **Destacar Testimonio:**
    *   El administrador selecciona un testimonio existente y lo "promueve" a destacado, asignándole un `display_order`.

---

## 2. ESTRUCTURA DE DATOS (ENTITIES)

### `CourseTestimony`
*   `id` (PK)
*   `userId` (FK -> User)
*   `courseCycleId` (FK -> CourseCycle)
*   `rating` (0-5)
*   `comment` (Text)
*   `photoUrl` (Nullable)
*   `photoSource` (Enum: profile, uploaded, none)

### `FeaturedTestimony`
*   `id` (PK)
*   `courseCycleId` (FK) -> *Nota: Redundancia controlada para búsquedas rápidas por ciclo.*
*   `courseTestimonyId` (FK -> CourseTestimony)
*   `displayOrder` (Int)
*   `isActive` (Bool)

---

## 3. API ENDPOINTS (PROPUESTA)

### Alumno
*   `POST /feedback`: Crear testimonio (Multipart si hay foto).
*   `GET /feedback/my-testimony/:courseCycleId`: Ver su propio testimonio.

### Público
*   `GET /feedback/public/course/:courseId`: Listar testimonios destacados (Marketing).

### Administración
*   `GET /feedback/admin/cycle/:courseCycleId`: Ver todos los testimonios (incluyendo no destacados).
*   `POST /feedback/admin/feature`: Destacar/Ocultar testimonio.

---

## 4. ESTRATEGIA DE IMPLEMENTACIÓN

1.  **Capa de Dominio:** Crear Entidades y Repositorios.
2.  **Capa de Aplicación:** `FeedbackService`.
    *   Inyectar `StorageService` para fotos.
    *   Inyectar `EnrollmentRepository` (o servicio) para validar permisos.
3.  **Capa de Presentación:** `FeedbackController`.
    *   Tests de Seguridad RBAC (Metadata Testing).
4.  **Verificación:** Tests unitarios cubriendo los casos de duplicidad y validación de matrícula.
