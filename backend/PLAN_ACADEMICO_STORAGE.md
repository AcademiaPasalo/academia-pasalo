# Plan de Desarrollo Académico y Gestión de Contenidos

Este documento centraliza la hoja de ruta para las épicas de Cursos, Ciclos, Matrículas y Almacenamiento.

## ESTADO DE AVANCE (AUDITADO)
- [x] FASE 1: Infraestructura y Ciclo Activo
- [x] FASE 2: Moldes de Cursos y Catálogos
- [x] FASE 3: Operativa de Ciclo (Course-Cycle) y Banco Automático
- [x] FASE 4: Motor de Matrícula y Accesos Granulares
- [x] FASE 5: Motor de Verificación de Acceso (Access Engine)
- [x] FASE 6: CRUD de Evaluaciones Académicas
- [x] FASE 7: Infraestructura de Almacenamiento (Storage Service)
- [x] FASE 8: Jerarquía de Carpetas (Material Folders)
- [x] FASE 9: Gestión de Materiales y Versionado (Files) (Completada)

## DETALLE TÉCNICO POR ÉPICA

### 1. Gestión de Cursos y Ciclos
- **Ciclo Activo:** Determinado por `ACTIVE_CYCLE_ID` en `system_setting` con caché en Redis.
- **Banco de Enunciados:** Implementado como una `evaluation` especial (Tipo: BANCO_ENUNCIADOS, number: 0). Se crea automáticamente al vincular un curso a un ciclo.

### 2. Seguridad y Accesos
- **Matrículas:** Soporta curso completo o parcial. Cada matrícula genera registros en `enrollment_evaluation`.
- **Access Engine:** Servicio centralizado que valida permisos cruzando `userId` y `evaluationId`. Optimizado con Redis e invalidación reactiva.

### 3. Almacenamiento y Carpetas
- **Storage Service:** Capa de infraestructura para persistencia física y cálculo de SHA-256.
- **Carpetas:** Jerarquía infinita (folders/subfolders) ligada obligatoriamente a una `evaluation_id`.

## REGLAS DE ORO APLICADAS
- **Cero Comentarios:** El código debe ser auto-explicativo.
- **Tipado Estricto:** No se permite el uso de `any`.
- **Rendimiento:** Prevención de N+1 mediante `relations` en repositorios.
- **Internacionalización:** Código en Inglés, UI en Español, Logs en JSON (sin emojis).
- **Paths:** Uso exclusivo de `@modules`, `@common`, `@infrastructure`, `@config`.
