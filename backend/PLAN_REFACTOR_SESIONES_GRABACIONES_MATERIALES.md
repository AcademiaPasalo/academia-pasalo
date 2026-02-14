# Plan Profesional de Refactor: Sesiones, Grabaciones y Materiales de Clase

## 1. Objetivo del Refactor

Alinear el backend con la logica de negocio real de Academia Pasalo para:

1. Soportar sesiones de clase por evaluacion con flujo completo `en vivo -> grabacion`.
2. Permitir materiales especificos por sesion sin romper el material adicional por evaluacion.
3. Corregir autorizacion y exposicion de enlaces sensibles.
4. Mantener compatibilidad con versionado y deduplicacion existente.
5. Blindar con pruebas unitarias, integracion y e2e.

## 2. Alineamiento de Negocio Confirmado

Reglas cerradas y validadas:

1. Una evaluacion tiene multiples sesiones (`Clase 1`, `Clase 2`, etc.).
2. Cada documento de clase pertenece a una sola sesion (modelo actual de negocio).
3. Debe convivir:
   - Material adicional por evaluacion (carpetas/subcarpetas actuales).
   - Material de clase por sesion (nuevo).
4. Alumno PARTIAL:
   - Ve la raiz/listado de evaluaciones del curso.
   - Solo accede a evaluaciones en las que esta matriculado y con acceso vigente.
   - Sesiones, grabaciones y materiales solo durante vigencia de acceso.
5. No debe filtrarse URL sensible si el usuario no tiene permiso efectivo.

## 3. Problemas Detectados (Estado Actual)

1. `class_event` tiene un unico `meeting_link`; no distingue reunion en vivo vs grabacion.
2. La respuesta actual mezcla semanticas con `canJoinMeeting` (solo sirve para vivo).
3. El DTO expone `meetingLink` aunque el permiso sea denegado.
4. `my-schedule` filtra por matricula de curso y puede incluir sesiones fuera del acceso fino por evaluacion.
5. No existe relacion explicita para material de sesion.

## 4. Decisiones Tecnicas Aprobadas

### 4.1 Modelo de enlaces de sesion

Se separan enlaces:

1. `live_meeting_url` (nullable)
2. `recording_url` (nullable)

Opcional recomendado para operacion:

3. `recording_status` (`NOT_AVAILABLE | PROCESSING | READY | FAILED`)

Nota:

1. Si se decide minimizar cambios iniciales, `recording_status` puede diferirse a una fase posterior.

### 4.2 Modelo de material por sesion

Se agrega en `material`:

1. `class_event_id` nullable (FK a `class_event.id`)

Justificacion:

1. Cada documento pertenece a una sola sesion (sin necesidad de pivote).
2. Se mantiene material adicional por evaluacion (`class_event_id = null`).
3. Deduplicacion/versions no se rompen porque viven en `file_resource`/`file_version`.

### 4.3 Politica de seguridad de enlaces

Regla de salida API:

1. Si no hay permiso efectivo, no devolver URL sensible (`null`).
2. Front no decide acceso por inferencia de URL; usa flags de permiso del backend.

### 4.4 Autorizacion en calendario

`my-schedule` debe filtrar por acceso vigente en `enrollment_evaluation` para alumnos:

1. `is_active = 1`
2. `access_start_date <= NOW()`
3. `access_end_date >= NOW()`
4. Matricula no cancelada

Staff mantiene bypass por rol (con reglas actuales de asignacion).

## 5. Contrato API Objetivo

## 5.1 Class Events Response (objetivo)

Campos sugeridos:

1. `liveMeetingUrl: string | null`
2. `recordingUrl: string | null`
3. `status: PROGRAMADA | EN_CURSO | FINALIZADA | CANCELADA`
4. `canJoinLive: boolean`
5. `canWatchRecording: boolean`
6. `canCopyLiveLink: boolean`
7. `canCopyRecordingLink: boolean`

Comportamiento:

1. En `FINALIZADA`, `canJoinLive = false`.
2. `canWatchRecording = true` solo si hay `recordingUrl` y acceso vigente.
3. URL se retorna en `null` cuando no hay permiso.

### 5.2 Endpoints nuevos/ajustados (resumen)

1. `POST /class-events`
   - Crear sesion con `liveMeetingUrl` obligatorio o validacion equivalente definida por negocio.
