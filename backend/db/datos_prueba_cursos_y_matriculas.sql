-- =============================================================================
-- SCRIPT DE CARGA DE DATOS DE PRUEBA: CURSOS, PROFESORES Y MATRÍCULAS (CICLO ACTUAL)
-- =============================================================================
-- Descripción:
-- 1. Identifica el Ciclo Académico Actual desde system_setting.
-- 2. Crea 6 usuarios con rol de Profesor.
-- 3. Crea 4 cursos de tipo 'CIENCIAS' del 'Primer Ciclo'.
-- 4. Apertura dichos cursos en el Ciclo Actual (CourseCycle).
-- 5. Asigna profesores a los cursos (2 para los primeros dos, 1 para los últimos).
-- 6. Matricula al usuario ID 1 (Student) en los 4 cursos (Matrícula FULL).
-- =============================================================================

USE academia_pasalo;

-- -----------------------------------------------------------------------------
-- 1. OBTENCIÓN DE IDs DE CONFIGURACIÓN Y CICLO ACTUAL
-- -----------------------------------------------------------------------------

-- Obtener el ID del Ciclo Actual desde la configuración del sistema
SET @current_cycle_id = (SELECT CAST(setting_value AS UNSIGNED) FROM system_setting WHERE setting_key = 'ACTIVE_CYCLE_ID' LIMIT 1);

-- Fallback: Si no hay configuración, usar el último ciclo creado (para evitar fallos en entornos de dev limpios)
SET @current_cycle_id = IFNULL(@current_cycle_id, (SELECT id FROM academic_cycle ORDER BY id DESC LIMIT 1));

-- Obtener IDs de Metadata necesarios
SET @role_professor_id = (SELECT id FROM role WHERE code = 'PROFESSOR' LIMIT 1);
SET @type_ciencias_id  = (SELECT id FROM course_type WHERE code = 'CIENCIAS' LIMIT 1);
SET @level_1_id        = (SELECT id FROM cycle_level WHERE level_number = 1 LIMIT 1);
SET @status_active_id  = (SELECT id FROM enrollment_status WHERE code = 'ACTIVE' LIMIT 1);
SET @type_full_id      = (SELECT id FROM enrollment_type WHERE code = 'FULL' LIMIT 1);

SET @type_partial_id   = (SELECT id FROM enrollment_type WHERE code = 'PARTIAL' LIMIT 1);

-- ID del Estudiante a Matricular (Usuario Objetivo)
SET @target_student_id = 1;

-- -----------------------------------------------------------------------------
-- 2. CREACIÓN DE PROFESORES
-- -----------------------------------------------------------------------------

INSERT INTO user (email, first_name, last_name_1, last_name_2, photo_source, created_at) VALUES
('profesor.algebra1@fake.com', 'Jorge', 'Sarmiento', 'Pérez', 'none', NOW()),
('profesor.algebra2@fake.com', 'Lucía', 'Méndez', 'García', 'none', NOW()),
('profesor.calculo1@fake.com', 'Ricardo', 'Feynman', 'López', 'none', NOW()),
('profesor.calculo2@fake.com', 'Elena', 'Curie', 'Santos', 'none', NOW()),
('profesor.fisica@fake.com',  'Albert', 'Newton', 'Ruiz',   'none', NOW()),
('profesor.quimica@fake.com', 'Marie',  'Lavoisier','Díaz', 'none', NOW());

-- Capturar IDs de los profesores recién creados
SET @prof_alg1 = (SELECT id FROM user WHERE email = 'profesor.algebra1@fake.com');
SET @prof_alg2 = (SELECT id FROM user WHERE email = 'profesor.algebra2@fake.com');
SET @prof_cal1 = (SELECT id FROM user WHERE email = 'profesor.calculo1@fake.com');
SET @prof_cal2 = (SELECT id FROM user WHERE email = 'profesor.calculo2@fake.com');
SET @prof_fis  = (SELECT id FROM user WHERE email = 'profesor.fisica@fake.com');
SET @prof_qui  = (SELECT id FROM user WHERE email = 'profesor.quimica@fake.com');

-- Asignar Rol 'PROFESSOR' a los nuevos usuarios
INSERT INTO user_role (user_id, role_id) VALUES
(@prof_alg1, @role_professor_id),
(@prof_alg2, @role_professor_id),
(@prof_cal1, @role_professor_id),
(@prof_cal2, @role_professor_id),
(@prof_fis,  @role_professor_id),
(@prof_qui,  @role_professor_id);

-- -----------------------------------------------------------------------------
-- 3. CREACIÓN DE CURSOS Y APERTURA EN CICLO (COURSE & COURSE_CYCLE)
-- -----------------------------------------------------------------------------

-- Curso 1: Álgebra Matricial y Geometría Analítica
INSERT INTO course (course_type_id, cycle_level_id, code, name, created_at)
VALUES (@type_ciencias_id, @level_1_id, 'MATE101', 'Álgebra Matricial y Geometría Analítica', NOW());
SET @course_alg_id = LAST_INSERT_ID();

INSERT INTO course_cycle (course_id, academic_cycle_id) VALUES (@course_alg_id, @current_cycle_id);
SET @cc_alg_id = LAST_INSERT_ID();

-- Curso 2: Fundamentos de Cálculo
INSERT INTO course (course_type_id, cycle_level_id, code, name, created_at)
VALUES (@type_ciencias_id, @level_1_id, 'MATE102', 'Fundamentos de Cálculo', NOW());
SET @course_cal_id = LAST_INSERT_ID();

INSERT INTO course_cycle (course_id, academic_cycle_id) VALUES (@course_cal_id, @current_cycle_id);
SET @cc_cal_id = LAST_INSERT_ID();

-- Curso 3: Fundamentos de Física
INSERT INTO course (course_type_id, cycle_level_id, code, name, created_at)
VALUES (@type_ciencias_id, @level_1_id, 'FIS101', 'Fundamentos de Física', NOW());
SET @course_fis_id = LAST_INSERT_ID();

