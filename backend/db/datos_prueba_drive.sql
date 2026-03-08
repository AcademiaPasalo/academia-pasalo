-- Script generado automaticamente desde BD local
-- Replica estado Drive (scopes, videos, folders y materiales)
USE academia_pasalo;

SET @active_cycle_id = (
  SELECT COALESCE((SELECT CAST(setting_value AS UNSIGNED) FROM system_setting WHERE setting_key='ACTIVE_CYCLE_ID' LIMIT 1), (SELECT id FROM academic_cycle ORDER BY id DESC LIMIT 1))
);
SET @folder_status_active = (SELECT id FROM folder_status WHERE code = 'ACTIVE' LIMIT 1);
SET @material_status_active = (SELECT id FROM material_status WHERE code = 'ACTIVE' LIMIT 1);
SET @recording_ready = (SELECT id FROM class_event_recording_status WHERE code = 'READY' LIMIT 1);
SET @actor_user_id = 1;

-- 1) Scopes Drive por evaluacion (ciclo activo)
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 17, 'ev_17', '1p9Y6244WJLdFDHiwMod3dg5lszU0EnAk', '1QSAZ66dt4PAeLs-9OG_vvozRbf5kgjGR', '1QDHzg3WL3cfSlo4Ly33wMceXHoczzLCz', '1JnPIlAQdUo-3ae85-GxJcg93uyDqPWjV', 'ev-17-viewers@academiapasalo.com', '00upglbi2al8x8k', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 17);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 18, 'ev_18', '1o-LrEPLyvCCulCnWJKa2N9dJRAOTALhb', '1EFxVr1hDfQ-nr5jpcDXAtnRtNnGUVgf6', '1e2hMfH2prIFj8qklE3juB0A0CJMtQ-I0', '1dM5zEWTpHVRVGPl_OhbrkCttr5z0-bbh', 'ev-18-viewers@academiapasalo.com', '035nkun20jntf4r', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 18);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 19, 'ev_19', '1SzC2lSQrYVOe_RYnMcZycf_5DGbtHx4T', '1lE7AHR_4V0cpQeWJv86crX8w-zd4Ylj7', '1R9Wode_H5OcbRC8RsAI6jPSASa94dt25', '1VSE4pEmvvhevbW87ipI6cQxMUOW0R1jn', 'ev-19-viewers@academiapasalo.com', '00sqyw641qbosxy', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 19);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 20, 'ev_20', '1oN4nmhaIXgLED1oB0a-OZPTYfRiXFxYO', '1d0_9iT386Aqpo060pdI-23horQS_R6Ci', '1LFPmYL16fzaSu_ro91NDKCK-pZxHwPCC', '1-MS_ap2aI7ZMwsLANSmxezuSlt5lnojJ', 'ev-20-viewers@academiapasalo.com', '045jfvxd0nf2kb8', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 20);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 37, 'ev_37', '1nDTpVEtZ1vDPp87UhZZn7ynIowp8t_8t', '13JOxOWEmw-9yq4CBbzu52V_XqhSI_W7M', '1U3yCnwIKUv79OviDlifHNgapkzASQvlE', '1W4_JBKp8giollSGJveBjDA73SWzhNrSX', 'ev-37-viewers@academiapasalo.com', '04d34og80v2tm4u', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 37);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 38, 'ev_38', '1DWA5mqQu-IABg_qXfaZktzmAfZ4K8kvh', '14Y0R-laXmtUO07DHVfXgna1tDDE3b5VX', '1qlry6FvKYAOPL9JOqYOEyVu_Ats05zE2', '13YtuY8YBLJUFppdCc_--HqJvd9AbQGnn', 'ev-38-viewers@academiapasalo.com', '02p2csry46fytig', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 38);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 39, 'ev_39', '1iPeh459bHHwrJniEt0Ow2cbUtzZWp0ZV', '16-edMmujxkO6O27n4AIoxLrV3cU8Nfls', '1oalhdIUOK78XfwTPffJPu1m5_ChXrkTV', '10bogTpapW4tjVuTxCIHx86Efn0T1um7u', 'ev-39-viewers@academiapasalo.com', '01302m920rj3ssl', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 39);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 40, 'ev_40', '11GS7jEQ5ci0rDIH6vkJlvJdPCStLnDha', '1xzGbtcjJWEcvkX4qU2zkBv384rt3KVmx', '1K7w2kJLsWpZp_0om-tzQkzNRolYPSfiT', '1ZnH5JDLK088joGsUu3Z_I8mByX5JPDxM', 'ev-40-viewers@academiapasalo.com', '01d96cc01iry76p', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 40);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 57, 'ev_57', '14pWIzIgfM4FkcE1QazYSc5pc55aW1nlK', '1dM5dL_YLZTAzIca5rdRRGGmaTdHth4Qa', '1PsucN32xGu31kjO1Uz7atR7t41kDZspO', '1SK4TKSQmDMqkjkzRepFoYDsFR5Qwruc7', 'ev-57-viewers@academiapasalo.com', '028h4qwu37o7lyv', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 57);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 58, 'ev_58', '1Js5hzPR3XQqQ4uaHgNNJZjO3W7fT1eA8', '17jdDJW66GjhVMU5dOPYx0osai4ZW3C8X', '1fAKAt7Ooq_isEr7ukhu1wT-eGojUfgYi', '1eOk0_Ygs2WrC9bZBrpk2Oa_W_eXpDBoO', 'ev-58-viewers@academiapasalo.com', '00haapch24zcg39', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 58);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 59, 'ev_59', '1EuFcktJ4ACQrqFO0me3E3dqODvuVxzAU', '1qARSoUs1G85qf23rxapdXLxS8XQzFqjp', '1o9ivsRTxDX7XPGHmBlGhwaMfFpS7_C2n', '1JPtDp0DeFXYaGq6fR2k2XqpjNykdTcN3', 'ev-59-viewers@academiapasalo.com', '03jtnz0s3ee59m2', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 59);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 60, 'ev_60', '15BEApfx5LiRBVWT4jBs6i_ufCs_TUOQ1', '1WMb48mq2uU_6xchb8uyDt54QBLsx7mMh', '1fHsapM_8cqprIVWYZq5ke0usIQdd_Q8f', '1RovEfOGIAPnDMKZsyqsNDyfX6OyRULo2', 'ev-60-viewers@academiapasalo.com', '01ksv4uv3on7k80', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 60);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 77, 'ev_77', '1c3jf5AyVxkYk3NuSdDv71zwOupZrf5Ux', '1kZj5qyVD1XcTxGua4kXM-mqevILNRrUX', '1wI4dTwXB92g4NWpZV7A_BVYTJvH92Bz-', '1s54On6oTjEE7LPmGCrUHC33rgikl5LrS', 'ev-77-viewers@academiapasalo.com', '02250f4o1ek8hkh', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 77);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 78, 'ev_78', '10n9Eq7PTyCHqqiiYgqZHXhFLPCVdR6Lw', '1mHm2Jj_JHYUcInL7WkS1MEC85tLBqwfc', '1QjBquQvsKmnVrAWilaYuaFkbrL_I5atz', '1Gao3rjz318jsnM4aveJEIyodcEXdgf5X', 'ev-78-viewers@academiapasalo.com', '00nmf14n2t83553', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 78);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 79, 'ev_79', '1pwiVTpBrPYGeb9zk-kf_xqL6GLM1Mb1o', '1W1bY3jtOsN7rIYZKZG1SCIfoMSoDQ2eb', '1fWoZCOFKvR-HIzSXFFC8IViMRgLWKAxj', '1PQsin-jGOYEA9pzbaOrgPe_Irz5rcQM_', 'ev-79-viewers@academiapasalo.com', '0279ka651r0r0f7', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 79);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 80, 'ev_80', '1C6gGxLQnDpK7HHsnJ0mNw3ePUpX3d60f', '1KYNdbfAzF-XvaVdbUtHrDQbCvKoPNEpA', '1Fr50rjIefiPdNcq_FryjkjYUeqizPbG5', '1PsazyoiFkuJsldqN4QdsvGApRLcbXM7Z', 'ev-80-viewers@academiapasalo.com', '01jlao461qb1hkf', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 80);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 97, 'ev_97', '1aSgWh88mrRvxktXw1jF72gp5JEurUEY_', '1kWmUBVK4jKLDDLFBoOjJOjAIsYemG9-G', '1ZPo3n-53hsw-o35AtTr8fxVejoQEXSVY', '1lDgxzuW6SqGo2E3nV602YlXgmk3ycio7', 'ev-97-viewers@academiapasalo.com', '025b2l0r0sfe438', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 97);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 98, 'ev_98', '1pYeH8D-SIlHGPPtCOabKNQaTEUm-YM6V', '1jq_a-GgQaSBoqPEYgemkfsnz9DA-XOG3', '1-hPUuiMICez9pqvb7eK377c55q6AJFFW', '11FKnAuJEwgYHS6Yt2XlVGeWU5Xk0_oOo', 'ev-98-viewers@academiapasalo.com', '01ljsd9k3csded4', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 98);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 99, 'ev_99', '1U0MeGKmUzVc8jPsFryv9qs2WWokdLDh-', '1QSZmk2La-M0_4lifMMjgqDPLSEw-9K_h', '1OycQ8xLGrCNqUUIdAcNr1cCLxTIG0lxK', '1GtbI29UE2p95SjLnZWLgmDcoqp_w-qvb', 'ev-99-viewers@academiapasalo.com', '01y810tw0ykfdcf', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 99);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 100, 'ev_100', '1YXa_7QY9stRtaHNWaTql99Meg0uv5iKZ', '1LEApkigQnhDKqGuuNaNb6J61pqKz3pwa', '1NdDXMbaOaJZfHyd_bCIqQJvAZGBN7Pgg', '1iKup1WDn98qQXthASiN4TkrlxwnvtRpd', 'ev-100-viewers@academiapasalo.com', '00upglbi15vpnu9', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 100);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 117, 'ev_117', '1wuYZCGfKGMgr2qAvxz9HUqV1kuEk4SQ4', '1IwrpTnsMRu3dGcAKJSyGOkcu_8m9DZ78', '18UhO0QAYnX0XX62myw5Cw_yR7H3kLOd9', '1IairqV5rMkwBfAe7M21N9_0ekFjljTQ9', 'ev-117-viewers@academiapasalo.com', '048pi1tg17e9kyr', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 117);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 118, 'ev_118', '153Ti-3hI50p1blhgCtdOONHzrSiuKSNS', '1AFfaxfdSLpv_OcWmwx_ybdjBgDHCsTjP', '1bLrDUv-Mzm_tT-0LVxYfLw3nbzk4yj5D', '1IC3mc4IdxCUpdQY-Zntd_RZ3ZPhsvVDR', 'ev-118-viewers@academiapasalo.com', '0147n2zr1bdwdix', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 118);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 119, 'ev_119', '1Wt_KTF2EJIaEFlXy-yZpEicmIodyhmVQ', '1NOVxibXFeumsb81l5kwvgRCOeAgIKA6M', '1SNRDvaJbmZtrmZJgyVY2YNVU84v-vzxi', '1RhSXfGecMUqYuXC5E202ZOoFlM6yWUft', 'ev-119-viewers@academiapasalo.com', '025b2l0r1rs2fwa', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 119);
INSERT INTO evaluation_drive_access (evaluation_id, scope_key, drive_scope_folder_id, drive_videos_folder_id, drive_documents_folder_id, drive_archived_folder_id, viewer_group_email, viewer_group_id, is_active, created_at, updated_at)
SELECT 120, 'ev_120', '1QSDtXZ0UVxgItgF3DWa326Cwoc66IP_f', '17aH_DQYoBiQgmMKNcG4lmITV3raX-iSC', '1yZuHqbD9PIg-a2JRchYOnJNz60FbvYfl', '109P2SH6lYYqPFS5oLN1t-UylA7OZrv2z', 'ev-120-viewers@academiapasalo.com', '04anzqyu2vw1739', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM evaluation_drive_access WHERE evaluation_id = 120);