2. `PATCH /class-events/:id`
   - Permitir actualizar `recordingUrl` y/o `recordingStatus` cuando corresponda.
3. `GET /class-events/evaluation/:evaluationId`
   - Retornar flags separados de vivo/grabacion.
4. `GET /class-events/my-schedule`
   - Filtro de acceso fino por evaluacion vigente para alumnos.
5. Materiales por sesion:
   - `GET /class-events/:id/materials`
   - `POST /class-events/:id/materials`
   - Opcional: `POST /class-events/:id/materials/:materialId/versions`

## 6. Estrategia por Fases

## Fase 0: Baseline y seguridad de despliegue

Objetivo:

1. Congelar comportamiento actual con pruebas de regresion.

Tareas:

1. Levantar snapshot de endpoints actuales (`class-events`, `materials`, `course content`).
2. Crear pruebas que documenten bug actual de filtrado de URL/acceso.

Criterio de salida:

1. Suite inicial verde.
2. Casos de bug reproduciendose de forma controlada.

## Fase 1: Modelo de datos y migraciones

Objetivo:

1. Preparar esquema para reunion/grabacion y materiales de sesion.

Tareas:

1. Migracion SQL:
   - `class_event.live_meeting_url`
   - `class_event.recording_url`
   - Opcional `class_event.recording_status`
2. Migracion SQL:
   - `material.class_event_id` nullable + FK + indice.
3. Backfill de datos:
   - `meeting_link` actual -> `live_meeting_url`.

Criterio de salida:

1. Entidades TypeORM sincronizadas con el nuevo esquema.
2. Migracion reversible validada.

## Fase 2: Dominio y servicios (class-events)

Objetivo:

1. Separar semantica de acceso vivo vs grabacion.

Tareas:

1. Refactor DTOs create/update/response.
2. Reemplazar `canAccessMeetingLink` por calculo dual:
   - `canJoinLive`
   - `canWatchRecording`
3. Aplicar politica de URL segura (`null` sin permiso).
4. Ajustar cache/invalidation si cambian campos clave.

Criterio de salida:

1. Endpoints de class-events responden con contrato nuevo.
2. No se exponen URL sin permiso.

## Fase 3: Autorizacion de `my-schedule` y consultas

Objetivo:

1. Corregir acceso fino por evaluacion para alumnos PARTIAL.

Tareas:

1. Refactor query `findByUserAndRange` para unir con `enrollment_evaluation` vigente.
2. Mantener excepciones/bypass para staff segun rol.
3. Agregar indices SQL si consulta lo requiere.

Criterio de salida:

1. Alumno solo ve sesiones de evaluaciones con acceso vigente.
2. Staff mantiene visibilidad correcta.

## Fase 4: Materiales por sesion

Objetivo:

1. Permitir asociar documentos a sesion sin romper flujo existente.

Tareas:

1. Extender upload para aceptar contexto de sesion.
2. Validar consistencia:
   - `material.class_event_id` pertenece a misma `evaluation_id` de carpeta.
3. Crear endpoints de consulta por sesion.
4. Mantener material adicional por evaluacion sin cambios.

Criterio de salida:

1. Docente puede crear sesion sin docs y agregarlos despues.
2. Alumno autorizado ve documentos de su sesion.
3. Deduplicacion/versionado siguen funcionando.

## Fase 5: Documentacion, hardening y e2e final

Objetivo:

1. Cerrar refactor con estandar profesional.

Tareas:

1. Actualizar `API_CONTENT_AND_FEEDBACK.md`.
2. Actualizar casos de seguridad en docs internas.
3. Ejecutar test unitarios + integracion + e2e de regresion.

Criterio de salida:

1. Documentacion alineada al contrato real.
2. Suite de pruebas completa en verde.

## 7. Plan de Pruebas (obligatorio)

## 7.1 Unitarias

Class Events:

1. `canJoinLive` por estado y rol.
2. `canWatchRecording` por existencia de `recordingUrl` y vigencia de acceso.
3. URL en `null` sin permiso.
4. Actualizacion de `recordingUrl` en evento finalizado.

Materials:

1. Upload con `classEventId` valido.
2. Rechazo por inconsistencia `classEvent.evaluationId != folder.evaluationId`.
3. Mantener deduplicacion por hash.
4. Mantener versionado al subir nueva version.

