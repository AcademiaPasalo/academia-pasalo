INSERT INTO role (code, name) VALUES
('SUPER_ADMIN', 'Super Administrador'),
('ADMIN', 'Administrador'),
('PROFESSOR', 'Profesor'),
('STUDENT', 'Alumno');

INSERT INTO course_type (code, name) VALUES
('CIENCIAS', 'Ciencias'),
('LETRAS', 'Letras'),
('FACULTAD', 'Facultad');

INSERT INTO cycle_level (level_number, name) VALUES
(1, 'Primer Ciclo'),
(2, 'Segundo Ciclo'),
(3, 'Tercer Ciclo'),
(4, 'Cuarto Ciclo'),
(5, 'Quinto Ciclo'),
(6, 'Sexto Ciclo'),
(7, 'Séptimo Ciclo'),
(8, 'Octavo Ciclo'),
(9, 'Noveno Ciclo'),
(10, 'Décimo Ciclo');

INSERT INTO enrollment_status (code, name) VALUES
('ACTIVE', 'Matrícula Activa'),
('CANCELLED', 'Matrícula Cancelada'),
('SUSPENDED', 'Matrícula Suspendida');

INSERT INTO evaluation_type (code, name) VALUES
('PC', 'Práctica Calificada'),
('EX', 'Examen'),
('LAB', 'Laboratorio'),
('TUTORING', 'Tutoría Especializada'),
('BANCO_ENUNCIADOS', 'Banco de Enunciados');

INSERT INTO academic_cycle (code, start_date, end_date, created_at)
VALUES ('2026-0', '2026-01-09', '2026-03-06', NOW());

INSERT INTO system_setting (setting_key, setting_value, description, created_at)
VALUES ('ACTIVE_CYCLE_ID', '1', 'ID del ciclo académico actual y activo en el sistema', NOW());

INSERT INTO folder_status (code, name) VALUES
('ACTIVE', 'Activa'),
('HIDDEN', 'Oculta'),
('ARCHIVED', 'Archivada');

INSERT INTO material_status (code, name) VALUES
('ACTIVE', 'Activo'),
('HIDDEN', 'Oculto'),
('ARCHIVED', 'Archivado');

INSERT INTO deletion_request_status (code, name) VALUES
('PENDING', 'Pendiente de Revisión'),
('APPROVED', 'Aprobada'),
('REJECTED', 'Rechazada');

INSERT INTO audit_action (code, name) VALUES
('LOGIN', 'Inicio de sesión'),
('LOGOUT', 'Cierre de sesión'),
('LOGIN_ANOMALY', 'Inicio de sesión anómalo'),
('FILE_UPLOAD', 'Subida de archivo'),
('FILE_EDIT', 'Edición de archivo'),
('FILE_DELETE_REQUEST', 'Solicitud de eliminación de archivo'),
('FILE_ARCHIVE', 'Archivado de archivo o carpeta'),
('CONTENT_DISABLE', 'Desactivación de contenido');

INSERT INTO security_event_type (code, name) VALUES
('CONCURRENT_SESSION_DETECTED', 'Detección de sesión concurrente'),
('CONCURRENT_SESSION_RESOLVED', 'Resolución de sesión concurrente'),
('ANOMALOUS_LOGIN_DETECTED', 'Inicio de sesión potencialmente anómalo detectado'),
('ANOMALOUS_LOGIN_REAUTH_SUCCESS', 'Reautenticación exitosa tras login anómalo'),
('ANOMALOUS_LOGIN_REAUTH_FAILED', 'Reautenticación fallida tras login anómalo'),
('LOGIN_SUCCESS', 'Inicio de sesión de manera exitosa'),
('LOGOUT_SUCCESS', 'Cierre de sesión exitoso');

INSERT INTO enrollment_type (code, name) VALUES
('FULL', 'Curso Completo'),
('PARTIAL', 'Por Evaluación');


INSERT INTO system_setting (setting_key, setting_value, description, created_at) VALUES
-- Umbrales por IP (detección gruesa, no distrital)
('GEO_IP_ANOMALY_TIME_WINDOW_MINUTES', '60', 'Ventana de tiempo (min) para evaluar anomalías de ubicación basadas en IP.', NOW()),
('GEO_IP_ANOMALY_DISTANCE_KM', '300', 'Distancia (km) para considerar anómala la ubicación basada en IP.', NOW()),

-- Umbrales por geolocalización real (GPS / navegador)
('GEO_GPS_ANOMALY_TIME_WINDOW_MINUTES', '30', 'Ventana de tiempo (min) para evaluar anomalías usando geolocalización real.', NOW()),
('GEO_GPS_ANOMALY_DISTANCE_KM', '10', 'Distancia (km) para detectar cambios anómalos a nivel urbano/distrital.', NOW());
     
INSERT INTO session_status (code, name) VALUES
('ACTIVE', 'Sesión Activa'),
('PENDING_CONCURRENT_RESOLUTION', 'Resolución de Sesión Concurrente Pendiente'),
('BLOCKED_PENDING_REAUTH', 'Bloqueado por Anomalía (Requiere Re-autenticación)'),
('REVOKED', 'Sesión Revocada / Cerrada');

-- MI USUARIO DE PRUEBA
INSERT INTO user (email, first_name, last_name_1, last_name_2, profile_photo_url, photo_source, created_at) 
VALUES 
('omar.aedo.alvarez@gmail.com', 'Omar', 'Aedo', 'Alvarez', NULL, 'google', NOW());

INSERT INTO user_role (user_id, role_id) 
VALUES 
(LAST_INSERT_ID(), 1);