-- 2) Videos de sesiones (recording)
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/19KItOBT4RqdOj90lNP2qv_uA6JAnyeZ_/view?usp=drivesdk',
    recording_file_id = '19KItOBT4RqdOj90lNP2qv_uA6JAnyeZ_',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 17;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/13K91nksNwjgR2qxRuGB5rG-8tyA_HhQr/view?usp=drivesdk',
    recording_file_id = '13K91nksNwjgR2qxRuGB5rG-8tyA_HhQr',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 18;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1dCIADh3MFaIlzM27FiYBrbniRVC1lDgw/view?usp=drivesdk',
    recording_file_id = '1dCIADh3MFaIlzM27FiYBrbniRVC1lDgw',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 19;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/15kxIVZvpaum62JuwWBasyrlRoGk0oU8T/view?usp=drivesdk',
    recording_file_id = '15kxIVZvpaum62JuwWBasyrlRoGk0oU8T',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 20;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1_el31nf1XviFrVT-ZOHBAXElW3UcO3oj/view?usp=drivesdk',
    recording_file_id = '1_el31nf1XviFrVT-ZOHBAXElW3UcO3oj',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 37;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1JDEIwJZu8it2czR0CAnjSBFOl94U9gCf/view?usp=drivesdk',
    recording_file_id = '1JDEIwJZu8it2czR0CAnjSBFOl94U9gCf',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 38;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1uJKTvzRQ2RY1UhPInrl-YyxFggIKVSZB/view?usp=drivesdk',
    recording_file_id = '1uJKTvzRQ2RY1UhPInrl-YyxFggIKVSZB',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 39;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/14FolPG2SrYNdjsyVTZcTAsmt9mmTn9OO/view?usp=drivesdk',
    recording_file_id = '14FolPG2SrYNdjsyVTZcTAsmt9mmTn9OO',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 40;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1ZeQwYnYoegklnCHJNdt9bAoQ5VcXzGV2/view?usp=drivesdk',
    recording_file_id = '1ZeQwYnYoegklnCHJNdt9bAoQ5VcXzGV2',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 57;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1q5mOj2nwH-5y1v-_vIjnL6IOVCbgSgzH/view?usp=drivesdk',
    recording_file_id = '1q5mOj2nwH-5y1v-_vIjnL6IOVCbgSgzH',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 58;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1ZH_1vQLlms7L08rJCCe3fqAuFncEaoiW/view?usp=drivesdk',
    recording_file_id = '1ZH_1vQLlms7L08rJCCe3fqAuFncEaoiW',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 59;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1n0c7gJ9kzCDNnRBYE9gfJFhHAlh7T_Ar/view?usp=drivesdk',
    recording_file_id = '1n0c7gJ9kzCDNnRBYE9gfJFhHAlh7T_Ar',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 60;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1fEFZ4CkGRnfiPkErdgPFHBD-NhUAo4Cs/view?usp=drivesdk',
    recording_file_id = '1fEFZ4CkGRnfiPkErdgPFHBD-NhUAo4Cs',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 77;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1ne1mk3JPpNt7T2fKzrs73nJEZg5cGKA1/view?usp=drivesdk',
    recording_file_id = '1ne1mk3JPpNt7T2fKzrs73nJEZg5cGKA1',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 78;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1hmKBSfLV954geiVqiIWefgwrr3ShQT3E/view?usp=drivesdk',
    recording_file_id = '1hmKBSfLV954geiVqiIWefgwrr3ShQT3E',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 79;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1pHUHsEXxISnLbQWX5bpg1vh9xk40hkfA/view?usp=drivesdk',
    recording_file_id = '1pHUHsEXxISnLbQWX5bpg1vh9xk40hkfA',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 80;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1VM1K8_xj2zbxuPpMVMTzwMfrbJOQsCz4/view?usp=drivesdk',
    recording_file_id = '1VM1K8_xj2zbxuPpMVMTzwMfrbJOQsCz4',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 97;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1veB_ZPB8xvdLIFSo1moshzhrL0Mb2LoF/view?usp=drivesdk',
    recording_file_id = '1veB_ZPB8xvdLIFSo1moshzhrL0Mb2LoF',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 98;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1JZ1hiP8xfzmblgqP_IyOMx28O3SV9XU9/view?usp=drivesdk',
    recording_file_id = '1JZ1hiP8xfzmblgqP_IyOMx28O3SV9XU9',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 99;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1Ip5nIK6kGBoYg5U5ZJ9S7chLJjTC_II_/view?usp=drivesdk',
    recording_file_id = '1Ip5nIK6kGBoYg5U5ZJ9S7chLJjTC_II_',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 100;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1G4AIYqzaAkQP2nNfPq8itCxVgfdjX97d/view?usp=drivesdk',
    recording_file_id = '1G4AIYqzaAkQP2nNfPq8itCxVgfdjX97d',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 117;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1slmg-SY6MTzxLx44gGT61-um6tdX8cXx/view?usp=drivesdk',
    recording_file_id = '1slmg-SY6MTzxLx44gGT61-um6tdX8cXx',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 118;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1n9bh0uhg4Nmtt6gElTKRWl6vFVDWDiFN/view?usp=drivesdk',
    recording_file_id = '1n9bh0uhg4Nmtt6gElTKRWl6vFVDWDiFN',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 119;
UPDATE class_event
SET recording_url = 'https://drive.google.com/file/d/1gQ616dto69rGFt9PFQhK85YvoUXyLssD/view?usp=drivesdk',
    recording_file_id = '1gQ616dto69rGFt9PFQhK85YvoUXyLssD',
    recording_status_id = @recording_ready,
    updated_at = NOW()
WHERE evaluation_id = 120;

-- 3) Video intro por course_cycle
UPDATE course_cycle
SET intro_video_url = 'https://drive.google.com/file/d/13SwkbwjPkD2rjNAZtsTJ17A_occsGSpa/view?usp=drivesdk',
    intro_video_file_id = '13SwkbwjPkD2rjNAZtsTJ17A_occsGSpa'
WHERE id = 17;
UPDATE course_cycle
SET intro_video_url = 'https://drive.google.com/file/d/1HUPpE2xs1zppDsRhoAIlDojBkivN_96Y/view?usp=drivesdk',
    intro_video_file_id = '1HUPpE2xs1zppDsRhoAIlDojBkivN_96Y'
WHERE id = 18;
UPDATE course_cycle
SET intro_video_url = 'https://drive.google.com/file/d/1edh_3S3SQWhvC_4-6_xG3wvj5-yaWPaR/view?usp=drivesdk',
    intro_video_file_id = '1edh_3S3SQWhvC_4-6_xG3wvj5-yaWPaR'
WHERE id = 19;
UPDATE course_cycle
SET intro_video_url = 'https://drive.google.com/file/d/1QwCLyvXu-ICDTj8-twXeOUvHfZIpasin/view?usp=drivesdk',
    intro_video_file_id = '1QwCLyvXu-ICDTj8-twXeOUvHfZIpasin'
WHERE id = 20;

