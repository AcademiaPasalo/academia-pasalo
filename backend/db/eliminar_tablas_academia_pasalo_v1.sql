-- =============================================================================
-- SCRIPT DE ELIMINACIÓN TOTAL DE TABLAS - ACADEMIA PASALO
-- =============================================================================
-- Descripción:
-- Elimina todas las tablas del esquema 'academia_pasalo' en el orden correcto
-- para evitar conflictos de Foreign Keys. Como medida de seguridad adicional,
-- se desactivan temporalmente las comprobaciones de claves foráneas.
-- =============================================================================

USE academia_pasalo;

-- 1. Desactivar chequeo de claves foráneas para permitir eliminación sin bloqueos
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Eliminar tablas (Orden inverso de dependencia sugerido, aunque con FK=0 no es estricto)

-- Tablas de detalle / relación N:M
DROP TABLE IF EXISTS class_event_professor;
DROP TABLE IF EXISTS featured_testimony;
DROP TABLE IF EXISTS course_testimony;
DROP TABLE IF EXISTS user_notification;
DROP TABLE IF EXISTS enrollment_evaluation;
DROP TABLE IF EXISTS course_cycle_professor;
DROP TABLE IF EXISTS user_role;

-- Tablas transaccionales / operativas
DROP TABLE IF EXISTS class_event;
DROP TABLE IF EXISTS academic_event;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS deletion_request;
DROP TABLE IF EXISTS material;
DROP TABLE IF EXISTS file_version;
DROP TABLE IF EXISTS material_folder;
DROP TABLE IF EXISTS enrollment;
DROP TABLE IF EXISTS evaluation;
DROP TABLE IF EXISTS course_cycle;
DROP TABLE IF EXISTS security_event;
DROP TABLE IF EXISTS user_session;

-- Tablas maestras / catálogos
DROP TABLE IF EXISTS file_resource;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS academic_cycle;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS system_setting;

-- Tablas de tipos y estados (diccionarios)
DROP TABLE IF EXISTS security_event_type;
DROP TABLE IF EXISTS enrollment_type;
DROP TABLE IF EXISTS class_event_recording_status;
DROP TABLE IF EXISTS session_status;
DROP TABLE IF EXISTS audit_action;
DROP TABLE IF EXISTS deletion_request_status;
DROP TABLE IF EXISTS material_status;
DROP TABLE IF EXISTS folder_status;
DROP TABLE IF EXISTS evaluation_type;
DROP TABLE IF EXISTS enrollment_status;
DROP TABLE IF EXISTS cycle_level;
DROP TABLE IF EXISTS course_type;
DROP TABLE IF EXISTS role;

-- 3. Reactivar chequeo de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Eliminación de tablas completada exitosamente.' AS Status;