INSERT INTO course_cycle (course_id, academic_cycle_id) VALUES (@course_fis_id, @current_cycle_id);
SET @cc_fis_id = LAST_INSERT_ID();

-- Curso 4: Química
INSERT INTO course (course_type_id, cycle_level_id, code, name, created_at)
VALUES (@type_ciencias_id, @level_1_id, 'QUI101', 'Química', NOW());
SET @course_qui_id = LAST_INSERT_ID();

INSERT INTO course_cycle (course_id, academic_cycle_id) VALUES (@course_qui_id, @current_cycle_id);
SET @cc_qui_id = LAST_INSERT_ID();

-- Obtener ID del docente real (docentepasalo@gmail.com)
SET @docente_user_id = (SELECT id FROM user WHERE email = 'docentepasalo@gmail.com' LIMIT 1);

-- -----------------------------------------------------------------------------
-- 4. ASIGNACIÓN DE PROFESORES A LOS CURSOS (COURSE_CYCLE_PROFESSOR)
-- -----------------------------------------------------------------------------

-- Álgebra: 2 Profesores + docentepasalo (docente real)
INSERT INTO course_cycle_professor (course_cycle_id, professor_user_id, assigned_at) VALUES
(@cc_alg_id, @prof_alg1, NOW()),
(@cc_alg_id, @prof_alg2, NOW()),
(@cc_alg_id, @docente_user_id, NOW());

-- Cálculo: 2 Profesores
INSERT INTO course_cycle_professor (course_cycle_id, professor_user_id, assigned_at) VALUES
(@cc_cal_id, @prof_cal1, NOW()),
(@cc_cal_id, @prof_cal2, NOW());

-- Física: 1 Profesor
INSERT INTO course_cycle_professor (course_cycle_id, professor_user_id, assigned_at) VALUES
(@cc_fis_id, @prof_fis, NOW());

-- Química: 1 Profesor
INSERT INTO course_cycle_professor (course_cycle_id, professor_user_id, assigned_at) VALUES
(@cc_qui_id, @prof_qui, NOW());

-- -----------------------------------------------------------------------------
-- 5. MATRÍCULA DEL USUARIO OBJETIVO (ENROLLMENT)
-- -----------------------------------------------------------------------------

INSERT INTO enrollment (user_id, course_cycle_id, enrollment_status_id, enrollment_type_id, enrolled_at) VALUES
(@target_student_id, @cc_alg_id, @status_active_id, @type_full_id, NOW()),
(@target_student_id, @cc_cal_id, @status_active_id, @type_full_id, NOW()),
(@target_student_id, @cc_fis_id, @status_active_id, @type_partial_id, NOW()),
(@target_student_id, @cc_qui_id, @status_active_id, @type_partial_id, NOW());

-- -----------------------------------------------------------------------------
-- 6. CREACIÓN DE EVALUACIONES (PC1, PC2, EX1, PC3, PC4, EX2)
-- -----------------------------------------------------------------------------
-- Fechas calculadas para no solaparse dentro del ciclo (09 Ene - 06 Mar)

SET @t_pc = (SELECT id FROM evaluation_type WHERE code = 'PC' LIMIT 1);
SET @t_ex = (SELECT id FROM evaluation_type WHERE code = 'EX' LIMIT 1);

-- Fechas (YYYY-MM-DD HH:MM:SS) - Ajustadas a UTC (+5h) para que en Perú (GMT-5) se vean a las 08:00 AM y 23:59 PM
-- Rango alineado con los class_events (Feb 3 - Mar 31)
SET @d1_s = '2026-02-01 13:00:00'; SET @d1_e = '2026-02-11 04:59:59'; -- PC1 (clases: Feb 3, 5, 10)
SET @d2_s = '2026-02-11 13:00:00'; SET @d2_e = '2026-02-21 04:59:59'; -- PC2 (clases: Feb 12, 17, 19)
SET @d3_s = '2026-02-21 13:00:00'; SET @d3_e = '2026-03-05 04:59:59'; -- EX1 (clases: Feb 24, 26, Mar 3)
SET @d4_s = '2026-03-05 13:00:00'; SET @d4_e = '2026-03-15 04:59:59'; -- PC3 (clases: Mar 5, 10, 12)
SET @d5_s = '2026-03-15 13:00:00'; SET @d5_e = '2026-03-26 04:59:59'; -- PC4 (clases: Mar 17, 19, 24)
SET @d6_s = '2026-03-26 13:00:00'; SET @d6_e = '2026-04-06 04:59:59'; -- EX2 (clases: Mar 26, 31)

INSERT INTO evaluation (course_cycle_id, evaluation_type_id, number, start_date, end_date) VALUES
-- Álgebra
(@cc_alg_id, @t_pc, 1, @d1_s, @d1_e),
(@cc_alg_id, @t_pc, 2, @d2_s, @d2_e),
(@cc_alg_id, @t_ex, 1, @d3_s, @d3_e),
(@cc_alg_id, @t_pc, 3, @d4_s, @d4_e),
(@cc_alg_id, @t_pc, 4, @d5_s, @d5_e),
(@cc_alg_id, @t_ex, 2, @d6_s, @d6_e),
-- Cálculo
(@cc_cal_id, @t_pc, 1, @d1_s, @d1_e),
(@cc_cal_id, @t_pc, 2, @d2_s, @d2_e),
(@cc_cal_id, @t_ex, 1, @d3_s, @d3_e),
(@cc_cal_id, @t_pc, 3, @d4_s, @d4_e),
(@cc_cal_id, @t_pc, 4, @d5_s, @d5_e),
(@cc_cal_id, @t_ex, 2, @d6_s, @d6_e),
-- Física
(@cc_fis_id, @t_pc, 1, @d1_s, @d1_e),
(@cc_fis_id, @t_pc, 2, @d2_s, @d2_e),
(@cc_fis_id, @t_ex, 1, @d3_s, @d3_e),
(@cc_fis_id, @t_pc, 3, @d4_s, @d4_e),
(@cc_fis_id, @t_pc, 4, @d5_s, @d5_e),
(@cc_fis_id, @t_ex, 2, @d6_s, @d6_e),
-- Química
(@cc_qui_id, @t_pc, 1, @d1_s, @d1_e),
(@cc_qui_id, @t_pc, 2, @d2_s, @d2_e),
(@cc_qui_id, @t_ex, 1, @d3_s, @d3_e),
(@cc_qui_id, @t_pc, 3, @d4_s, @d4_e),
(@cc_qui_id, @t_pc, 4, @d5_s, @d5_e),
(@cc_qui_id, @t_ex, 2, @d6_s, @d6_e);

