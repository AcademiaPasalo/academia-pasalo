# ESPECIFICACIÓN TÉCNICA DE API: CONTENIDO, MATERIALES Y FEEDBACK
==================================================================

Esta API gestiona el núcleo de la experiencia académica: cursos, materiales educativos, testimonios y calendario de clases. Sigue el estándar de respuesta unificada del proyecto.

---

## Estándar de Comunicación
- **Base URL:** `/api/v1`
- **Auth:** Requiere `Authorization: Bearer <token>` (excepto en endpoints públicos).
- **Contexto de Rol Activo:** Todos los endpoints (ej. `/my-schedule`, `/my-courses`) responden basándose en el **perfil activo** seleccionado mediante `POST /auth/switch-profile`. Si un usuario tiene roles de `STUDENT` y `PROFESSOR`, debe cambiar de perfil explícitamente para ver el contenido correspondiente a cada rol.
- **Respuesta Exitosa:**
    ```json
    {
      "statusCode": number,
      "message": "Mensaje en español para UI",
      "data": object | array | null,
      "timestamp": "ISO-8601"
    }
    ```

### Convención de IDs en ejemplos
Los IDs mostrados en ejemplos (`"123"`, `"pc1-id"`, `"courseCycleId"`) son referenciales.
No son valores literales para copiar/pegar.

Flujo esperado para frontend:

1. Consultar primero recursos base para obtener IDs reales.
2. Reutilizar esos IDs en operaciones de escritura.
3. Validar que cada `...Id` pertenezca al contexto correcto (curso/ciclo/evaluación).

---

## ÉPICA: CALENDARIO Y CLASES EN VIVO (`/class-events`)

Gestión de sesiones sincrónicas vinculadas a evaluaciones. Incluye lógica de acceso dinámico diferenciando entre clase en vivo y grabaciones.

### 1. Calendario Unificado (Mi Horario)
Obtiene todas las sesiones programadas para el usuario (alumno o profesor) dentro de un rango de fechas específico.
- **Endpoint:** `GET /class-events/my-schedule`
- **Query Params (Obligatorios):** `start` (ISO), `end` (ISO).
- **Roles:** `STUDENT`, `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
- **Data (Response):** 
    ```json
    [
      {
        "id": string,
        "sessionNumber": number,
        "title": string,
        "topic": string,
        "startDatetime": "ISO-8601",
        "endDatetime": "ISO-8601",
        "liveMeetingUrl": string | null, // URL de Zoom/Meet (sin enmascarado en este DTO)
        "recordingUrl": string | null,   // URL de grabación (sin enmascarado en este DTO)
        "recordingStatus": "NOT_AVAILABLE" | "PROCESSING" | "READY" | "FAILED",
        "isCancelled": boolean,
        "status": "PROGRAMADA" | "EN_CURSO" | "FINALIZADA" | "CANCELADA",
        "canJoinLive": boolean,
        "canWatchRecording": boolean,
        "canCopyLiveLink": boolean,
        "canCopyRecordingLink": boolean,
        "courseName": string,
        "courseCode": string,
        "evaluationName": string, // e.g. "PC1"
        "creator": { "id": string, "firstName": string, "lastName1": string, "profilePhotoUrl": string | null },
        "professors": [ { "id": string, "firstName": string, "lastName1": string, "profilePhotoUrl": string | null } ]
      }
    ]
    ```

### 2. Descubrimiento de Capas por Categoría (Panel Lateral)
Devuelve cursos "hermanos" para superposición visual de horarios.
- **Endpoint:** `GET /class-events/discovery/layers/:courseCycleId`
- **Roles:** `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
- **Reglas:**
  - El `courseCycleId` debe existir.
  - Debe pertenecer al ciclo activo (`system_setting.ACTIVE_CYCLE_ID`).
  - Solo incluye cursos del mismo `course_type` y del mismo ciclo activo.
  - Excluye el `courseCycleId` origen.
- **Data (Response):**
    ```json
    [
      {
        "courseCycleId": "string",
        "courseId": "string",
        "courseCode": "MAT-101",
        "courseName": "Álgebra I",
        "primaryColor": "#1A73E8",
        "secondaryColor": "#D2E3FC",
        "courseTypeCode": "CIENCIAS"
      }
    ]
    ```

