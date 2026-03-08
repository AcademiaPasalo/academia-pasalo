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
        "recordingUrl": string | null,   // URL de grabacion en formato preview/embed
        "recordingStatus": "NOT_AVAILABLE" | "PROCESSING" | "READY" | "FAILED",
        "isCancelled": boolean,
        "canJoinLive": boolean,
        "canWatchRecording": boolean, // true solo cuando recordingStatus = READY
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
- **POST /courses/setup**: Alta integral de curso/ciclo (orquestado en un solo endpoint).
    * **Roles:** `ADMIN`, `SUPER_ADMIN`
    * **Objetivo:** crear curso + course_cycle + estructura de evaluaciones + evaluaciones reales + plantilla de carpetas de materiales + provision Drive (evaluaciones y course_cycle).
    * **Body (resumen):**
      ```json
      {
        "course": {
          "code": "MATE101",
          "name": "Calculo I",
          "courseTypeId": "1",
          "cycleLevelId": "1",
          "primaryColor": "#0E7490",
          "secondaryColor": "#F59E0B"
        },
        "academicCycleId": "8",
        "allowedEvaluationTypeIds": ["1", "2", "3"],
        "evaluationsToCreate": [
          {
            "evaluationTypeId": "1",
            "number": 1,
            "startDate": "2026-03-10",
            "endDate": "2026-07-20"
          }
        ],
        "professorUserIds": ["2"],
        "materialsTemplate": {
          "applyToEachEvaluation": true,
          "roots": [
            { "name": "Sesiones", "subfolderNames": [] },
            { "name": "Material Adicional", "subfolderNames": ["Resumenes", "Enunciados"] }
          ]
        }
      }
      ```
    * **Notas clave:**
      - `evaluationsToCreate` define las evaluaciones reales (type + number). No se envia count.
      - El banco enunciados (number=0) se crea por `assign-cycle`.
      - Las cards/carpetas de banco se derivan de las evaluaciones reales creadas.
      - Provisiona inmediatamente:
        - scope Drive por evaluacion (`evaluations/.../ev_*`)
        - scope Drive por course_cycle (`course_cycles/.../cc_*`) con `intro_video` y `bank_documents`.
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
- **Flujo frontend recomendado (tab Material adicional):
    * Paso 1: al abrir el tab, llamar GET /materials/folders/evaluation/:evaluationId.
    * Paso 2: tomar el id de la carpeta raiz Material adicional y llamar GET /materials/folders/:folderId.
    * Resultado esperado: cards Resumenes y Enunciados con su contador en subfolderMaterialCount.
    * Lazy loading: solo cuando el usuario haga click en una card, volver a llamar GET /materials/folders/:folderId de esa subcarpeta para listar archivos.
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

### 2. Descarga y Link Autorizado de Archivos
- **Endpoint:** `GET /materials/:id/download`
- **Roles:** `STUDENT` (con acceso), `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
- **Comportamiento:** retorna stream binario con headers `Content-Type` y `Content-Disposition`.
- **Notas de backend:**
    * Para recursos locales/proxy, este endpoint es la salida principal de descarga.
    * Para recursos Drive, el backend igual valida alcance por evaluacion antes de devolver datos.

- **Endpoint:** `GET /materials/:id/authorized-link?mode=view|download`
- **Roles:** `STUDENT` (con acceso), `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
- **Query Params:**
    * `mode`: `view` | `download`
- **Response (`data`):**
    * `contentKind`: `DOCUMENT`
    * `accessMode`: `DIRECT_URL` | `BACKEND_PROXY`
    * `evaluationId`: string
    * `driveFileId`: string | null
    * `url`: string
    * `expiresAt`: string | null
    * `requestedMode`: `view` | `download`
    * `fileName`: string
    * `mimeType`: string
    * `storageProvider`: `LOCAL` | `GDRIVE` | `S3`
- **Validaciones criticas (si storage es GDRIVE):**
    * valida que el material pertenezca a la evaluacion autorizada para el usuario.
    * valida que el archivo este dentro de la subcarpeta de documentos del scope Drive de esa evaluacion.
    * si el archivo esta fuera del scope esperado, responde `403`.