-- -----------------------------------------------------------------------------
-- 7. GENERACIÓN DE ACCESOS (ENROLLMENT_EVALUATION)
-- -----------------------------------------------------------------------------
-- Como es carga SQL directa, debemos simular la lógica de negocio de asignación de accesos.

-- FULL (Álgebra): Acceso a todo
INSERT INTO enrollment_evaluation (enrollment_id, evaluation_id, access_start_date, access_end_date, is_active)
SELECT e.id, ev.id, ev.start_date, ev.end_date, TRUE
FROM enrollment e
JOIN evaluation ev ON ev.course_cycle_id = e.course_cycle_id
WHERE e.user_id = @target_student_id AND e.course_cycle_id = @cc_alg_id;

-- FULL (Cálculo): Acceso a todo
INSERT INTO enrollment_evaluation (enrollment_id, evaluation_id, access_start_date, access_end_date, is_active)
SELECT e.id, ev.id, ev.start_date, ev.end_date, TRUE
FROM enrollment e
JOIN evaluation ev ON ev.course_cycle_id = e.course_cycle_id
WHERE e.user_id = @target_student_id AND e.course_cycle_id = @cc_cal_id;

-- PARTIAL (Física): Acceso SOLO a PC1 y EX1
INSERT INTO enrollment_evaluation (enrollment_id, evaluation_id, access_start_date, access_end_date, is_active)
SELECT e.id, ev.id, ev.start_date, ev.end_date, TRUE
FROM enrollment e
JOIN evaluation ev ON ev.course_cycle_id = e.course_cycle_id
JOIN evaluation_type et ON ev.evaluation_type_id = et.id
WHERE e.user_id = @target_student_id AND e.course_cycle_id = @cc_fis_id
AND ( (et.code = 'PC' AND ev.number = 1) OR (et.code = 'EX' AND ev.number = 1) );

-- PARTIAL (Química): Acceso SOLO a PC1
INSERT INTO enrollment_evaluation (enrollment_id, evaluation_id, access_start_date, access_end_date, is_active)
SELECT e.id, ev.id, ev.start_date, ev.end_date, TRUE
FROM enrollment e
JOIN evaluation ev ON ev.course_cycle_id = e.course_cycle_id
JOIN evaluation_type et ON ev.evaluation_type_id = et.id
WHERE e.user_id = @target_student_id AND e.course_cycle_id = @cc_qui_id
AND (et.code = 'PC' AND ev.number = 1);

-- -----------------------------------------------------------------------------
-- 8. ASIGNAR ROL DE ADMINISTRADOR AL DOCENTE
-- -----------------------------------------------------------------------------

SET @role_admin_id   = (SELECT id FROM role WHERE code = 'ADMIN' LIMIT 1);

INSERT IGNORE INTO user_role (user_id, role_id) VALUES (@docente_user_id, @role_admin_id);

-- -----------------------------------------------------------------------------
-- 9. CREACIÓN DE EVENTOS DE CLASE (CLASS_EVENT) - Febrero y Marzo 2026
-- -----------------------------------------------------------------------------
-- Calendario: 2 clases por semana (Martes y Jueves), 8:00-10:00 AM Perú (13:00-15:00 UTC)
-- Febrero: 8 clases | Marzo: 9 clases = 17 por curso, 68 en total
-- Distribución por evaluación: PC1(3), PC2(3), EX1(3), PC3(3), PC4(3), EX2(2)

SET @rec_na = (SELECT id FROM class_event_recording_status WHERE code = 'NOT_AVAILABLE' LIMIT 1);
SET @rec_ready = (SELECT id FROM class_event_recording_status WHERE code = 'READY' LIMIT 1);

-- Obtener IDs de evaluaciones - Álgebra
SET @eval_alg_pc1 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_alg_id AND evaluation_type_id = @t_pc AND number = 1);
SET @eval_alg_pc2 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_alg_id AND evaluation_type_id = @t_pc AND number = 2);
SET @eval_alg_ex1 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_alg_id AND evaluation_type_id = @t_ex AND number = 1);
SET @eval_alg_pc3 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_alg_id AND evaluation_type_id = @t_pc AND number = 3);
SET @eval_alg_pc4 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_alg_id AND evaluation_type_id = @t_pc AND number = 4);
SET @eval_alg_ex2 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_alg_id AND evaluation_type_id = @t_ex AND number = 2);

-- Obtener IDs de evaluaciones - Cálculo
SET @eval_cal_pc1 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_cal_id AND evaluation_type_id = @t_pc AND number = 1);
SET @eval_cal_pc2 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_cal_id AND evaluation_type_id = @t_pc AND number = 2);
SET @eval_cal_ex1 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_cal_id AND evaluation_type_id = @t_ex AND number = 1);
SET @eval_cal_pc3 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_cal_id AND evaluation_type_id = @t_pc AND number = 3);
SET @eval_cal_pc4 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_cal_id AND evaluation_type_id = @t_pc AND number = 4);
SET @eval_cal_ex2 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_cal_id AND evaluation_type_id = @t_ex AND number = 2);

