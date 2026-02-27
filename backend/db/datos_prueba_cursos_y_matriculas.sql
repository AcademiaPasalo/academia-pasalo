-- =============================================================================
-- SCRIPT DE CARGA DE DATOS DE PRUEBA: CURSOS, PROFESORES, MATRÍCULAS Y SESIONES
-- =============================================================================
-- Descripción:
-- 1. Identifica el Ciclo Académico Actual.
-- 2. Crea 6 usuarios con rol de Profesor.
-- 3. Crea 4 cursos de tipo 'CIENCIAS'.
-- 4. Crea 6 evaluaciones por curso (PC1, PC2, EX1, PC3, PC4, EX2).
-- 5. Crea 4 sesiones por evaluación (24 sesiones por curso) SIN CRUCES.
-- 6. REGLAS: Inicio >= 08:00, Fin <= 23:00.
-- =============================================================================

USE academia_pasalo;

-- -----------------------------------------------------------------------------
-- 1. OBTENCIÓN DE IDs DE CONFIGURACIÓN Y METADATA
-- -----------------------------------------------------------------------------
SET @current_cycle_id = (SELECT CAST(setting_value AS UNSIGNED) FROM system_setting WHERE setting_key = 'ACTIVE_CYCLE_ID' LIMIT 1);
SET @current_cycle_id = IFNULL(@current_cycle_id, (SELECT id FROM academic_cycle ORDER BY id DESC LIMIT 1));

SET @role_professor_id = (SELECT id FROM role WHERE code = 'PROFESSOR' LIMIT 1);
SET @type_ciencias_id  = (SELECT id FROM course_type WHERE code = 'CIENCIAS' LIMIT 1);
SET @level_1_id        = (SELECT id FROM cycle_level WHERE level_number = 1 LIMIT 1);
SET @status_active_id  = (SELECT id FROM enrollment_status WHERE code = 'ACTIVE' LIMIT 1);
SET @type_full_id      = (SELECT id FROM enrollment_type WHERE code = 'FULL' LIMIT 1);
SET @target_student_id = 1;
SET @docente_user_id   = (SELECT id FROM user WHERE email = 'docentepasalo@gmail.com' LIMIT 1);

-- -----------------------------------------------------------------------------
-- 2. CREACIÓN DE PROFESORES
-- -----------------------------------------------------------------------------
INSERT INTO user (email, first_name, last_name_1, last_name_2, photo_source, created_at) VALUES
('profesor.algebra@fake.com', 'Jorge', 'Sarmiento', 'Pérez', 'none', NOW()),
('profesor.calculo@fake.com', 'Ricardo', 'Feynman', 'López', 'none', NOW()),
('profesor.fisica@fake.com',  'Albert', 'Newton', 'Ruiz',   'none', NOW()),
('profesor.quimica@fake.com', 'Marie',  'Lavoisier','Díaz', 'none', NOW());

SET @prof_alg = (SELECT id FROM user WHERE email = 'profesor.algebra@fake.com');
SET @prof_cal = (SELECT id FROM user WHERE email = 'profesor.calculo@fake.com');
SET @prof_fis = (SELECT id FROM user WHERE email = 'profesor.fisica@fake.com');
SET @prof_qui = (SELECT id FROM user WHERE email = 'profesor.quimica@fake.com');

INSERT INTO user_role (user_id, role_id) VALUES
(@prof_alg, @role_professor_id), (@prof_cal, @role_professor_id),
(@prof_fis, @role_professor_id), (@prof_qui, @role_professor_id);

-- -----------------------------------------------------------------------------
-- 3. CREACIÓN DE CURSOS
-- -----------------------------------------------------------------------------
INSERT INTO course (course_type_id, cycle_level_id, code, name, created_at) VALUES
(@type_ciencias_id, @level_1_id, 'MATE101', 'Álgebra Matricial', NOW()),
(@type_ciencias_id, @level_1_id, 'MATE102', 'Cálculo I', NOW()),
(@type_ciencias_id, @level_1_id, 'FIS101', 'Física I', NOW()),
(@type_ciencias_id, @level_1_id, 'QUI101', 'Química General', NOW());

SET @course_alg_id = (SELECT id FROM course WHERE code = 'MATE101');
SET @course_cal_id = (SELECT id FROM course WHERE code = 'MATE102');
SET @course_fis_id = (SELECT id FROM course WHERE code = 'FIS101');
SET @course_qui_id = (SELECT id FROM course WHERE code = 'QUI101');