### 3. Sesiones Globales Multi-Curso (Render de Capas)
Obtiene sesiones agrupadas por curso-ciclo para pintar calendario comparativo.
- **Endpoint:** `GET /class-events/global/sessions`
- **Roles:** `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
- **Query Params (Obligatorios):**
  - `courseCycleIds`: CSV de IDs (`id1,id2,id3`)
  - `startDate`: ISO-8601
  - `endDate`: ISO-8601
- **Reglas:**
  - Todos los `courseCycleIds` deben pertenecer al mismo `course_type` y `academic_cycle`.
  - Si mezcla categoría/ciclo, backend responde `400`.
  - No devuelve eventos cancelados.
- **Data (Response):**
    ```json
    [
      {
        "courseCycleId": "string",
        "courseId": "string",
        "courseCode": "MAT-101",
        "courseName": "Álgebra I",
        "primaryColor": "#1A73E8",
        "secondaryColor": "#D2E3FC",
        "sessions": [
          {
            "eventId": "string",
            "evaluationId": "string",
            "sessionNumber": 1,
            "title": "Clase 1",
            "topic": "Introducción",
            "startDatetime": "2026-02-25T18:00:00.000Z",
            "endDatetime": "2026-02-25T20:00:00.000Z"
          }
        ]
      }
    ]
    ```

### 4. Listar Eventos de una Evaluación
- **Endpoint:** `GET /class-events/evaluation/:evaluationId`
- **Roles:** `STUDENT`, `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
- **Data (Response):** `[ { ...ClassEventResponseDto } ]` (Ver estructura arriba).

### 5. Detalle de un Evento
- **Endpoint:** `GET /class-events/:id`
- **Data (Response):** Mismo objeto que en Calendario Unificado.

### 6. Crear Nuevo Evento (Docente/Admin)
- **Endpoint:** `POST /class-events`
- **Roles:** `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
- **Request Body:**
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
- **Regla de colisión vigente:**
  - El backend valida solapamiento contra todos los cursos del mismo `course_type` dentro del mismo `academic_cycle`.
  - Excepción actual: `FACULTAD` queda aislado por su propio tipo.

### 7. Actualizar / Cancelar Evento
- **Patch:** `PATCH /class-events/:id` (Actualiza campos opcionales).
    * **Fields:** `title`, `topic`, `startDatetime`, `endDatetime`, `liveMeetingUrl`, `recordingUrl`.
- **Cancel:** `DELETE /class-events/:id/cancel` (Marca como cancelada).

### 8. Gestión de Profesores Invitados (Admin)
Permite que otros profesores también sean anfitriones del evento.
- **POST /class-events/:id/professors:** `body: { professorUserId: string }`
- **DELETE /class-events/:id/professors/:professorId:** Quitar acceso.
- **Roles:** `ADMIN`, `SUPER_ADMIN`.

---

## ÉPICA: GESTIÓN ACADÉMICA CORE (`/cycles`, `/courses`)

### 1. Ciclos Académicos (`/cycles`)
- **GET /api/v1/cycles**: Listar todos los ciclos. (Roles: `ADMIN`, `SUPER_ADMIN`).
- **GET /api/v1/cycles/active**: Obtener el ciclo activo actual. (Roles: Público/Auth).
- **GET /api/v1/cycles/:id**: Detalle de un ciclo. (Roles: `ADMIN`).
- **Data (Response):**
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
- **Endpoint:** `GET /enrollments/my-courses`
- **Roles:** `STUDENT`, `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
- **Caché:** 1 hora.
- **Data (Response):** (Ver estructura actual en Dashboard Alumno)

#### Detalle de Curso para Alumno (2 tabs y bandera)
Flujo recomendado para frontend cuando el alumno abre un curso:

1. Llamar `GET /courses/cycle/:courseCycleId/current` (tab por defecto: Ciclo Vigente).
2. Leer `canViewPreviousCycles`.
3. Si `canViewPreviousCycles = true`, mostrar tab `Ciclos Anteriores` y luego cargar:
   - `GET /courses/cycle/:courseCycleId/previous-cycles`
   - `GET /courses/cycle/:courseCycleId/previous-cycles/:cycleCode/content` (al hacer click en `Ver ciclo`)

**Endpoint 1: Ciclo Vigente**
- **Endpoint:** `GET /courses/cycle/:courseCycleId/current`
- **Roles:** `STUDENT`
- **Data (Response):**
    ```json
    {
      "courseCycleId": "string",
      "cycleCode": "2026-1",
      "canViewPreviousCycles": true,
      "evaluations": [
        {
          "id": "string",
          "evaluationTypeCode": "PC | EX | ...",
          "shortName": "PC1",
          "fullName": "Práctica Calificada 1",
          "hasAccess": true,
          "label": "Completado | En curso | Próximamente | Bloqueado"
        }
      ]
    }
    ```