-- Obtener IDs de evaluaciones - Física
SET @eval_fis_pc1 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_fis_id AND evaluation_type_id = @t_pc AND number = 1);
SET @eval_fis_pc2 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_fis_id AND evaluation_type_id = @t_pc AND number = 2);
SET @eval_fis_ex1 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_fis_id AND evaluation_type_id = @t_ex AND number = 1);
SET @eval_fis_pc3 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_fis_id AND evaluation_type_id = @t_pc AND number = 3);
SET @eval_fis_pc4 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_fis_id AND evaluation_type_id = @t_pc AND number = 4);
SET @eval_fis_ex2 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_fis_id AND evaluation_type_id = @t_ex AND number = 2);

-- Obtener IDs de evaluaciones - Química
SET @eval_qui_pc1 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_qui_id AND evaluation_type_id = @t_pc AND number = 1);
SET @eval_qui_pc2 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_qui_id AND evaluation_type_id = @t_pc AND number = 2);
SET @eval_qui_ex1 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_qui_id AND evaluation_type_id = @t_ex AND number = 1);
SET @eval_qui_pc3 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_qui_id AND evaluation_type_id = @t_pc AND number = 3);
SET @eval_qui_pc4 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_qui_id AND evaluation_type_id = @t_pc AND number = 4);
SET @eval_qui_ex2 = (SELECT id FROM evaluation WHERE course_cycle_id = @cc_qui_id AND evaluation_type_id = @t_ex AND number = 2);

-- ── ÁLGEBRA MATRICIAL Y GEOMETRÍA ANALÍTICA ──
INSERT INTO class_event (evaluation_id, session_number, title, topic, start_datetime, end_datetime, live_meeting_url, recording_url, recording_status_id, is_cancelled, created_by, created_at) VALUES
-- PC1: Feb 3, 5, 10
(@eval_alg_pc1, 1, 'Clase 1: Introducción a Matrices',        'Matrices',                    '2026-02-03 13:00:00', '2026-02-03 15:00:00', 'https://meet.google.com/test-alg-001', NULL, @rec_na, FALSE, @prof_alg1, NOW()),
(@eval_alg_pc1, 2, 'Clase 2: Operaciones con Matrices',       'Operaciones matriciales',     '2026-02-05 13:00:00', '2026-02-05 15:00:00', 'https://meet.google.com/test-alg-002', NULL, @rec_na, FALSE, @prof_alg1, NOW()),
(@eval_alg_pc1, 3, 'Clase 3: Determinantes',                  'Determinantes',               '2026-02-10 13:00:00', '2026-02-10 15:00:00', 'https://meet.google.com/test-alg-003', NULL, @rec_na, FALSE, @prof_alg1, NOW()),
-- PC2: Feb 12, 17, 19
(@eval_alg_pc2, 1, 'Clase 4: Sistemas de Ecuaciones Lineales','Sistemas lineales',           '2026-02-12 13:00:00', '2026-02-12 15:00:00', 'https://meet.google.com/test-alg-004', NULL, @rec_na, FALSE, @prof_alg1, NOW()),
(@eval_alg_pc2, 2, 'Clase 5: Método de Gauss',                'Método de Gauss',             '2026-02-17 13:00:00', '2026-02-17 15:00:00', 'https://meet.google.com/test-alg-005', NULL, @rec_na, FALSE, @prof_alg1, NOW()),
(@eval_alg_pc2, 3, 'Clase 6: Vectores en R²',                 'Vectores en el plano',        '2026-02-19 13:00:00', '2026-02-19 15:00:00', 'https://meet.google.com/test-alg-006', NULL, @rec_na, FALSE, @prof_alg1, NOW()),
-- EX1: Feb 24, 26, Mar 3
(@eval_alg_ex1, 1, 'Clase 7: Vectores en R³',                 'Vectores en el espacio',      '2026-02-24 13:00:00', '2026-02-24 15:00:00', 'https://meet.google.com/test-alg-007', NULL, @rec_na, FALSE, @prof_alg1, NOW()),
(@eval_alg_ex1, 2, 'Clase 8: Producto Punto y Cruz',          'Productos vectoriales',       '2026-02-26 13:00:00', '2026-02-26 15:00:00', 'https://meet.google.com/test-alg-008', NULL, @rec_na, FALSE, @prof_alg1, NOW()),
(@eval_alg_ex1, 3, 'Clase 9: Rectas en el Plano',             'Ecuaciones de rectas',        '2026-03-03 13:00:00', '2026-03-03 15:00:00', 'https://meet.google.com/test-alg-009', NULL, @rec_na, FALSE, @prof_alg1, NOW()),
-- PC3: Mar 5, 10, 12
(@eval_alg_pc3, 1, 'Clase 10: Planos en el Espacio',          'Ecuaciones de planos',        '2026-03-05 13:00:00', '2026-03-05 15:00:00', 'https://meet.google.com/test-alg-010', NULL, @rec_na, FALSE, @prof_alg1, NOW()),
(@eval_alg_pc3, 2, 'Clase 11: Espacios Vectoriales',          'Espacios vectoriales',        '2026-03-10 13:00:00', '2026-03-10 15:00:00', 'https://meet.google.com/test-alg-011', NULL, @rec_na, FALSE, @prof_alg1, NOW()),
(@eval_alg_pc3, 3, 'Clase 12: Subespacios',                   'Subespacios vectoriales',     '2026-03-12 13:00:00', '2026-03-12 15:00:00', 'https://meet.google.com/test-alg-012', NULL, @rec_na, FALSE, @prof_alg1, NOW()),
-- PC4: Mar 17, 19, 24
(@eval_alg_pc4, 1, 'Clase 13: Base y Dimensión',              'Base y dimensión',            '2026-03-17 13:00:00', '2026-03-17 15:00:00', 'https://meet.google.com/test-alg-013', NULL, @rec_na, FALSE, @prof_alg1, NOW()),
(@eval_alg_pc4, 2, 'Clase 14: Transformaciones Lineales',     'Transformaciones lineales',   '2026-03-19 13:00:00', '2026-03-19 15:00:00', 'https://meet.google.com/test-alg-014', NULL, @rec_na, FALSE, @prof_alg1, NOW()),
(@eval_alg_pc4, 3, 'Clase 15: Matrices de Transformación',    'Matrices de transformación',  '2026-03-24 13:00:00', '2026-03-24 15:00:00', 'https://meet.google.com/test-alg-015', NULL, @rec_na, FALSE, @prof_alg1, NOW()),
-- EX2: Mar 26, 31
(@eval_alg_ex2, 1, 'Clase 16: Valores y Vectores Propios',    'Eigenvalores',                '2026-03-26 13:00:00', '2026-03-26 15:00:00', 'https://meet.google.com/test-alg-016', NULL, @rec_na, FALSE, @prof_alg1, NOW()),
(@eval_alg_ex2, 2, 'Clase 17: Repaso General de Álgebra',     'Repaso general',              '2026-03-31 13:00:00', '2026-03-31 15:00:00', 'https://meet.google.com/test-alg-017', NULL, @rec_na, FALSE, @prof_alg1, NOW());