INSERT INTO course_cycle (course_id, academic_cycle_id) VALUES 
(@course_alg_id, @current_cycle_id), (@course_cal_id, @current_cycle_id),
(@course_fis_id, @current_cycle_id), (@course_qui_id, @current_cycle_id);

SET @cc_alg_id = (SELECT id FROM course_cycle WHERE course_id = @course_alg_id);
SET @cc_cal_id = (SELECT id FROM course_cycle WHERE course_id = @course_cal_id);
SET @cc_fis_id = (SELECT id FROM course_cycle WHERE course_id = @course_fis_id);
SET @cc_qui_id = (SELECT id FROM course_cycle WHERE course_id = @course_qui_id);

INSERT INTO course_cycle_professor (course_cycle_id, professor_user_id, assigned_at) VALUES
(@cc_alg_id, @prof_alg, NOW()), (@cc_alg_id, @docente_user_id, NOW()),
(@cc_cal_id, @prof_cal, NOW()), (@cc_fis_id, @prof_fis, NOW()), (@cc_qui_id, @prof_qui, NOW());

-- -----------------------------------------------------------------------------
-- 4. MATRÍCULAS
-- -----------------------------------------------------------------------------
INSERT INTO enrollment (user_id, course_cycle_id, enrollment_status_id, enrollment_type_id, enrolled_at) VALUES
(@target_student_id, @cc_alg_id, @status_active_id, @type_full_id, NOW()),
(@target_student_id, @cc_cal_id, @status_active_id, @type_full_id, NOW()),
(@target_student_id, @cc_fis_id, @status_active_id, @type_full_id, NOW()),
(@target_student_id, @cc_qui_id, @status_active_id, @type_full_id, NOW());

-- -----------------------------------------------------------------------------
-- 5. EVALUACIONES
-- -----------------------------------------------------------------------------
SET @t_pc = (SELECT id FROM evaluation_type WHERE code = 'PC' LIMIT 1);
SET @t_ex = (SELECT id FROM evaluation_type WHERE code = 'EX' LIMIT 1);

SET @d1_s = '2026-01-12 05:00:00'; SET @d1_e = '2026-01-25 23:59:59';
SET @d2_s = '2026-01-26 05:00:00'; SET @d2_e = '2026-02-08 23:59:59';
SET @d3_s = '2026-02-09 05:00:00'; SET @d3_e = '2026-02-22 23:59:59';
SET @d4_s = '2026-02-23 05:00:00'; SET @d4_e = '2026-03-08 23:59:59';
SET @d5_s = '2026-03-09 05:00:00'; SET @d5_e = '2026-03-22 23:59:59';
SET @d6_s = '2026-03-23 05:00:00'; SET @d6_e = '2026-03-31 23:59:59';

INSERT INTO evaluation (course_cycle_id, evaluation_type_id, number, start_date, end_date)
SELECT cc.id, type.id, num.n, dates.start, dates.end
FROM course_cycle cc
CROSS JOIN (SELECT @t_pc AS id, 'PC' AS code UNION SELECT @t_ex, 'EX') type
CROSS JOIN (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) num
JOIN (
    SELECT 'PC' AS code, 1 AS n, @d1_s AS start, @d1_e AS end UNION
    SELECT 'PC', 2, @d2_s, @d2_e UNION
    SELECT 'EX', 1, @d3_s, @d3_e UNION
    SELECT 'PC', 3, @d4_s, @d4_e UNION
    SELECT 'PC', 4, @d5_s, @d5_e UNION
    SELECT 'EX', 2, @d6_s, @d6_e
) dates ON type.code = dates.code AND num.n = dates.n
WHERE cc.id IN (@cc_alg_id, @cc_cal_id, @cc_fis_id, @cc_qui_id);

INSERT INTO enrollment_evaluation (enrollment_id, evaluation_id, access_start_date, access_end_date, is_active)
SELECT e.id, ev.id, ev.start_date, ev.end_date, TRUE
FROM enrollment e
JOIN evaluation ev ON ev.course_cycle_id = e.course_cycle_id;

-- -----------------------------------------------------------------------------
-- 6. SESIONES (REGLA: INICIO >= 08:00, FIN <= 23:00)
-- -----------------------------------------------------------------------------
SET @rec_na = (SELECT id FROM class_event_recording_status WHERE code = 'NOT_AVAILABLE' LIMIT 1);