Reglas de `label` en ciclo vigente:
1. `Completado`: fecha actual > fin de evaluacion.
2. `En curso`: fecha actual entre inicio y fin.
3. `Proximamente`: fecha futura y con acceso activo.
4. `Bloqueado`: sin acceso activo a esa evaluacion.

Nota de negocio:
- `Completado`, `En curso` y `Proximamente` son etiquetas informativas de estado academico.
- La etiqueta no bloquea contenido por si sola; el bloqueo real depende de `hasActiveAccess`.
- Con la regla actual de matriculas, toda evaluacion concedida mantiene acceso hasta fin de ciclo.
**Endpoint 2: Lista de Ciclos Anteriores**
- **Endpoint:** `GET /courses/cycle/:courseCycleId/previous-cycles`
- **Roles:** `STUDENT`
- **Data (Response):**
    ```json
    {
      "cycles": [
        { "cycleCode": "2025-2" },
        { "cycleCode": "2025-1" }
      ]
    }
    ```

Regla de visibilidad del tab:
1. Visible si matrícula del curso es `FULL`.
2. Visible si matrícula es `PARTIAL` y existe acceso a alguna evaluación de ciclos anteriores.
3. Si no cumple, backend responde `403`.

Cuando el tab es visible, la lista devuelve todos los ciclos anteriores del curso (no filtra ciclo por ciclo).

**Endpoint 3: Contenido de un Ciclo Anterior**
- **Endpoint:** `GET /courses/cycle/:courseCycleId/previous-cycles/:cycleCode/content`
- **Roles:** `STUDENT`
- **Data (Response):**
    ```json
    {
      "cycleCode": "2025-2",
      "evaluations": [
        {
          "id": "string",
          "evaluationTypeCode": "PC | EX | ...",
          "shortName": "PC1",
          "fullName": "Práctica Calificada 1",
          "hasAccess": false,
          "label": "Archivado | Bloqueado"
        }
      ]
    }
    ```

Regla de `label` en ciclo anterior:
1. `Archivado`: el alumno tiene acceso a esa evaluación.
2. `Bloqueado`: no tiene acceso a esa evaluación.

**Nota de seguridad**
El endpoint legado GET /courses/cycle/:courseCycleId/content queda para roles de staff (PROFESSOR, ADMIN, SUPER_ADMIN), no para STUDENT.
- Si el courseCycleId no existe, responde 404.
- Si el curso/ciclo existe pero el PROFESSOR no está asignado, responde 403.


#### Operaciones Administrativas (Admin/SuperAdmin)
- **POST /courses**: Crear materia base.
    * `body: { "code": "string", "name": "string", "courseTypeId": "ID", "cycleLevelId": "ID", "primaryColor": "string (permite null)", "secondaryColor": "string (permite null)" }`
- **PATCH /courses/:id**: Actualizar materia (nombre, código, colores).
    * **Nota:** Invalida automáticamente cachés de Dashboard y Horarios.
- **GET /courses/course-cycles**: Listado paginado de curso-ciclos para panel admin/superadmin.
    * Query params: page (default 1), pageSize (default 10, max 100), search (opcional).
    * Incluye courseCycleId, datos de curso, datos de ciclo, bandera isCurrent y métricas agregadas: evaluations, activeEnrollments, activeProfessors.
- **POST /courses/assign-cycle**: Aperturar materia en un ciclo (Crea CourseCycle).
    * `body: { "courseId": "ID", "academicCycleId": "ID" }`
- **POST /courses/cycle/:id/professors**: Asignar profesor a la plana del curso.
    * `body: { "professorUserId": "ID" }`
- **DELETE /courses/cycle/:id/professors/:professorUserId**: Remover profesor del curso.

---

## ÉPICA: EVALUACIONES ACADÉMICAS (`/evaluations`)

Gestión de los hitos evaluativos (PC, EX, etc.) a los que se vinculan las sesiones y materiales.

### 1. Crear Evaluación (Admin)
Define una nueva evaluación dentro de un curso/ciclo.
- **Endpoint:** `POST /evaluations`
- **Roles:** `ADMIN`, `SUPER_ADMIN`
- **Request Body:**
    ```json
    {
      "courseCycleId": "string",
      "evaluationTypeId": "string (ID obtenido de /courses/types)",
      "number": number, // e.g. 1 para PC1
      "startDate": "ISO-8601",
      "endDate": "ISO-8601"
    }
    ```
- **Automatizacion:** al crear una evaluacion nueva, el subscriber concede acceso automatico segun tipo.
  - `BANCO_ENUNCIADOS`: para toda matricula activa del curso/ciclo.
  - Resto de evaluaciones: solo para matriculas activas `FULL`.
  - En todos los casos, `accessStartDate` queda en inicio de ciclo academico y `accessEndDate` en fin de ciclo academico del curso base.

