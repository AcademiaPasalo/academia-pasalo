# Plan Implementacion Videos Drive Embed

Fecha: 2026-03-01
Estado: Documento base de trabajo para ejecucion por fases.

## 1. Objetivo
Implementar visualizacion de videos embebidos desde Google Drive en la plataforma, con control de acceso gobernado por backend y sincronizacion automatica de permisos por grupos de Google Workspace.

Este documento define:
1. Base que ya existe y esta validada.
2. Lo que falta para cerrar implementacion profesional.
3. Estrategia por fases con validacion, tests y pausa obligatoria al cierre de cada fase.

## 2. Base ya disponible (no partimos desde cero)
### 2.1 Backend actual
1. Autenticacion solo con Google ya operativa.
2. Control de acceso academico por backend ya implementado (rol activo, matriculas, accesos por evaluacion, revocaciones).
3. Integracion Google Drive para storage ya implementada:
   - proveedor `GDRIVE`
   - estructura base `uploads/objects/archivado`
   - subida, descarga por stream API, borrado
4. Modulo de clases ya expone `recordingUrl` y `recordingStatus`.
5. BullMQ ya esta integrado en plataforma para procesos asincronos.

### 2.2 Google Workspace / Admin SDK
1. Domain-wide delegation configurada para service account.
2. Admin SDK API habilitada en GCP.
3. Scopes validados para:
   - lectura de grupos
   - creacion/actualizacion de grupos
   - gestion de miembros
4. Prueba real ejecutada:
   - crear grupo
   - leer grupo
   - actualizar grupo
   - agregar miembro
   - quitar miembro
   Resultado: OK.

### 2.3 Variables de entorno base documentadas
1. `GOOGLE_APPLICATION_CREDENTIALS`
2. `GOOGLE_DRIVE_ROOT_FOLDER_ID`
3. `GOOGLE_WORKSPACE_ADMIN_EMAIL`
4. `GOOGLE_WORKSPACE_GROUP_DOMAIN`

## 3. Alcance funcional objetivo
1. Videos se almacenan en Drive, no en EC2.
2. Frontend consume URL embebida (`preview`) solo cuando backend autoriza.
3. Permisos Drive se gestionan por grupos (no por usuario por archivo).
4. Fuente de verdad de acceso: plataforma (matriculas y accesos por evaluacion).
5. Revocacion automatica: al perder acceso academico, se remueve del grupo correspondiente.

## 4. Decisiones tecnicas recomendadas
### 4.1 Unidad de permiso
Usar grupo por evaluacion (recomendado) para calzar con tu modelo de acceso actual.

Ejemplo:
1. Grupo: `ev-552-viewers@academiapasalo.com`
2. Carpeta: `uploads/{ciclo}/{curso}/{evaluacion}/videos`
3. Permiso carpeta -> grupo viewer.

### 4.2 Estructura de carpetas Drive
Crear por codigo, con componentes legibles + ids para evitar ambiguedad operativa.

Ejemplo:
`uploads/2026-1/CC_184-MAT101/EV_552-PC1/videos`

### 4.3 Identificador de video
Guardar `driveFileId` como identificador tecnico principal.
El nombre del archivo es operativo/visual, no llave de negocio.

### 4.4 Seguridad
1. No usar "public with link" para videos protegidos.
2. Compartir por grupos restringidos.
3. Backend entrega embed URL solo si el usuario tiene acceso vigente.

## 5. Gaps pendientes para cerrar implementacion
1. Modelo persistente de mapeo academico <-> Drive:
   - scope academico (courseCycle/evaluation)
   - driveFolderId para videos
   - groupEmail/groupId viewer
2. Servicio de sincronizacion de grupos:
   - upsert grupo
   - add/remove miembros idempotente
3. Pipeline asincrono de sync de permisos con BullMQ:
   - trigger por eventos de negocio
   - reintentos y DLQ
4. Reconciliacion periodica (fallback):
   - recalculo estado real en plataforma
   - correccion de diferencias con Workspace
5. API de videos embebidos:
   - endpoint para obtener metadata + embed URL autorizada
6. Auditoria y observabilidad:
   - logs de altas/bajas de permisos
   - metricas de errores de sync

## 6. Estrategia de implementacion por fases
Regla obligatoria para todas las fases:
1. Desarrollo profesional y optimizado.
2. Al terminar una fase:
   - actualizar/crear tests de la fase
   - ejecutar pruebas impactadas
   - detenerse
   - entregar informe al usuario
   - esperar aprobacion/correcciones
3. Solo continuar con la siguiente fase cuando el usuario apruebe.

---

## Fase 1 - Fundacion de modelo y contratos
Estado: PENDIENTE

Objetivo:
Definir estructura persistente y contratos de dominio para videos + permisos Drive por evaluacion.

Entregables:
1. Entidades/tablas para mapping:
   - scope academico
   - folder videos Drive
   - grupo viewer
