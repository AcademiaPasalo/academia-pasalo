-- Seed SQL: banco de enunciados con archivos de Google Drive
-- Generado automaticamente desde estado actual de Drive + BD
SET NAMES utf8mb4;
SET @actor_user_id = 1;
SET @folder_status_active = (SELECT id FROM folder_status WHERE code = 'ACTIVE' LIMIT 1);
SET @material_status_active = (SELECT id FROM material_status WHERE code = 'ACTIVE' LIMIT 1);
SET @evaluation_type_banco = (SELECT id FROM evaluation_type WHERE code = 'BANCO_ENUNCIADOS' LIMIT 1);

-- course_cycle 17 (QUI101 - 2026-0)
INSERT INTO evaluation (course_cycle_id, evaluation_type_id, number, start_date, end_date)
SELECT
  17,
  @evaluation_type_banco,
  0,
  (SELECT ac.start_date FROM academic_cycle ac INNER JOIN course_cycle cc ON cc.academic_cycle_id = ac.id WHERE cc.id = 17 LIMIT 1),
  (SELECT ac.end_date FROM academic_cycle ac INNER JOIN course_cycle cc ON cc.academic_cycle_id = ac.id WHERE cc.id = 17 LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM evaluation e
  WHERE e.course_cycle_id = 17 AND e.evaluation_type_id = @evaluation_type_banco AND e.number = 0
);

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  NULL,
  @folder_status_active,
  'Practicas Calificadas',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id IS NULL
    AND mf.name = 'Practicas Calificadas'
);

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  NULL,
  @folder_status_active,
  'Practicas Dirigidas',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id IS NULL
    AND mf.name = 'Practicas Dirigidas'
);

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  NULL,
  @folder_status_active,
  'Examenes',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id IS NULL
    AND mf.name = 'Examenes'
);

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'EX1',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'EX1'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1yNOZ2jqOO876W_Je8ts7Jn-G9PX_yGa3',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1yNOZ2jqOO876W_Je8ts7Jn-G9PX_yGa3',
  'https://docs.google.com/document/d/1yNOZ2jqOO876W_Je8ts7Jn-G9PX_yGa3/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1yNOZ2jqOO876W_Je8ts7Jn-G9PX_yGa3'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1yNOZ2jqOO876W_Je8ts7Jn-G9PX_yGa3/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1yNOZ2jqOO876W_Je8ts7Jn-G9PX_yGa3'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1yNOZ2jqOO876W_Je8ts7Jn-G9PX_yGa3'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1LFJsupbTVJ9wCRzQD4My5fEptb9tGJnG',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1LFJsupbTVJ9wCRzQD4My5fEptb9tGJnG',
  'https://drive.google.com/file/d/1LFJsupbTVJ9wCRzQD4My5fEptb9tGJnG/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1LFJsupbTVJ9wCRzQD4My5fEptb9tGJnG'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1LFJsupbTVJ9wCRzQD4My5fEptb9tGJnG/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1LFJsupbTVJ9wCRzQD4My5fEptb9tGJnG'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1LFJsupbTVJ9wCRzQD4My5fEptb9tGJnG'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1D1MjzR0tbFXThEwmv-eqsU-gdho9eC9B',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1D1MjzR0tbFXThEwmv-eqsU-gdho9eC9B',
  'https://drive.google.com/file/d/1D1MjzR0tbFXThEwmv-eqsU-gdho9eC9B/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1D1MjzR0tbFXThEwmv-eqsU-gdho9eC9B'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1D1MjzR0tbFXThEwmv-eqsU-gdho9eC9B/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1D1MjzR0tbFXThEwmv-eqsU-gdho9eC9B'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1D1MjzR0tbFXThEwmv-eqsU-gdho9eC9B'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'EX2',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'EX2'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1wFaagGIO4wu2n-87Q9CVx-aARUffZReH',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1wFaagGIO4wu2n-87Q9CVx-aARUffZReH',
  'https://docs.google.com/document/d/1wFaagGIO4wu2n-87Q9CVx-aARUffZReH/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1wFaagGIO4wu2n-87Q9CVx-aARUffZReH'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1wFaagGIO4wu2n-87Q9CVx-aARUffZReH/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1wFaagGIO4wu2n-87Q9CVx-aARUffZReH'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1wFaagGIO4wu2n-87Q9CVx-aARUffZReH'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1aO18tNcwiXhSLoNhkufBsVDZfo92VLm0',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1aO18tNcwiXhSLoNhkufBsVDZfo92VLm0',
  'https://drive.google.com/file/d/1aO18tNcwiXhSLoNhkufBsVDZfo92VLm0/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1aO18tNcwiXhSLoNhkufBsVDZfo92VLm0'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1aO18tNcwiXhSLoNhkufBsVDZfo92VLm0/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1aO18tNcwiXhSLoNhkufBsVDZfo92VLm0'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1aO18tNcwiXhSLoNhkufBsVDZfo92VLm0'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-16ZnX56TX-3zM3Q3_xRhuVt6dVfeGEtlu',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '16ZnX56TX-3zM3Q3_xRhuVt6dVfeGEtlu',
  'https://drive.google.com/file/d/16ZnX56TX-3zM3Q3_xRhuVt6dVfeGEtlu/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '16ZnX56TX-3zM3Q3_xRhuVt6dVfeGEtlu'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/16ZnX56TX-3zM3Q3_xRhuVt6dVfeGEtlu/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '16ZnX56TX-3zM3Q3_xRhuVt6dVfeGEtlu'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '16ZnX56TX-3zM3Q3_xRhuVt6dVfeGEtlu'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'EX3',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'EX3'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1xc1a7-95X9GwT4gaC3mJvgSp0shachy_',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1xc1a7-95X9GwT4gaC3mJvgSp0shachy_',
  'https://docs.google.com/document/d/1xc1a7-95X9GwT4gaC3mJvgSp0shachy_/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1xc1a7-95X9GwT4gaC3mJvgSp0shachy_'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1xc1a7-95X9GwT4gaC3mJvgSp0shachy_/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1xc1a7-95X9GwT4gaC3mJvgSp0shachy_'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1xc1a7-95X9GwT4gaC3mJvgSp0shachy_'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1l8YCEq68U_W6fy0yD7rg-LxZFtC49ZEu',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1l8YCEq68U_W6fy0yD7rg-LxZFtC49ZEu',
  'https://drive.google.com/file/d/1l8YCEq68U_W6fy0yD7rg-LxZFtC49ZEu/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1l8YCEq68U_W6fy0yD7rg-LxZFtC49ZEu'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1l8YCEq68U_W6fy0yD7rg-LxZFtC49ZEu/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1l8YCEq68U_W6fy0yD7rg-LxZFtC49ZEu'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1l8YCEq68U_W6fy0yD7rg-LxZFtC49ZEu'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-17ifRZbuMvSkLbkwA_AhYcOuKTjZHTYg0',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '17ifRZbuMvSkLbkwA_AhYcOuKTjZHTYg0',
  'https://drive.google.com/file/d/17ifRZbuMvSkLbkwA_AhYcOuKTjZHTYg0/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '17ifRZbuMvSkLbkwA_AhYcOuKTjZHTYg0'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/17ifRZbuMvSkLbkwA_AhYcOuKTjZHTYg0/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '17ifRZbuMvSkLbkwA_AhYcOuKTjZHTYg0'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '17ifRZbuMvSkLbkwA_AhYcOuKTjZHTYg0'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PC1',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PC1'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1L38617cj3rDWdteNFYzrvR-rDDj44f1F',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1L38617cj3rDWdteNFYzrvR-rDDj44f1F',
  'https://docs.google.com/document/d/1L38617cj3rDWdteNFYzrvR-rDDj44f1F/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1L38617cj3rDWdteNFYzrvR-rDDj44f1F'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1L38617cj3rDWdteNFYzrvR-rDDj44f1F/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1L38617cj3rDWdteNFYzrvR-rDDj44f1F'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1L38617cj3rDWdteNFYzrvR-rDDj44f1F'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1rE1xCGbO_pIkmU3YXN6sbefDGE5se9dB',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1rE1xCGbO_pIkmU3YXN6sbefDGE5se9dB',
  'https://drive.google.com/file/d/1rE1xCGbO_pIkmU3YXN6sbefDGE5se9dB/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rE1xCGbO_pIkmU3YXN6sbefDGE5se9dB'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1rE1xCGbO_pIkmU3YXN6sbefDGE5se9dB/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rE1xCGbO_pIkmU3YXN6sbefDGE5se9dB'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rE1xCGbO_pIkmU3YXN6sbefDGE5se9dB'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1ZETJ4aMItX2pO7qURkMRjrDTfVYBae9A',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1ZETJ4aMItX2pO7qURkMRjrDTfVYBae9A',
  'https://drive.google.com/file/d/1ZETJ4aMItX2pO7qURkMRjrDTfVYBae9A/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ZETJ4aMItX2pO7qURkMRjrDTfVYBae9A'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1ZETJ4aMItX2pO7qURkMRjrDTfVYBae9A/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ZETJ4aMItX2pO7qURkMRjrDTfVYBae9A'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ZETJ4aMItX2pO7qURkMRjrDTfVYBae9A'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PC2',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PC2'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1qSXJVzyjZXFcE6lSD8Z1TxYCLRzKAhVx',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1qSXJVzyjZXFcE6lSD8Z1TxYCLRzKAhVx',
  'https://docs.google.com/document/d/1qSXJVzyjZXFcE6lSD8Z1TxYCLRzKAhVx/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1qSXJVzyjZXFcE6lSD8Z1TxYCLRzKAhVx'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1qSXJVzyjZXFcE6lSD8Z1TxYCLRzKAhVx/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1qSXJVzyjZXFcE6lSD8Z1TxYCLRzKAhVx'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1qSXJVzyjZXFcE6lSD8Z1TxYCLRzKAhVx'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1llFodfsHAuaOM8KKUCeNJzYvjvKyATbz',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1llFodfsHAuaOM8KKUCeNJzYvjvKyATbz',
  'https://drive.google.com/file/d/1llFodfsHAuaOM8KKUCeNJzYvjvKyATbz/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1llFodfsHAuaOM8KKUCeNJzYvjvKyATbz'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1llFodfsHAuaOM8KKUCeNJzYvjvKyATbz/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1llFodfsHAuaOM8KKUCeNJzYvjvKyATbz'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1llFodfsHAuaOM8KKUCeNJzYvjvKyATbz'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1pskmg-q3afMkzZ2oP9Ig7XBA1DC8ru7x',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1pskmg-q3afMkzZ2oP9Ig7XBA1DC8ru7x',
  'https://drive.google.com/file/d/1pskmg-q3afMkzZ2oP9Ig7XBA1DC8ru7x/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1pskmg-q3afMkzZ2oP9Ig7XBA1DC8ru7x'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1pskmg-q3afMkzZ2oP9Ig7XBA1DC8ru7x/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1pskmg-q3afMkzZ2oP9Ig7XBA1DC8ru7x'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1pskmg-q3afMkzZ2oP9Ig7XBA1DC8ru7x'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PC3',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PC3'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1szSE76Xzgp4XiH0Kc9w7pr6XcqWYRZ_t',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1szSE76Xzgp4XiH0Kc9w7pr6XcqWYRZ_t',
  'https://docs.google.com/document/d/1szSE76Xzgp4XiH0Kc9w7pr6XcqWYRZ_t/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1szSE76Xzgp4XiH0Kc9w7pr6XcqWYRZ_t'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1szSE76Xzgp4XiH0Kc9w7pr6XcqWYRZ_t/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1szSE76Xzgp4XiH0Kc9w7pr6XcqWYRZ_t'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1szSE76Xzgp4XiH0Kc9w7pr6XcqWYRZ_t'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1CMJyrwFnVa5RY9yc7SHXWQ0-XbyEbM6A',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1CMJyrwFnVa5RY9yc7SHXWQ0-XbyEbM6A',
  'https://drive.google.com/file/d/1CMJyrwFnVa5RY9yc7SHXWQ0-XbyEbM6A/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1CMJyrwFnVa5RY9yc7SHXWQ0-XbyEbM6A'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1CMJyrwFnVa5RY9yc7SHXWQ0-XbyEbM6A/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1CMJyrwFnVa5RY9yc7SHXWQ0-XbyEbM6A'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1CMJyrwFnVa5RY9yc7SHXWQ0-XbyEbM6A'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1-Ee1Py2_e17s_Zg0hxCSYOnCPG_ZHvwh',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1-Ee1Py2_e17s_Zg0hxCSYOnCPG_ZHvwh',
  'https://drive.google.com/file/d/1-Ee1Py2_e17s_Zg0hxCSYOnCPG_ZHvwh/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1-Ee1Py2_e17s_Zg0hxCSYOnCPG_ZHvwh'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1-Ee1Py2_e17s_Zg0hxCSYOnCPG_ZHvwh/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1-Ee1Py2_e17s_Zg0hxCSYOnCPG_ZHvwh'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1-Ee1Py2_e17s_Zg0hxCSYOnCPG_ZHvwh'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PC4',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PC4'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1EsVpvy0ffyo6zSAV4mJj0Ct0QhlZHZ_o',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1EsVpvy0ffyo6zSAV4mJj0Ct0QhlZHZ_o',
  'https://docs.google.com/document/d/1EsVpvy0ffyo6zSAV4mJj0Ct0QhlZHZ_o/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1EsVpvy0ffyo6zSAV4mJj0Ct0QhlZHZ_o'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1EsVpvy0ffyo6zSAV4mJj0Ct0QhlZHZ_o/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1EsVpvy0ffyo6zSAV4mJj0Ct0QhlZHZ_o'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1EsVpvy0ffyo6zSAV4mJj0Ct0QhlZHZ_o'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1etBE3U6Ox83C_LQdhSJNFBoN3DRn0RTo',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1etBE3U6Ox83C_LQdhSJNFBoN3DRn0RTo',
  'https://drive.google.com/file/d/1etBE3U6Ox83C_LQdhSJNFBoN3DRn0RTo/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1etBE3U6Ox83C_LQdhSJNFBoN3DRn0RTo'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1etBE3U6Ox83C_LQdhSJNFBoN3DRn0RTo/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1etBE3U6Ox83C_LQdhSJNFBoN3DRn0RTo'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1etBE3U6Ox83C_LQdhSJNFBoN3DRn0RTo'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1D9WECBIXaDJE34EDCcx8sqre-VA3ITBo',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1D9WECBIXaDJE34EDCcx8sqre-VA3ITBo',
  'https://drive.google.com/file/d/1D9WECBIXaDJE34EDCcx8sqre-VA3ITBo/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1D9WECBIXaDJE34EDCcx8sqre-VA3ITBo'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1D9WECBIXaDJE34EDCcx8sqre-VA3ITBo/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1D9WECBIXaDJE34EDCcx8sqre-VA3ITBo'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1D9WECBIXaDJE34EDCcx8sqre-VA3ITBo'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PD1',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PD1'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-11TG1GdmmW2yRHbb_72-y39lol3rBi6Zi',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '11TG1GdmmW2yRHbb_72-y39lol3rBi6Zi',
  'https://docs.google.com/document/d/11TG1GdmmW2yRHbb_72-y39lol3rBi6Zi/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '11TG1GdmmW2yRHbb_72-y39lol3rBi6Zi'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/11TG1GdmmW2yRHbb_72-y39lol3rBi6Zi/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '11TG1GdmmW2yRHbb_72-y39lol3rBi6Zi'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '11TG1GdmmW2yRHbb_72-y39lol3rBi6Zi'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1yHnVleteQdPCJh2D5XG2NnRNzazmix2o',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1yHnVleteQdPCJh2D5XG2NnRNzazmix2o',
  'https://drive.google.com/file/d/1yHnVleteQdPCJh2D5XG2NnRNzazmix2o/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1yHnVleteQdPCJh2D5XG2NnRNzazmix2o'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1yHnVleteQdPCJh2D5XG2NnRNzazmix2o/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1yHnVleteQdPCJh2D5XG2NnRNzazmix2o'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1yHnVleteQdPCJh2D5XG2NnRNzazmix2o'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-198bDd4-RM_OWDMBvIwNd72UhfwMfxp0S',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '198bDd4-RM_OWDMBvIwNd72UhfwMfxp0S',
  'https://drive.google.com/file/d/198bDd4-RM_OWDMBvIwNd72UhfwMfxp0S/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '198bDd4-RM_OWDMBvIwNd72UhfwMfxp0S'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/198bDd4-RM_OWDMBvIwNd72UhfwMfxp0S/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '198bDd4-RM_OWDMBvIwNd72UhfwMfxp0S'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '198bDd4-RM_OWDMBvIwNd72UhfwMfxp0S'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PD2',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PD2'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-13WjeUdbOwrBxBLFCi6-m9xzsUnlhf35Y',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '13WjeUdbOwrBxBLFCi6-m9xzsUnlhf35Y',
  'https://docs.google.com/document/d/13WjeUdbOwrBxBLFCi6-m9xzsUnlhf35Y/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '13WjeUdbOwrBxBLFCi6-m9xzsUnlhf35Y'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/13WjeUdbOwrBxBLFCi6-m9xzsUnlhf35Y/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '13WjeUdbOwrBxBLFCi6-m9xzsUnlhf35Y'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '13WjeUdbOwrBxBLFCi6-m9xzsUnlhf35Y'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1vjgtjYMlE4gxrFDXdWel5OTkwqFgejum',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1vjgtjYMlE4gxrFDXdWel5OTkwqFgejum',
  'https://drive.google.com/file/d/1vjgtjYMlE4gxrFDXdWel5OTkwqFgejum/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1vjgtjYMlE4gxrFDXdWel5OTkwqFgejum'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1vjgtjYMlE4gxrFDXdWel5OTkwqFgejum/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1vjgtjYMlE4gxrFDXdWel5OTkwqFgejum'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1vjgtjYMlE4gxrFDXdWel5OTkwqFgejum'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1rFfNRZVOUM3i52ustQDK8n4fHlNFYJ5-',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1rFfNRZVOUM3i52ustQDK8n4fHlNFYJ5-',
  'https://drive.google.com/file/d/1rFfNRZVOUM3i52ustQDK8n4fHlNFYJ5-/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rFfNRZVOUM3i52ustQDK8n4fHlNFYJ5-'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1rFfNRZVOUM3i52ustQDK8n4fHlNFYJ5-/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rFfNRZVOUM3i52ustQDK8n4fHlNFYJ5-'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rFfNRZVOUM3i52ustQDK8n4fHlNFYJ5-'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PD3',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PD3'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1UJ9H3HRTtPiZmCurfHYyGH17xUbt5ijg',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1UJ9H3HRTtPiZmCurfHYyGH17xUbt5ijg',
  'https://docs.google.com/document/d/1UJ9H3HRTtPiZmCurfHYyGH17xUbt5ijg/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1UJ9H3HRTtPiZmCurfHYyGH17xUbt5ijg'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1UJ9H3HRTtPiZmCurfHYyGH17xUbt5ijg/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1UJ9H3HRTtPiZmCurfHYyGH17xUbt5ijg'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1UJ9H3HRTtPiZmCurfHYyGH17xUbt5ijg'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1eMYdaZHkTJY0ZHIiowkn87gpix6rKcnG',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1eMYdaZHkTJY0ZHIiowkn87gpix6rKcnG',
  'https://drive.google.com/file/d/1eMYdaZHkTJY0ZHIiowkn87gpix6rKcnG/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1eMYdaZHkTJY0ZHIiowkn87gpix6rKcnG'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1eMYdaZHkTJY0ZHIiowkn87gpix6rKcnG/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1eMYdaZHkTJY0ZHIiowkn87gpix6rKcnG'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1eMYdaZHkTJY0ZHIiowkn87gpix6rKcnG'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1ZEqlZwrTgRHy2n9cEj1YF04mJVbSwQ4o',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1ZEqlZwrTgRHy2n9cEj1YF04mJVbSwQ4o',
  'https://drive.google.com/file/d/1ZEqlZwrTgRHy2n9cEj1YF04mJVbSwQ4o/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ZEqlZwrTgRHy2n9cEj1YF04mJVbSwQ4o'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1ZEqlZwrTgRHy2n9cEj1YF04mJVbSwQ4o/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ZEqlZwrTgRHy2n9cEj1YF04mJVbSwQ4o'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ZEqlZwrTgRHy2n9cEj1YF04mJVbSwQ4o'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PD4',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PD4'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1N9_9WoxFGCQucrOgHQzIMzB28-UaLqWV',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1N9_9WoxFGCQucrOgHQzIMzB28-UaLqWV',
  'https://docs.google.com/document/d/1N9_9WoxFGCQucrOgHQzIMzB28-UaLqWV/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1N9_9WoxFGCQucrOgHQzIMzB28-UaLqWV'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1N9_9WoxFGCQucrOgHQzIMzB28-UaLqWV/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1N9_9WoxFGCQucrOgHQzIMzB28-UaLqWV'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1N9_9WoxFGCQucrOgHQzIMzB28-UaLqWV'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1_qRRDvWdeMN78Nmvo1irLvZiUcpFLAf9',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1_qRRDvWdeMN78Nmvo1irLvZiUcpFLAf9',
  'https://drive.google.com/file/d/1_qRRDvWdeMN78Nmvo1irLvZiUcpFLAf9/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1_qRRDvWdeMN78Nmvo1irLvZiUcpFLAf9'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1_qRRDvWdeMN78Nmvo1irLvZiUcpFLAf9/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1_qRRDvWdeMN78Nmvo1irLvZiUcpFLAf9'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1_qRRDvWdeMN78Nmvo1irLvZiUcpFLAf9'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-145OW-JWJad45jMewP7izlRgpzXQF8CIC',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '145OW-JWJad45jMewP7izlRgpzXQF8CIC',
  'https://drive.google.com/file/d/145OW-JWJad45jMewP7izlRgpzXQF8CIC/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '145OW-JWJad45jMewP7izlRgpzXQF8CIC'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/145OW-JWJad45jMewP7izlRgpzXQF8CIC/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '145OW-JWJad45jMewP7izlRgpzXQF8CIC'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '145OW-JWJad45jMewP7izlRgpzXQF8CIC'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 17
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );


-- course_cycle 18 (FIS101 - 2026-0)
INSERT INTO evaluation (course_cycle_id, evaluation_type_id, number, start_date, end_date)
SELECT
  18,
  @evaluation_type_banco,
  0,
  (SELECT ac.start_date FROM academic_cycle ac INNER JOIN course_cycle cc ON cc.academic_cycle_id = ac.id WHERE cc.id = 18 LIMIT 1),
  (SELECT ac.end_date FROM academic_cycle ac INNER JOIN course_cycle cc ON cc.academic_cycle_id = ac.id WHERE cc.id = 18 LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM evaluation e
  WHERE e.course_cycle_id = 18 AND e.evaluation_type_id = @evaluation_type_banco AND e.number = 0
);

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  NULL,
  @folder_status_active,
  'Practicas Calificadas',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id IS NULL
    AND mf.name = 'Practicas Calificadas'
);

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  NULL,
  @folder_status_active,
  'Practicas Dirigidas',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id IS NULL
    AND mf.name = 'Practicas Dirigidas'
);

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  NULL,
  @folder_status_active,
  'Examenes',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id IS NULL
    AND mf.name = 'Examenes'
);

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'EX1',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'EX1'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1tNPQoL-EK8PE7vZJ7oyohpZzxIP0-82C',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1tNPQoL-EK8PE7vZJ7oyohpZzxIP0-82C',
  'https://docs.google.com/document/d/1tNPQoL-EK8PE7vZJ7oyohpZzxIP0-82C/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1tNPQoL-EK8PE7vZJ7oyohpZzxIP0-82C'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1tNPQoL-EK8PE7vZJ7oyohpZzxIP0-82C/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1tNPQoL-EK8PE7vZJ7oyohpZzxIP0-82C'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1tNPQoL-EK8PE7vZJ7oyohpZzxIP0-82C'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1eYcL4zWWJRmXd7lcIzFtjl9-7Y-PL86C',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1eYcL4zWWJRmXd7lcIzFtjl9-7Y-PL86C',
  'https://drive.google.com/file/d/1eYcL4zWWJRmXd7lcIzFtjl9-7Y-PL86C/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1eYcL4zWWJRmXd7lcIzFtjl9-7Y-PL86C'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1eYcL4zWWJRmXd7lcIzFtjl9-7Y-PL86C/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1eYcL4zWWJRmXd7lcIzFtjl9-7Y-PL86C'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1eYcL4zWWJRmXd7lcIzFtjl9-7Y-PL86C'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1gOof550fe2yIjfNXMoPACmSe0arBR1th',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1gOof550fe2yIjfNXMoPACmSe0arBR1th',
  'https://drive.google.com/file/d/1gOof550fe2yIjfNXMoPACmSe0arBR1th/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1gOof550fe2yIjfNXMoPACmSe0arBR1th'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1gOof550fe2yIjfNXMoPACmSe0arBR1th/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1gOof550fe2yIjfNXMoPACmSe0arBR1th'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1gOof550fe2yIjfNXMoPACmSe0arBR1th'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'EX2',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'EX2'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1A7BNjRektWpMvfJcrCokfAy8bfUSdYyr',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1A7BNjRektWpMvfJcrCokfAy8bfUSdYyr',
  'https://docs.google.com/document/d/1A7BNjRektWpMvfJcrCokfAy8bfUSdYyr/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1A7BNjRektWpMvfJcrCokfAy8bfUSdYyr'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1A7BNjRektWpMvfJcrCokfAy8bfUSdYyr/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1A7BNjRektWpMvfJcrCokfAy8bfUSdYyr'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1A7BNjRektWpMvfJcrCokfAy8bfUSdYyr'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-12YShJfRcXOr0AWbvhtCzdgqE1k8x8tP-',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '12YShJfRcXOr0AWbvhtCzdgqE1k8x8tP-',
  'https://drive.google.com/file/d/12YShJfRcXOr0AWbvhtCzdgqE1k8x8tP-/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '12YShJfRcXOr0AWbvhtCzdgqE1k8x8tP-'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/12YShJfRcXOr0AWbvhtCzdgqE1k8x8tP-/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '12YShJfRcXOr0AWbvhtCzdgqE1k8x8tP-'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '12YShJfRcXOr0AWbvhtCzdgqE1k8x8tP-'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1MplmcOV0so45u1rcrFm2y_votsJhd36L',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1MplmcOV0so45u1rcrFm2y_votsJhd36L',
  'https://drive.google.com/file/d/1MplmcOV0so45u1rcrFm2y_votsJhd36L/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1MplmcOV0so45u1rcrFm2y_votsJhd36L'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1MplmcOV0so45u1rcrFm2y_votsJhd36L/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1MplmcOV0so45u1rcrFm2y_votsJhd36L'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1MplmcOV0so45u1rcrFm2y_votsJhd36L'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'EX3',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'EX3'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1Es12uvUOwq0Y5oqODlIV2OsZpZIFUeDZ',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1Es12uvUOwq0Y5oqODlIV2OsZpZIFUeDZ',
  'https://docs.google.com/document/d/1Es12uvUOwq0Y5oqODlIV2OsZpZIFUeDZ/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Es12uvUOwq0Y5oqODlIV2OsZpZIFUeDZ'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1Es12uvUOwq0Y5oqODlIV2OsZpZIFUeDZ/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Es12uvUOwq0Y5oqODlIV2OsZpZIFUeDZ'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Es12uvUOwq0Y5oqODlIV2OsZpZIFUeDZ'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1kEHKePSWaaS6m90W4fqly1NMBn3rxGEe',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1kEHKePSWaaS6m90W4fqly1NMBn3rxGEe',
  'https://drive.google.com/file/d/1kEHKePSWaaS6m90W4fqly1NMBn3rxGEe/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1kEHKePSWaaS6m90W4fqly1NMBn3rxGEe'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1kEHKePSWaaS6m90W4fqly1NMBn3rxGEe/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1kEHKePSWaaS6m90W4fqly1NMBn3rxGEe'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1kEHKePSWaaS6m90W4fqly1NMBn3rxGEe'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1v4xaLa5N7KG685-GoMf_WQvmh7W8Q5Z4',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1v4xaLa5N7KG685-GoMf_WQvmh7W8Q5Z4',
  'https://drive.google.com/file/d/1v4xaLa5N7KG685-GoMf_WQvmh7W8Q5Z4/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1v4xaLa5N7KG685-GoMf_WQvmh7W8Q5Z4'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1v4xaLa5N7KG685-GoMf_WQvmh7W8Q5Z4/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1v4xaLa5N7KG685-GoMf_WQvmh7W8Q5Z4'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1v4xaLa5N7KG685-GoMf_WQvmh7W8Q5Z4'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PC1',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PC1'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1mY1leqUSg6V7C-nSA69dWUPCJV1Zae4L',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1mY1leqUSg6V7C-nSA69dWUPCJV1Zae4L',
  'https://docs.google.com/document/d/1mY1leqUSg6V7C-nSA69dWUPCJV1Zae4L/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1mY1leqUSg6V7C-nSA69dWUPCJV1Zae4L'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1mY1leqUSg6V7C-nSA69dWUPCJV1Zae4L/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1mY1leqUSg6V7C-nSA69dWUPCJV1Zae4L'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1mY1leqUSg6V7C-nSA69dWUPCJV1Zae4L'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1yWleot-K24G8NCOey71uxhuK6kP2JfnP',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1yWleot-K24G8NCOey71uxhuK6kP2JfnP',
  'https://drive.google.com/file/d/1yWleot-K24G8NCOey71uxhuK6kP2JfnP/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1yWleot-K24G8NCOey71uxhuK6kP2JfnP'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1yWleot-K24G8NCOey71uxhuK6kP2JfnP/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1yWleot-K24G8NCOey71uxhuK6kP2JfnP'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1yWleot-K24G8NCOey71uxhuK6kP2JfnP'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-12BwsFH7q9J2Y3TFwATYsnnMFibGJT6Ed',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '12BwsFH7q9J2Y3TFwATYsnnMFibGJT6Ed',
  'https://drive.google.com/file/d/12BwsFH7q9J2Y3TFwATYsnnMFibGJT6Ed/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '12BwsFH7q9J2Y3TFwATYsnnMFibGJT6Ed'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/12BwsFH7q9J2Y3TFwATYsnnMFibGJT6Ed/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '12BwsFH7q9J2Y3TFwATYsnnMFibGJT6Ed'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '12BwsFH7q9J2Y3TFwATYsnnMFibGJT6Ed'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PC2',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PC2'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-19tUdxsD-APR-itWLhnoWJZwWDRmzhjZx',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '19tUdxsD-APR-itWLhnoWJZwWDRmzhjZx',
  'https://docs.google.com/document/d/19tUdxsD-APR-itWLhnoWJZwWDRmzhjZx/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '19tUdxsD-APR-itWLhnoWJZwWDRmzhjZx'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/19tUdxsD-APR-itWLhnoWJZwWDRmzhjZx/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '19tUdxsD-APR-itWLhnoWJZwWDRmzhjZx'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '19tUdxsD-APR-itWLhnoWJZwWDRmzhjZx'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1kuSUAr_G81vOGcLKeN9MH59f59gqdUAM',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1kuSUAr_G81vOGcLKeN9MH59f59gqdUAM',
  'https://drive.google.com/file/d/1kuSUAr_G81vOGcLKeN9MH59f59gqdUAM/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1kuSUAr_G81vOGcLKeN9MH59f59gqdUAM'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1kuSUAr_G81vOGcLKeN9MH59f59gqdUAM/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1kuSUAr_G81vOGcLKeN9MH59f59gqdUAM'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1kuSUAr_G81vOGcLKeN9MH59f59gqdUAM'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1uTm978mrVUn-s5YRrtncVGDDE_QS4OlD',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1uTm978mrVUn-s5YRrtncVGDDE_QS4OlD',
  'https://drive.google.com/file/d/1uTm978mrVUn-s5YRrtncVGDDE_QS4OlD/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1uTm978mrVUn-s5YRrtncVGDDE_QS4OlD'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1uTm978mrVUn-s5YRrtncVGDDE_QS4OlD/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1uTm978mrVUn-s5YRrtncVGDDE_QS4OlD'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1uTm978mrVUn-s5YRrtncVGDDE_QS4OlD'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PC3',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PC3'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1J8aFJq59d6pVzBs3CLmKna2stsbtGbjI',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1J8aFJq59d6pVzBs3CLmKna2stsbtGbjI',
  'https://docs.google.com/document/d/1J8aFJq59d6pVzBs3CLmKna2stsbtGbjI/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1J8aFJq59d6pVzBs3CLmKna2stsbtGbjI'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1J8aFJq59d6pVzBs3CLmKna2stsbtGbjI/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1J8aFJq59d6pVzBs3CLmKna2stsbtGbjI'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1J8aFJq59d6pVzBs3CLmKna2stsbtGbjI'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1ogysH35GVAqPEar8RL5kkb6LpO_GGd6T',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1ogysH35GVAqPEar8RL5kkb6LpO_GGd6T',
  'https://drive.google.com/file/d/1ogysH35GVAqPEar8RL5kkb6LpO_GGd6T/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ogysH35GVAqPEar8RL5kkb6LpO_GGd6T'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1ogysH35GVAqPEar8RL5kkb6LpO_GGd6T/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ogysH35GVAqPEar8RL5kkb6LpO_GGd6T'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ogysH35GVAqPEar8RL5kkb6LpO_GGd6T'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-15Pcp6kAmAlmOIv03kgOGIsuxP_0hO4wx',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '15Pcp6kAmAlmOIv03kgOGIsuxP_0hO4wx',
  'https://drive.google.com/file/d/15Pcp6kAmAlmOIv03kgOGIsuxP_0hO4wx/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '15Pcp6kAmAlmOIv03kgOGIsuxP_0hO4wx'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/15Pcp6kAmAlmOIv03kgOGIsuxP_0hO4wx/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '15Pcp6kAmAlmOIv03kgOGIsuxP_0hO4wx'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '15Pcp6kAmAlmOIv03kgOGIsuxP_0hO4wx'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PC4',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PC4'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1kPFdNPxd8yhNYVnEGUm9IVQYl6_G7Kb_',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1kPFdNPxd8yhNYVnEGUm9IVQYl6_G7Kb_',
  'https://docs.google.com/document/d/1kPFdNPxd8yhNYVnEGUm9IVQYl6_G7Kb_/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1kPFdNPxd8yhNYVnEGUm9IVQYl6_G7Kb_'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1kPFdNPxd8yhNYVnEGUm9IVQYl6_G7Kb_/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1kPFdNPxd8yhNYVnEGUm9IVQYl6_G7Kb_'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1kPFdNPxd8yhNYVnEGUm9IVQYl6_G7Kb_'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1B4fh5GeapK5UWqadvREJCRamb-Quo0ow',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1B4fh5GeapK5UWqadvREJCRamb-Quo0ow',
  'https://drive.google.com/file/d/1B4fh5GeapK5UWqadvREJCRamb-Quo0ow/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1B4fh5GeapK5UWqadvREJCRamb-Quo0ow'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1B4fh5GeapK5UWqadvREJCRamb-Quo0ow/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1B4fh5GeapK5UWqadvREJCRamb-Quo0ow'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1B4fh5GeapK5UWqadvREJCRamb-Quo0ow'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1rdIIJW5X_m7BkWgUXqDfBvN_sag2gSQk',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1rdIIJW5X_m7BkWgUXqDfBvN_sag2gSQk',
  'https://drive.google.com/file/d/1rdIIJW5X_m7BkWgUXqDfBvN_sag2gSQk/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rdIIJW5X_m7BkWgUXqDfBvN_sag2gSQk'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1rdIIJW5X_m7BkWgUXqDfBvN_sag2gSQk/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rdIIJW5X_m7BkWgUXqDfBvN_sag2gSQk'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rdIIJW5X_m7BkWgUXqDfBvN_sag2gSQk'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PD1',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PD1'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-11Z6fSubAuzmNeCxZNEZGk1CHbkg6Xp0L',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '11Z6fSubAuzmNeCxZNEZGk1CHbkg6Xp0L',
  'https://docs.google.com/document/d/11Z6fSubAuzmNeCxZNEZGk1CHbkg6Xp0L/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '11Z6fSubAuzmNeCxZNEZGk1CHbkg6Xp0L'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/11Z6fSubAuzmNeCxZNEZGk1CHbkg6Xp0L/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '11Z6fSubAuzmNeCxZNEZGk1CHbkg6Xp0L'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '11Z6fSubAuzmNeCxZNEZGk1CHbkg6Xp0L'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1dD14oTdA2RhLWzYl5-aahLKi0_Cf7YC4',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1dD14oTdA2RhLWzYl5-aahLKi0_Cf7YC4',
  'https://drive.google.com/file/d/1dD14oTdA2RhLWzYl5-aahLKi0_Cf7YC4/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1dD14oTdA2RhLWzYl5-aahLKi0_Cf7YC4'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1dD14oTdA2RhLWzYl5-aahLKi0_Cf7YC4/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1dD14oTdA2RhLWzYl5-aahLKi0_Cf7YC4'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1dD14oTdA2RhLWzYl5-aahLKi0_Cf7YC4'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-18PGKtUTvCctTkDU3fZ3Da4V3q34gXx9T',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '18PGKtUTvCctTkDU3fZ3Da4V3q34gXx9T',
  'https://drive.google.com/file/d/18PGKtUTvCctTkDU3fZ3Da4V3q34gXx9T/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '18PGKtUTvCctTkDU3fZ3Da4V3q34gXx9T'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/18PGKtUTvCctTkDU3fZ3Da4V3q34gXx9T/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '18PGKtUTvCctTkDU3fZ3Da4V3q34gXx9T'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '18PGKtUTvCctTkDU3fZ3Da4V3q34gXx9T'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PD2',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PD2'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-11wzTJwNH6-ZpFLnri4wuzhZNx_CBtVVN',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '11wzTJwNH6-ZpFLnri4wuzhZNx_CBtVVN',
  'https://docs.google.com/document/d/11wzTJwNH6-ZpFLnri4wuzhZNx_CBtVVN/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '11wzTJwNH6-ZpFLnri4wuzhZNx_CBtVVN'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/11wzTJwNH6-ZpFLnri4wuzhZNx_CBtVVN/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '11wzTJwNH6-ZpFLnri4wuzhZNx_CBtVVN'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '11wzTJwNH6-ZpFLnri4wuzhZNx_CBtVVN'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1eDk7jXJE_QdkFNobVmlmJmd6mO-ojtsL',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1eDk7jXJE_QdkFNobVmlmJmd6mO-ojtsL',
  'https://drive.google.com/file/d/1eDk7jXJE_QdkFNobVmlmJmd6mO-ojtsL/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1eDk7jXJE_QdkFNobVmlmJmd6mO-ojtsL'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1eDk7jXJE_QdkFNobVmlmJmd6mO-ojtsL/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1eDk7jXJE_QdkFNobVmlmJmd6mO-ojtsL'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1eDk7jXJE_QdkFNobVmlmJmd6mO-ojtsL'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1KRljL345u2TPxS-j2-b8NwNkVV7qiLvz',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1KRljL345u2TPxS-j2-b8NwNkVV7qiLvz',
  'https://drive.google.com/file/d/1KRljL345u2TPxS-j2-b8NwNkVV7qiLvz/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1KRljL345u2TPxS-j2-b8NwNkVV7qiLvz'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1KRljL345u2TPxS-j2-b8NwNkVV7qiLvz/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1KRljL345u2TPxS-j2-b8NwNkVV7qiLvz'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1KRljL345u2TPxS-j2-b8NwNkVV7qiLvz'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PD3',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PD3'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1SHG81ozkI0JIhiZ0KZ2f0lAR9MY90N0n',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1SHG81ozkI0JIhiZ0KZ2f0lAR9MY90N0n',
  'https://docs.google.com/document/d/1SHG81ozkI0JIhiZ0KZ2f0lAR9MY90N0n/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1SHG81ozkI0JIhiZ0KZ2f0lAR9MY90N0n'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1SHG81ozkI0JIhiZ0KZ2f0lAR9MY90N0n/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1SHG81ozkI0JIhiZ0KZ2f0lAR9MY90N0n'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1SHG81ozkI0JIhiZ0KZ2f0lAR9MY90N0n'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1KxjNPyhbfq_yRnaD1en8P6iRgRMS8qng',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1KxjNPyhbfq_yRnaD1en8P6iRgRMS8qng',
  'https://drive.google.com/file/d/1KxjNPyhbfq_yRnaD1en8P6iRgRMS8qng/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1KxjNPyhbfq_yRnaD1en8P6iRgRMS8qng'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1KxjNPyhbfq_yRnaD1en8P6iRgRMS8qng/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1KxjNPyhbfq_yRnaD1en8P6iRgRMS8qng'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1KxjNPyhbfq_yRnaD1en8P6iRgRMS8qng'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1EN3w3xz1m45MuVO2kvF488Eu-OV8dJtU',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1EN3w3xz1m45MuVO2kvF488Eu-OV8dJtU',
  'https://drive.google.com/file/d/1EN3w3xz1m45MuVO2kvF488Eu-OV8dJtU/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1EN3w3xz1m45MuVO2kvF488Eu-OV8dJtU'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1EN3w3xz1m45MuVO2kvF488Eu-OV8dJtU/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1EN3w3xz1m45MuVO2kvF488Eu-OV8dJtU'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1EN3w3xz1m45MuVO2kvF488Eu-OV8dJtU'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PD4',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PD4'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1ZmqJ_GQnC8ma7ZItNQOuDKenkLau23hz',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1ZmqJ_GQnC8ma7ZItNQOuDKenkLau23hz',
  'https://docs.google.com/document/d/1ZmqJ_GQnC8ma7ZItNQOuDKenkLau23hz/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ZmqJ_GQnC8ma7ZItNQOuDKenkLau23hz'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1ZmqJ_GQnC8ma7ZItNQOuDKenkLau23hz/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ZmqJ_GQnC8ma7ZItNQOuDKenkLau23hz'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ZmqJ_GQnC8ma7ZItNQOuDKenkLau23hz'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1apjZZGyVQ64nbZQ0RfIDlIaU315iMzhy',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1apjZZGyVQ64nbZQ0RfIDlIaU315iMzhy',
  'https://drive.google.com/file/d/1apjZZGyVQ64nbZQ0RfIDlIaU315iMzhy/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1apjZZGyVQ64nbZQ0RfIDlIaU315iMzhy'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1apjZZGyVQ64nbZQ0RfIDlIaU315iMzhy/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1apjZZGyVQ64nbZQ0RfIDlIaU315iMzhy'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1apjZZGyVQ64nbZQ0RfIDlIaU315iMzhy'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1t0IicD9lOrp0BgITZmX59khJVROZkRLw',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1t0IicD9lOrp0BgITZmX59khJVROZkRLw',
  'https://drive.google.com/file/d/1t0IicD9lOrp0BgITZmX59khJVROZkRLw/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1t0IicD9lOrp0BgITZmX59khJVROZkRLw'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1t0IicD9lOrp0BgITZmX59khJVROZkRLw/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1t0IicD9lOrp0BgITZmX59khJVROZkRLw'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1t0IicD9lOrp0BgITZmX59khJVROZkRLw'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 18
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );


-- course_cycle 19 (MATE102 - 2026-0)
INSERT INTO evaluation (course_cycle_id, evaluation_type_id, number, start_date, end_date)
SELECT
  19,
  @evaluation_type_banco,
  0,
  (SELECT ac.start_date FROM academic_cycle ac INNER JOIN course_cycle cc ON cc.academic_cycle_id = ac.id WHERE cc.id = 19 LIMIT 1),
  (SELECT ac.end_date FROM academic_cycle ac INNER JOIN course_cycle cc ON cc.academic_cycle_id = ac.id WHERE cc.id = 19 LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM evaluation e
  WHERE e.course_cycle_id = 19 AND e.evaluation_type_id = @evaluation_type_banco AND e.number = 0
);

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  NULL,
  @folder_status_active,
  'Practicas Calificadas',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id IS NULL
    AND mf.name = 'Practicas Calificadas'
);

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  NULL,
  @folder_status_active,
  'Practicas Dirigidas',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id IS NULL
    AND mf.name = 'Practicas Dirigidas'
);

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  NULL,
  @folder_status_active,
  'Examenes',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id IS NULL
    AND mf.name = 'Examenes'
);

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'EX1',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'EX1'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1LSoxLSvWegtW45wDSsebQCUUuRyvA9dG',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1LSoxLSvWegtW45wDSsebQCUUuRyvA9dG',
  'https://docs.google.com/document/d/1LSoxLSvWegtW45wDSsebQCUUuRyvA9dG/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1LSoxLSvWegtW45wDSsebQCUUuRyvA9dG'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1LSoxLSvWegtW45wDSsebQCUUuRyvA9dG/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1LSoxLSvWegtW45wDSsebQCUUuRyvA9dG'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1LSoxLSvWegtW45wDSsebQCUUuRyvA9dG'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1uQ0P91990DpVqEHyEvaVSXdL9lyFEds6',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1uQ0P91990DpVqEHyEvaVSXdL9lyFEds6',
  'https://drive.google.com/file/d/1uQ0P91990DpVqEHyEvaVSXdL9lyFEds6/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1uQ0P91990DpVqEHyEvaVSXdL9lyFEds6'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1uQ0P91990DpVqEHyEvaVSXdL9lyFEds6/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1uQ0P91990DpVqEHyEvaVSXdL9lyFEds6'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1uQ0P91990DpVqEHyEvaVSXdL9lyFEds6'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1i4kDIwDOfWhi76X3uyU0pavTY3zaenfQ',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1i4kDIwDOfWhi76X3uyU0pavTY3zaenfQ',
  'https://drive.google.com/file/d/1i4kDIwDOfWhi76X3uyU0pavTY3zaenfQ/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1i4kDIwDOfWhi76X3uyU0pavTY3zaenfQ'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1i4kDIwDOfWhi76X3uyU0pavTY3zaenfQ/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1i4kDIwDOfWhi76X3uyU0pavTY3zaenfQ'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1i4kDIwDOfWhi76X3uyU0pavTY3zaenfQ'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'EX2',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'EX2'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1gHFXBCW2VsvUzGr1OpX3JZL5cGQ8modj',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1gHFXBCW2VsvUzGr1OpX3JZL5cGQ8modj',
  'https://docs.google.com/document/d/1gHFXBCW2VsvUzGr1OpX3JZL5cGQ8modj/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1gHFXBCW2VsvUzGr1OpX3JZL5cGQ8modj'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1gHFXBCW2VsvUzGr1OpX3JZL5cGQ8modj/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1gHFXBCW2VsvUzGr1OpX3JZL5cGQ8modj'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1gHFXBCW2VsvUzGr1OpX3JZL5cGQ8modj'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1ozvp1mCq_nYHSTY1xDR4qQdsK0-GS-rD',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1ozvp1mCq_nYHSTY1xDR4qQdsK0-GS-rD',
  'https://drive.google.com/file/d/1ozvp1mCq_nYHSTY1xDR4qQdsK0-GS-rD/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ozvp1mCq_nYHSTY1xDR4qQdsK0-GS-rD'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1ozvp1mCq_nYHSTY1xDR4qQdsK0-GS-rD/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ozvp1mCq_nYHSTY1xDR4qQdsK0-GS-rD'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ozvp1mCq_nYHSTY1xDR4qQdsK0-GS-rD'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-12szCve_3TQdQAG86m0u9L8RJpX4Y8Zdr',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '12szCve_3TQdQAG86m0u9L8RJpX4Y8Zdr',
  'https://drive.google.com/file/d/12szCve_3TQdQAG86m0u9L8RJpX4Y8Zdr/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '12szCve_3TQdQAG86m0u9L8RJpX4Y8Zdr'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/12szCve_3TQdQAG86m0u9L8RJpX4Y8Zdr/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '12szCve_3TQdQAG86m0u9L8RJpX4Y8Zdr'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '12szCve_3TQdQAG86m0u9L8RJpX4Y8Zdr'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'EX3',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'EX3'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-13ZWbdOBwI3_kAVGxXLpLCYOpuVYOxvPt',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '13ZWbdOBwI3_kAVGxXLpLCYOpuVYOxvPt',
  'https://docs.google.com/document/d/13ZWbdOBwI3_kAVGxXLpLCYOpuVYOxvPt/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '13ZWbdOBwI3_kAVGxXLpLCYOpuVYOxvPt'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/13ZWbdOBwI3_kAVGxXLpLCYOpuVYOxvPt/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '13ZWbdOBwI3_kAVGxXLpLCYOpuVYOxvPt'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '13ZWbdOBwI3_kAVGxXLpLCYOpuVYOxvPt'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1LJsD9_sVvPuSvPbR5YrwTnAzy1zE58Y5',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1LJsD9_sVvPuSvPbR5YrwTnAzy1zE58Y5',
  'https://drive.google.com/file/d/1LJsD9_sVvPuSvPbR5YrwTnAzy1zE58Y5/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1LJsD9_sVvPuSvPbR5YrwTnAzy1zE58Y5'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1LJsD9_sVvPuSvPbR5YrwTnAzy1zE58Y5/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1LJsD9_sVvPuSvPbR5YrwTnAzy1zE58Y5'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1LJsD9_sVvPuSvPbR5YrwTnAzy1zE58Y5'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1H-hlGoAZ8yXR-8lu-gaoSt2WQOD87MiD',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1H-hlGoAZ8yXR-8lu-gaoSt2WQOD87MiD',
  'https://drive.google.com/file/d/1H-hlGoAZ8yXR-8lu-gaoSt2WQOD87MiD/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1H-hlGoAZ8yXR-8lu-gaoSt2WQOD87MiD'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1H-hlGoAZ8yXR-8lu-gaoSt2WQOD87MiD/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1H-hlGoAZ8yXR-8lu-gaoSt2WQOD87MiD'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1H-hlGoAZ8yXR-8lu-gaoSt2WQOD87MiD'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PC1',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PC1'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1T88kDJGZCjtwUKgDg6AW4m-hdvr7pEs5',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1T88kDJGZCjtwUKgDg6AW4m-hdvr7pEs5',
  'https://docs.google.com/document/d/1T88kDJGZCjtwUKgDg6AW4m-hdvr7pEs5/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1T88kDJGZCjtwUKgDg6AW4m-hdvr7pEs5'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1T88kDJGZCjtwUKgDg6AW4m-hdvr7pEs5/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1T88kDJGZCjtwUKgDg6AW4m-hdvr7pEs5'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1T88kDJGZCjtwUKgDg6AW4m-hdvr7pEs5'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1GqgPQwpc8b4z_LCalYCEjcaAVQ-mSjtN',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1GqgPQwpc8b4z_LCalYCEjcaAVQ-mSjtN',
  'https://drive.google.com/file/d/1GqgPQwpc8b4z_LCalYCEjcaAVQ-mSjtN/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1GqgPQwpc8b4z_LCalYCEjcaAVQ-mSjtN'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1GqgPQwpc8b4z_LCalYCEjcaAVQ-mSjtN/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1GqgPQwpc8b4z_LCalYCEjcaAVQ-mSjtN'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1GqgPQwpc8b4z_LCalYCEjcaAVQ-mSjtN'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1IxkVrdPaxgjN1rYYFRJdYlTK4yz4yDm_',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1IxkVrdPaxgjN1rYYFRJdYlTK4yz4yDm_',
  'https://drive.google.com/file/d/1IxkVrdPaxgjN1rYYFRJdYlTK4yz4yDm_/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IxkVrdPaxgjN1rYYFRJdYlTK4yz4yDm_'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1IxkVrdPaxgjN1rYYFRJdYlTK4yz4yDm_/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IxkVrdPaxgjN1rYYFRJdYlTK4yz4yDm_'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IxkVrdPaxgjN1rYYFRJdYlTK4yz4yDm_'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PC2',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PC2'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1Z9XXR9R_w6OgNLQVJK7si_KmR2DooIzh',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1Z9XXR9R_w6OgNLQVJK7si_KmR2DooIzh',
  'https://docs.google.com/document/d/1Z9XXR9R_w6OgNLQVJK7si_KmR2DooIzh/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Z9XXR9R_w6OgNLQVJK7si_KmR2DooIzh'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1Z9XXR9R_w6OgNLQVJK7si_KmR2DooIzh/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Z9XXR9R_w6OgNLQVJK7si_KmR2DooIzh'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Z9XXR9R_w6OgNLQVJK7si_KmR2DooIzh'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1p-TWrH4KUJvAur5BeMucSpIlGhTkeIJj',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1p-TWrH4KUJvAur5BeMucSpIlGhTkeIJj',
  'https://drive.google.com/file/d/1p-TWrH4KUJvAur5BeMucSpIlGhTkeIJj/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1p-TWrH4KUJvAur5BeMucSpIlGhTkeIJj'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1p-TWrH4KUJvAur5BeMucSpIlGhTkeIJj/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1p-TWrH4KUJvAur5BeMucSpIlGhTkeIJj'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1p-TWrH4KUJvAur5BeMucSpIlGhTkeIJj'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1HgpAuzdefjg5e0gax7gOBvTLDCV5QQru',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1HgpAuzdefjg5e0gax7gOBvTLDCV5QQru',
  'https://drive.google.com/file/d/1HgpAuzdefjg5e0gax7gOBvTLDCV5QQru/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1HgpAuzdefjg5e0gax7gOBvTLDCV5QQru'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1HgpAuzdefjg5e0gax7gOBvTLDCV5QQru/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1HgpAuzdefjg5e0gax7gOBvTLDCV5QQru'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1HgpAuzdefjg5e0gax7gOBvTLDCV5QQru'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PC3',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PC3'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1s4RgIPlUJ93PxOljTkpIei-dMbBtrePo',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1s4RgIPlUJ93PxOljTkpIei-dMbBtrePo',
  'https://docs.google.com/document/d/1s4RgIPlUJ93PxOljTkpIei-dMbBtrePo/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1s4RgIPlUJ93PxOljTkpIei-dMbBtrePo'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1s4RgIPlUJ93PxOljTkpIei-dMbBtrePo/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1s4RgIPlUJ93PxOljTkpIei-dMbBtrePo'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1s4RgIPlUJ93PxOljTkpIei-dMbBtrePo'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1itbkz-I2LbcxVMlbhwPX_bCylHiM2bPp',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1itbkz-I2LbcxVMlbhwPX_bCylHiM2bPp',
  'https://drive.google.com/file/d/1itbkz-I2LbcxVMlbhwPX_bCylHiM2bPp/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1itbkz-I2LbcxVMlbhwPX_bCylHiM2bPp'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1itbkz-I2LbcxVMlbhwPX_bCylHiM2bPp/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1itbkz-I2LbcxVMlbhwPX_bCylHiM2bPp'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1itbkz-I2LbcxVMlbhwPX_bCylHiM2bPp'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1TDuuy7PoD6R-k9nda9-AhPVFPi25_70f',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1TDuuy7PoD6R-k9nda9-AhPVFPi25_70f',
  'https://drive.google.com/file/d/1TDuuy7PoD6R-k9nda9-AhPVFPi25_70f/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1TDuuy7PoD6R-k9nda9-AhPVFPi25_70f'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1TDuuy7PoD6R-k9nda9-AhPVFPi25_70f/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1TDuuy7PoD6R-k9nda9-AhPVFPi25_70f'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1TDuuy7PoD6R-k9nda9-AhPVFPi25_70f'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PC4',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PC4'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1ykZnj3UuuQuzhX6Z3H91ZM-DHpS9ve9N',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1ykZnj3UuuQuzhX6Z3H91ZM-DHpS9ve9N',
  'https://docs.google.com/document/d/1ykZnj3UuuQuzhX6Z3H91ZM-DHpS9ve9N/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ykZnj3UuuQuzhX6Z3H91ZM-DHpS9ve9N'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1ykZnj3UuuQuzhX6Z3H91ZM-DHpS9ve9N/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ykZnj3UuuQuzhX6Z3H91ZM-DHpS9ve9N'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ykZnj3UuuQuzhX6Z3H91ZM-DHpS9ve9N'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1SiVgJMQ3h0m8rsM8CpAQ16PA_wkz-9X_',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1SiVgJMQ3h0m8rsM8CpAQ16PA_wkz-9X_',
  'https://drive.google.com/file/d/1SiVgJMQ3h0m8rsM8CpAQ16PA_wkz-9X_/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1SiVgJMQ3h0m8rsM8CpAQ16PA_wkz-9X_'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1SiVgJMQ3h0m8rsM8CpAQ16PA_wkz-9X_/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1SiVgJMQ3h0m8rsM8CpAQ16PA_wkz-9X_'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1SiVgJMQ3h0m8rsM8CpAQ16PA_wkz-9X_'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-16j1LH5IRymGI_DXAue16dtI_O-FGTg_L',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '16j1LH5IRymGI_DXAue16dtI_O-FGTg_L',
  'https://drive.google.com/file/d/16j1LH5IRymGI_DXAue16dtI_O-FGTg_L/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '16j1LH5IRymGI_DXAue16dtI_O-FGTg_L'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/16j1LH5IRymGI_DXAue16dtI_O-FGTg_L/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '16j1LH5IRymGI_DXAue16dtI_O-FGTg_L'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '16j1LH5IRymGI_DXAue16dtI_O-FGTg_L'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PD1',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PD1'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1nHJlLFojlZe9bNUBNqRULl_lfX_muzTx',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1nHJlLFojlZe9bNUBNqRULl_lfX_muzTx',
  'https://docs.google.com/document/d/1nHJlLFojlZe9bNUBNqRULl_lfX_muzTx/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1nHJlLFojlZe9bNUBNqRULl_lfX_muzTx'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1nHJlLFojlZe9bNUBNqRULl_lfX_muzTx/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1nHJlLFojlZe9bNUBNqRULl_lfX_muzTx'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1nHJlLFojlZe9bNUBNqRULl_lfX_muzTx'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1SaoaMIYkBtxcoSAfE9CoTwqafrIJemVA',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1SaoaMIYkBtxcoSAfE9CoTwqafrIJemVA',
  'https://drive.google.com/file/d/1SaoaMIYkBtxcoSAfE9CoTwqafrIJemVA/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1SaoaMIYkBtxcoSAfE9CoTwqafrIJemVA'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1SaoaMIYkBtxcoSAfE9CoTwqafrIJemVA/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1SaoaMIYkBtxcoSAfE9CoTwqafrIJemVA'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1SaoaMIYkBtxcoSAfE9CoTwqafrIJemVA'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1k7xQGTwK1ISKLVhF4DFNYCee1g8YC4do',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1k7xQGTwK1ISKLVhF4DFNYCee1g8YC4do',
  'https://drive.google.com/file/d/1k7xQGTwK1ISKLVhF4DFNYCee1g8YC4do/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1k7xQGTwK1ISKLVhF4DFNYCee1g8YC4do'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1k7xQGTwK1ISKLVhF4DFNYCee1g8YC4do/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1k7xQGTwK1ISKLVhF4DFNYCee1g8YC4do'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1k7xQGTwK1ISKLVhF4DFNYCee1g8YC4do'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PD2',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PD2'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1a2atjZpDbDEM4XkwXtQx9Q6f1Owa8Phs',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1a2atjZpDbDEM4XkwXtQx9Q6f1Owa8Phs',
  'https://docs.google.com/document/d/1a2atjZpDbDEM4XkwXtQx9Q6f1Owa8Phs/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1a2atjZpDbDEM4XkwXtQx9Q6f1Owa8Phs'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1a2atjZpDbDEM4XkwXtQx9Q6f1Owa8Phs/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1a2atjZpDbDEM4XkwXtQx9Q6f1Owa8Phs'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1a2atjZpDbDEM4XkwXtQx9Q6f1Owa8Phs'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1dPlfMFTTkOx2QuTzcbcnXwR08MstYR08',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1dPlfMFTTkOx2QuTzcbcnXwR08MstYR08',
  'https://drive.google.com/file/d/1dPlfMFTTkOx2QuTzcbcnXwR08MstYR08/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1dPlfMFTTkOx2QuTzcbcnXwR08MstYR08'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1dPlfMFTTkOx2QuTzcbcnXwR08MstYR08/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1dPlfMFTTkOx2QuTzcbcnXwR08MstYR08'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1dPlfMFTTkOx2QuTzcbcnXwR08MstYR08'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1eXNOcuM--_bem9_ScZVB5vp6ajAkvAal',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1eXNOcuM--_bem9_ScZVB5vp6ajAkvAal',
  'https://drive.google.com/file/d/1eXNOcuM--_bem9_ScZVB5vp6ajAkvAal/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1eXNOcuM--_bem9_ScZVB5vp6ajAkvAal'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1eXNOcuM--_bem9_ScZVB5vp6ajAkvAal/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1eXNOcuM--_bem9_ScZVB5vp6ajAkvAal'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1eXNOcuM--_bem9_ScZVB5vp6ajAkvAal'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PD3',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PD3'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1md6Qaqy0w8mBLk280-DPCLCuKY1ejBkM',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1md6Qaqy0w8mBLk280-DPCLCuKY1ejBkM',
  'https://docs.google.com/document/d/1md6Qaqy0w8mBLk280-DPCLCuKY1ejBkM/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1md6Qaqy0w8mBLk280-DPCLCuKY1ejBkM'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1md6Qaqy0w8mBLk280-DPCLCuKY1ejBkM/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1md6Qaqy0w8mBLk280-DPCLCuKY1ejBkM'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1md6Qaqy0w8mBLk280-DPCLCuKY1ejBkM'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-15kGpONbZH0ZRIutqARQlLTTaxTLKBR1e',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '15kGpONbZH0ZRIutqARQlLTTaxTLKBR1e',
  'https://drive.google.com/file/d/15kGpONbZH0ZRIutqARQlLTTaxTLKBR1e/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '15kGpONbZH0ZRIutqARQlLTTaxTLKBR1e'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/15kGpONbZH0ZRIutqARQlLTTaxTLKBR1e/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '15kGpONbZH0ZRIutqARQlLTTaxTLKBR1e'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '15kGpONbZH0ZRIutqARQlLTTaxTLKBR1e'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1jFU_Gb1u6mvU3RTyAwYCJ-ZYScdixoIL',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1jFU_Gb1u6mvU3RTyAwYCJ-ZYScdixoIL',
  'https://drive.google.com/file/d/1jFU_Gb1u6mvU3RTyAwYCJ-ZYScdixoIL/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1jFU_Gb1u6mvU3RTyAwYCJ-ZYScdixoIL'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1jFU_Gb1u6mvU3RTyAwYCJ-ZYScdixoIL/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1jFU_Gb1u6mvU3RTyAwYCJ-ZYScdixoIL'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1jFU_Gb1u6mvU3RTyAwYCJ-ZYScdixoIL'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PD4',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PD4'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1TjOJ5IwmX0lGpOiWYjzyC_Prp8UC-ApL',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1TjOJ5IwmX0lGpOiWYjzyC_Prp8UC-ApL',
  'https://docs.google.com/document/d/1TjOJ5IwmX0lGpOiWYjzyC_Prp8UC-ApL/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1TjOJ5IwmX0lGpOiWYjzyC_Prp8UC-ApL'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1TjOJ5IwmX0lGpOiWYjzyC_Prp8UC-ApL/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1TjOJ5IwmX0lGpOiWYjzyC_Prp8UC-ApL'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1TjOJ5IwmX0lGpOiWYjzyC_Prp8UC-ApL'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1jwIarlD2cLPsTOyE-EmQu2iLju0JkJu8',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1jwIarlD2cLPsTOyE-EmQu2iLju0JkJu8',
  'https://drive.google.com/file/d/1jwIarlD2cLPsTOyE-EmQu2iLju0JkJu8/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1jwIarlD2cLPsTOyE-EmQu2iLju0JkJu8'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1jwIarlD2cLPsTOyE-EmQu2iLju0JkJu8/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1jwIarlD2cLPsTOyE-EmQu2iLju0JkJu8'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1jwIarlD2cLPsTOyE-EmQu2iLju0JkJu8'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1HHJLSZ3z0tFWeIKA6K0JRnZHmZb_FW7K',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1HHJLSZ3z0tFWeIKA6K0JRnZHmZb_FW7K',
  'https://drive.google.com/file/d/1HHJLSZ3z0tFWeIKA6K0JRnZHmZb_FW7K/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1HHJLSZ3z0tFWeIKA6K0JRnZHmZb_FW7K'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1HHJLSZ3z0tFWeIKA6K0JRnZHmZb_FW7K/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1HHJLSZ3z0tFWeIKA6K0JRnZHmZb_FW7K'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1HHJLSZ3z0tFWeIKA6K0JRnZHmZb_FW7K'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 19
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );


-- course_cycle 20 (MATE101 - 2026-0)
INSERT INTO evaluation (course_cycle_id, evaluation_type_id, number, start_date, end_date)
SELECT
  20,
  @evaluation_type_banco,
  0,
  (SELECT ac.start_date FROM academic_cycle ac INNER JOIN course_cycle cc ON cc.academic_cycle_id = ac.id WHERE cc.id = 20 LIMIT 1),
  (SELECT ac.end_date FROM academic_cycle ac INNER JOIN course_cycle cc ON cc.academic_cycle_id = ac.id WHERE cc.id = 20 LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM evaluation e
  WHERE e.course_cycle_id = 20 AND e.evaluation_type_id = @evaluation_type_banco AND e.number = 0
);

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  NULL,
  @folder_status_active,
  'Practicas Calificadas',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id IS NULL
    AND mf.name = 'Practicas Calificadas'
);

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  NULL,
  @folder_status_active,
  'Practicas Dirigidas',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id IS NULL
    AND mf.name = 'Practicas Dirigidas'
);

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  NULL,
  @folder_status_active,
  'Examenes',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id IS NULL
    AND mf.name = 'Examenes'
);

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'EX1',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'EX1'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1Iu_iWxkOeBa8tm-aowQoFfouTZOFbO-c',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1Iu_iWxkOeBa8tm-aowQoFfouTZOFbO-c',
  'https://docs.google.com/document/d/1Iu_iWxkOeBa8tm-aowQoFfouTZOFbO-c/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Iu_iWxkOeBa8tm-aowQoFfouTZOFbO-c'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1Iu_iWxkOeBa8tm-aowQoFfouTZOFbO-c/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Iu_iWxkOeBa8tm-aowQoFfouTZOFbO-c'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Iu_iWxkOeBa8tm-aowQoFfouTZOFbO-c'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1GD4T5Qehw40WfQKA-0mM8q3qheD0m8jm',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1GD4T5Qehw40WfQKA-0mM8q3qheD0m8jm',
  'https://drive.google.com/file/d/1GD4T5Qehw40WfQKA-0mM8q3qheD0m8jm/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1GD4T5Qehw40WfQKA-0mM8q3qheD0m8jm'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1GD4T5Qehw40WfQKA-0mM8q3qheD0m8jm/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1GD4T5Qehw40WfQKA-0mM8q3qheD0m8jm'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1GD4T5Qehw40WfQKA-0mM8q3qheD0m8jm'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1NYFkQRLC4WKmBPC3om-bkrgnI2LA3Ctv',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1NYFkQRLC4WKmBPC3om-bkrgnI2LA3Ctv',
  'https://drive.google.com/file/d/1NYFkQRLC4WKmBPC3om-bkrgnI2LA3Ctv/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1NYFkQRLC4WKmBPC3om-bkrgnI2LA3Ctv'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1NYFkQRLC4WKmBPC3om-bkrgnI2LA3Ctv/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1NYFkQRLC4WKmBPC3om-bkrgnI2LA3Ctv'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1NYFkQRLC4WKmBPC3om-bkrgnI2LA3Ctv'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'EX2',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'EX2'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-152r3wh9cr76o9qgPzjlnqa7oi1ya-Glh',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '152r3wh9cr76o9qgPzjlnqa7oi1ya-Glh',
  'https://docs.google.com/document/d/152r3wh9cr76o9qgPzjlnqa7oi1ya-Glh/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '152r3wh9cr76o9qgPzjlnqa7oi1ya-Glh'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/152r3wh9cr76o9qgPzjlnqa7oi1ya-Glh/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '152r3wh9cr76o9qgPzjlnqa7oi1ya-Glh'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '152r3wh9cr76o9qgPzjlnqa7oi1ya-Glh'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1RZ_llkurRI2HUhOICRcP8WnAK7eThFfY',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1RZ_llkurRI2HUhOICRcP8WnAK7eThFfY',
  'https://drive.google.com/file/d/1RZ_llkurRI2HUhOICRcP8WnAK7eThFfY/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1RZ_llkurRI2HUhOICRcP8WnAK7eThFfY'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1RZ_llkurRI2HUhOICRcP8WnAK7eThFfY/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1RZ_llkurRI2HUhOICRcP8WnAK7eThFfY'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1RZ_llkurRI2HUhOICRcP8WnAK7eThFfY'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1n3XlHqa9uICa2l8jvlsu5uGvBAn61AOF',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1n3XlHqa9uICa2l8jvlsu5uGvBAn61AOF',
  'https://drive.google.com/file/d/1n3XlHqa9uICa2l8jvlsu5uGvBAn61AOF/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1n3XlHqa9uICa2l8jvlsu5uGvBAn61AOF'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1n3XlHqa9uICa2l8jvlsu5uGvBAn61AOF/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1n3XlHqa9uICa2l8jvlsu5uGvBAn61AOF'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1n3XlHqa9uICa2l8jvlsu5uGvBAn61AOF'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'EX3',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'EX3'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1BPTIRLpdhemsslW1YlD6grfWP-mm1wnz',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1BPTIRLpdhemsslW1YlD6grfWP-mm1wnz',
  'https://docs.google.com/document/d/1BPTIRLpdhemsslW1YlD6grfWP-mm1wnz/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1BPTIRLpdhemsslW1YlD6grfWP-mm1wnz'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1BPTIRLpdhemsslW1YlD6grfWP-mm1wnz/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1BPTIRLpdhemsslW1YlD6grfWP-mm1wnz'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1BPTIRLpdhemsslW1YlD6grfWP-mm1wnz'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1P40v7ph9GzCDRIcfkJVz-bPHi9KdAwdg',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1P40v7ph9GzCDRIcfkJVz-bPHi9KdAwdg',
  'https://drive.google.com/file/d/1P40v7ph9GzCDRIcfkJVz-bPHi9KdAwdg/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1P40v7ph9GzCDRIcfkJVz-bPHi9KdAwdg'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1P40v7ph9GzCDRIcfkJVz-bPHi9KdAwdg/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1P40v7ph9GzCDRIcfkJVz-bPHi9KdAwdg'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1P40v7ph9GzCDRIcfkJVz-bPHi9KdAwdg'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1IeArtGgc6_7g7FoQL0ZRWUslCzf8U2g6',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1IeArtGgc6_7g7FoQL0ZRWUslCzf8U2g6',
  'https://drive.google.com/file/d/1IeArtGgc6_7g7FoQL0ZRWUslCzf8U2g6/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IeArtGgc6_7g7FoQL0ZRWUslCzf8U2g6'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1IeArtGgc6_7g7FoQL0ZRWUslCzf8U2g6/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IeArtGgc6_7g7FoQL0ZRWUslCzf8U2g6'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IeArtGgc6_7g7FoQL0ZRWUslCzf8U2g6'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Examenes'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'EX3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PC1',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PC1'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1G6S3FXJ6l_fM-DMRGmoq3ZeuVSspZAfh',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1G6S3FXJ6l_fM-DMRGmoq3ZeuVSspZAfh',
  'https://docs.google.com/document/d/1G6S3FXJ6l_fM-DMRGmoq3ZeuVSspZAfh/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1G6S3FXJ6l_fM-DMRGmoq3ZeuVSspZAfh'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1G6S3FXJ6l_fM-DMRGmoq3ZeuVSspZAfh/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1G6S3FXJ6l_fM-DMRGmoq3ZeuVSspZAfh'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1G6S3FXJ6l_fM-DMRGmoq3ZeuVSspZAfh'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1HYATEQaLj7oiVClP8EXY6fVXrSVpKYFI',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1HYATEQaLj7oiVClP8EXY6fVXrSVpKYFI',
  'https://drive.google.com/file/d/1HYATEQaLj7oiVClP8EXY6fVXrSVpKYFI/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1HYATEQaLj7oiVClP8EXY6fVXrSVpKYFI'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1HYATEQaLj7oiVClP8EXY6fVXrSVpKYFI/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1HYATEQaLj7oiVClP8EXY6fVXrSVpKYFI'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1HYATEQaLj7oiVClP8EXY6fVXrSVpKYFI'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-121GQ__jxIYzuiRUzPQhOFLPsX4InBWAj',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '121GQ__jxIYzuiRUzPQhOFLPsX4InBWAj',
  'https://drive.google.com/file/d/121GQ__jxIYzuiRUzPQhOFLPsX4InBWAj/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '121GQ__jxIYzuiRUzPQhOFLPsX4InBWAj'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/121GQ__jxIYzuiRUzPQhOFLPsX4InBWAj/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '121GQ__jxIYzuiRUzPQhOFLPsX4InBWAj'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '121GQ__jxIYzuiRUzPQhOFLPsX4InBWAj'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PC2',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PC2'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1xzE0u17mj-ZWk57ea7thuzCpTwlQGNOp',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1xzE0u17mj-ZWk57ea7thuzCpTwlQGNOp',
  'https://docs.google.com/document/d/1xzE0u17mj-ZWk57ea7thuzCpTwlQGNOp/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1xzE0u17mj-ZWk57ea7thuzCpTwlQGNOp'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1xzE0u17mj-ZWk57ea7thuzCpTwlQGNOp/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1xzE0u17mj-ZWk57ea7thuzCpTwlQGNOp'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1xzE0u17mj-ZWk57ea7thuzCpTwlQGNOp'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1wwyCJlR_AJaOFSbQTpJRubXWjrn3UHHT',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1wwyCJlR_AJaOFSbQTpJRubXWjrn3UHHT',
  'https://drive.google.com/file/d/1wwyCJlR_AJaOFSbQTpJRubXWjrn3UHHT/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1wwyCJlR_AJaOFSbQTpJRubXWjrn3UHHT'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1wwyCJlR_AJaOFSbQTpJRubXWjrn3UHHT/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1wwyCJlR_AJaOFSbQTpJRubXWjrn3UHHT'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1wwyCJlR_AJaOFSbQTpJRubXWjrn3UHHT'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1tUsSVUolqMOhLHSMtxDTxJjOVykd6Ssc',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1tUsSVUolqMOhLHSMtxDTxJjOVykd6Ssc',
  'https://drive.google.com/file/d/1tUsSVUolqMOhLHSMtxDTxJjOVykd6Ssc/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1tUsSVUolqMOhLHSMtxDTxJjOVykd6Ssc'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1tUsSVUolqMOhLHSMtxDTxJjOVykd6Ssc/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1tUsSVUolqMOhLHSMtxDTxJjOVykd6Ssc'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1tUsSVUolqMOhLHSMtxDTxJjOVykd6Ssc'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PC3',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PC3'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1PrFh_GtLEn7etc9lMMsbpV_uqS5iNcn_',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1PrFh_GtLEn7etc9lMMsbpV_uqS5iNcn_',
  'https://docs.google.com/document/d/1PrFh_GtLEn7etc9lMMsbpV_uqS5iNcn_/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1PrFh_GtLEn7etc9lMMsbpV_uqS5iNcn_'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1PrFh_GtLEn7etc9lMMsbpV_uqS5iNcn_/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1PrFh_GtLEn7etc9lMMsbpV_uqS5iNcn_'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1PrFh_GtLEn7etc9lMMsbpV_uqS5iNcn_'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1hK-IoPu-VeSVmmU1wxReRShNpPtNXyIS',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1hK-IoPu-VeSVmmU1wxReRShNpPtNXyIS',
  'https://drive.google.com/file/d/1hK-IoPu-VeSVmmU1wxReRShNpPtNXyIS/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1hK-IoPu-VeSVmmU1wxReRShNpPtNXyIS'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1hK-IoPu-VeSVmmU1wxReRShNpPtNXyIS/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1hK-IoPu-VeSVmmU1wxReRShNpPtNXyIS'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1hK-IoPu-VeSVmmU1wxReRShNpPtNXyIS'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1K-_jzKfmjvZ_19CtxYVIa2LoHaFCFEwV',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1K-_jzKfmjvZ_19CtxYVIa2LoHaFCFEwV',
  'https://drive.google.com/file/d/1K-_jzKfmjvZ_19CtxYVIa2LoHaFCFEwV/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1K-_jzKfmjvZ_19CtxYVIa2LoHaFCFEwV'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1K-_jzKfmjvZ_19CtxYVIa2LoHaFCFEwV/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1K-_jzKfmjvZ_19CtxYVIa2LoHaFCFEwV'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1K-_jzKfmjvZ_19CtxYVIa2LoHaFCFEwV'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PC4',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PC4'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1okp7-ok-yu0tUREln-4nROL6OOqREzmI',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1okp7-ok-yu0tUREln-4nROL6OOqREzmI',
  'https://docs.google.com/document/d/1okp7-ok-yu0tUREln-4nROL6OOqREzmI/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1okp7-ok-yu0tUREln-4nROL6OOqREzmI'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1okp7-ok-yu0tUREln-4nROL6OOqREzmI/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1okp7-ok-yu0tUREln-4nROL6OOqREzmI'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1okp7-ok-yu0tUREln-4nROL6OOqREzmI'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-18wc9PphQi3bCyKwLF_Ay_yHkIi9-9YW6',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '18wc9PphQi3bCyKwLF_Ay_yHkIi9-9YW6',
  'https://drive.google.com/file/d/18wc9PphQi3bCyKwLF_Ay_yHkIi9-9YW6/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '18wc9PphQi3bCyKwLF_Ay_yHkIi9-9YW6'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/18wc9PphQi3bCyKwLF_Ay_yHkIi9-9YW6/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '18wc9PphQi3bCyKwLF_Ay_yHkIi9-9YW6'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '18wc9PphQi3bCyKwLF_Ay_yHkIi9-9YW6'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1bDZPqveV2kb277a98uUSVyO_E43yJIts',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1bDZPqveV2kb277a98uUSVyO_E43yJIts',
  'https://drive.google.com/file/d/1bDZPqveV2kb277a98uUSVyO_E43yJIts/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1bDZPqveV2kb277a98uUSVyO_E43yJIts'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1bDZPqveV2kb277a98uUSVyO_E43yJIts/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1bDZPqveV2kb277a98uUSVyO_E43yJIts'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1bDZPqveV2kb277a98uUSVyO_E43yJIts'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Calificadas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PC4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PD1',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PD1'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1Irzn5QEb7F_MS494KiViCpOkQglv9D_y',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1Irzn5QEb7F_MS494KiViCpOkQglv9D_y',
  'https://docs.google.com/document/d/1Irzn5QEb7F_MS494KiViCpOkQglv9D_y/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Irzn5QEb7F_MS494KiViCpOkQglv9D_y'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1Irzn5QEb7F_MS494KiViCpOkQglv9D_y/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Irzn5QEb7F_MS494KiViCpOkQglv9D_y'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Irzn5QEb7F_MS494KiViCpOkQglv9D_y'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-16nwnuTZbuf1fFkR-BAbc8eRp_i92OzMa',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '16nwnuTZbuf1fFkR-BAbc8eRp_i92OzMa',
  'https://drive.google.com/file/d/16nwnuTZbuf1fFkR-BAbc8eRp_i92OzMa/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '16nwnuTZbuf1fFkR-BAbc8eRp_i92OzMa'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/16nwnuTZbuf1fFkR-BAbc8eRp_i92OzMa/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '16nwnuTZbuf1fFkR-BAbc8eRp_i92OzMa'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '16nwnuTZbuf1fFkR-BAbc8eRp_i92OzMa'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1Kr-3DZ6Xeg5OCvTL3FnNNhpRoFakwnYd',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1Kr-3DZ6Xeg5OCvTL3FnNNhpRoFakwnYd',
  'https://drive.google.com/file/d/1Kr-3DZ6Xeg5OCvTL3FnNNhpRoFakwnYd/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Kr-3DZ6Xeg5OCvTL3FnNNhpRoFakwnYd'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1Kr-3DZ6Xeg5OCvTL3FnNNhpRoFakwnYd/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Kr-3DZ6Xeg5OCvTL3FnNNhpRoFakwnYd'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Kr-3DZ6Xeg5OCvTL3FnNNhpRoFakwnYd'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD1'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PD2',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PD2'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1QCbGY3fXx2z9MFAqTbr51St8vv38g3Vn',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1QCbGY3fXx2z9MFAqTbr51St8vv38g3Vn',
  'https://docs.google.com/document/d/1QCbGY3fXx2z9MFAqTbr51St8vv38g3Vn/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1QCbGY3fXx2z9MFAqTbr51St8vv38g3Vn'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1QCbGY3fXx2z9MFAqTbr51St8vv38g3Vn/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1QCbGY3fXx2z9MFAqTbr51St8vv38g3Vn'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1QCbGY3fXx2z9MFAqTbr51St8vv38g3Vn'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1T5eThGSKP10cOp5MSUqf64FxjjEIgmmN',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1T5eThGSKP10cOp5MSUqf64FxjjEIgmmN',
  'https://drive.google.com/file/d/1T5eThGSKP10cOp5MSUqf64FxjjEIgmmN/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1T5eThGSKP10cOp5MSUqf64FxjjEIgmmN'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1T5eThGSKP10cOp5MSUqf64FxjjEIgmmN/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1T5eThGSKP10cOp5MSUqf64FxjjEIgmmN'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1T5eThGSKP10cOp5MSUqf64FxjjEIgmmN'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-19R3ISzh_x3YCEqwZVFRDHD6Kf2zaCOB8',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '19R3ISzh_x3YCEqwZVFRDHD6Kf2zaCOB8',
  'https://drive.google.com/file/d/19R3ISzh_x3YCEqwZVFRDHD6Kf2zaCOB8/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '19R3ISzh_x3YCEqwZVFRDHD6Kf2zaCOB8'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/19R3ISzh_x3YCEqwZVFRDHD6Kf2zaCOB8/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '19R3ISzh_x3YCEqwZVFRDHD6Kf2zaCOB8'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '19R3ISzh_x3YCEqwZVFRDHD6Kf2zaCOB8'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD2'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PD3',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PD3'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1Kj15cAHfLs2lpDCtYjmUBhAAO_hRi9jS',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '1Kj15cAHfLs2lpDCtYjmUBhAAO_hRi9jS',
  'https://docs.google.com/document/d/1Kj15cAHfLs2lpDCtYjmUBhAAO_hRi9jS/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Kj15cAHfLs2lpDCtYjmUBhAAO_hRi9jS'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/1Kj15cAHfLs2lpDCtYjmUBhAAO_hRi9jS/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Kj15cAHfLs2lpDCtYjmUBhAAO_hRi9jS'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Kj15cAHfLs2lpDCtYjmUBhAAO_hRi9jS'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1_MUa5nSJ3PFgg6U7itR8HT7XzGOMGW2U',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1_MUa5nSJ3PFgg6U7itR8HT7XzGOMGW2U',
  'https://drive.google.com/file/d/1_MUa5nSJ3PFgg6U7itR8HT7XzGOMGW2U/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1_MUa5nSJ3PFgg6U7itR8HT7XzGOMGW2U'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1_MUa5nSJ3PFgg6U7itR8HT7XzGOMGW2U/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1_MUa5nSJ3PFgg6U7itR8HT7XzGOMGW2U'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1_MUa5nSJ3PFgg6U7itR8HT7XzGOMGW2U'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-111YtfBhiyMVzoQszX96YWayKJlSpGwzy',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '111YtfBhiyMVzoQszX96YWayKJlSpGwzy',
  'https://drive.google.com/file/d/111YtfBhiyMVzoQszX96YWayKJlSpGwzy/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '111YtfBhiyMVzoQszX96YWayKJlSpGwzy'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/111YtfBhiyMVzoQszX96YWayKJlSpGwzy/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '111YtfBhiyMVzoQszX96YWayKJlSpGwzy'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '111YtfBhiyMVzoQszX96YWayKJlSpGwzy'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD3'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  ),
  (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  ),
  @folder_status_active,
  'PD4',
  NULL, NULL, @actor_user_id, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM material_folder mf
  WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
    AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
    AND mf.name = 'PD4'
);

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-11AAUrKE8ZBjFELxmxZnhiyMpGOUs67iq',
  '1INF26-Plantilla_E2.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  253021,
  'GDRIVE',
  '11AAUrKE8ZBjFELxmxZnhiyMpGOUs67iq',
  'https://docs.google.com/document/d/11AAUrKE8ZBjFELxmxZnhiyMpGOUs67iq/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '11AAUrKE8ZBjFELxmxZnhiyMpGOUs67iq'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://docs.google.com/document/d/11AAUrKE8ZBjFELxmxZnhiyMpGOUs67iq/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '11AAUrKE8ZBjFELxmxZnhiyMpGOUs67iq'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF26-Plantilla_E2.docx',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '11AAUrKE8ZBjFELxmxZnhiyMpGOUs67iq'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1wME_8n4mqkkwPN2rGsPYziAOElgbKUAW',
  '1INF61-2026-1-SILABO.PDF',
  'application/pdf',
  27856,
  'GDRIVE',
  '1wME_8n4mqkkwPN2rGsPYziAOElgbKUAW',
  'https://drive.google.com/file/d/1wME_8n4mqkkwPN2rGsPYziAOElgbKUAW/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1wME_8n4mqkkwPN2rGsPYziAOElgbKUAW'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1wME_8n4mqkkwPN2rGsPYziAOElgbKUAW/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1wME_8n4mqkkwPN2rGsPYziAOElgbKUAW'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  '1INF61-2026-1-SILABO.PDF',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1wME_8n4mqkkwPN2rGsPYziAOElgbKUAW'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );

INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT
  'gdrive-seed-1HLUUTMKa5Zts8IWvkEX7WwN2Hg_vOECf',
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  'application/pdf',
  95413,
  'GDRIVE',
  '1HLUUTMKa5Zts8IWvkEX7WwN2Hg_vOECf',
  'https://drive.google.com/file/d/1HLUUTMKa5Zts8IWvkEX7WwN2Hg_vOECf/view?usp=drivesdk',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM file_resource fr
  WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1HLUUTMKa5Zts8IWvkEX7WwN2Hg_vOECf'
);

INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT
  fr.id,
  1,
  'https://drive.google.com/file/d/1HLUUTMKa5Zts8IWvkEX7WwN2Hg_vOECf/view?usp=drivesdk',
  NOW(),
  @actor_user_id
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1HLUUTMKa5Zts8IWvkEX7WwN2Hg_vOECf'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT
  (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        ),
  NULL,
  fr.id,
  fv.id,
  @material_status_active,
  'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf',
  NULL, NULL, @actor_user_id, NOW(), NOW()
FROM file_resource fr
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1HLUUTMKa5Zts8IWvkEX7WwN2Hg_vOECf'
  AND NOT EXISTS (
    SELECT 1 FROM material m
    WHERE m.material_folder_id = (
          SELECT mf.id
          FROM material_folder mf
          WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
            AND mf.parent_folder_id = (
    SELECT mf.id
    FROM material_folder mf
    WHERE mf.evaluation_id = (
    SELECT e.id
    FROM evaluation e
    INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
    WHERE e.course_cycle_id = 20
      AND et.code = 'BANCO_ENUNCIADOS'
      AND e.number = 0
    ORDER BY e.id ASC
    LIMIT 1
  )
      AND mf.parent_folder_id IS NULL
      AND mf.name = 'Practicas Dirigidas'
    ORDER BY mf.id ASC
    LIMIT 1
  )
            AND mf.name = 'PD4'
          ORDER BY mf.id ASC
          LIMIT 1
        )
      AND m.file_resource_id = fr.id
  );


-- Summary: leafFolders=44, files=132