-- 4) File resources
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1Ogddc0UeMSvWMpcAFLTImGNMiAU8iZR1', '1INF61-2026-1-SILABO__ev_17.PDF', 'application/pdf', 27856, 'GDRIVE', '1Ogddc0UeMSvWMpcAFLTImGNMiAU8iZR1', 'https://drive.google.com/file/d/1Ogddc0UeMSvWMpcAFLTImGNMiAU8iZR1/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1Ogddc0UeMSvWMpcAFLTImGNMiAU8iZR1');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1zv_qi6c_BUcJ49I8UfBOWazFnMSW0IUF', '1INF61-2026-1-SILABO__ev_18.PDF', 'application/pdf', 27856, 'GDRIVE', '1zv_qi6c_BUcJ49I8UfBOWazFnMSW0IUF', 'https://drive.google.com/file/d/1zv_qi6c_BUcJ49I8UfBOWazFnMSW0IUF/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1zv_qi6c_BUcJ49I8UfBOWazFnMSW0IUF');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1iF_65Sy6k38DdlALAabE8l5MKkloTMlt', '1INF61-2026-1-SILABO__ev_19.PDF', 'application/pdf', 27856, 'GDRIVE', '1iF_65Sy6k38DdlALAabE8l5MKkloTMlt', 'https://drive.google.com/file/d/1iF_65Sy6k38DdlALAabE8l5MKkloTMlt/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1iF_65Sy6k38DdlALAabE8l5MKkloTMlt');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1IS_JUAkrp_dLCg3lSBljWWzeKFvIHFSx', '1INF61-2026-1-SILABO__ev_20.PDF', 'application/pdf', 27856, 'GDRIVE', '1IS_JUAkrp_dLCg3lSBljWWzeKFvIHFSx', 'https://drive.google.com/file/d/1IS_JUAkrp_dLCg3lSBljWWzeKFvIHFSx/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1IS_JUAkrp_dLCg3lSBljWWzeKFvIHFSx');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1IuOE_Lrn9Qbd6kjDX0P35rcCmWKc0QG-', '1INF61-2026-1-SILABO__ev_37.PDF', 'application/pdf', 27856, 'GDRIVE', '1IuOE_Lrn9Qbd6kjDX0P35rcCmWKc0QG-', 'https://drive.google.com/file/d/1IuOE_Lrn9Qbd6kjDX0P35rcCmWKc0QG-/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1IuOE_Lrn9Qbd6kjDX0P35rcCmWKc0QG-');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1GYj9G4Y0Wa8FQnTGTZOo31N4tYTXC-tP', '1INF61-2026-1-SILABO__ev_38.PDF', 'application/pdf', 27856, 'GDRIVE', '1GYj9G4Y0Wa8FQnTGTZOo31N4tYTXC-tP', 'https://drive.google.com/file/d/1GYj9G4Y0Wa8FQnTGTZOo31N4tYTXC-tP/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1GYj9G4Y0Wa8FQnTGTZOo31N4tYTXC-tP');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1KEazU9dUJoM888Oim1HGoJ-Z9gyNDWCd', '1INF61-2026-1-SILABO__ev_39.PDF', 'application/pdf', 27856, 'GDRIVE', '1KEazU9dUJoM888Oim1HGoJ-Z9gyNDWCd', 'https://drive.google.com/file/d/1KEazU9dUJoM888Oim1HGoJ-Z9gyNDWCd/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1KEazU9dUJoM888Oim1HGoJ-Z9gyNDWCd');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-16uxufc0ctqVO2iC5yzhwuMZDxRZvt_Yh', '1INF61-2026-1-SILABO__ev_40.PDF', 'application/pdf', 27856, 'GDRIVE', '16uxufc0ctqVO2iC5yzhwuMZDxRZvt_Yh', 'https://drive.google.com/file/d/16uxufc0ctqVO2iC5yzhwuMZDxRZvt_Yh/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '16uxufc0ctqVO2iC5yzhwuMZDxRZvt_Yh');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1wpcp2DpTM_KEO3k-GQBDEAgm6mC7U47y', '1INF61-2026-1-SILABO__ev_57.PDF', 'application/pdf', 27856, 'GDRIVE', '1wpcp2DpTM_KEO3k-GQBDEAgm6mC7U47y', 'https://drive.google.com/file/d/1wpcp2DpTM_KEO3k-GQBDEAgm6mC7U47y/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1wpcp2DpTM_KEO3k-GQBDEAgm6mC7U47y');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1hwGVVNbam9j4VnVmcKAphuIfDpR3NNge', '1INF61-2026-1-SILABO__ev_58.PDF', 'application/pdf', 27856, 'GDRIVE', '1hwGVVNbam9j4VnVmcKAphuIfDpR3NNge', 'https://drive.google.com/file/d/1hwGVVNbam9j4VnVmcKAphuIfDpR3NNge/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1hwGVVNbam9j4VnVmcKAphuIfDpR3NNge');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1LJXZ4-F9Ia0k0Jt5Us2bUa6285s57S9m', '1INF61-2026-1-SILABO__ev_59.PDF', 'application/pdf', 27856, 'GDRIVE', '1LJXZ4-F9Ia0k0Jt5Us2bUa6285s57S9m', 'https://drive.google.com/file/d/1LJXZ4-F9Ia0k0Jt5Us2bUa6285s57S9m/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1LJXZ4-F9Ia0k0Jt5Us2bUa6285s57S9m');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1a7G88LDJXvS9fRchV9_xod_FxMUttrfh', '1INF61-2026-1-SILABO__ev_60.PDF', 'application/pdf', 27856, 'GDRIVE', '1a7G88LDJXvS9fRchV9_xod_FxMUttrfh', 'https://drive.google.com/file/d/1a7G88LDJXvS9fRchV9_xod_FxMUttrfh/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1a7G88LDJXvS9fRchV9_xod_FxMUttrfh');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1nSleL8cmsj3wKh-7GOQIUztki8uvXLZS', '1INF61-2026-1-SILABO__ev_77.PDF', 'application/pdf', 27856, 'GDRIVE', '1nSleL8cmsj3wKh-7GOQIUztki8uvXLZS', 'https://drive.google.com/file/d/1nSleL8cmsj3wKh-7GOQIUztki8uvXLZS/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1nSleL8cmsj3wKh-7GOQIUztki8uvXLZS');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1V7-079VawmPgIXNuBGVDBrddzHT_0C-t', '1INF61-2026-1-SILABO__ev_78.PDF', 'application/pdf', 27856, 'GDRIVE', '1V7-079VawmPgIXNuBGVDBrddzHT_0C-t', 'https://drive.google.com/file/d/1V7-079VawmPgIXNuBGVDBrddzHT_0C-t/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1V7-079VawmPgIXNuBGVDBrddzHT_0C-t');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1o_xyDG19b-K1Djgo2ypu7W1m78-bBFHz', '1INF61-2026-1-SILABO__ev_79.PDF', 'application/pdf', 27856, 'GDRIVE', '1o_xyDG19b-K1Djgo2ypu7W1m78-bBFHz', 'https://drive.google.com/file/d/1o_xyDG19b-K1Djgo2ypu7W1m78-bBFHz/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1o_xyDG19b-K1Djgo2ypu7W1m78-bBFHz');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1Zcx1njC8wQhxLXrozJhgE1ej-ThFt_L2', '1INF61-2026-1-SILABO__ev_80.PDF', 'application/pdf', 27856, 'GDRIVE', '1Zcx1njC8wQhxLXrozJhgE1ej-ThFt_L2', 'https://drive.google.com/file/d/1Zcx1njC8wQhxLXrozJhgE1ej-ThFt_L2/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1Zcx1njC8wQhxLXrozJhgE1ej-ThFt_L2');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1w0yqHML1uZ5b7ewPQTzG3_vKOlgZjjz3', '1INF61-2026-1-SILABO__ev_97.PDF', 'application/pdf', 27856, 'GDRIVE', '1w0yqHML1uZ5b7ewPQTzG3_vKOlgZjjz3', 'https://drive.google.com/file/d/1w0yqHML1uZ5b7ewPQTzG3_vKOlgZjjz3/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1w0yqHML1uZ5b7ewPQTzG3_vKOlgZjjz3');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1FOahWFg-8pD6vwHCaYAGw09lX8C5cE5e', '1INF61-2026-1-SILABO__ev_98.PDF', 'application/pdf', 27856, 'GDRIVE', '1FOahWFg-8pD6vwHCaYAGw09lX8C5cE5e', 'https://drive.google.com/file/d/1FOahWFg-8pD6vwHCaYAGw09lX8C5cE5e/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1FOahWFg-8pD6vwHCaYAGw09lX8C5cE5e');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1yPx0BjP5wzyig1Mt9hWokRi4QJn2m04c', '1INF61-2026-1-SILABO__ev_99.PDF', 'application/pdf', 27856, 'GDRIVE', '1yPx0BjP5wzyig1Mt9hWokRi4QJn2m04c', 'https://drive.google.com/file/d/1yPx0BjP5wzyig1Mt9hWokRi4QJn2m04c/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1yPx0BjP5wzyig1Mt9hWokRi4QJn2m04c');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1-_6n8TdDvX5U6rusEVedxKGrYJREvzsz', '1INF61-2026-1-SILABO__ev_100.PDF', 'application/pdf', 27856, 'GDRIVE', '1-_6n8TdDvX5U6rusEVedxKGrYJREvzsz', 'https://drive.google.com/file/d/1-_6n8TdDvX5U6rusEVedxKGrYJREvzsz/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1-_6n8TdDvX5U6rusEVedxKGrYJREvzsz');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-14DKytkL7pL0b-HEsVFUMf5G-zx9o7phr', '1INF61-2026-1-SILABO__ev_117.PDF', 'application/pdf', 27856, 'GDRIVE', '14DKytkL7pL0b-HEsVFUMf5G-zx9o7phr', 'https://drive.google.com/file/d/14DKytkL7pL0b-HEsVFUMf5G-zx9o7phr/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '14DKytkL7pL0b-HEsVFUMf5G-zx9o7phr');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1BVoJI-4MvmGsTycTgfamD2sl_fNyd-L4', '1INF61-2026-1-SILABO__ev_118.PDF', 'application/pdf', 27856, 'GDRIVE', '1BVoJI-4MvmGsTycTgfamD2sl_fNyd-L4', 'https://drive.google.com/file/d/1BVoJI-4MvmGsTycTgfamD2sl_fNyd-L4/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1BVoJI-4MvmGsTycTgfamD2sl_fNyd-L4');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1IEAjeV8kY-SSanGTm1C0U5IsRhgKJFSS', '1INF61-2026-1-SILABO__ev_119.PDF', 'application/pdf', 27856, 'GDRIVE', '1IEAjeV8kY-SSanGTm1C0U5IsRhgKJFSS', 'https://drive.google.com/file/d/1IEAjeV8kY-SSanGTm1C0U5IsRhgKJFSS/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1IEAjeV8kY-SSanGTm1C0U5IsRhgKJFSS');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-17hhIUWbPE_BBpthF2qxD1UPFcwBcKRpo', '1INF61-2026-1-SILABO__ev_120.PDF', 'application/pdf', 27856, 'GDRIVE', '17hhIUWbPE_BBpthF2qxD1UPFcwBcKRpo', 'https://drive.google.com/file/d/17hhIUWbPE_BBpthF2qxD1UPFcwBcKRpo/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '17hhIUWbPE_BBpthF2qxD1UPFcwBcKRpo');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1WwBGsVlrBBfSct0hQTyz6N46IlGC0bq9', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1WwBGsVlrBBfSct0hQTyz6N46IlGC0bq9', 'https://drive.google.com/file/d/1WwBGsVlrBBfSct0hQTyz6N46IlGC0bq9/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1WwBGsVlrBBfSct0hQTyz6N46IlGC0bq9');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1HbbEumBCCjeaS5xzogm5vGZB29xZzgMX', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1HbbEumBCCjeaS5xzogm5vGZB29xZzgMX', 'https://docs.google.com/document/d/1HbbEumBCCjeaS5xzogm5vGZB29xZzgMX/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1HbbEumBCCjeaS5xzogm5vGZB29xZzgMX');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1PtPvS8ecvhholw1Lh6FvoD5QGmqq-Kqo', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1PtPvS8ecvhholw1Lh6FvoD5QGmqq-Kqo', 'https://drive.google.com/file/d/1PtPvS8ecvhholw1Lh6FvoD5QGmqq-Kqo/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1PtPvS8ecvhholw1Lh6FvoD5QGmqq-Kqo');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1uTkkdHAc86dDFdy75SUPeGZZc4N2FIb7', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1uTkkdHAc86dDFdy75SUPeGZZc4N2FIb7', 'https://docs.google.com/document/d/1uTkkdHAc86dDFdy75SUPeGZZc4N2FIb7/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1uTkkdHAc86dDFdy75SUPeGZZc4N2FIb7');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1KHW-Jb-zXlOItZfvdiOlF4VYZ_zkLeaR', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1KHW-Jb-zXlOItZfvdiOlF4VYZ_zkLeaR', 'https://drive.google.com/file/d/1KHW-Jb-zXlOItZfvdiOlF4VYZ_zkLeaR/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1KHW-Jb-zXlOItZfvdiOlF4VYZ_zkLeaR');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1IxATftwfdn77ejslRMM97JsFe3y2Idtt', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1IxATftwfdn77ejslRMM97JsFe3y2Idtt', 'https://docs.google.com/document/d/1IxATftwfdn77ejslRMM97JsFe3y2Idtt/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1IxATftwfdn77ejslRMM97JsFe3y2Idtt');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1G6BKx0gj9mFC9Jf_AkyZynMhcim1LZKg', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1G6BKx0gj9mFC9Jf_AkyZynMhcim1LZKg', 'https://drive.google.com/file/d/1G6BKx0gj9mFC9Jf_AkyZynMhcim1LZKg/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1G6BKx0gj9mFC9Jf_AkyZynMhcim1LZKg');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1Znjj_3cao8oX9dGT8l7N9W7WNcyN4oyy', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1Znjj_3cao8oX9dGT8l7N9W7WNcyN4oyy', 'https://docs.google.com/document/d/1Znjj_3cao8oX9dGT8l7N9W7WNcyN4oyy/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1Znjj_3cao8oX9dGT8l7N9W7WNcyN4oyy');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1MlALOYgamI6m87oUMNT9kYEuXz7NM05U', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1MlALOYgamI6m87oUMNT9kYEuXz7NM05U', 'https://drive.google.com/file/d/1MlALOYgamI6m87oUMNT9kYEuXz7NM05U/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1MlALOYgamI6m87oUMNT9kYEuXz7NM05U');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1rl11bF3mj7Yh2qnFhECCJkIxODotclRA', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1rl11bF3mj7Yh2qnFhECCJkIxODotclRA', 'https://docs.google.com/document/d/1rl11bF3mj7Yh2qnFhECCJkIxODotclRA/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1rl11bF3mj7Yh2qnFhECCJkIxODotclRA');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1ieOLbKJVcwyerEbjSQPsI7HAmkyuYFB2', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1ieOLbKJVcwyerEbjSQPsI7HAmkyuYFB2', 'https://drive.google.com/file/d/1ieOLbKJVcwyerEbjSQPsI7HAmkyuYFB2/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1ieOLbKJVcwyerEbjSQPsI7HAmkyuYFB2');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1gohb7IoErtwtpgDuYtzLyCTXY0ogOEDo', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1gohb7IoErtwtpgDuYtzLyCTXY0ogOEDo', 'https://docs.google.com/document/d/1gohb7IoErtwtpgDuYtzLyCTXY0ogOEDo/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1gohb7IoErtwtpgDuYtzLyCTXY0ogOEDo');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1ATRszqqODvJSEIrQu1aeLX5GFSmfPrSf', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1ATRszqqODvJSEIrQu1aeLX5GFSmfPrSf', 'https://drive.google.com/file/d/1ATRszqqODvJSEIrQu1aeLX5GFSmfPrSf/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1ATRszqqODvJSEIrQu1aeLX5GFSmfPrSf');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1iE0rIqb4ILSk-NWtC-JKiMRv-ICM-nj5', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1iE0rIqb4ILSk-NWtC-JKiMRv-ICM-nj5', 'https://docs.google.com/document/d/1iE0rIqb4ILSk-NWtC-JKiMRv-ICM-nj5/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1iE0rIqb4ILSk-NWtC-JKiMRv-ICM-nj5');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1axSADderCbGH6Gcec7t5EZwSnWDsb3vf', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1axSADderCbGH6Gcec7t5EZwSnWDsb3vf', 'https://drive.google.com/file/d/1axSADderCbGH6Gcec7t5EZwSnWDsb3vf/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1axSADderCbGH6Gcec7t5EZwSnWDsb3vf');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-11bxBh8F9Qgz5FKbI2gQocwaK20XwWXw_', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '11bxBh8F9Qgz5FKbI2gQocwaK20XwWXw_', 'https://docs.google.com/document/d/11bxBh8F9Qgz5FKbI2gQocwaK20XwWXw_/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '11bxBh8F9Qgz5FKbI2gQocwaK20XwWXw_');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1Ahuar298z-ghOjGH5_VXg4zv-7ae0dbh', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1Ahuar298z-ghOjGH5_VXg4zv-7ae0dbh', 'https://drive.google.com/file/d/1Ahuar298z-ghOjGH5_VXg4zv-7ae0dbh/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1Ahuar298z-ghOjGH5_VXg4zv-7ae0dbh');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1e-1zASB9V7M5MGstIsWAIsiuoVJ0w49g', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1e-1zASB9V7M5MGstIsWAIsiuoVJ0w49g', 'https://docs.google.com/document/d/1e-1zASB9V7M5MGstIsWAIsiuoVJ0w49g/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1e-1zASB9V7M5MGstIsWAIsiuoVJ0w49g');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-15EaGkROfLUstamUD0yi51Te6QVFmyFQM', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '15EaGkROfLUstamUD0yi51Te6QVFmyFQM', 'https://drive.google.com/file/d/15EaGkROfLUstamUD0yi51Te6QVFmyFQM/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '15EaGkROfLUstamUD0yi51Te6QVFmyFQM');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1sEIH8xgZecj-cBfCWAQ7z45fbi01XW4f', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1sEIH8xgZecj-cBfCWAQ7z45fbi01XW4f', 'https://docs.google.com/document/d/1sEIH8xgZecj-cBfCWAQ7z45fbi01XW4f/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1sEIH8xgZecj-cBfCWAQ7z45fbi01XW4f');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1yrpsS37Xh6QqCwdfyD5NEKlpiHtAKX1a', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1yrpsS37Xh6QqCwdfyD5NEKlpiHtAKX1a', 'https://drive.google.com/file/d/1yrpsS37Xh6QqCwdfyD5NEKlpiHtAKX1a/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1yrpsS37Xh6QqCwdfyD5NEKlpiHtAKX1a');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1aadszK56LMsKnDDvQjrLpT-Bt61D8Ao_', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1aadszK56LMsKnDDvQjrLpT-Bt61D8Ao_', 'https://docs.google.com/document/d/1aadszK56LMsKnDDvQjrLpT-Bt61D8Ao_/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1aadszK56LMsKnDDvQjrLpT-Bt61D8Ao_');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1QbqnLF8WMyOzvUdGTz-YbnW0XVF3qIy6', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1QbqnLF8WMyOzvUdGTz-YbnW0XVF3qIy6', 'https://drive.google.com/file/d/1QbqnLF8WMyOzvUdGTz-YbnW0XVF3qIy6/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1QbqnLF8WMyOzvUdGTz-YbnW0XVF3qIy6');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1qxmu1KE25PLwTx6GAeA52Is4HrqqQkx4', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1qxmu1KE25PLwTx6GAeA52Is4HrqqQkx4', 'https://docs.google.com/document/d/1qxmu1KE25PLwTx6GAeA52Is4HrqqQkx4/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1qxmu1KE25PLwTx6GAeA52Is4HrqqQkx4');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1GR0ucgSxXfbRxwzcUdbcAtVWB_eBW1bJ', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1GR0ucgSxXfbRxwzcUdbcAtVWB_eBW1bJ', 'https://drive.google.com/file/d/1GR0ucgSxXfbRxwzcUdbcAtVWB_eBW1bJ/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1GR0ucgSxXfbRxwzcUdbcAtVWB_eBW1bJ');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1cSPfOcZRaBOWkyWUdb-88UhKRbN0PeJq', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1cSPfOcZRaBOWkyWUdb-88UhKRbN0PeJq', 'https://docs.google.com/document/d/1cSPfOcZRaBOWkyWUdb-88UhKRbN0PeJq/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1cSPfOcZRaBOWkyWUdb-88UhKRbN0PeJq');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1-LS4b3Dymgd8qxdh4WJSHjLk0P-G2LPK', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1-LS4b3Dymgd8qxdh4WJSHjLk0P-G2LPK', 'https://drive.google.com/file/d/1-LS4b3Dymgd8qxdh4WJSHjLk0P-G2LPK/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1-LS4b3Dymgd8qxdh4WJSHjLk0P-G2LPK');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1JhbfILUb_9PX2C3ebsVmQCPWIjDEckb1', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1JhbfILUb_9PX2C3ebsVmQCPWIjDEckb1', 'https://docs.google.com/document/d/1JhbfILUb_9PX2C3ebsVmQCPWIjDEckb1/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1JhbfILUb_9PX2C3ebsVmQCPWIjDEckb1');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1tPxXLm9ogNt1ZhNiqWcy1VCaukooB3qa', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1tPxXLm9ogNt1ZhNiqWcy1VCaukooB3qa', 'https://drive.google.com/file/d/1tPxXLm9ogNt1ZhNiqWcy1VCaukooB3qa/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1tPxXLm9ogNt1ZhNiqWcy1VCaukooB3qa');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1Tv24MmDdpJ-VOkh51c1CMk7UOi3G6393', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1Tv24MmDdpJ-VOkh51c1CMk7UOi3G6393', 'https://docs.google.com/document/d/1Tv24MmDdpJ-VOkh51c1CMk7UOi3G6393/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1Tv24MmDdpJ-VOkh51c1CMk7UOi3G6393');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1AqnrDPZYRj6G-q4E2X8WxbYDN2yvLhle', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1AqnrDPZYRj6G-q4E2X8WxbYDN2yvLhle', 'https://drive.google.com/file/d/1AqnrDPZYRj6G-q4E2X8WxbYDN2yvLhle/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1AqnrDPZYRj6G-q4E2X8WxbYDN2yvLhle');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1czeTuR2huO8lhj8cxNNSq3mTLllwrch6', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1czeTuR2huO8lhj8cxNNSq3mTLllwrch6', 'https://docs.google.com/document/d/1czeTuR2huO8lhj8cxNNSq3mTLllwrch6/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1czeTuR2huO8lhj8cxNNSq3mTLllwrch6');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1iLovA-k1FgkuzrcPtRSReJoOwxh2oEWW', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1iLovA-k1FgkuzrcPtRSReJoOwxh2oEWW', 'https://drive.google.com/file/d/1iLovA-k1FgkuzrcPtRSReJoOwxh2oEWW/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1iLovA-k1FgkuzrcPtRSReJoOwxh2oEWW');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1f02AmOXIuiVHBo3bq1s7mqJLvv5JU3Jj', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1f02AmOXIuiVHBo3bq1s7mqJLvv5JU3Jj', 'https://docs.google.com/document/d/1f02AmOXIuiVHBo3bq1s7mqJLvv5JU3Jj/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1f02AmOXIuiVHBo3bq1s7mqJLvv5JU3Jj');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1xolEpP_9C7diH-Ngb6tj2BR3tU7aGlLl', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1xolEpP_9C7diH-Ngb6tj2BR3tU7aGlLl', 'https://drive.google.com/file/d/1xolEpP_9C7diH-Ngb6tj2BR3tU7aGlLl/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1xolEpP_9C7diH-Ngb6tj2BR3tU7aGlLl');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1BmjmXCEdCLbK-c0nU7vPAfGpZ3TKz7Vh', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1BmjmXCEdCLbK-c0nU7vPAfGpZ3TKz7Vh', 'https://docs.google.com/document/d/1BmjmXCEdCLbK-c0nU7vPAfGpZ3TKz7Vh/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1BmjmXCEdCLbK-c0nU7vPAfGpZ3TKz7Vh');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1VDOuu9BC2dr1n4ub0_H2lCbc_ShTVk82', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1VDOuu9BC2dr1n4ub0_H2lCbc_ShTVk82', 'https://drive.google.com/file/d/1VDOuu9BC2dr1n4ub0_H2lCbc_ShTVk82/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1VDOuu9BC2dr1n4ub0_H2lCbc_ShTVk82');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1Wz-oBiLcaWT3pN7CDCTLR7dGAUeGno8L', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1Wz-oBiLcaWT3pN7CDCTLR7dGAUeGno8L', 'https://docs.google.com/document/d/1Wz-oBiLcaWT3pN7CDCTLR7dGAUeGno8L/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1Wz-oBiLcaWT3pN7CDCTLR7dGAUeGno8L');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1YIUpS97LvLzN1erWtzfkSkkJrw700SvG', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1YIUpS97LvLzN1erWtzfkSkkJrw700SvG', 'https://drive.google.com/file/d/1YIUpS97LvLzN1erWtzfkSkkJrw700SvG/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1YIUpS97LvLzN1erWtzfkSkkJrw700SvG');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1FNSwSQCwcuoTc0XVCs2KuX1HPr0FWqRl', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1FNSwSQCwcuoTc0XVCs2KuX1HPr0FWqRl', 'https://docs.google.com/document/d/1FNSwSQCwcuoTc0XVCs2KuX1HPr0FWqRl/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1FNSwSQCwcuoTc0XVCs2KuX1HPr0FWqRl');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1rZkeki8LR8kPy4rLEIosX19qVrfSl12v', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1rZkeki8LR8kPy4rLEIosX19qVrfSl12v', 'https://drive.google.com/file/d/1rZkeki8LR8kPy4rLEIosX19qVrfSl12v/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1rZkeki8LR8kPy4rLEIosX19qVrfSl12v');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-15mTVQ3-zh9xBCHlo0UPtlixeYFikfRI6', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '15mTVQ3-zh9xBCHlo0UPtlixeYFikfRI6', 'https://docs.google.com/document/d/15mTVQ3-zh9xBCHlo0UPtlixeYFikfRI6/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '15mTVQ3-zh9xBCHlo0UPtlixeYFikfRI6');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1IrlZwkc9j07mKXSP1TDi0qMCrJqTdZCd', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1IrlZwkc9j07mKXSP1TDi0qMCrJqTdZCd', 'https://drive.google.com/file/d/1IrlZwkc9j07mKXSP1TDi0qMCrJqTdZCd/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1IrlZwkc9j07mKXSP1TDi0qMCrJqTdZCd');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1rR0dOCbyKN0sq__bC3NW6qO0-g4fF04i', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1rR0dOCbyKN0sq__bC3NW6qO0-g4fF04i', 'https://docs.google.com/document/d/1rR0dOCbyKN0sq__bC3NW6qO0-g4fF04i/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1rR0dOCbyKN0sq__bC3NW6qO0-g4fF04i');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1GolyxlvXx6Ex6urzXiNsAD_HLdm_BlQM', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1GolyxlvXx6Ex6urzXiNsAD_HLdm_BlQM', 'https://drive.google.com/file/d/1GolyxlvXx6Ex6urzXiNsAD_HLdm_BlQM/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1GolyxlvXx6Ex6urzXiNsAD_HLdm_BlQM');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1cW7pCOMxcOnvQYapgE-fSpDoRc8CPDj_', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1cW7pCOMxcOnvQYapgE-fSpDoRc8CPDj_', 'https://docs.google.com/document/d/1cW7pCOMxcOnvQYapgE-fSpDoRc8CPDj_/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1cW7pCOMxcOnvQYapgE-fSpDoRc8CPDj_');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1a-6PBpxDbSAGBNj70lOPtTzehs1Zrqu9', 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', 'application/pdf', 95413, 'GDRIVE', '1a-6PBpxDbSAGBNj70lOPtTzehs1Zrqu9', 'https://drive.google.com/file/d/1a-6PBpxDbSAGBNj70lOPtTzehs1Zrqu9/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1a-6PBpxDbSAGBNj70lOPtTzehs1Zrqu9');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1zpHe-mVBdv25z0Bm5DiH7aqe9zF9Mk3Q', '1INF26-Plantilla_E2.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 253021, 'GDRIVE', '1zpHe-mVBdv25z0Bm5DiH7aqe9zF9Mk3Q', 'https://docs.google.com/document/d/1zpHe-mVBdv25z0Bm5DiH7aqe9zF9Mk3Q/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1zpHe-mVBdv25z0Bm5DiH7aqe9zF9Mk3Q');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1G9vzGUgf02XVfZzIzIvNEyqvoDgTu4vS', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1G9vzGUgf02XVfZzIzIvNEyqvoDgTu4vS', 'https://docs.google.com/document/d/1G9vzGUgf02XVfZzIzIvNEyqvoDgTu4vS/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1G9vzGUgf02XVfZzIzIvNEyqvoDgTu4vS');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1fTNUI87Wgy0tbIrMw4YzTsDh9LBAvu6b', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1fTNUI87Wgy0tbIrMw4YzTsDh9LBAvu6b', 'https://drive.google.com/file/d/1fTNUI87Wgy0tbIrMw4YzTsDh9LBAvu6b/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1fTNUI87Wgy0tbIrMw4YzTsDh9LBAvu6b');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1aSQdSPPbvVR9dNoRKlbuF723gO2qjgXU', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1aSQdSPPbvVR9dNoRKlbuF723gO2qjgXU', 'https://docs.google.com/document/d/1aSQdSPPbvVR9dNoRKlbuF723gO2qjgXU/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1aSQdSPPbvVR9dNoRKlbuF723gO2qjgXU');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1ZrSccpKoyZjM5NCdCXdgsRObqlxQIFrY', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1ZrSccpKoyZjM5NCdCXdgsRObqlxQIFrY', 'https://drive.google.com/file/d/1ZrSccpKoyZjM5NCdCXdgsRObqlxQIFrY/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1ZrSccpKoyZjM5NCdCXdgsRObqlxQIFrY');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1EV7hoUtrchbCY231QhY0J0vwv_MrFSDg', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1EV7hoUtrchbCY231QhY0J0vwv_MrFSDg', 'https://docs.google.com/document/d/1EV7hoUtrchbCY231QhY0J0vwv_MrFSDg/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1EV7hoUtrchbCY231QhY0J0vwv_MrFSDg');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1ObBdxEb-SLnESx6j2UDQvw1AQqqjtCPt', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1ObBdxEb-SLnESx6j2UDQvw1AQqqjtCPt', 'https://drive.google.com/file/d/1ObBdxEb-SLnESx6j2UDQvw1AQqqjtCPt/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1ObBdxEb-SLnESx6j2UDQvw1AQqqjtCPt');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1hL1y3oXkoR9OcOUzeMNznYYxetfF1mCB', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1hL1y3oXkoR9OcOUzeMNznYYxetfF1mCB', 'https://docs.google.com/document/d/1hL1y3oXkoR9OcOUzeMNznYYxetfF1mCB/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1hL1y3oXkoR9OcOUzeMNznYYxetfF1mCB');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1Yu185-8amxaFPRy8B0OTnOz1Wv8GmJI-', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1Yu185-8amxaFPRy8B0OTnOz1Wv8GmJI-', 'https://drive.google.com/file/d/1Yu185-8amxaFPRy8B0OTnOz1Wv8GmJI-/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1Yu185-8amxaFPRy8B0OTnOz1Wv8GmJI-');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1_3-mSiOJl7YwOgw4iFpuGXGSw3saHRhx', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1_3-mSiOJl7YwOgw4iFpuGXGSw3saHRhx', 'https://docs.google.com/document/d/1_3-mSiOJl7YwOgw4iFpuGXGSw3saHRhx/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1_3-mSiOJl7YwOgw4iFpuGXGSw3saHRhx');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1bRoh3Hp82UvhsqVdVgnN4nze0AutvVOT', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1bRoh3Hp82UvhsqVdVgnN4nze0AutvVOT', 'https://drive.google.com/file/d/1bRoh3Hp82UvhsqVdVgnN4nze0AutvVOT/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1bRoh3Hp82UvhsqVdVgnN4nze0AutvVOT');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1mWu90No-8YzIsqyQ33NnAGDPk9hQkao8', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1mWu90No-8YzIsqyQ33NnAGDPk9hQkao8', 'https://docs.google.com/document/d/1mWu90No-8YzIsqyQ33NnAGDPk9hQkao8/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1mWu90No-8YzIsqyQ33NnAGDPk9hQkao8');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1dh2_fk3jch7R2ScIRcgognkNhOMCQ5ct', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1dh2_fk3jch7R2ScIRcgognkNhOMCQ5ct', 'https://drive.google.com/file/d/1dh2_fk3jch7R2ScIRcgognkNhOMCQ5ct/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1dh2_fk3jch7R2ScIRcgognkNhOMCQ5ct');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1oRC7L2ZtBAmi_KyjxcUrYrv4AAwimlfl', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1oRC7L2ZtBAmi_KyjxcUrYrv4AAwimlfl', 'https://docs.google.com/document/d/1oRC7L2ZtBAmi_KyjxcUrYrv4AAwimlfl/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1oRC7L2ZtBAmi_KyjxcUrYrv4AAwimlfl');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1EQl68bYScvP_OxCukAc3pF5ajBHH_yjm', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1EQl68bYScvP_OxCukAc3pF5ajBHH_yjm', 'https://drive.google.com/file/d/1EQl68bYScvP_OxCukAc3pF5ajBHH_yjm/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1EQl68bYScvP_OxCukAc3pF5ajBHH_yjm');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1-BHHD6LDZ7sSGaPyKklXHCBEEZeDyu_X', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1-BHHD6LDZ7sSGaPyKklXHCBEEZeDyu_X', 'https://docs.google.com/document/d/1-BHHD6LDZ7sSGaPyKklXHCBEEZeDyu_X/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1-BHHD6LDZ7sSGaPyKklXHCBEEZeDyu_X');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1q01IuyC44xnWvjrnv4D0pM6ye0Umw1uE', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1q01IuyC44xnWvjrnv4D0pM6ye0Umw1uE', 'https://drive.google.com/file/d/1q01IuyC44xnWvjrnv4D0pM6ye0Umw1uE/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1q01IuyC44xnWvjrnv4D0pM6ye0Umw1uE');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1S-0qagQ7Mx7MHIxH2InHIkpRq3rgBtMB', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1S-0qagQ7Mx7MHIxH2InHIkpRq3rgBtMB', 'https://docs.google.com/document/d/1S-0qagQ7Mx7MHIxH2InHIkpRq3rgBtMB/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1S-0qagQ7Mx7MHIxH2InHIkpRq3rgBtMB');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1rqBwH1Xr-rhL5-9Pp_bMsI-NMKpafhCc', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1rqBwH1Xr-rhL5-9Pp_bMsI-NMKpafhCc', 'https://drive.google.com/file/d/1rqBwH1Xr-rhL5-9Pp_bMsI-NMKpafhCc/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1rqBwH1Xr-rhL5-9Pp_bMsI-NMKpafhCc');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1uZK4YMSixKgR79rEF-eLSvk4PW_IAUh8', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1uZK4YMSixKgR79rEF-eLSvk4PW_IAUh8', 'https://docs.google.com/document/d/1uZK4YMSixKgR79rEF-eLSvk4PW_IAUh8/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1uZK4YMSixKgR79rEF-eLSvk4PW_IAUh8');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1PBFTrE_Jz5v9f1Z9gm1fpY65w323Zdxl', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1PBFTrE_Jz5v9f1Z9gm1fpY65w323Zdxl', 'https://drive.google.com/file/d/1PBFTrE_Jz5v9f1Z9gm1fpY65w323Zdxl/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1PBFTrE_Jz5v9f1Z9gm1fpY65w323Zdxl');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1IJPpLMJodUiBjOEVcJx00OlL45BqWF1m', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1IJPpLMJodUiBjOEVcJx00OlL45BqWF1m', 'https://docs.google.com/document/d/1IJPpLMJodUiBjOEVcJx00OlL45BqWF1m/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1IJPpLMJodUiBjOEVcJx00OlL45BqWF1m');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-18jySXno0g8l8EvPi4Te68pU7f5ewjw7V', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '18jySXno0g8l8EvPi4Te68pU7f5ewjw7V', 'https://drive.google.com/file/d/18jySXno0g8l8EvPi4Te68pU7f5ewjw7V/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '18jySXno0g8l8EvPi4Te68pU7f5ewjw7V');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1h3CEHcBAQkKVqiQx7aG7ziXxDOnWrhhy', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1h3CEHcBAQkKVqiQx7aG7ziXxDOnWrhhy', 'https://docs.google.com/document/d/1h3CEHcBAQkKVqiQx7aG7ziXxDOnWrhhy/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1h3CEHcBAQkKVqiQx7aG7ziXxDOnWrhhy');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-18axkx7ikPla3uJv2XqCI6y5vuR7hU0oI', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '18axkx7ikPla3uJv2XqCI6y5vuR7hU0oI', 'https://drive.google.com/file/d/18axkx7ikPla3uJv2XqCI6y5vuR7hU0oI/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '18axkx7ikPla3uJv2XqCI6y5vuR7hU0oI');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1IYGYgFHJtvuIdGaqz8nftEyVsNLpnAxX', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1IYGYgFHJtvuIdGaqz8nftEyVsNLpnAxX', 'https://docs.google.com/document/d/1IYGYgFHJtvuIdGaqz8nftEyVsNLpnAxX/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1IYGYgFHJtvuIdGaqz8nftEyVsNLpnAxX');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-10bWkRUJI7RaMmxy-FVyJPIHl0nE2ABk8', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '10bWkRUJI7RaMmxy-FVyJPIHl0nE2ABk8', 'https://drive.google.com/file/d/10bWkRUJI7RaMmxy-FVyJPIHl0nE2ABk8/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '10bWkRUJI7RaMmxy-FVyJPIHl0nE2ABk8');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1VIBhqgT1YA9sRU6vtmzdX5gD-UUlnoax', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1VIBhqgT1YA9sRU6vtmzdX5gD-UUlnoax', 'https://docs.google.com/document/d/1VIBhqgT1YA9sRU6vtmzdX5gD-UUlnoax/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1VIBhqgT1YA9sRU6vtmzdX5gD-UUlnoax');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1OfvkqnM2V-bC5G0N059ZCDbRLbf2atCK', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1OfvkqnM2V-bC5G0N059ZCDbRLbf2atCK', 'https://drive.google.com/file/d/1OfvkqnM2V-bC5G0N059ZCDbRLbf2atCK/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1OfvkqnM2V-bC5G0N059ZCDbRLbf2atCK');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-11hNB3qBHIMqhLQEY0gKmD1cNe0qNKR7G', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '11hNB3qBHIMqhLQEY0gKmD1cNe0qNKR7G', 'https://docs.google.com/document/d/11hNB3qBHIMqhLQEY0gKmD1cNe0qNKR7G/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '11hNB3qBHIMqhLQEY0gKmD1cNe0qNKR7G');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1cndWa9mWEa4wy5iKfNjslX6XWKCvJkxf', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1cndWa9mWEa4wy5iKfNjslX6XWKCvJkxf', 'https://drive.google.com/file/d/1cndWa9mWEa4wy5iKfNjslX6XWKCvJkxf/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1cndWa9mWEa4wy5iKfNjslX6XWKCvJkxf');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1OJ0f2DV1ZpnHQO49wSXXuE-rKv_jh6fO', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1OJ0f2DV1ZpnHQO49wSXXuE-rKv_jh6fO', 'https://docs.google.com/document/d/1OJ0f2DV1ZpnHQO49wSXXuE-rKv_jh6fO/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1OJ0f2DV1ZpnHQO49wSXXuE-rKv_jh6fO');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-12YMvK3iK9C47BpXyErA_PnL8dRD9c6ZP', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '12YMvK3iK9C47BpXyErA_PnL8dRD9c6ZP', 'https://drive.google.com/file/d/12YMvK3iK9C47BpXyErA_PnL8dRD9c6ZP/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '12YMvK3iK9C47BpXyErA_PnL8dRD9c6ZP');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1cEvNhmMaHJl_YFZmt5E52eu5jeyOm8ET', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1cEvNhmMaHJl_YFZmt5E52eu5jeyOm8ET', 'https://docs.google.com/document/d/1cEvNhmMaHJl_YFZmt5E52eu5jeyOm8ET/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1cEvNhmMaHJl_YFZmt5E52eu5jeyOm8ET');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1oPndrkcAZBqmVTg097TbyBK7lwwpoRS3', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1oPndrkcAZBqmVTg097TbyBK7lwwpoRS3', 'https://drive.google.com/file/d/1oPndrkcAZBqmVTg097TbyBK7lwwpoRS3/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1oPndrkcAZBqmVTg097TbyBK7lwwpoRS3');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1EFiIdYsngwJWkCIoSgjKJ8Z8rLS4LoOo', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1EFiIdYsngwJWkCIoSgjKJ8Z8rLS4LoOo', 'https://docs.google.com/document/d/1EFiIdYsngwJWkCIoSgjKJ8Z8rLS4LoOo/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1EFiIdYsngwJWkCIoSgjKJ8Z8rLS4LoOo');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-15X9sp0RbJJU7miLtspMwXgcNyhEO9v-E', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '15X9sp0RbJJU7miLtspMwXgcNyhEO9v-E', 'https://drive.google.com/file/d/15X9sp0RbJJU7miLtspMwXgcNyhEO9v-E/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '15X9sp0RbJJU7miLtspMwXgcNyhEO9v-E');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1MN-n0Yjqx9Rjy1RO89QKk4y_rNTVM01m', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1MN-n0Yjqx9Rjy1RO89QKk4y_rNTVM01m', 'https://docs.google.com/document/d/1MN-n0Yjqx9Rjy1RO89QKk4y_rNTVM01m/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1MN-n0Yjqx9Rjy1RO89QKk4y_rNTVM01m');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1qtvBjQPfvOhkD5uwlvmhPqn6TcFF-9Uu', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1qtvBjQPfvOhkD5uwlvmhPqn6TcFF-9Uu', 'https://drive.google.com/file/d/1qtvBjQPfvOhkD5uwlvmhPqn6TcFF-9Uu/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1qtvBjQPfvOhkD5uwlvmhPqn6TcFF-9Uu');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1xZOsIE8NEdhAUhY0ImTJ0ftmRfToyAk4', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1xZOsIE8NEdhAUhY0ImTJ0ftmRfToyAk4', 'https://docs.google.com/document/d/1xZOsIE8NEdhAUhY0ImTJ0ftmRfToyAk4/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1xZOsIE8NEdhAUhY0ImTJ0ftmRfToyAk4');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1hgO5oNj-husJqRwG76cEIEOlCLM1o2sf', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1hgO5oNj-husJqRwG76cEIEOlCLM1o2sf', 'https://drive.google.com/file/d/1hgO5oNj-husJqRwG76cEIEOlCLM1o2sf/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1hgO5oNj-husJqRwG76cEIEOlCLM1o2sf');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1vWMlmN6JRZ_UpoqNeLtbhbhBGph50OLB', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1vWMlmN6JRZ_UpoqNeLtbhbhBGph50OLB', 'https://docs.google.com/document/d/1vWMlmN6JRZ_UpoqNeLtbhbhBGph50OLB/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1vWMlmN6JRZ_UpoqNeLtbhbhBGph50OLB');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1hHwUihCuLLwTr62L2_1d2Ueh8R7LQYGM', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1hHwUihCuLLwTr62L2_1d2Ueh8R7LQYGM', 'https://drive.google.com/file/d/1hHwUihCuLLwTr62L2_1d2Ueh8R7LQYGM/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1hHwUihCuLLwTr62L2_1d2Ueh8R7LQYGM');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-16wZwNJ1sJOxtySQ2modm7hNvaMSf_Zxj', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '16wZwNJ1sJOxtySQ2modm7hNvaMSf_Zxj', 'https://docs.google.com/document/d/16wZwNJ1sJOxtySQ2modm7hNvaMSf_Zxj/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '16wZwNJ1sJOxtySQ2modm7hNvaMSf_Zxj');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1oGhii6SozoGCaCh7edCuRP-FsvL29EzC', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1oGhii6SozoGCaCh7edCuRP-FsvL29EzC', 'https://drive.google.com/file/d/1oGhii6SozoGCaCh7edCuRP-FsvL29EzC/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1oGhii6SozoGCaCh7edCuRP-FsvL29EzC');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1A6eqJbNPT1nG0nl5HAehIOyF30GfNIRd', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1A6eqJbNPT1nG0nl5HAehIOyF30GfNIRd', 'https://docs.google.com/document/d/1A6eqJbNPT1nG0nl5HAehIOyF30GfNIRd/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1A6eqJbNPT1nG0nl5HAehIOyF30GfNIRd');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1A0wxMjI-xkyat7Tv0w1e53b5V4b9xD7H', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1A0wxMjI-xkyat7Tv0w1e53b5V4b9xD7H', 'https://drive.google.com/file/d/1A0wxMjI-xkyat7Tv0w1e53b5V4b9xD7H/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1A0wxMjI-xkyat7Tv0w1e53b5V4b9xD7H');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1rknhNoo7qvAKRzWissVs9Bcoep2Zfs32', 'Fconstancia.doc', 'application/msword', 46592, 'GDRIVE', '1rknhNoo7qvAKRzWissVs9Bcoep2Zfs32', 'https://docs.google.com/document/d/1rknhNoo7qvAKRzWissVs9Bcoep2Zfs32/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1rknhNoo7qvAKRzWissVs9Bcoep2Zfs32');
INSERT INTO file_resource (checksum_hash, original_name, mime_type, size_bytes, storage_provider, storage_key, storage_url, created_at)
SELECT 'gdrive-seed-1hlWtkIsSEaCjSKGFkACO8_PJpYKHctpM', 'malla_informatica.pdf', 'application/pdf', 78409, 'GDRIVE', '1hlWtkIsSEaCjSKGFkACO8_PJpYKHctpM', 'https://drive.google.com/file/d/1hlWtkIsSEaCjSKGFkACO8_PJpYKHctpM/view?usp=drivesdk', NOW()
WHERE NOT EXISTS (SELECT 1 FROM file_resource WHERE storage_provider = 'GDRIVE' AND storage_key = '1hlWtkIsSEaCjSKGFkACO8_PJpYKHctpM');