### 2. Listar Evaluaciones de un Curso
- **Endpoint:** `GET /evaluations/course-cycle/:courseCycleId`
- **Roles:** `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
- **Data (Response):** Array de evaluaciones con su tipo y fechas.
- **Reglas de alcance:**
    * Si el `courseCycleId` no existe, responde `404`.
    * Si el curso/ciclo existe pero el `PROFESSOR` no está asignado, responde `403`.

---

## ÉPICA: REPOSITORIO DE MATERIALES (`/materials`)

### 1. Navegación de Carpetas (Explorador)
Permite navegar la jerarquía de una evaluación. Requiere matrícula en la evaluación.
- **Endpoints:**
    * `GET /materials/folders/evaluation/:evaluationId` (Carpetas raíz)
    * `GET /materials/folders/:folderId` (Contenido de una carpeta)
- **GET /materials/class-event/:classEventId**: Obtiene materiales vinculados a una sesión específica.
- **Roles:** `STUDENT`, `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
- **Data (Response de Contenido):**
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
      ],
      "totalMaterials": number,
      "subfolderMaterialCount": {
        "subFolderId": number
      }
    }
    ```

### 2. Descarga de Archivos
- **Endpoint:** `GET /materials/:id/download`
- **Roles:** `STUDENT` (con acceso), `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
- **Comportamiento:** Retorna stream binario con headers `Content-Type` y `Content-Disposition`.

### 3. Gestión Administrativa (Upload/Config)
- **POST /materials/folders:** Crear carpeta.
    * `body: { evaluationId: string, parentFolderId?: string, name: string, visibleFrom?: string, visibleUntil?: string }`
    * Regla: solo se permiten 2 niveles (raíz y un nivel de subcarpeta). Un tercer nivel responde `400`.
- **POST /materials/folders/template:** Crear estructura fija de 2 niveles en una sola petición.
    * `body: { evaluationId: string, rootName: string, subfolderNames: string[], visibleFrom?: string, visibleUntil?: string }`
    * Validación: `subfolderNames` (1..50), sin vacíos, sin duplicados case-insensitive.
- **POST /materials:** Subir archivo nuevo.
    * `Content-Type: multipart/form-data`
    * `body: { file: Buffer, materialFolderId: string, displayName: string, classEventId?: string }`
- **POST /materials/:id/versions:** Actualizar versión de archivo existente.
    * `body: { file: Buffer }`