2. Interfaces de servicio para:
   - resolucion de scope
   - resolucion de folder/grupo
3. Reglas de naming estandar para grupo y carpeta.
4. DTOs base de respuesta de video embebido.

Tests requeridos:
1. Unit tests de validacion de naming y resolucion de scope.
2. Unit tests de mapeo de entidades/dto.

Criterio de cierre:
1. Modelo consistente con matriculas actuales.
2. Sin ambiguedad de ownership ni duplicidad de grupos/carpetas.

Pausa obligatoria:
Entregar informe de fase y esperar validacion del usuario.

---

## Fase 2 - Provision de carpetas y grupos
Estado: PENDIENTE

Objetivo:
Automatizar creacion/obtencion idempotente de carpeta `videos` y grupo viewer por evaluacion.

Entregables:
1. Servicio Drive folder provisioner (`find-or-create`).
2. Servicio Workspace group provisioner (`find-or-create`).
3. Enlace carpeta <-> grupo (permiso reader).
4. Persistencia del resultado en tabla de mapping.

Tests requeridos:
1. Unit tests con mocks de Google APIs:
   - grupo existente/no existente
   - carpeta existente/no existente
   - casos ambiguos/errores API
2. Test de idempotencia (doble provision no duplica recursos).

Criterio de cierre:
1. Provision repetible sin duplicados.
2. Manejo de errores con mensajes operativos claros.

Pausa obligatoria:
Entregar informe de fase y esperar validacion del usuario.

---

## Fase 3 - Sync de membresia por eventos de negocio
Estado: PENDIENTE

Objetivo:
Sincronizar altas/bajas de miembros en grupos segun cambios de acceso academico.

Entregables:
1. Jobs BullMQ para:
   - grant access
   - revoke access
2. Hooks en puntos de negocio:
   - matricula creada
   - matricula cancelada
   - revocacion/reactivacion de acceso evaluacion
   - asignacion/revocacion profesor (si aplica visualizacion)
3. Idempotencia en add/remove miembros.
4. Retry policy y DLQ.

Tests requeridos:
1. Unit tests de encolado.
2. Unit tests de processor.
3. E2E de casos clave de matricula y revocacion.

Criterio de cierre:
1. Cambios academicos generan sync correcto en background.
2. Fallos temporales quedan en retry sin perder evento.

Pausa obligatoria:
Entregar informe de fase y esperar validacion del usuario.

---

## Fase 4 - Reconciliacion y consistencia temporal
Estado: PENDIENTE

Objetivo:
Agregar fallback robusto para expiracion por fecha fin y recuperacion ante fallos.

Entregables:
1. Job periodico de reconciliacion:
   - calcula miembros esperados por evaluacion
   - compara con grupo actual
   - aplica delta add/remove
2. Telemetria de drift detectado/corregido.
3. Estrategia de throttling para no golpear cuotas API.

Tests requeridos:
1. Unit tests de calculo de delta.
2. Unit tests de comportamiento ante errores parciales.
3. Prueba integrada de correccion de drift.

Criterio de cierre:
1. Expiracion por fecha se refleja aun si falla evento puntual.
2. Drift converge automaticamente.

Pausa obligatoria:
Entregar informe de fase y esperar validacion del usuario.

---

## Fase 5 - API de consumo para frontend y hardening
Estado: PENDIENTE

Objetivo:
Exponer consumo final para UI de videos embebidos con seguridad y UX estable.

Entregables:
1. Endpoint de consulta de video embebido:
   - valida acceso actual
   - retorna embed URL + metadata
2. Politica de no exponer URL cuando no hay acceso.
3. Auditoria de consultas sensibles.
4. Documentacion API final para frontend.

Tests requeridos:
1. Unit de autorizacion.
2. E2E de perfiles (permitido/denegado/revocado).
3. E2E de acceso luego de expiracion.

Criterio de cierre:
1. Frontend integra sin ambiguedad.
2. Seguridad y trazabilidad listas para produccion.

Pausa obligatoria:
Entregar informe final de fase y esperar validacion del usuario.

## 7. Riesgos y mitigaciones
1. Propagacion de permisos Google no instantanea.
   Mitigacion: eventos + reconciliacion periodica.
2. Cuotas API de Admin SDK/Drive.
   Mitigacion: batching, retries exponenciales, rate limit.
3. Drift por fallos transitorios.
   Mitigacion: reconciliacion, logs y alertas.
4. Exposicion accidental por comparticion publica.
   Mitigacion: politicas de comparticion estrictas y validaciones de compliance.

## 8. Checklist de arranque para fase 1
1. Confirmar naming final de grupos y carpetas.
2. Confirmar unidad de permiso (evaluacion) como canon.
3. Confirmar politica de borrado de grupos (manual solamente).
4. Confirmar politica de archivado de videos en Drive.
5. Confirmar alcance inicial (solo alumnos + profesores asignados, o tambien admins).