-- 5) File versions (v1)
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1Ogddc0UeMSvWMpcAFLTImGNMiAU8iZR1/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Ogddc0UeMSvWMpcAFLTImGNMiAU8iZR1'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1zv_qi6c_BUcJ49I8UfBOWazFnMSW0IUF/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1zv_qi6c_BUcJ49I8UfBOWazFnMSW0IUF'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1iF_65Sy6k38DdlALAabE8l5MKkloTMlt/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1iF_65Sy6k38DdlALAabE8l5MKkloTMlt'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1IS_JUAkrp_dLCg3lSBljWWzeKFvIHFSx/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IS_JUAkrp_dLCg3lSBljWWzeKFvIHFSx'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1IuOE_Lrn9Qbd6kjDX0P35rcCmWKc0QG-/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IuOE_Lrn9Qbd6kjDX0P35rcCmWKc0QG-'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1GYj9G4Y0Wa8FQnTGTZOo31N4tYTXC-tP/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1GYj9G4Y0Wa8FQnTGTZOo31N4tYTXC-tP'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1KEazU9dUJoM888Oim1HGoJ-Z9gyNDWCd/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1KEazU9dUJoM888Oim1HGoJ-Z9gyNDWCd'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/16uxufc0ctqVO2iC5yzhwuMZDxRZvt_Yh/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '16uxufc0ctqVO2iC5yzhwuMZDxRZvt_Yh'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1wpcp2DpTM_KEO3k-GQBDEAgm6mC7U47y/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1wpcp2DpTM_KEO3k-GQBDEAgm6mC7U47y'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1hwGVVNbam9j4VnVmcKAphuIfDpR3NNge/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1hwGVVNbam9j4VnVmcKAphuIfDpR3NNge'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1LJXZ4-F9Ia0k0Jt5Us2bUa6285s57S9m/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1LJXZ4-F9Ia0k0Jt5Us2bUa6285s57S9m'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1a7G88LDJXvS9fRchV9_xod_FxMUttrfh/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1a7G88LDJXvS9fRchV9_xod_FxMUttrfh'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1nSleL8cmsj3wKh-7GOQIUztki8uvXLZS/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1nSleL8cmsj3wKh-7GOQIUztki8uvXLZS'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1V7-079VawmPgIXNuBGVDBrddzHT_0C-t/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1V7-079VawmPgIXNuBGVDBrddzHT_0C-t'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1o_xyDG19b-K1Djgo2ypu7W1m78-bBFHz/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1o_xyDG19b-K1Djgo2ypu7W1m78-bBFHz'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1Zcx1njC8wQhxLXrozJhgE1ej-ThFt_L2/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Zcx1njC8wQhxLXrozJhgE1ej-ThFt_L2'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1w0yqHML1uZ5b7ewPQTzG3_vKOlgZjjz3/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1w0yqHML1uZ5b7ewPQTzG3_vKOlgZjjz3'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1FOahWFg-8pD6vwHCaYAGw09lX8C5cE5e/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1FOahWFg-8pD6vwHCaYAGw09lX8C5cE5e'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1yPx0BjP5wzyig1Mt9hWokRi4QJn2m04c/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1yPx0BjP5wzyig1Mt9hWokRi4QJn2m04c'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1-_6n8TdDvX5U6rusEVedxKGrYJREvzsz/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1-_6n8TdDvX5U6rusEVedxKGrYJREvzsz'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/14DKytkL7pL0b-HEsVFUMf5G-zx9o7phr/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '14DKytkL7pL0b-HEsVFUMf5G-zx9o7phr'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1BVoJI-4MvmGsTycTgfamD2sl_fNyd-L4/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1BVoJI-4MvmGsTycTgfamD2sl_fNyd-L4'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1IEAjeV8kY-SSanGTm1C0U5IsRhgKJFSS/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IEAjeV8kY-SSanGTm1C0U5IsRhgKJFSS'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/17hhIUWbPE_BBpthF2qxD1UPFcwBcKRpo/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '17hhIUWbPE_BBpthF2qxD1UPFcwBcKRpo'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1WwBGsVlrBBfSct0hQTyz6N46IlGC0bq9/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1WwBGsVlrBBfSct0hQTyz6N46IlGC0bq9'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1HbbEumBCCjeaS5xzogm5vGZB29xZzgMX/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1HbbEumBCCjeaS5xzogm5vGZB29xZzgMX'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1PtPvS8ecvhholw1Lh6FvoD5QGmqq-Kqo/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1PtPvS8ecvhholw1Lh6FvoD5QGmqq-Kqo'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1uTkkdHAc86dDFdy75SUPeGZZc4N2FIb7/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1uTkkdHAc86dDFdy75SUPeGZZc4N2FIb7'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1KHW-Jb-zXlOItZfvdiOlF4VYZ_zkLeaR/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1KHW-Jb-zXlOItZfvdiOlF4VYZ_zkLeaR'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1IxATftwfdn77ejslRMM97JsFe3y2Idtt/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IxATftwfdn77ejslRMM97JsFe3y2Idtt'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1G6BKx0gj9mFC9Jf_AkyZynMhcim1LZKg/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1G6BKx0gj9mFC9Jf_AkyZynMhcim1LZKg'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1Znjj_3cao8oX9dGT8l7N9W7WNcyN4oyy/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Znjj_3cao8oX9dGT8l7N9W7WNcyN4oyy'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1MlALOYgamI6m87oUMNT9kYEuXz7NM05U/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1MlALOYgamI6m87oUMNT9kYEuXz7NM05U'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1rl11bF3mj7Yh2qnFhECCJkIxODotclRA/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rl11bF3mj7Yh2qnFhECCJkIxODotclRA'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1ieOLbKJVcwyerEbjSQPsI7HAmkyuYFB2/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ieOLbKJVcwyerEbjSQPsI7HAmkyuYFB2'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1gohb7IoErtwtpgDuYtzLyCTXY0ogOEDo/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1gohb7IoErtwtpgDuYtzLyCTXY0ogOEDo'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1ATRszqqODvJSEIrQu1aeLX5GFSmfPrSf/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ATRszqqODvJSEIrQu1aeLX5GFSmfPrSf'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1iE0rIqb4ILSk-NWtC-JKiMRv-ICM-nj5/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1iE0rIqb4ILSk-NWtC-JKiMRv-ICM-nj5'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1axSADderCbGH6Gcec7t5EZwSnWDsb3vf/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1axSADderCbGH6Gcec7t5EZwSnWDsb3vf'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/11bxBh8F9Qgz5FKbI2gQocwaK20XwWXw_/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '11bxBh8F9Qgz5FKbI2gQocwaK20XwWXw_'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1Ahuar298z-ghOjGH5_VXg4zv-7ae0dbh/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Ahuar298z-ghOjGH5_VXg4zv-7ae0dbh'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1e-1zASB9V7M5MGstIsWAIsiuoVJ0w49g/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1e-1zASB9V7M5MGstIsWAIsiuoVJ0w49g'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/15EaGkROfLUstamUD0yi51Te6QVFmyFQM/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '15EaGkROfLUstamUD0yi51Te6QVFmyFQM'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1sEIH8xgZecj-cBfCWAQ7z45fbi01XW4f/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1sEIH8xgZecj-cBfCWAQ7z45fbi01XW4f'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1yrpsS37Xh6QqCwdfyD5NEKlpiHtAKX1a/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1yrpsS37Xh6QqCwdfyD5NEKlpiHtAKX1a'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1aadszK56LMsKnDDvQjrLpT-Bt61D8Ao_/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1aadszK56LMsKnDDvQjrLpT-Bt61D8Ao_'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1QbqnLF8WMyOzvUdGTz-YbnW0XVF3qIy6/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1QbqnLF8WMyOzvUdGTz-YbnW0XVF3qIy6'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1qxmu1KE25PLwTx6GAeA52Is4HrqqQkx4/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1qxmu1KE25PLwTx6GAeA52Is4HrqqQkx4'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1GR0ucgSxXfbRxwzcUdbcAtVWB_eBW1bJ/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1GR0ucgSxXfbRxwzcUdbcAtVWB_eBW1bJ'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1cSPfOcZRaBOWkyWUdb-88UhKRbN0PeJq/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1cSPfOcZRaBOWkyWUdb-88UhKRbN0PeJq'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1-LS4b3Dymgd8qxdh4WJSHjLk0P-G2LPK/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1-LS4b3Dymgd8qxdh4WJSHjLk0P-G2LPK'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1JhbfILUb_9PX2C3ebsVmQCPWIjDEckb1/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1JhbfILUb_9PX2C3ebsVmQCPWIjDEckb1'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1tPxXLm9ogNt1ZhNiqWcy1VCaukooB3qa/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1tPxXLm9ogNt1ZhNiqWcy1VCaukooB3qa'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1Tv24MmDdpJ-VOkh51c1CMk7UOi3G6393/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Tv24MmDdpJ-VOkh51c1CMk7UOi3G6393'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1AqnrDPZYRj6G-q4E2X8WxbYDN2yvLhle/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1AqnrDPZYRj6G-q4E2X8WxbYDN2yvLhle'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1czeTuR2huO8lhj8cxNNSq3mTLllwrch6/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1czeTuR2huO8lhj8cxNNSq3mTLllwrch6'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1iLovA-k1FgkuzrcPtRSReJoOwxh2oEWW/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1iLovA-k1FgkuzrcPtRSReJoOwxh2oEWW'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1f02AmOXIuiVHBo3bq1s7mqJLvv5JU3Jj/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1f02AmOXIuiVHBo3bq1s7mqJLvv5JU3Jj'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1xolEpP_9C7diH-Ngb6tj2BR3tU7aGlLl/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1xolEpP_9C7diH-Ngb6tj2BR3tU7aGlLl'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1BmjmXCEdCLbK-c0nU7vPAfGpZ3TKz7Vh/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1BmjmXCEdCLbK-c0nU7vPAfGpZ3TKz7Vh'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1VDOuu9BC2dr1n4ub0_H2lCbc_ShTVk82/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1VDOuu9BC2dr1n4ub0_H2lCbc_ShTVk82'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1Wz-oBiLcaWT3pN7CDCTLR7dGAUeGno8L/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Wz-oBiLcaWT3pN7CDCTLR7dGAUeGno8L'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1YIUpS97LvLzN1erWtzfkSkkJrw700SvG/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1YIUpS97LvLzN1erWtzfkSkkJrw700SvG'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1FNSwSQCwcuoTc0XVCs2KuX1HPr0FWqRl/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1FNSwSQCwcuoTc0XVCs2KuX1HPr0FWqRl'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1rZkeki8LR8kPy4rLEIosX19qVrfSl12v/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rZkeki8LR8kPy4rLEIosX19qVrfSl12v'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/15mTVQ3-zh9xBCHlo0UPtlixeYFikfRI6/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '15mTVQ3-zh9xBCHlo0UPtlixeYFikfRI6'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1IrlZwkc9j07mKXSP1TDi0qMCrJqTdZCd/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IrlZwkc9j07mKXSP1TDi0qMCrJqTdZCd'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1rR0dOCbyKN0sq__bC3NW6qO0-g4fF04i/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rR0dOCbyKN0sq__bC3NW6qO0-g4fF04i'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1GolyxlvXx6Ex6urzXiNsAD_HLdm_BlQM/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1GolyxlvXx6Ex6urzXiNsAD_HLdm_BlQM'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1cW7pCOMxcOnvQYapgE-fSpDoRc8CPDj_/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1cW7pCOMxcOnvQYapgE-fSpDoRc8CPDj_'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1a-6PBpxDbSAGBNj70lOPtTzehs1Zrqu9/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1a-6PBpxDbSAGBNj70lOPtTzehs1Zrqu9'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1zpHe-mVBdv25z0Bm5DiH7aqe9zF9Mk3Q/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1zpHe-mVBdv25z0Bm5DiH7aqe9zF9Mk3Q'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1G9vzGUgf02XVfZzIzIvNEyqvoDgTu4vS/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1G9vzGUgf02XVfZzIzIvNEyqvoDgTu4vS'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1fTNUI87Wgy0tbIrMw4YzTsDh9LBAvu6b/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1fTNUI87Wgy0tbIrMw4YzTsDh9LBAvu6b'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1aSQdSPPbvVR9dNoRKlbuF723gO2qjgXU/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1aSQdSPPbvVR9dNoRKlbuF723gO2qjgXU'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1ZrSccpKoyZjM5NCdCXdgsRObqlxQIFrY/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ZrSccpKoyZjM5NCdCXdgsRObqlxQIFrY'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1EV7hoUtrchbCY231QhY0J0vwv_MrFSDg/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1EV7hoUtrchbCY231QhY0J0vwv_MrFSDg'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1ObBdxEb-SLnESx6j2UDQvw1AQqqjtCPt/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ObBdxEb-SLnESx6j2UDQvw1AQqqjtCPt'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1hL1y3oXkoR9OcOUzeMNznYYxetfF1mCB/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1hL1y3oXkoR9OcOUzeMNznYYxetfF1mCB'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1Yu185-8amxaFPRy8B0OTnOz1Wv8GmJI-/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Yu185-8amxaFPRy8B0OTnOz1Wv8GmJI-'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1_3-mSiOJl7YwOgw4iFpuGXGSw3saHRhx/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1_3-mSiOJl7YwOgw4iFpuGXGSw3saHRhx'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1bRoh3Hp82UvhsqVdVgnN4nze0AutvVOT/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1bRoh3Hp82UvhsqVdVgnN4nze0AutvVOT'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1mWu90No-8YzIsqyQ33NnAGDPk9hQkao8/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1mWu90No-8YzIsqyQ33NnAGDPk9hQkao8'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1dh2_fk3jch7R2ScIRcgognkNhOMCQ5ct/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1dh2_fk3jch7R2ScIRcgognkNhOMCQ5ct'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1oRC7L2ZtBAmi_KyjxcUrYrv4AAwimlfl/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1oRC7L2ZtBAmi_KyjxcUrYrv4AAwimlfl'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1EQl68bYScvP_OxCukAc3pF5ajBHH_yjm/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1EQl68bYScvP_OxCukAc3pF5ajBHH_yjm'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1-BHHD6LDZ7sSGaPyKklXHCBEEZeDyu_X/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1-BHHD6LDZ7sSGaPyKklXHCBEEZeDyu_X'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1q01IuyC44xnWvjrnv4D0pM6ye0Umw1uE/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1q01IuyC44xnWvjrnv4D0pM6ye0Umw1uE'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1S-0qagQ7Mx7MHIxH2InHIkpRq3rgBtMB/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1S-0qagQ7Mx7MHIxH2InHIkpRq3rgBtMB'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1rqBwH1Xr-rhL5-9Pp_bMsI-NMKpafhCc/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rqBwH1Xr-rhL5-9Pp_bMsI-NMKpafhCc'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1uZK4YMSixKgR79rEF-eLSvk4PW_IAUh8/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1uZK4YMSixKgR79rEF-eLSvk4PW_IAUh8'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1PBFTrE_Jz5v9f1Z9gm1fpY65w323Zdxl/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1PBFTrE_Jz5v9f1Z9gm1fpY65w323Zdxl'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1IJPpLMJodUiBjOEVcJx00OlL45BqWF1m/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IJPpLMJodUiBjOEVcJx00OlL45BqWF1m'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/18jySXno0g8l8EvPi4Te68pU7f5ewjw7V/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '18jySXno0g8l8EvPi4Te68pU7f5ewjw7V'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1h3CEHcBAQkKVqiQx7aG7ziXxDOnWrhhy/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1h3CEHcBAQkKVqiQx7aG7ziXxDOnWrhhy'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/18axkx7ikPla3uJv2XqCI6y5vuR7hU0oI/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '18axkx7ikPla3uJv2XqCI6y5vuR7hU0oI'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1IYGYgFHJtvuIdGaqz8nftEyVsNLpnAxX/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IYGYgFHJtvuIdGaqz8nftEyVsNLpnAxX'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/10bWkRUJI7RaMmxy-FVyJPIHl0nE2ABk8/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '10bWkRUJI7RaMmxy-FVyJPIHl0nE2ABk8'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1VIBhqgT1YA9sRU6vtmzdX5gD-UUlnoax/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1VIBhqgT1YA9sRU6vtmzdX5gD-UUlnoax'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1OfvkqnM2V-bC5G0N059ZCDbRLbf2atCK/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1OfvkqnM2V-bC5G0N059ZCDbRLbf2atCK'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/11hNB3qBHIMqhLQEY0gKmD1cNe0qNKR7G/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '11hNB3qBHIMqhLQEY0gKmD1cNe0qNKR7G'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1cndWa9mWEa4wy5iKfNjslX6XWKCvJkxf/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1cndWa9mWEa4wy5iKfNjslX6XWKCvJkxf'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1OJ0f2DV1ZpnHQO49wSXXuE-rKv_jh6fO/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1OJ0f2DV1ZpnHQO49wSXXuE-rKv_jh6fO'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/12YMvK3iK9C47BpXyErA_PnL8dRD9c6ZP/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '12YMvK3iK9C47BpXyErA_PnL8dRD9c6ZP'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1cEvNhmMaHJl_YFZmt5E52eu5jeyOm8ET/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1cEvNhmMaHJl_YFZmt5E52eu5jeyOm8ET'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1oPndrkcAZBqmVTg097TbyBK7lwwpoRS3/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1oPndrkcAZBqmVTg097TbyBK7lwwpoRS3'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1EFiIdYsngwJWkCIoSgjKJ8Z8rLS4LoOo/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1EFiIdYsngwJWkCIoSgjKJ8Z8rLS4LoOo'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/15X9sp0RbJJU7miLtspMwXgcNyhEO9v-E/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '15X9sp0RbJJU7miLtspMwXgcNyhEO9v-E'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1MN-n0Yjqx9Rjy1RO89QKk4y_rNTVM01m/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1MN-n0Yjqx9Rjy1RO89QKk4y_rNTVM01m'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1qtvBjQPfvOhkD5uwlvmhPqn6TcFF-9Uu/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1qtvBjQPfvOhkD5uwlvmhPqn6TcFF-9Uu'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1xZOsIE8NEdhAUhY0ImTJ0ftmRfToyAk4/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1xZOsIE8NEdhAUhY0ImTJ0ftmRfToyAk4'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1hgO5oNj-husJqRwG76cEIEOlCLM1o2sf/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1hgO5oNj-husJqRwG76cEIEOlCLM1o2sf'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1vWMlmN6JRZ_UpoqNeLtbhbhBGph50OLB/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1vWMlmN6JRZ_UpoqNeLtbhbhBGph50OLB'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1hHwUihCuLLwTr62L2_1d2Ueh8R7LQYGM/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1hHwUihCuLLwTr62L2_1d2Ueh8R7LQYGM'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/16wZwNJ1sJOxtySQ2modm7hNvaMSf_Zxj/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '16wZwNJ1sJOxtySQ2modm7hNvaMSf_Zxj'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1oGhii6SozoGCaCh7edCuRP-FsvL29EzC/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1oGhii6SozoGCaCh7edCuRP-FsvL29EzC'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1A6eqJbNPT1nG0nl5HAehIOyF30GfNIRd/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1A6eqJbNPT1nG0nl5HAehIOyF30GfNIRd'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1A0wxMjI-xkyat7Tv0w1e53b5V4b9xD7H/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1A0wxMjI-xkyat7Tv0w1e53b5V4b9xD7H'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://docs.google.com/document/d/1rknhNoo7qvAKRzWissVs9Bcoep2Zfs32/edit?usp=drivesdk&ouid=104725373034984418734&rtpof=true&sd=true', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rknhNoo7qvAKRzWissVs9Bcoep2Zfs32'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );
INSERT INTO file_version (file_resource_id, version_number, storage_url, created_at, created_by)
SELECT fr.id, 1, 'https://drive.google.com/file/d/1hlWtkIsSEaCjSKGFkACO8_PJpYKHctpM/view?usp=drivesdk', NOW(), 1
FROM file_resource fr
WHERE fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1hlWtkIsSEaCjSKGFkACO8_PJpYKHctpM'
  AND NOT EXISTS (
    SELECT 1 FROM file_version fv
    WHERE fv.file_resource_id = fr.id AND fv.version_number = 1
  );