### 3. Gestión Administrativa (Upload/Config)
- **POST /materials/folders:** Crear carpeta.
    * `body: { evaluationId: string, parentFolderId?: string, name: string, visibleFrom?: string, visibleUntil?: string }`
    * Regla: se permiten hasta 3 niveles maximos. Intentar crear un cuarto nivel responde `400`.
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

### 4. Gestion Administrativa Avanzada (Moderacion)
- **GET /admin/materials/requests/pending:** listar solicitudes pendientes de eliminacion con metadata del material para decision administrativa.
    * **Roles:** `ADMIN`, `SUPER_ADMIN`
    * **Response (`data`):** array con objetos:
      - `id`: string (requestId)
      - `entityType`: string
      - `entityId`: string
      - `reason`: string | null
      - `createdAt`: string ISO
      - `requestedBy`: object
      - `requestedBy.id`: string
      - `requestedBy.email`: string | null
      - `requestedBy.firstName`: string | null
      - `requestedBy.lastName1`: string | null
      - `requestedBy.lastName2`: string | null
      - `material`: object | null
      - `material.id`: string
      - `material.displayName`: string | null
      - `material.originalName`: string | null
      - `material.mimeType`: string | null
      - `material.storageProvider`: `LOCAL` | `GDRIVE` | `S3` | null
      - `material.previewUrl`: string | null (Drive `/preview` cuando aplica)
      - `material.viewUrl`: string | null (Drive `/view` cuando aplica)
      - `material.downloadUrl`: string | null (Drive directo o proxy `/materials/:id/download`)
      - `material.authorizedViewPath`: string | null (`/materials/:id/authorized-link?mode=view`)
    * **Notas de integracion frontend:**
      - usar `material.displayName` como etiqueta principal en tabla/listado.
      - usar `material.originalName` como apoyo tecnico para distinguir archivos similares.
      - en UI de revision, priorizar `authorizedViewPath` para abrir contenido validado por backend.
      - `previewUrl/viewUrl/downloadUrl` son utilidades para inspeccion/operacion administrativa.
- **POST /admin/materials/requests/:id/review:** Aprobar o rechazar solicitud.
    * **Roles:** `ADMIN`, `SUPER_ADMIN`
    * `body: { action: 'APPROVE' | 'REJECT', adminComment?: string }`
- **DELETE /admin/materials/:id/hard-delete:** Eliminacion fisica permanente (irreversible).
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

## UPDATE FRONTEND CONTRACT - INTRO VIDEO POR CURSO/CICLO (2026-03-06)

Se agrega soporte para video introductorio a nivel `course_cycle` (no por evaluacion).

### 1) Admin - Configurar video introductorio

- Endpoint: `PATCH /courses/cycle/:id/intro-video`
- Roles: `ADMIN`, `SUPER_ADMIN`
- Body:
```json
{
  "introVideoUrl": "https://drive.google.com/file/d/<FILE_ID>/view"
}
```
- Reglas:
1. La URL debe ser de Google Drive.
2. Backend extrae y guarda internamente `intro_video_file_id`.
3. Si `introVideoUrl` viene vacio/null, se limpia el video introductorio del curso-ciclo.

### 2) Alumno/Profesor/Admin - Obtener link autorizado

- Endpoint: `GET /courses/cycle/:id/intro-video-link`
- Roles: `STUDENT`, `PROFESSOR`, `ADMIN`, `SUPER_ADMIN`
- Control de acceso:
1. `STUDENT`: requiere matricula activa en ese `course_cycle`.
2. `PROFESSOR`: requiere estar asignado a ese `course_cycle`.
3. `ADMIN`/`SUPER_ADMIN`: acceso permitido.
- Comportamiento de enlace:
1. Siempre retorna URL de Drive en formato `preview` (embed).
2. No expone opcion `mode` para video.
- Response 200:
```json
{
  "contentKind": "VIDEO",
  "accessMode": "DIRECT_URL",
  "courseCycleId": "4",
  "driveFileId": "<FILE_ID>",
  "url": "https://drive.google.com/file/d/<FILE_ID>/preview",
  "expiresAt": null,
  "requestedMode": "embed",
  "fileName": null,
  "mimeType": null,
  "storageProvider": "GDRIVE"
}
```