DROP PROCEDURE IF EXISTS GenerateSessions;
DELIMITER //
CREATE PROCEDURE GenerateSessions()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE eval_id BIGINT;
    DECLARE c_code VARCHAR(10);
    DECLARE e_num INT;
    DECLARE e_type VARCHAR(10);
    DECLARE e_date DATE;
    DECLARE prof_id BIGINT;
    DECLARE day_offset INT;
    
    DECLARE cur CURSOR FOR 
        SELECT ev.id, c.code, ev.number, et.code, DATE(ev.start_date), 
               (SELECT professor_user_id FROM course_cycle_professor WHERE course_cycle_id = ev.course_cycle_id LIMIT 1)
        FROM evaluation ev
        JOIN course_cycle cc ON ev.course_cycle_id = cc.id
        JOIN course c ON cc.course_id = c.id
        JOIN evaluation_type et ON ev.evaluation_type_id = et.id;
        
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO eval_id, c_code, e_num, e_type, e_date, prof_id;
        IF done THEN LEAVE read_loop; END IF;

        SET day_offset = CASE 
            WHEN c_code = 'MATE101' THEN 0 
            WHEN c_code = 'MATE102' THEN 1
            WHEN c_code = 'FIS101'  THEN 2
            WHEN c_code = 'QUI101'  THEN 3
            ELSE 4 END;

        -- Sesión 1: Semana 1, Día asignado, 18:00 - 20:00 (Noche)
        INSERT INTO class_event (evaluation_id, session_number, title, topic, start_datetime, end_datetime, live_meeting_url, recording_status_id, created_by, created_at)
        VALUES (eval_id, 1, CONCAT('Sesión 1 - ', e_type, e_num), 'Introducción', 
                DATE_ADD(DATE_ADD(e_date, INTERVAL day_offset DAY), INTERVAL 18 HOUR),
                DATE_ADD(DATE_ADD(e_date, INTERVAL day_offset DAY), INTERVAL 20 HOUR),
                'https://meet.google.com/pasalo-test', @rec_na, prof_id, NOW());

        -- Sesión 2: Semana 1, Sábado, Bloque Rotativo desde 08:00 AM
        INSERT INTO class_event (evaluation_id, session_number, title, topic, start_datetime, end_datetime, live_meeting_url, recording_status_id, created_by, created_at)
        VALUES (eval_id, 2, CONCAT('Sesión 2 - ', e_type, e_num), 'Ejercicios', 
                DATE_ADD(DATE_ADD(e_date, INTERVAL 5 DAY), INTERVAL (8 + day_offset * 2) HOUR),
                DATE_ADD(DATE_ADD(e_date, INTERVAL 5 DAY), INTERVAL (10 + day_offset * 2) HOUR),
                'https://meet.google.com/pasalo-test', @rec_na, prof_id, NOW());

        -- Sesión 3: Semana 2, Día asignado, 19:00 - 21:00 (Noche)
        INSERT INTO class_event (evaluation_id, session_number, title, topic, start_datetime, end_datetime, live_meeting_url, recording_status_id, created_by, created_at)
        VALUES (eval_id, 3, CONCAT('Sesión 3 - ', e_type, e_num), 'Avanzado', 
                DATE_ADD(DATE_ADD(e_date, INTERVAL (7 + day_offset) DAY), INTERVAL 19 HOUR),
                DATE_ADD(DATE_ADD(e_date, INTERVAL (7 + day_offset) DAY), INTERVAL 21 HOUR),
                'https://meet.google.com/pasalo-test', @rec_na, prof_id, NOW());

        -- Sesión 4: Semana 2, Domingo, Bloque Rotativo desde 09:00 AM
        INSERT INTO class_event (evaluation_id, session_number, title, topic, start_datetime, end_datetime, live_meeting_url, recording_status_id, created_by, created_at)
        VALUES (eval_id, 4, CONCAT('Sesión 4 - ', e_type, e_num), 'Repaso', 
                DATE_ADD(DATE_ADD(e_date, INTERVAL 6 DAY), INTERVAL (9 + day_offset * 2) HOUR),
                DATE_ADD(DATE_ADD(e_date, INTERVAL 6 DAY), INTERVAL (11 + day_offset * 2) HOUR),
                'https://meet.google.com/pasalo-test', @rec_na, prof_id, NOW());

    END LOOP;
    CLOSE cur;
END //
DELIMITER ;

CALL GenerateSessions();
DROP PROCEDURE IF EXISTS GenerateSessions;

INSERT IGNORE INTO class_event_professor (class_event_id, professor_user_id, assigned_at)
SELECT ce.id, ccp.professor_user_id, NOW()
FROM class_event ce
JOIN evaluation ev ON ce.evaluation_id = ev.id
JOIN course_cycle_professor ccp ON ev.course_cycle_id = ccp.course_cycle_id;

SELECT 'Data OK: 96 Sesiones (Inicio >= 08:00, Fin <= 21:00)' AS Status;
