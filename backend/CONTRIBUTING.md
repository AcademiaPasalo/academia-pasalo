# GUÍA DE CONTRIBUCIÓN (CONTRIBUTING)

## 🛑 REGLAS DE ORO (HARD RULES)
Cualquier código que viole estas reglas será rechazado automáticamente.

### 1. CÓDIGO LIMPIO Y TIPADO
- **CERO COMENTARIOS:** El código debe ser auto-explicativo. Queda prohibido el uso de comentarios de línea o bloque.
- **NO `ANY`:** Tipado estricto TypeScript en todo el proyecto. Queda prohibido el uso de `any`.
- **IDS COMO STRING:** Todas las columnas `BIGINT` de base de datos (IDs y FKs) deben mapearse como `string` en TypeScript para garantizar precisión y coherencia con el driver.
- **PRETTIER:** El código debe respetar el `.prettierrc` del proyecto.

### 2. IDIOMA
- **Código (Internal):** INGLÉS (Variables, Clases, Funciones, Interfaces).
- **Logs Técnicos:** Mensaje (`message`) en ESPAÑOL. El resto del objeto log en inglés.
- **Mensajes UI (External):** ESPAÑOL (Strings de error, mensajes de éxito en el campo `message` de la respuesta).
- **Commits:** ESPAÑOL (Imperativo, claro, máximo 1 línea).

### 3. ARQUITECTURA Y PERSISTENCIA
- **ESTRUCTURA:** Seguir estrictamente DDD y Modularidad de NestJS.
- **LOGS:** Formato JSON estructurado. Prohibido `console.log` o emojis.
- **TRANSACCIONALIDAD:** Toda operación de escritura que afecte a más de una tabla o requiera integridad lógica debe envolverse en una transacción (`dataSource.transaction`).
- **BASE DE DATOS:** 
  - `synchronize: false` siempre. Las entidades son solo mapeos.
  - El manejo de errores de base de datos debe ser semántico. Capturar errores específicos (ej. `ER_DUP_ENTRY`) y lanzar excepciones de NestJS (`ConflictException`, etc.) usando la interfaz `DatabaseError`.

### 4. SEGURIDAD Y VALIDACIÓN
- **CAPA DTO:** Validación obligatoria con `class-validator`. Todos los campos deben incluir `@MaxLength` basado en el tamaño definido en el esquema SQL para prevenir ataques DoS.
- **CONFIGURACIÓN:** Queda prohibido el "Hardcoding". Valores operativos (TTLs, umbrales, flags) deben almacenarse en la tabla `system_setting`.
- **VALIDACIÓN DE SESIÓN:** No confiar solo en la firma del JWT. Siempre validar el estado `isActive` y `sessionStatus` contra la base de datos en la estrategia de autenticación.

### 5. FLUJO DE TRABAJO
- **PRUEBAS:** Cada nueva funcionalidad crítica debe incluir tests de integración que validen escenarios de éxito y fallo (especialmente transacciones).
- **REVISIÓN:** Antes de entregar, verificar línea por línea contra esta guía.
- **DUDAS:** Ante cualquier ambigüedad técnica, PREGUNTAR.