- **GET /materials/:id/last-modified:** Consultar fecha/hora de ultima modificacion de un material.
    * **Roles:** `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
    * **Path Params:**
      - `id`: string (materialId)
    * **Response (`data`):**
      - `materialId`: string
      - `lastModifiedAt`: string ISO-8601 (`updatedAt` del material; si es `null`, usa `createdAt`)
    * **Errores esperados:**
      - `403`: usuario sin permiso sobre la evaluacion/curso del material
      - `404`: material no existe o no tiene carpeta contenedora valida
    * **Notas de integracion frontend:**
      - Endpoint de solo lectura para mostrar "Ultima actualizacion" en cards, tablas o panel de detalle.
      - No requiere payload en body.
      - Recomendado llamar bajo demanda al abrir detalle de material, o en batch solo si UI realmente lo necesita.
- **POST /materials/request-deletion:** Flujo seguro de borrado.
    * `body: { entityType: 'material', entityId: string, reason: string }`

### 4. Gestión Administrativa Avanzada (Moderación)
- **GET /admin/materials/requests/pending:** Listar solicitudes de eliminación pendientes.
    * **Roles:** `ADMIN`, `SUPER_ADMIN`
- **POST /admin/materials/requests/:id/review:** Aprobar o rechazar solicitud.
    * **Roles:** `ADMIN`, `SUPER_ADMIN`
    * `body: { action: 'APPROVE' | 'REJECT', adminComment?: string }`
- **DELETE /admin/materials/:id/hard-delete:** Eliminación física permanente (irreversible).
    * **Roles:** `SUPER_ADMIN`

---

## ÉPICA: FEEDBACK Y REPUTACIÓN (`/feedback`)

### 1. Enviar Testimonio (Alumno)
- **Endpoint:** `POST /feedback`
- **Roles:** `STUDENT` (con matrícula activa)
- **Content-Type:** `multipart/form-data` (Si incluye foto).
- **Request Body:**
    * `courseCycleId`: string
    * `rating`: number (0-5)
    * `comment`: string (min 10 caracteres)
    * `photoSource`: 'uploaded' | 'profile' | 'none'
    * `photo?`: File (Opcional, solo si source es 'uploaded')
- **Validación:** Solo 1 opinión por curso/ciclo.

### 2. Listar Destacados (Público/Web)
- **Endpoint:** `GET /feedback/public/course-cycle/:id`
- **Auth:** No requerida.
- **Caché:** 10 minutos.
- **Data (Response):**
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
- **GET /feedback/admin/course-cycle/:id:** Listado completo para gestión.
- **POST /feedback/admin/:testimonyId/feature:** Destacar testimonio en la web.
    * `body: { isActive: boolean, displayOrder: number }`
    * **Efecto:** Invalida automáticamente el caché público.













---

## UPDATE FRONTEND CONTRACT - FASES 2, 3 Y 4 (2026-03-02)

Esta seccion resume los contratos actuales para frontend de forma estricta y sin ambiguedades.

### 1) Admin - Definir estructura por course_cycle

- Endpoint: `PUT /courses/cycle/:courseCycleId/evaluation-structure`
- Roles: `ADMIN`, `SUPER_ADMIN`
- Body:
```json
{
  "evaluationTypeIds": ["1", "2", "6"]
}
```
- Validaciones backend:
1. `courseCycleId` debe existir.
2. `evaluationTypeIds` no puede ser vacio.
3. No se permiten ids duplicados.
4. Todos los ids deben existir en `evaluation_type`.
5. Si la estructura enviada es igual a la actual, no se hacen escrituras (idempotente).
- Respuesta 200:
```json
{
  "courseCycleId": "4",
  "evaluationTypeIds": ["1", "2", "6"]
}
```
- Errores esperados:
1. `400` payload invalido (vacio, duplicados, ids inexistentes, ids vacios).
2. `404` course_cycle no existe.
3. `403` si rol no autorizado.

### 2) Alumno - Obtener estructura del tab Banco

- Endpoint: `GET /courses/cycle/:courseCycleId/bank-structure`
- Roles: `STUDENT`
- Reglas de acceso:
1. Requiere matricula activa en ese `courseCycleId`.
2. Si no tiene matricula activa: `403`.
- Respuesta 200:
```json
{
  "courseCycleId": "4",
  "cycleCode": "2026-0",
  "items": [
    {
      "evaluationTypeId": "2",
      "evaluationTypeCode": "EX",
      "evaluationTypeName": "Examen"
    },
    {
      "evaluationTypeId": "1",
      "evaluationTypeCode": "PC",
      "evaluationTypeName": "Practica Calificada"
    }
  ]
}
```
- Nota frontend:
1. Mostrar cards segun `items`.
2. No hardcodear tipos.
3. El orden llega desde backend (por code).

### 3) Admin - Crear evaluacion con validacion estricta de estructura

- Endpoint: `POST /evaluations`
- Roles: `ADMIN`, `SUPER_ADMIN`
- Body:
```json
{
  "courseCycleId": "4",
  "evaluationTypeId": "1",
  "number": 3,
  "startDate": "2026-03-10T05:00:00.000Z",
  "endDate": "2026-03-10T23:59:59.000Z"
}
```
- Reglas nuevas obligatorias:
1. `evaluationTypeId` debe existir en la estructura activa del `course_cycle`.
2. Si el `course_cycle` no tiene estructura activa: `400`.
3. Si el tipo no esta permitido en la estructura: `400`.
4. Se mantiene validacion de fechas dentro del ciclo academico.
- Errores esperados:
1. `400` tipo no permitido, estructura vacia, fechas invalidas, typeId vacio.
2. `404` course_cycle no existe.

### 4) Impacto esperado en frontend

1. En admin, configurar estructura por ciclo antes de crear evaluaciones nuevas.
2. En alumno, usar `bank-structure` para render del tab Banco.
3. No inferir acceso por labels.
4. Seguir usando `hasAccess` para habilitar o deshabilitar acciones por evaluacion.

### 5) Cache y consistencia

1. Cuando admin actualiza `evaluation-structure`, backend invalida:
   - cache de contenido por ciclo
   - cache de bank structure por ciclo
2. Cuando admin crea evaluacion (`POST /evaluations`), backend invalida cache de contenido por ciclo.
3. Con esto, frontend debe ver cambios sin esperar TTL largo.

### 6) SQL de desarrollo actualizado

Se actualizo `db/datos_prueba_cursos_y_matriculas.sql` para poblar `course_cycle_allowed_evaluation_type` en ciclos actual e historicos para los cursos de prueba.

Objetivo:
1. Permitir que `bank-structure` devuelva data real desde seed.
2. Permitir que `POST /evaluations` valide contra estructura activa desde seed.
3. Mantener entorno reproducible al recrear schema+data.