Schedule:

1. Alumno PARTIAL ve solo sesiones vigentes de evaluaciones compradas.
2. Alumno sin acceso no recibe sesiones no autorizadas.
3. Staff conserva acceso esperado.

## 7.2 Integracion

1. Flujo completo:
   - Crear sesion con vivo.
   - Finalizar clase.
   - Cargar `recordingUrl`.
   - Alumno autorizado ve grabacion.
2. Flujo PARTIAL:
   - Acceso solo a evaluaciones matriculadas.
3. Material de sesion:
   - Crear sin docs.
   - Cargar docs luego.
   - Descargar con permiso.

## 7.3 E2E

1. Contratos de response DTO completos.
2. Seguridad de URL no autorizada.
3. `my-schedule` con filtros temporales y acceso vigente.

## 8. Riesgos y Mitigaciones

1. Riesgo: romper frontend por cambio de campos.
   - Mitigacion: fase de compatibilidad temporal y versionado de contrato.
2. Riesgo: consulta de horario mas costosa.
   - Mitigacion: indices y cache con invalidacion precisa.
3. Riesgo: incoherencia entre carpeta/evaluacion/sesion.
   - Mitigacion: validaciones transaccionales estrictas.

## 9. Protocolo de Ejecucion por Fases

Regla operativa acordada:

1. Se implementa una fase a la vez.
2. Al cerrar cada fase:
   - Se actualiza este `.md` con estado y decisiones finales.
   - Se entrega resumen de cambios.
   - Se valida contigo antes de iniciar la siguiente fase.

## 10. Seguimiento de Estado

Estado actual:

1. Fase 0: COMPLETADA (2026-02-14)
2. Fase 1: COMPLETADA (2026-02-14)
3. Fase 2: COMPLETADA (2026-02-14)
4. Fase 3: COMPLETADA (2026-02-14)
5. Fase 4: COMPLETADA (2026-02-14)
6. Fase 5: PENDIENTE

Bitacora de avances:

1. 2026-02-14 - Fase 0 completada:
2. Se agrego prueba de caracterizacion para documentar exposicion actual de `meetingLink` aun con `canAccess=false` en `src/modules/events/dto/class-event-response.dto.spec.ts`.
3. Se agrego prueba baseline para documentar que `getMySchedule` retorna lo obtenido de repositorio sin filtro adicional de acceso fino por evaluacion en `src/modules/events/application/class-events.service.spec.ts`.
4. Ejecucion de pruebas focalizadas en verde:
5. `cmd /c npm test -- class-events.service.spec.ts class-event-response.dto.spec.ts --runInBand` -> 2 suites OK, 13 tests OK.
6. 2026-02-14 - Fase 1 completada:
7. Se actualizo `db/creacion_tablas_academia_pasalo_v1.sql`:
8. En `class_event`: `live_meeting_url` (NOT NULL), `recording_url` (NULL), `recording_status` (default `NOT_AVAILABLE` + check constraint).
9. En `material`: `class_event_id` nullable.
10. Se agrego FK `fk_material_class_event` mediante `ALTER TABLE` (posterior a creacion de `class_event` para respetar orden de dependencias).
11. Se agrego indice `idx_material_class_event`.
12. Se actualizo entidad `ClassEvent` (`src/modules/events/domain/class-event.entity.ts`) mapeando `meetingLink` a `live_meeting_url` y agregando `recordingUrl`/`recordingStatus`.
13. Se actualizo entidad `Material` (`src/modules/materials/domain/material.entity.ts`) con `classEventId` nullable y relacion opcional a `ClassEvent`.
14. Pruebas focalizadas en verde:
15. `cmd /c npm test -- class-events.service.spec.ts class-event-response.dto.spec.ts materials.service.spec.ts --runInBand` -> 3 suites OK, 18 tests OK.
16. 2026-02-14 - Ajuste post-Fase 1 solicitado:
17. Se elimino el `ALTER TABLE` y la FK `material.class_event_id` quedo declarada directamente dentro de `CREATE TABLE material` (misma politica para siguientes cambios de esquema).
18. Se reordeno el SQL para crear `class_event`/`class_event_professor` antes de `material`, evitando dependencias diferidas.
19. Se agrego optimizacion anti N+1 en `ClassEventsController` con memoizacion por `evaluationId` usando `User` cargado en memoria (`checkUserAuthorizationForUser`) para evitar consultas repetidas por evento.
20. Validacion tecnica posterior:
21. `cmd /c npm run build` OK.
22. `cmd /c npm test -- class-events.service.spec.ts class-event-response.dto.spec.ts materials.service.spec.ts --runInBand` -> 3 suites OK, 18 tests OK.
23. 2026-02-14 - Ajuste de profesionalizacion de estado de grabacion:
24. `recording_status` fue reemplazado por catalogo `class_event_recording_status` + FK `class_event.recording_status_id`.
25. Estados iniciales definidos y sembrados: `NOT_AVAILABLE`, `PROCESSING`, `READY`, `FAILED`.
26. Se actualizo script de eliminacion para incluir `class_event_recording_status`.
27. Se incorporo entidad `ClassEventRecordingStatus` y relacion en `ClassEvent`.
28. 2026-02-14 - Fase 2 completada (contrato class-events):
29. Se refactorizo contrato de request/response para separar vivo y grabacion:
30. `CreateClassEventDto`: `liveMeetingUrl` (antes `meetingLink`).
31. `UpdateClassEventDto`: `liveMeetingUrl` + `recordingUrl` opcionales.
32. `ClassEventResponseDto` ahora expone:
33. `liveMeetingUrl`, `recordingUrl`, `canJoinLive`, `canWatchRecording`, `canCopyLiveLink`, `canCopyRecordingLink`.
34. Se aplico politica de URL segura:
35. Si no hay permiso efectivo, `liveMeetingUrl` y `recordingUrl` se responden como `null`.
36. Se refactorizo `ClassEventsService`:
37. Nuevos metodos `canJoinLive`, `canWatchRecording`, `getEventAccess`.
38. `canAccessMeetingLink` queda como compatibilidad y mapea a `canJoinLive`.
39. Se refactorizo `ClassEventsController`:
40. Mapeo unificado de eventos (`mapEventToResponse` / `mapEventsToResponse`) con memoizacion por `evaluationId`.
41. Se mantiene reduccion de consultas repetidas intra-request (anti N+1) sin cache global.
42. Se renombro propiedad de dominio `meetingLink` -> `liveMeetingUrl` en `ClassEvent`.
43. Validaciones ejecutadas:
44. `cmd /c npm run build` -> OK.
45. `cmd /c npm test -- class-events.service.spec.ts class-event-response.dto.spec.ts --runInBand` -> OK.
46. `cmd /c npm test -- class-events.service.spec.ts class-event-response.dto.spec.ts materials.service.spec.ts --runInBand` -> OK.
47. 2026-02-14 - Refactor de hardcodes previo a Fase 3:
48. Se centralizaron constantes de negocio del modulo `events` en `src/modules/events/domain/class-event.constants.ts` (`CLASS_EVENT_STATUS`, `ClassEventStatus`, `ClassEventAccess`, `CLASS_EVENT_RECORDING_STATUS_CODES`).
49. Se centralizaron codigos de rol en `src/common/constants/role-codes.constants.ts` (`ROLE_CODES`, `ADMIN_ROLE_CODES`).
50. `ClassEventsService`, `ClassEventsController`, DTOs y tests de `events` ahora consumen constantes en lugar de strings hardcodeados.
51. Validacion posterior:
52. `cmd /c npm run build` -> OK.
53. `cmd /c npm test -- class-events.service.spec.ts class-event-response.dto.spec.ts materials.service.spec.ts --runInBand` -> OK.
54. 2026-02-14 - Estandarizacion global de roles en controllers:
55. Se reemplazaron roles hardcodeados por `ROLE_CODES` en todos los controllers de `src/modules/**/presentation`.
56. Se reemplazo tambien `@Auth('ADMIN', 'SUPER_ADMIN')` por `@Auth(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)` en `materials-admin.controller.ts`.
57. Se eliminaron comparaciones hardcodeadas `['ADMIN','SUPER_ADMIN']` en `users.controller.ts`, usando `ADMIN_ROLE_CODES`.
58. Validacion posterior:
59. `cmd /c npm run build` -> OK.
60. `cmd /c npm test -- materials.controller.spec.ts feedback.controller.spec.ts class-events.service.spec.ts class-event-response.dto.spec.ts materials.service.spec.ts --runInBand` -> OK (5 suites, 30 tests).
61. 2026-02-14 - Correccion de estado inicial de grabacion por backend (sin default de BD):
62. Se elimino `DEFAULT 1` de `class_event.recording_status_id` en schema.
63. Se agrego `ClassEventRecordingStatusRepository` para resolver estado por `code`.
64. `ClassEventsService.createEvent` ahora asigna `recordingStatusId = NOT_AVAILABLE` desde catalogo dentro de transaccion.
65. Si falta el catalogo en BD, se lanza `InternalServerErrorException` semantica.
66. Validacion posterior:
67. `cmd /c npm run build` -> OK.
68. `cmd /c npm test -- class-events.service.spec.ts class-event-response.dto.spec.ts materials.service.spec.ts --runInBand` -> OK.
69. 2026-02-14 - Fase 3 completada (my-schedule con acceso fino por evaluacion):
70. Se refactorizo `ClassEventRepository.findByUserAndRange` para filtrar acceso de alumnos por `enrollment_evaluation` vigente:
71. `is_active = 1`, `access_start_date <= NOW()`, `access_end_date >= NOW()`, matricula no cancelada.
72. Se mantiene bypass para creador de evento y profesor asignado activo.
73. Se agrego `distinct(true)` para evitar duplicados por joins.
74. Se reforzo filtro de profesor asignado con `revokedAt IS NULL`.
75. Validacion posterior:
76. `cmd /c npm run build` -> OK.
77. `cmd /c npm test -- class-events.service.spec.ts class-event-response.dto.spec.ts materials.service.spec.ts --runInBand` -> OK.
78. 2026-02-14 - Endurecimiento post-Fase 3 (performance + consistencia):
79. Se optimizo `findByUserAndRange` usando `EXISTS` en lugar de joins de control para reducir multiplicacion de filas y joins innecesarios.
80. Se mantuvo `distinct(true)` por joins de expansion (profesores) y se reforzo chequeo de profesores activos en subconsulta.
81. Se migro el filtro temporal de vigencia a `UTC_TIMESTAMP()` en consulta SQL, consistente con configuracion global TypeORM (`timezone: 'Z'`).
82. Se implemento cache de catalogo para `class_event_recording_status` por `code` en `ClassEventsService`.
83. Se sincronizo actualizacion de `recordingUrl` -> `recordingStatusId = READY` en `updateEvent`.
84. Se ampliaron pruebas unitarias de `ClassEventsService` para:
85. uso de cache de estado de grabacion en `createEvent`,
86. asignacion automatica de estado `READY` al setear `recordingUrl` en `updateEvent`.
87. Validacion posterior:
88. `cmd /c npm run build` -> OK.
89. `cmd /c npm test -- class-events.service.spec.ts class-event-response.dto.spec.ts materials.service.spec.ts --runInBand` -> OK (3 suites, 21 tests).
90. 2026-02-14 - Fase 4 completada (materiales por sesion):
91. Se habilito asociacion opcional de material a sesion con `classEventId` en DTOs de material (`UploadMaterialDto` y `CreateMaterialDto`).
92. `MaterialsService.uploadMaterial` ahora persiste `classEventId` y valida consistencia de dominio:
93. la sesion debe existir y pertenecer a la misma evaluacion de la carpeta (`class_event.evaluation_id == material_folder.evaluation_id`).
94. Se agrego endpoint de lectura por sesion:
95. `GET /materials/class-event/:classEventId` (con control de acceso vigente por evaluacion).
96. Se agrego cache para listado por sesion:
97. `cache:materials:class-event:{classEventId}` con invalidacion en upload y addVersion.
98. Se incorporo `ClassEventsModule` en `MaterialsModule` para reutilizar `ClassEventRepository`.
99. Se extendio `MaterialRepository` con `findByClassEventId`.
100. Se reforzaron pruebas:
101. `materials.service.spec.ts` cubre inconsistencia carpeta/sesion y listado por sesion.
102. `materials.controller.spec.ts` cubre RBAC de `getClassEventMaterials`.
103. Validacion posterior:
104. `cmd /c npm run build` -> OK.
105. `cmd /c npm test -- materials.service.spec.ts materials.controller.spec.ts class-events.service.spec.ts class-event-response.dto.spec.ts --runInBand` -> OK (4 suites, 31 tests).