-- ── FUNDAMENTOS DE CÁLCULO ──
INSERT INTO class_event (evaluation_id, session_number, title, topic, start_datetime, end_datetime, live_meeting_url, recording_url, recording_status_id, is_cancelled, created_by, created_at) VALUES
-- PC1: Feb 3, 5, 10
(@eval_cal_pc1, 1, 'Clase 1: Funciones y Dominio',            'Funciones',                   '2026-02-03 13:00:00', '2026-02-03 15:00:00', 'https://meet.google.com/test-cal-001', NULL, @rec_na, FALSE, @prof_cal1, NOW()),
(@eval_cal_pc1, 2, 'Clase 2: Límites - Definición',           'Límites',                     '2026-02-05 13:00:00', '2026-02-05 15:00:00', 'https://meet.google.com/test-cal-002', NULL, @rec_na, FALSE, @prof_cal1, NOW()),
(@eval_cal_pc1, 3, 'Clase 3: Límites - Propiedades',          'Propiedades de límites',      '2026-02-10 13:00:00', '2026-02-10 15:00:00', 'https://meet.google.com/test-cal-003', NULL, @rec_na, FALSE, @prof_cal1, NOW()),
-- PC2: Feb 12, 17, 19
(@eval_cal_pc2, 1, 'Clase 4: Continuidad',                    'Continuidad',                 '2026-02-12 13:00:00', '2026-02-12 15:00:00', 'https://meet.google.com/test-cal-004', NULL, @rec_na, FALSE, @prof_cal1, NOW()),
(@eval_cal_pc2, 2, 'Clase 5: Derivada - Definición',          'Derivada',                    '2026-02-17 13:00:00', '2026-02-17 15:00:00', 'https://meet.google.com/test-cal-005', NULL, @rec_na, FALSE, @prof_cal1, NOW()),
(@eval_cal_pc2, 3, 'Clase 6: Reglas de Derivación',           'Reglas de derivación',        '2026-02-19 13:00:00', '2026-02-19 15:00:00', 'https://meet.google.com/test-cal-006', NULL, @rec_na, FALSE, @prof_cal1, NOW()),
-- EX1: Feb 24, 26, Mar 3
(@eval_cal_ex1, 1, 'Clase 7: Derivada de Funciones Compuestas','Regla de la cadena',         '2026-02-24 13:00:00', '2026-02-24 15:00:00', 'https://meet.google.com/test-cal-007', NULL, @rec_na, FALSE, @prof_cal1, NOW()),
(@eval_cal_ex1, 2, 'Clase 8: Derivadas Trigonométricas',      'Derivadas trigonométricas',   '2026-02-26 13:00:00', '2026-02-26 15:00:00', 'https://meet.google.com/test-cal-008', NULL, @rec_na, FALSE, @prof_cal1, NOW()),
(@eval_cal_ex1, 3, 'Clase 9: Aplicaciones de la Derivada',    'Aplicaciones',                '2026-03-03 13:00:00', '2026-03-03 15:00:00', 'https://meet.google.com/test-cal-009', NULL, @rec_na, FALSE, @prof_cal1, NOW()),
-- PC3: Mar 5, 10, 12
(@eval_cal_pc3, 1, 'Clase 10: Máximos y Mínimos',             'Optimización',                '2026-03-05 13:00:00', '2026-03-05 15:00:00', 'https://meet.google.com/test-cal-010', NULL, @rec_na, FALSE, @prof_cal1, NOW()),
(@eval_cal_pc3, 2, 'Clase 11: Integrales - Definición',       'Integral indefinida',         '2026-03-10 13:00:00', '2026-03-10 15:00:00', 'https://meet.google.com/test-cal-011', NULL, @rec_na, FALSE, @prof_cal1, NOW()),
(@eval_cal_pc3, 3, 'Clase 12: Métodos de Integración',        'Técnicas de integración',     '2026-03-12 13:00:00', '2026-03-12 15:00:00', 'https://meet.google.com/test-cal-012', NULL, @rec_na, FALSE, @prof_cal1, NOW()),
-- PC4: Mar 17, 19, 24
(@eval_cal_pc4, 1, 'Clase 13: Integral Definida',             'Integral definida',           '2026-03-17 13:00:00', '2026-03-17 15:00:00', 'https://meet.google.com/test-cal-013', NULL, @rec_na, FALSE, @prof_cal1, NOW()),
(@eval_cal_pc4, 2, 'Clase 14: Teorema Fundamental',           'Teorema fundamental',         '2026-03-19 13:00:00', '2026-03-19 15:00:00', 'https://meet.google.com/test-cal-014', NULL, @rec_na, FALSE, @prof_cal1, NOW()),
(@eval_cal_pc4, 3, 'Clase 15: Aplicaciones de Integrales',    'Aplicaciones de integrales',  '2026-03-24 13:00:00', '2026-03-24 15:00:00', 'https://meet.google.com/test-cal-015', NULL, @rec_na, FALSE, @prof_cal1, NOW()),
-- EX2: Mar 26, 31
(@eval_cal_ex2, 1, 'Clase 16: Área entre Curvas',             'Área entre curvas',           '2026-03-26 13:00:00', '2026-03-26 15:00:00', 'https://meet.google.com/test-cal-016', NULL, @rec_na, FALSE, @prof_cal1, NOW()),
(@eval_cal_ex2, 2, 'Clase 17: Repaso General de Cálculo',     'Repaso general',              '2026-03-31 13:00:00', '2026-03-31 15:00:00', 'https://meet.google.com/test-cal-017', NULL, @rec_na, FALSE, @prof_cal1, NOW());

