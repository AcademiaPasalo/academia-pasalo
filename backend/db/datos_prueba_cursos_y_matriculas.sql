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

-- -----------------------------------------------------------------------------
-- 4. ASIGNACIÓN DE PROFESORES A LOS CURSOS (COURSE_CYCLE_PROFESSOR)
-- -----------------------------------------------------------------------------

-- Álgebra: 2 Profesores
INSERT INTO course_cycle_professor (course_cycle_id, professor_user_id, assigned_at) VALUES
(@cc_alg_id, @prof_alg1, NOW()),
(@cc_alg_id, @prof_alg2, NOW());

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
SET @d1_s = '2026-01-16 13:00:00'; SET @d1_e = '2026-01-21 04:59:59'; -- PC1
SET @d2_s = '2026-01-23 13:00:00'; SET @d2_e = '2026-01-28 04:59:59'; -- PC2
SET @d3_s = '2026-01-30 13:00:00'; SET @d3_e = '2026-02-04 04:59:59'; -- EX1
SET @d4_s = '2026-02-06 13:00:00'; SET @d4_e = '2026-02-11 04:59:59'; -- PC3
SET @d5_s = '2026-02-13 13:00:00'; SET @d5_e = '2026-02-18 04:59:59'; -- PC4
SET @d6_s = '2026-02-20 13:00:00'; SET @d6_e = '2026-02-25 04:59:59'; -- EX2

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

-- Confirmación visual
SELECT 'Datos cargados exitosamente' AS Status, 
       @current_cycle_id AS CycleID,
       (SELECT COUNT(*) FROM enrollment WHERE user_id = @target_student_id) AS TotalEnrollments,
       (SELECT COUNT(*) FROM evaluation WHERE course_cycle_id IN (@cc_alg_id, @cc_cal_id, @cc_fis_id, @cc_qui_id)) AS TotalEvaluations;
