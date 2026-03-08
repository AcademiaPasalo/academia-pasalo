# Reglas de Rutas de Documentos (BD + Google Drive)

## Objetivo
Definir una guia unica para futuras implementaciones de endpoints de documentos.
La meta es mantener consistencia entre:
- estructura logica (BD)
- almacenamiento fisico (Google Drive)
- permisos de acceso (matricula/rol)

## Principio Base
1. **La BD es la fuente de verdad de la estructura**.
2. **Drive es el proveedor de storage**.
3. El frontend debe construir navegacion con datos del backend (BD), no con listado directo de Drive.

## Modelo de Responsabilidad
1. `material_folder` define la jerarquia logica que ve el frontend.
2. `material` relaciona carpeta + recurso visible.
3. `file_resource` y `file_version` guardan metadata/versionado/dedup.
4. Drive solo guarda el archivo fisico (`storage_key` / `driveFileId`).

## Regla de Scope
1. Si el contenido pertenece a una evaluacion:
   - usar scope de evaluacion (`evaluation_drive_access`)
   - guardar archivos fisicamente en carpeta `documentos` de ese scope
2. Si el contenido pertenece a curso-ciclo (no a una evaluacion puntual):
   - usar scope de `course_cycle`
   - guardar archivos en la carpeta del scope correspondiente

## Regla de Construccion de Rutas
1. Toda ruta nueva se crea primero en BD (`material_folder`).
2. El endpoint de carga siempre recibe `materialFolderId` destino.
3. El backend valida que:
   - la carpeta exista
   - la carpeta pertenezca al scope correcto
   - el usuario tenga permiso sobre ese scope
4. Recien despues se persiste el archivo en Drive y se registra en BD.

## Regla de Frontend
1. Front solicita:
   - carpetas hijas de una carpeta
   - archivos de una carpeta (lazy loading)
   - conteos por carpeta
2. Front no debe depender de nombre de carpeta en Drive.
3. Front no debe inferir permisos por URL; siempre usar respuesta del backend.

## Contrato Minimo para Endpoints Futuros
1. Crear carpeta:
   - entrada: `evaluationId` o `parentFolderId`, `name`
   - salida: carpeta creada + metadata basica
2. Listar estructura:
   - entrada: contexto (`evaluationId` o `courseCycleId`)
   - salida: nodos con `id`, `name`, `childrenCount`, `filesCount`
3. Listar contenido de carpeta:
   - entrada: `folderId`
   - salida: subcarpetas + archivos paginados
4. Cargar documento:
   - entrada: `materialFolderId` + archivo
   - salida: material creado con `fileResourceId`, `driveFileId`, `displayName`

## Regla de Seguridad
1. Todo acceso a documento/video pasa por validacion backend.
2. URL de visualizacion autorizada se entrega solo tras validar acceso vigente.
3. Si matricula/acceso expira, el backend debe negar emision de enlaces.
4. Compartir URL fuera de plataforma no debe romper el control de acceso por grupo/scope.

## Regla Operativa
1. No leer Drive para "descubrir estructura" en runtime normal.
2. La sincronizacion Drive->BD se usa solo para bootstrap/migracion o recuperacion controlada.
3. Mantener ids estables en BD para evitar romper navegacion del frontend.

## Checklist antes de publicar un endpoint nuevo
1. Valida permisos por rol y por matricula activa.
2. Valida pertenencia al scope correcto.
3. Registra `file_resource` + `file_version` + `material`.
4. Invalida caches relacionadas.
5. Cubre tests unitarios y e2e del flujo feliz y de rechazo.