-- ── FUNDAMENTOS DE FÍSICA ──
INSERT INTO class_event (evaluation_id, session_number, title, topic, start_datetime, end_datetime, live_meeting_url, recording_url, recording_status_id, is_cancelled, created_by, created_at) VALUES
-- PC1: Feb 3, 5, 10
(@eval_fis_pc1, 1, 'Clase 1: Magnitudes y Unidades',          'Magnitudes físicas',          '2026-02-03 13:00:00', '2026-02-03 15:00:00', 'https://meet.google.com/test-fis-001', NULL, @rec_na, FALSE, @prof_fis, NOW()),
(@eval_fis_pc1, 2, 'Clase 2: Vectores y Descomposición',      'Vectores',                    '2026-02-05 13:00:00', '2026-02-05 15:00:00', 'https://meet.google.com/test-fis-002', NULL, @rec_na, FALSE, @prof_fis, NOW()),
(@eval_fis_pc1, 3, 'Clase 3: Cinemática Rectilínea',          'Cinemática',                  '2026-02-10 13:00:00', '2026-02-10 15:00:00', 'https://meet.google.com/test-fis-003', NULL, @rec_na, FALSE, @prof_fis, NOW()),
-- PC2: Feb 12, 17, 19
(@eval_fis_pc2, 1, 'Clase 4: MRU y MRUV',                     'Movimiento rectilíneo',       '2026-02-12 13:00:00', '2026-02-12 15:00:00', 'https://meet.google.com/test-fis-004', NULL, @rec_na, FALSE, @prof_fis, NOW()),
(@eval_fis_pc2, 2, 'Clase 5: Caída Libre',                    'Caída libre',                 '2026-02-17 13:00:00', '2026-02-17 15:00:00', 'https://meet.google.com/test-fis-005', NULL, @rec_na, FALSE, @prof_fis, NOW()),
(@eval_fis_pc2, 3, 'Clase 6: Movimiento Parabólico',          'Proyectiles',                 '2026-02-19 13:00:00', '2026-02-19 15:00:00', 'https://meet.google.com/test-fis-006', NULL, @rec_na, FALSE, @prof_fis, NOW()),
-- EX1: Feb 24, 26, Mar 3
(@eval_fis_ex1, 1, 'Clase 7: Leyes de Newton I',              'Primera y segunda ley',       '2026-02-24 13:00:00', '2026-02-24 15:00:00', 'https://meet.google.com/test-fis-007', NULL, @rec_na, FALSE, @prof_fis, NOW()),
(@eval_fis_ex1, 2, 'Clase 8: Leyes de Newton II',             'Tercera ley y aplicaciones',  '2026-02-26 13:00:00', '2026-02-26 15:00:00', 'https://meet.google.com/test-fis-008', NULL, @rec_na, FALSE, @prof_fis, NOW()),
(@eval_fis_ex1, 3, 'Clase 9: Fuerza de Fricción',             'Fricción',                    '2026-03-03 13:00:00', '2026-03-03 15:00:00', 'https://meet.google.com/test-fis-009', NULL, @rec_na, FALSE, @prof_fis, NOW()),
-- PC3: Mar 5, 10, 12
(@eval_fis_pc3, 1, 'Clase 10: Trabajo Mecánico',              'Trabajo',                     '2026-03-05 13:00:00', '2026-03-05 15:00:00', 'https://meet.google.com/test-fis-010', NULL, @rec_na, FALSE, @prof_fis, NOW()),
(@eval_fis_pc3, 2, 'Clase 11: Energía Cinética',              'Energía cinética',            '2026-03-10 13:00:00', '2026-03-10 15:00:00', 'https://meet.google.com/test-fis-011', NULL, @rec_na, FALSE, @prof_fis, NOW()),
(@eval_fis_pc3, 3, 'Clase 12: Energía Potencial',             'Energía potencial',           '2026-03-12 13:00:00', '2026-03-12 15:00:00', 'https://meet.google.com/test-fis-012', NULL, @rec_na, FALSE, @prof_fis, NOW()),
-- PC4: Mar 17, 19, 24
(@eval_fis_pc4, 1, 'Clase 13: Conservación de Energía',       'Conservación de energía',     '2026-03-17 13:00:00', '2026-03-17 15:00:00', 'https://meet.google.com/test-fis-013', NULL, @rec_na, FALSE, @prof_fis, NOW()),
(@eval_fis_pc4, 2, 'Clase 14: Impulso y Cantidad de Movimiento','Momentum',                  '2026-03-19 13:00:00', '2026-03-19 15:00:00', 'https://meet.google.com/test-fis-014', NULL, @rec_na, FALSE, @prof_fis, NOW()),
(@eval_fis_pc4, 3, 'Clase 15: Colisiones',                    'Colisiones',                  '2026-03-24 13:00:00', '2026-03-24 15:00:00', 'https://meet.google.com/test-fis-015', NULL, @rec_na, FALSE, @prof_fis, NOW()),
-- EX2: Mar 26, 31
(@eval_fis_ex2, 1, 'Clase 16: Movimiento Circular',           'Movimiento circular',         '2026-03-26 13:00:00', '2026-03-26 15:00:00', 'https://meet.google.com/test-fis-016', NULL, @rec_na, FALSE, @prof_fis, NOW()),
(@eval_fis_ex2, 2, 'Clase 17: Repaso General de Física',      'Repaso general',              '2026-03-31 13:00:00', '2026-03-31 15:00:00', 'https://meet.google.com/test-fis-017', NULL, @rec_na, FALSE, @prof_fis, NOW());