-- 6) Carpetas de materiales (Sesiones + Material adicional)
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 17, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 17 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 17, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 17 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 18, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 18 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 18, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 18 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 19, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 19 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 19, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 19 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 20, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 20 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 20, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 20 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 37, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 37 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 37, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 37 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 38, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 38 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 38, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 38 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 39, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 39 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 39, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 39 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 40, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 40 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 40, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 40 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 57, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 57 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 57, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 57 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 58, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 58 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 58, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 58 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 59, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 59 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 59, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 59 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 60, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 60 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 60, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 60 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 77, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 77 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 77, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 77 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 78, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 78 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 78, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 78 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 79, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 79 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 79, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 79 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 80, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 80 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 80, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 80 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 97, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 97 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 97, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 97 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 98, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 98 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 98, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 98 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 99, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 99 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 99, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 99 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 100, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 100 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 100, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 100 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 117, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 117 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 117, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 117 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 118, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 118 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 118, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 118 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 119, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 119 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 119, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 119 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 120, NULL, @folder_status_active, 'Material adicional', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 120 AND mf.parent_folder_id IS NULL AND mf.name = 'Material adicional'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 120, NULL, @folder_status_active, 'Sesiones', NULL, NULL, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM material_folder mf
  WHERE mf.evaluation_id = 120 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
);
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 17, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 17 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 17 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 17, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 17 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 17 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 18, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 18 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 18 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 18, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 18 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 18 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 19, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 19 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 19 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 19, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 19 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 19 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 20, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 20 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 20 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 20, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 20 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 20 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 37, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 37 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 37 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 37, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 37 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 37 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 38, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 38 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 38 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 38, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 38 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 38 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 39, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 39 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 39 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 39, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 39 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 39 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 40, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 40 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 40 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 40, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 40 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 40 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 57, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 57 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 57 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 57, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 57 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 57 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 58, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 58 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 58 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 58, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 58 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 58 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 59, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 59 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 59 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 59, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 59 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 59 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 60, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 60 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 60 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 60, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 60 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 60 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 77, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 77 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 77 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 77, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 77 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 77 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 78, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 78 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 78 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 78, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 78 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 78 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 79, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 79 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 79 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 79, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 79 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 79 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 80, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 80 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 80 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 80, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 80 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 80 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 97, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 97 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 97 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 97, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 97 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 97 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 98, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 98 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 98 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 98, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 98 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 98 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 99, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 99 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 99 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 99, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 99 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 99 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 100, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 100 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 100 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 100, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 100 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 100 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 117, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 117 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 117 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 117, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 117 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 117 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 118, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 118 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 118 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 118, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 118 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 118 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 119, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 119 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 119 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 119, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 119 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 119 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 120, root.id, @folder_status_active, 'Enunciados', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 120 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 120 AND mf.parent_folder_id = root.id AND mf.name = 'Enunciados'
  );