-- ── QUÍMICA ──
INSERT INTO class_event (evaluation_id, session_number, title, topic, start_datetime, end_datetime, live_meeting_url, recording_url, recording_status_id, is_cancelled, created_by, created_at) VALUES
-- PC1: Feb 3, 5, 10
(@eval_qui_pc1, 1, 'Clase 1: Materia y sus Propiedades',      'Materia',                     '2026-02-03 13:00:00', '2026-02-03 15:00:00', 'https://meet.google.com/test-qui-001', NULL, @rec_na, FALSE, @prof_qui, NOW()),
(@eval_qui_pc1, 2, 'Clase 2: Estructura Atómica',             'Átomo',                       '2026-02-05 13:00:00', '2026-02-05 15:00:00', 'https://meet.google.com/test-qui-002', NULL, @rec_na, FALSE, @prof_qui, NOW()),
(@eval_qui_pc1, 3, 'Clase 3: Tabla Periódica',                'Tabla periódica',             '2026-02-10 13:00:00', '2026-02-10 15:00:00', 'https://meet.google.com/test-qui-003', NULL, @rec_na, FALSE, @prof_qui, NOW()),
-- PC2: Feb 12, 17, 19
(@eval_qui_pc2, 1, 'Clase 4: Configuración Electrónica',      'Configuración electrónica',   '2026-02-12 13:00:00', '2026-02-12 15:00:00', 'https://meet.google.com/test-qui-004', NULL, @rec_na, FALSE, @prof_qui, NOW()),
(@eval_qui_pc2, 2, 'Clase 5: Enlaces Químicos',               'Enlaces químicos',            '2026-02-17 13:00:00', '2026-02-17 15:00:00', 'https://meet.google.com/test-qui-005', NULL, @rec_na, FALSE, @prof_qui, NOW()),
(@eval_qui_pc2, 3, 'Clase 6: Enlace Iónico y Covalente',      'Tipos de enlace',             '2026-02-19 13:00:00', '2026-02-19 15:00:00', 'https://meet.google.com/test-qui-006', NULL, @rec_na, FALSE, @prof_qui, NOW()),
-- EX1: Feb 24, 26, Mar 3
(@eval_qui_ex1, 1, 'Clase 7: Nomenclatura Inorgánica',        'Nomenclatura',                '2026-02-24 13:00:00', '2026-02-24 15:00:00', 'https://meet.google.com/test-qui-007', NULL, @rec_na, FALSE, @prof_qui, NOW()),
(@eval_qui_ex1, 2, 'Clase 8: Reacciones Químicas',            'Reacciones',                  '2026-02-26 13:00:00', '2026-02-26 15:00:00', 'https://meet.google.com/test-qui-008', NULL, @rec_na, FALSE, @prof_qui, NOW()),
(@eval_qui_ex1, 3, 'Clase 9: Balanceo de Ecuaciones',         'Balanceo',                    '2026-03-03 13:00:00', '2026-03-03 15:00:00', 'https://meet.google.com/test-qui-009', NULL, @rec_na, FALSE, @prof_qui, NOW()),
-- PC3: Mar 5, 10, 12
(@eval_qui_pc3, 1, 'Clase 10: Estequiometría I',              'Estequiometría básica',       '2026-03-05 13:00:00', '2026-03-05 15:00:00', 'https://meet.google.com/test-qui-010', NULL, @rec_na, FALSE, @prof_qui, NOW()),
(@eval_qui_pc3, 2, 'Clase 11: Estequiometría II',             'Estequiometría avanzada',     '2026-03-10 13:00:00', '2026-03-10 15:00:00', 'https://meet.google.com/test-qui-011', NULL, @rec_na, FALSE, @prof_qui, NOW()),
(@eval_qui_pc3, 3, 'Clase 12: Soluciones',                    'Soluciones químicas',         '2026-03-12 13:00:00', '2026-03-12 15:00:00', 'https://meet.google.com/test-qui-012', NULL, @rec_na, FALSE, @prof_qui, NOW()),
-- PC4: Mar 17, 19, 24
(@eval_qui_pc4, 1, 'Clase 13: Concentración',                 'Concentración',               '2026-03-17 13:00:00', '2026-03-17 15:00:00', 'https://meet.google.com/test-qui-013', NULL, @rec_na, FALSE, @prof_qui, NOW()),
(@eval_qui_pc4, 2, 'Clase 14: Ácidos y Bases',                'Ácidos y bases',              '2026-03-19 13:00:00', '2026-03-19 15:00:00', 'https://meet.google.com/test-qui-014', NULL, @rec_na, FALSE, @prof_qui, NOW()),
(@eval_qui_pc4, 3, 'Clase 15: pH y Equilibrio',               'pH',                          '2026-03-24 13:00:00', '2026-03-24 15:00:00', 'https://meet.google.com/test-qui-015', NULL, @rec_na, FALSE, @prof_qui, NOW()),
-- EX2: Mar 26, 31
(@eval_qui_ex2, 1, 'Clase 16: Termodinámica Básica',          'Termodinámica',               '2026-03-26 13:00:00', '2026-03-26 15:00:00', 'https://meet.google.com/test-qui-016', NULL, @rec_na, FALSE, @prof_qui, NOW()),
(@eval_qui_ex2, 2, 'Clase 17: Repaso General de Química',     'Repaso general',              '2026-03-31 13:00:00', '2026-03-31 15:00:00', 'https://meet.google.com/test-qui-017', NULL, @rec_na, FALSE, @prof_qui, NOW());

-- ── EVENTOS ADICIONALES: DOCENTE PASALO (ÁLGEBRA) ──
-- Clases cada 2 días desde Feb 20 hasta Mar 20, horario 16:00-18:00 UTC (11:00 AM - 1:00 PM Perú)
-- Creados por docentepasalo@gmail.com
INSERT INTO class_event (evaluation_id, session_number, title, topic, start_datetime, end_datetime, live_meeting_url, recording_url, recording_status_id, is_cancelled, created_by, created_at) VALUES
-- PC2: Feb 20
(@eval_alg_pc2, 4, '4° Clase - PC2', 'Repaso de vectores en el plano',        '2026-02-20 16:00:00', '2026-02-20 18:00:00', 'https://meet.google.com/test-doc-001', NULL, @rec_na, FALSE, @docente_user_id, NOW()),
-- EX1: Feb 22, 24, 26, 28, Mar 2, 4
(@eval_alg_ex1, 4, '4° Clase - EX1', 'Producto escalar y sus aplicaciones',   '2026-02-22 16:00:00', '2026-02-22 18:00:00', 'https://meet.google.com/test-doc-002', NULL, @rec_na, FALSE, @docente_user_id, NOW()),
(@eval_alg_ex1, 5, '5° Clase - EX1', 'Proyecciones y ángulos entre vectores', '2026-02-24 16:00:00', '2026-02-24 18:00:00', 'https://meet.google.com/test-doc-003', NULL, @rec_na, FALSE, @docente_user_id, NOW()),
(@eval_alg_ex1, 6, '6° Clase - EX1', 'Rectas en R²: formas paramétricas',    '2026-02-26 16:00:00', '2026-02-26 18:00:00', 'https://meet.google.com/test-doc-004', NULL, @rec_na, FALSE, @docente_user_id, NOW()),
(@eval_alg_ex1, 7, '7° Clase - EX1', 'Rectas en R²: ecuación general',       '2026-02-28 16:00:00', '2026-02-28 18:00:00', 'https://meet.google.com/test-doc-005', NULL, @rec_na, FALSE, @docente_user_id, NOW()),
(@eval_alg_ex1, 8, '8° Clase - EX1', 'Intersección y distancia entre rectas', '2026-03-02 16:00:00', '2026-03-02 18:00:00', 'https://meet.google.com/test-doc-006', NULL, @rec_na, FALSE, @docente_user_id, NOW()),
(@eval_alg_ex1, 9, '9° Clase - EX1', 'Repaso para Examen 1',                 '2026-03-04 16:00:00', '2026-03-04 18:00:00', 'https://meet.google.com/test-doc-007', NULL, @rec_na, FALSE, @docente_user_id, NOW()),
-- PC3: Mar 6, 8, 10, 12, 14
(@eval_alg_pc3, 4, '4° Clase - PC3', 'Planos en R³: ecuación general',       '2026-03-06 16:00:00', '2026-03-06 18:00:00', 'https://meet.google.com/test-doc-008', NULL, @rec_na, FALSE, @docente_user_id, NOW()),
(@eval_alg_pc3, 5, '5° Clase - PC3', 'Intersección de planos',               '2026-03-08 16:00:00', '2026-03-08 18:00:00', 'https://meet.google.com/test-doc-009', NULL, @rec_na, FALSE, @docente_user_id, NOW()),
(@eval_alg_pc3, 6, '6° Clase - PC3', 'Espacios vectoriales: definición',     '2026-03-10 16:00:00', '2026-03-10 18:00:00', 'https://meet.google.com/test-doc-010', NULL, @rec_na, FALSE, @docente_user_id, NOW()),
(@eval_alg_pc3, 7, '7° Clase - PC3', 'Combinaciones lineales',               '2026-03-12 16:00:00', '2026-03-12 18:00:00', 'https://meet.google.com/test-doc-011', NULL, @rec_na, FALSE, @docente_user_id, NOW()),
(@eval_alg_pc3, 8, '8° Clase - PC3', 'Dependencia e independencia lineal',   '2026-03-14 16:00:00', '2026-03-14 18:00:00', 'https://meet.google.com/test-doc-012', NULL, @rec_na, FALSE, @docente_user_id, NOW()),
-- PC4: Mar 16, 18, 20
(@eval_alg_pc4, 4, '4° Clase - PC4', 'Base de un espacio vectorial',         '2026-03-16 16:00:00', '2026-03-16 18:00:00', 'https://meet.google.com/test-doc-013', NULL, @rec_na, FALSE, @docente_user_id, NOW()),
(@eval_alg_pc4, 5, '5° Clase - PC4', 'Dimensión y rango',                    '2026-03-18 16:00:00', '2026-03-18 18:00:00', 'https://meet.google.com/test-doc-014', NULL, @rec_na, FALSE, @docente_user_id, NOW()),
(@eval_alg_pc4, 6, '6° Clase - PC4', 'Intro a transformaciones lineales',    '2026-03-20 16:00:00', '2026-03-20 18:00:00', 'https://meet.google.com/test-doc-015', NULL, @rec_na, FALSE, @docente_user_id, NOW());

-- -----------------------------------------------------------------------------
-- 10. ASIGNACIÓN DE PROFESORES A EVENTOS DE CLASE (CLASS_EVENT_PROFESSOR)
-- -----------------------------------------------------------------------------
-- Asigna automáticamente todos los profesores de cada curso a sus class_events

INSERT INTO class_event_professor (class_event_id, professor_user_id, assigned_at)
SELECT ce.id, ccp.professor_user_id, NOW()
FROM class_event ce
JOIN evaluation ev ON ce.evaluation_id = ev.id
JOIN course_cycle_professor ccp ON ev.course_cycle_id = ccp.course_cycle_id
WHERE ev.course_cycle_id IN (@cc_alg_id, @cc_cal_id, @cc_fis_id, @cc_qui_id);

-- Confirmación visual
SELECT 'Datos cargados exitosamente' AS Status,
       @current_cycle_id AS CycleID,
       (SELECT COUNT(*) FROM enrollment WHERE user_id = @target_student_id) AS TotalEnrollments,
       (SELECT COUNT(*) FROM evaluation WHERE course_cycle_id IN (@cc_alg_id, @cc_cal_id, @cc_fis_id, @cc_qui_id)) AS TotalEvaluations,
       (SELECT COUNT(*) FROM class_event ce JOIN evaluation ev ON ce.evaluation_id = ev.id WHERE ev.course_cycle_id IN (@cc_alg_id, @cc_cal_id, @cc_fis_id, @cc_qui_id)) AS TotalClassEvents;