INSERT INTO material_folder (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT 120, root.id, @folder_status_active, 'Resumenes', NULL, NULL, 1, NOW(), NOW()
FROM material_folder root
WHERE root.evaluation_id = 120 AND root.parent_folder_id IS NULL AND root.name = 'Material adicional'
  AND NOT EXISTS (
    SELECT 1 FROM material_folder mf
    WHERE mf.evaluation_id = 120 AND mf.parent_folder_id = root.id AND mf.name = 'Resumenes'
  );

-- 7) Materiales (sesiones y material adicional)
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 1, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_17.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Ogddc0UeMSvWMpcAFLTImGNMiAU8iZR1'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 17 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 1
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 2, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_17.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Ogddc0UeMSvWMpcAFLTImGNMiAU8iZR1'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 17 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 2
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 3, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_17.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Ogddc0UeMSvWMpcAFLTImGNMiAU8iZR1'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 17 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 3
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 4, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_17.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Ogddc0UeMSvWMpcAFLTImGNMiAU8iZR1'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 17 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 4
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 5, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_18.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1zv_qi6c_BUcJ49I8UfBOWazFnMSW0IUF'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 18 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 5
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 6, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_18.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1zv_qi6c_BUcJ49I8UfBOWazFnMSW0IUF'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 18 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 6
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 7, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_18.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1zv_qi6c_BUcJ49I8UfBOWazFnMSW0IUF'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 18 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 7
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 8, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_18.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1zv_qi6c_BUcJ49I8UfBOWazFnMSW0IUF'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 18 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 8
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 9, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_19.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1iF_65Sy6k38DdlALAabE8l5MKkloTMlt'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 19 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 9
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 10, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_19.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1iF_65Sy6k38DdlALAabE8l5MKkloTMlt'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 19 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 10
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 11, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_19.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1iF_65Sy6k38DdlALAabE8l5MKkloTMlt'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 19 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 11
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 12, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_19.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1iF_65Sy6k38DdlALAabE8l5MKkloTMlt'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 19 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 12
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 13, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_20.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IS_JUAkrp_dLCg3lSBljWWzeKFvIHFSx'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 20 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 13
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 14, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_20.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IS_JUAkrp_dLCg3lSBljWWzeKFvIHFSx'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 20 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 14
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 15, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_20.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IS_JUAkrp_dLCg3lSBljWWzeKFvIHFSx'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 20 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 15
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 16, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_20.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IS_JUAkrp_dLCg3lSBljWWzeKFvIHFSx'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 20 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 16
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 33, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_37.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IuOE_Lrn9Qbd6kjDX0P35rcCmWKc0QG-'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 37 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 33
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 34, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_37.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IuOE_Lrn9Qbd6kjDX0P35rcCmWKc0QG-'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 37 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 34
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 35, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_37.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IuOE_Lrn9Qbd6kjDX0P35rcCmWKc0QG-'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 37 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 35
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 36, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_37.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IuOE_Lrn9Qbd6kjDX0P35rcCmWKc0QG-'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 37 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 36
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 37, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_38.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1GYj9G4Y0Wa8FQnTGTZOo31N4tYTXC-tP'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 38 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 37
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 38, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_38.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1GYj9G4Y0Wa8FQnTGTZOo31N4tYTXC-tP'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 38 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 38
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 39, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_38.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1GYj9G4Y0Wa8FQnTGTZOo31N4tYTXC-tP'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 38 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 39
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 40, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_38.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1GYj9G4Y0Wa8FQnTGTZOo31N4tYTXC-tP'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 38 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 40
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 41, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_39.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1KEazU9dUJoM888Oim1HGoJ-Z9gyNDWCd'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 39 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 41
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 42, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_39.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1KEazU9dUJoM888Oim1HGoJ-Z9gyNDWCd'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 39 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 42
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 43, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_39.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1KEazU9dUJoM888Oim1HGoJ-Z9gyNDWCd'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 39 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 43
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 44, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_39.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1KEazU9dUJoM888Oim1HGoJ-Z9gyNDWCd'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 39 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 44
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 45, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_40.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '16uxufc0ctqVO2iC5yzhwuMZDxRZvt_Yh'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 40 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 45
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 46, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_40.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '16uxufc0ctqVO2iC5yzhwuMZDxRZvt_Yh'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 40 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 46
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 47, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_40.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '16uxufc0ctqVO2iC5yzhwuMZDxRZvt_Yh'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 40 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 47
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 48, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_40.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '16uxufc0ctqVO2iC5yzhwuMZDxRZvt_Yh'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 40 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 48
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 17, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_57.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1wpcp2DpTM_KEO3k-GQBDEAgm6mC7U47y'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 57 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 17
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 18, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_57.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1wpcp2DpTM_KEO3k-GQBDEAgm6mC7U47y'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 57 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 18
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 19, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_57.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1wpcp2DpTM_KEO3k-GQBDEAgm6mC7U47y'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 57 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 19
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 20, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_57.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1wpcp2DpTM_KEO3k-GQBDEAgm6mC7U47y'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 57 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 20
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 21, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_58.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1hwGVVNbam9j4VnVmcKAphuIfDpR3NNge'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 58 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 21
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 22, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_58.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1hwGVVNbam9j4VnVmcKAphuIfDpR3NNge'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 58 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 22
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 23, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_58.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1hwGVVNbam9j4VnVmcKAphuIfDpR3NNge'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 58 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 23
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 24, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_58.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1hwGVVNbam9j4VnVmcKAphuIfDpR3NNge'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 58 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 24
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 25, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_59.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1LJXZ4-F9Ia0k0Jt5Us2bUa6285s57S9m'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 59 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 25
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 26, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_59.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1LJXZ4-F9Ia0k0Jt5Us2bUa6285s57S9m'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 59 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 26
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 27, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_59.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1LJXZ4-F9Ia0k0Jt5Us2bUa6285s57S9m'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 59 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 27
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 28, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_59.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1LJXZ4-F9Ia0k0Jt5Us2bUa6285s57S9m'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 59 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 28
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 29, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_60.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1a7G88LDJXvS9fRchV9_xod_FxMUttrfh'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 60 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 29
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 30, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_60.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1a7G88LDJXvS9fRchV9_xod_FxMUttrfh'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 60 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 30
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 31, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_60.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1a7G88LDJXvS9fRchV9_xod_FxMUttrfh'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 60 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 31
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 32, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_60.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1a7G88LDJXvS9fRchV9_xod_FxMUttrfh'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 60 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 32
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 49, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_77.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1nSleL8cmsj3wKh-7GOQIUztki8uvXLZS'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 77 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 49
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 50, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_77.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1nSleL8cmsj3wKh-7GOQIUztki8uvXLZS'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 77 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 50
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 51, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_77.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1nSleL8cmsj3wKh-7GOQIUztki8uvXLZS'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 77 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 51
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 52, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_77.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1nSleL8cmsj3wKh-7GOQIUztki8uvXLZS'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 77 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 52
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 53, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_78.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1V7-079VawmPgIXNuBGVDBrddzHT_0C-t'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 78 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 53
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 54, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_78.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1V7-079VawmPgIXNuBGVDBrddzHT_0C-t'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 78 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 54
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 55, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_78.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1V7-079VawmPgIXNuBGVDBrddzHT_0C-t'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 78 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 55
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 56, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_78.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1V7-079VawmPgIXNuBGVDBrddzHT_0C-t'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 78 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 56
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 57, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_79.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1o_xyDG19b-K1Djgo2ypu7W1m78-bBFHz'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 79 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 57
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 58, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_79.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1o_xyDG19b-K1Djgo2ypu7W1m78-bBFHz'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 79 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 58
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 59, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_79.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1o_xyDG19b-K1Djgo2ypu7W1m78-bBFHz'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 79 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 59
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 60, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_79.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1o_xyDG19b-K1Djgo2ypu7W1m78-bBFHz'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 79 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 60
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 61, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_80.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Zcx1njC8wQhxLXrozJhgE1ej-ThFt_L2'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 80 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 61
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 62, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_80.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Zcx1njC8wQhxLXrozJhgE1ej-ThFt_L2'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 80 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 62
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 63, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_80.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Zcx1njC8wQhxLXrozJhgE1ej-ThFt_L2'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 80 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 63
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 64, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_80.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Zcx1njC8wQhxLXrozJhgE1ej-ThFt_L2'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 80 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 64
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 65, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_97.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1w0yqHML1uZ5b7ewPQTzG3_vKOlgZjjz3'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 97 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 65
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 66, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_97.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1w0yqHML1uZ5b7ewPQTzG3_vKOlgZjjz3'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 97 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 66
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 67, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_97.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1w0yqHML1uZ5b7ewPQTzG3_vKOlgZjjz3'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 97 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 67
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 68, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_97.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1w0yqHML1uZ5b7ewPQTzG3_vKOlgZjjz3'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 97 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 68
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 69, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_98.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1FOahWFg-8pD6vwHCaYAGw09lX8C5cE5e'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 98 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 69
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 70, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_98.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1FOahWFg-8pD6vwHCaYAGw09lX8C5cE5e'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 98 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 70
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 71, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_98.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1FOahWFg-8pD6vwHCaYAGw09lX8C5cE5e'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 98 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 71
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 72, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_98.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1FOahWFg-8pD6vwHCaYAGw09lX8C5cE5e'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 98 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 72
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 73, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_99.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1yPx0BjP5wzyig1Mt9hWokRi4QJn2m04c'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 99 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 73
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 74, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_99.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1yPx0BjP5wzyig1Mt9hWokRi4QJn2m04c'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 99 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 74
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 75, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_99.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1yPx0BjP5wzyig1Mt9hWokRi4QJn2m04c'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 99 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 75
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 76, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_99.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1yPx0BjP5wzyig1Mt9hWokRi4QJn2m04c'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 99 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 76
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 77, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_100.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1-_6n8TdDvX5U6rusEVedxKGrYJREvzsz'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 100 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 77
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 78, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_100.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1-_6n8TdDvX5U6rusEVedxKGrYJREvzsz'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 100 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 78
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 79, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_100.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1-_6n8TdDvX5U6rusEVedxKGrYJREvzsz'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 100 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 79
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 80, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_100.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1-_6n8TdDvX5U6rusEVedxKGrYJREvzsz'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 100 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 80
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 81, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_117.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '14DKytkL7pL0b-HEsVFUMf5G-zx9o7phr'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 117 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 81
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 82, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_117.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '14DKytkL7pL0b-HEsVFUMf5G-zx9o7phr'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 117 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 82
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 83, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_117.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '14DKytkL7pL0b-HEsVFUMf5G-zx9o7phr'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 117 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 83
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 84, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_117.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '14DKytkL7pL0b-HEsVFUMf5G-zx9o7phr'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 117 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 84
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 85, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_118.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1BVoJI-4MvmGsTycTgfamD2sl_fNyd-L4'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 118 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 85
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 86, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_118.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1BVoJI-4MvmGsTycTgfamD2sl_fNyd-L4'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 118 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 86
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 87, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_118.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1BVoJI-4MvmGsTycTgfamD2sl_fNyd-L4'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 118 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 87
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 88, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_118.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1BVoJI-4MvmGsTycTgfamD2sl_fNyd-L4'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 118 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 88
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 89, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_119.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IEAjeV8kY-SSanGTm1C0U5IsRhgKJFSS'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 119 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 89
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 90, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_119.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IEAjeV8kY-SSanGTm1C0U5IsRhgKJFSS'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 119 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 90
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 91, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_119.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IEAjeV8kY-SSanGTm1C0U5IsRhgKJFSS'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 119 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 91
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 92, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_119.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IEAjeV8kY-SSanGTm1C0U5IsRhgKJFSS'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 119 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 92
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 93, fr.id, fv.id, @material_status_active, 'Sesion 1 - 1INF61-2026-1-SILABO__ev_120.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '17hhIUWbPE_BBpthF2qxD1UPFcwBcKRpo'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 120 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 93
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 94, fr.id, fv.id, @material_status_active, 'Sesion 2 - 1INF61-2026-1-SILABO__ev_120.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '17hhIUWbPE_BBpthF2qxD1UPFcwBcKRpo'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 120 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 94
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 95, fr.id, fv.id, @material_status_active, 'Sesion 3 - 1INF61-2026-1-SILABO__ev_120.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '17hhIUWbPE_BBpthF2qxD1UPFcwBcKRpo'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 120 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 95
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, 96, fr.id, fv.id, @material_status_active, 'Sesion 4 - 1INF61-2026-1-SILABO__ev_120.PDF', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '17hhIUWbPE_BBpthF2qxD1UPFcwBcKRpo'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 120 AND mf.parent_folder_id IS NULL AND mf.name = 'Sesiones'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id = 96
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1WwBGsVlrBBfSct0hQTyz6N46IlGC0bq9'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 17 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1HbbEumBCCjeaS5xzogm5vGZB29xZzgMX'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 17 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1PtPvS8ecvhholw1Lh6FvoD5QGmqq-Kqo'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 18 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1uTkkdHAc86dDFdy75SUPeGZZc4N2FIb7'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 18 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1KHW-Jb-zXlOItZfvdiOlF4VYZ_zkLeaR'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 19 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IxATftwfdn77ejslRMM97JsFe3y2Idtt'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 19 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1G6BKx0gj9mFC9Jf_AkyZynMhcim1LZKg'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 20 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Znjj_3cao8oX9dGT8l7N9W7WNcyN4oyy'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 20 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1MlALOYgamI6m87oUMNT9kYEuXz7NM05U'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 37 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rl11bF3mj7Yh2qnFhECCJkIxODotclRA'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 37 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ieOLbKJVcwyerEbjSQPsI7HAmkyuYFB2'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 38 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1gohb7IoErtwtpgDuYtzLyCTXY0ogOEDo'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 38 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ATRszqqODvJSEIrQu1aeLX5GFSmfPrSf'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 39 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1iE0rIqb4ILSk-NWtC-JKiMRv-ICM-nj5'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 39 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1axSADderCbGH6Gcec7t5EZwSnWDsb3vf'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 40 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '11bxBh8F9Qgz5FKbI2gQocwaK20XwWXw_'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 40 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Ahuar298z-ghOjGH5_VXg4zv-7ae0dbh'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 57 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1e-1zASB9V7M5MGstIsWAIsiuoVJ0w49g'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 57 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '15EaGkROfLUstamUD0yi51Te6QVFmyFQM'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 58 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1sEIH8xgZecj-cBfCWAQ7z45fbi01XW4f'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 58 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1yrpsS37Xh6QqCwdfyD5NEKlpiHtAKX1a'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 59 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1aadszK56LMsKnDDvQjrLpT-Bt61D8Ao_'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 59 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1QbqnLF8WMyOzvUdGTz-YbnW0XVF3qIy6'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 60 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1qxmu1KE25PLwTx6GAeA52Is4HrqqQkx4'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 60 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1GR0ucgSxXfbRxwzcUdbcAtVWB_eBW1bJ'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 77 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1cSPfOcZRaBOWkyWUdb-88UhKRbN0PeJq'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 77 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1-LS4b3Dymgd8qxdh4WJSHjLk0P-G2LPK'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 78 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1JhbfILUb_9PX2C3ebsVmQCPWIjDEckb1'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 78 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1tPxXLm9ogNt1ZhNiqWcy1VCaukooB3qa'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 79 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Tv24MmDdpJ-VOkh51c1CMk7UOi3G6393'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 79 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1AqnrDPZYRj6G-q4E2X8WxbYDN2yvLhle'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 80 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1czeTuR2huO8lhj8cxNNSq3mTLllwrch6'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 80 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1iLovA-k1FgkuzrcPtRSReJoOwxh2oEWW'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 97 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1f02AmOXIuiVHBo3bq1s7mqJLvv5JU3Jj'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 97 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1xolEpP_9C7diH-Ngb6tj2BR3tU7aGlLl'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 98 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1BmjmXCEdCLbK-c0nU7vPAfGpZ3TKz7Vh'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 98 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1VDOuu9BC2dr1n4ub0_H2lCbc_ShTVk82'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 99 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Wz-oBiLcaWT3pN7CDCTLR7dGAUeGno8L'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 99 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1YIUpS97LvLzN1erWtzfkSkkJrw700SvG'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 100 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1FNSwSQCwcuoTc0XVCs2KuX1HPr0FWqRl'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 100 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rZkeki8LR8kPy4rLEIosX19qVrfSl12v'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 117 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '15mTVQ3-zh9xBCHlo0UPtlixeYFikfRI6'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 117 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IrlZwkc9j07mKXSP1TDi0qMCrJqTdZCd'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 118 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rR0dOCbyKN0sq__bC3NW6qO0-g4fF04i'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 118 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1GolyxlvXx6Ex6urzXiNsAD_HLdm_BlQM'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 119 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1cW7pCOMxcOnvQYapgE-fSpDoRc8CPDj_'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 119 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Desarrollo de un videojuego educativo configurable con mecánicas de aprendizaje y de juego que.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1a-6PBpxDbSAGBNj70lOPtTzehs1Zrqu9'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 120 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, '1INF26-Plantilla_E2.docx', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1zpHe-mVBdv25z0Bm5DiH7aqe9zF9Mk3Q'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 120 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1G9vzGUgf02XVfZzIzIvNEyqvoDgTu4vS'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 17 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1fTNUI87Wgy0tbIrMw4YzTsDh9LBAvu6b'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 17 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1aSQdSPPbvVR9dNoRKlbuF723gO2qjgXU'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 18 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ZrSccpKoyZjM5NCdCXdgsRObqlxQIFrY'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 18 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1EV7hoUtrchbCY231QhY0J0vwv_MrFSDg'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 19 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1ObBdxEb-SLnESx6j2UDQvw1AQqqjtCPt'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 19 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1hL1y3oXkoR9OcOUzeMNznYYxetfF1mCB'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 20 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1Yu185-8amxaFPRy8B0OTnOz1Wv8GmJI-'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 20 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1_3-mSiOJl7YwOgw4iFpuGXGSw3saHRhx'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 37 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1bRoh3Hp82UvhsqVdVgnN4nze0AutvVOT'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 37 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1mWu90No-8YzIsqyQ33NnAGDPk9hQkao8'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 38 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1dh2_fk3jch7R2ScIRcgognkNhOMCQ5ct'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 38 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1oRC7L2ZtBAmi_KyjxcUrYrv4AAwimlfl'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 39 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1EQl68bYScvP_OxCukAc3pF5ajBHH_yjm'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 39 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1-BHHD6LDZ7sSGaPyKklXHCBEEZeDyu_X'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 40 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1q01IuyC44xnWvjrnv4D0pM6ye0Umw1uE'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 40 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1S-0qagQ7Mx7MHIxH2InHIkpRq3rgBtMB'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 57 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rqBwH1Xr-rhL5-9Pp_bMsI-NMKpafhCc'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 57 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1uZK4YMSixKgR79rEF-eLSvk4PW_IAUh8'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 58 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1PBFTrE_Jz5v9f1Z9gm1fpY65w323Zdxl'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 58 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IJPpLMJodUiBjOEVcJx00OlL45BqWF1m'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 59 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '18jySXno0g8l8EvPi4Te68pU7f5ewjw7V'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 59 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1h3CEHcBAQkKVqiQx7aG7ziXxDOnWrhhy'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 60 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '18axkx7ikPla3uJv2XqCI6y5vuR7hU0oI'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 60 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1IYGYgFHJtvuIdGaqz8nftEyVsNLpnAxX'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 77 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '10bWkRUJI7RaMmxy-FVyJPIHl0nE2ABk8'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 77 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1VIBhqgT1YA9sRU6vtmzdX5gD-UUlnoax'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 78 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1OfvkqnM2V-bC5G0N059ZCDbRLbf2atCK'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 78 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '11hNB3qBHIMqhLQEY0gKmD1cNe0qNKR7G'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 79 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1cndWa9mWEa4wy5iKfNjslX6XWKCvJkxf'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 79 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1OJ0f2DV1ZpnHQO49wSXXuE-rKv_jh6fO'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 80 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '12YMvK3iK9C47BpXyErA_PnL8dRD9c6ZP'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 80 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1cEvNhmMaHJl_YFZmt5E52eu5jeyOm8ET'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 97 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1oPndrkcAZBqmVTg097TbyBK7lwwpoRS3'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 97 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1EFiIdYsngwJWkCIoSgjKJ8Z8rLS4LoOo'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 98 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '15X9sp0RbJJU7miLtspMwXgcNyhEO9v-E'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 98 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1MN-n0Yjqx9Rjy1RO89QKk4y_rNTVM01m'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 99 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1qtvBjQPfvOhkD5uwlvmhPqn6TcFF-9Uu'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 99 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1xZOsIE8NEdhAUhY0ImTJ0ftmRfToyAk4'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 100 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1hgO5oNj-husJqRwG76cEIEOlCLM1o2sf'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 100 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1vWMlmN6JRZ_UpoqNeLtbhbhBGph50OLB'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 117 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1hHwUihCuLLwTr62L2_1d2Ueh8R7LQYGM'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 117 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '16wZwNJ1sJOxtySQ2modm7hNvaMSf_Zxj'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 118 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1oGhii6SozoGCaCh7edCuRP-FsvL29EzC'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 118 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1A6eqJbNPT1nG0nl5HAehIOyF30GfNIRd'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 119 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1A0wxMjI-xkyat7Tv0w1e53b5V4b9xD7H'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 119 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'Fconstancia.doc', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1rknhNoo7qvAKRzWissVs9Bcoep2Zfs32'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 120 AND root.name = 'Material adicional' AND mf.name = 'Resumenes'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
INSERT INTO material (material_folder_id, class_event_id, file_resource_id, file_version_id, material_status_id, display_name, visible_from, visible_until, created_by, created_at, updated_at)
SELECT mf.id, NULL, fr.id, fv.id, @material_status_active, 'malla_informatica.pdf', NULL, NULL, 1, NOW(), NOW()
FROM material_folder mf
INNER JOIN material_folder root ON root.id = mf.parent_folder_id
INNER JOIN file_resource fr ON fr.storage_provider = 'GDRIVE' AND fr.storage_key = '1hlWtkIsSEaCjSKGFkACO8_PJpYKHctpM'
INNER JOIN file_version fv ON fv.file_resource_id = fr.id AND fv.version_number = 1
WHERE mf.evaluation_id = 120 AND root.name = 'Material adicional' AND mf.name = 'Enunciados'
  AND NOT EXISTS (
    SELECT 1 FROM material mx
    WHERE mx.material_folder_id = mf.id
      AND mx.file_resource_id = fr.id
      AND mx.class_event_id IS NULL
  );
