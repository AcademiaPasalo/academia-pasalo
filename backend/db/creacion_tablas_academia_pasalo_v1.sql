CREATE SCHEMA IF NOT EXISTS academia_pasalo
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE academia_pasalo;

CREATE TABLE role (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL,
  name VARCHAR(30) NOT NULL
);

CREATE TABLE course_type (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL,
  name VARCHAR(60) NOT NULL
);

CREATE TABLE cycle_level (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  level_number INT NOT NULL,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE enrollment_status (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE evaluation_type (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE folder_status (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE material_status (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE deletion_request_status (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE audit_action (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL
);

CREATE TABLE session_status (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL
);


CREATE TABLE security_event_type (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL
);

CREATE TABLE enrollment_type (
    id BIGINT NOT NULL AUTO_INCREMENT,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_enrollment_type_code UNIQUE (code)
);

CREATE TABLE user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name_1 VARCHAR(50),
  last_name_2 VARCHAR(50),
  phone VARCHAR(20),
  career VARCHAR(100),
  profile_photo_url VARCHAR(500) NULL,
  photo_source ENUM('google', 'uploaded', 'none') NOT NULL DEFAULT 'none',
  last_active_role_id BIGINT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (last_active_role_id) REFERENCES role(id)
);

CREATE TABLE user_role (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (role_id) REFERENCES role(id)
);

CREATE TABLE user_session (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,	
  user_id BIGINT NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  ip_address VARCHAR(50) NOT NULL,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  refresh_token_hash VARCHAR(255) NOT NULL,
  session_status_id BIGINT NOT NULL,
  active_role_id BIGINT NULL,
  expires_at DATETIME NOT NULL,
  is_active BOOLEAN NOT NULL,
  last_activity_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (session_status_id) REFERENCES session_status(id),
  FOREIGN KEY (active_role_id) REFERENCES role(id)
);

CREATE TABLE security_event (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  security_event_type_id BIGINT NOT NULL,
  event_datetime DATETIME NOT NULL,
  ip_address VARCHAR(50),
  user_agent VARCHAR(255),
  metadata JSON,
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (security_event_type_id) REFERENCES security_event_type(id)
);

CREATE TABLE academic_cycle (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME
);

CREATE TABLE course (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_type_id BIGINT NOT NULL,
  cycle_level_id BIGINT NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (course_type_id) REFERENCES course_type(id),
  FOREIGN KEY (cycle_level_id) REFERENCES cycle_level(id)
);

CREATE TABLE course_cycle (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  academic_cycle_id BIGINT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES course(id),
  FOREIGN KEY (academic_cycle_id) REFERENCES academic_cycle(id)
);

CREATE TABLE evaluation (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_cycle_id BIGINT NOT NULL,
  evaluation_type_id BIGINT NOT NULL,
  number INT NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  FOREIGN KEY (course_cycle_id) REFERENCES course_cycle(id),
  FOREIGN KEY (evaluation_type_id) REFERENCES evaluation_type(id)
);

CREATE TABLE enrollment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  course_cycle_id BIGINT NOT NULL,
  enrollment_status_id BIGINT NOT NULL,
  enrollment_type_id BIGINT NOT NULL,
  enrolled_at DATETIME NOT NULL,
  cancelled_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (course_cycle_id) REFERENCES course_cycle(id),
  FOREIGN KEY (enrollment_status_id) REFERENCES enrollment_status(id),
  FOREIGN KEY (enrollment_type_id) REFERENCES enrollment_type (id)
);

CREATE TABLE enrollment_evaluation (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  enrollment_id BIGINT NOT NULL,
  evaluation_id BIGINT NOT NULL,
  access_start_date DATETIME NOT NULL,
  access_end_date DATETIME NOT NULL,
  is_active BOOLEAN NOT NULL,
  revoked_at DATETIME,
  revoked_by BIGINT,
  CONSTRAINT uq_enrollment_evaluation_access UNIQUE (enrollment_id, evaluation_id),
  FOREIGN KEY (enrollment_id) REFERENCES enrollment(id),
  FOREIGN KEY (evaluation_id) REFERENCES evaluation(id),
  FOREIGN KEY (revoked_by) REFERENCES user(id)
);

CREATE TABLE material_folder (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  evaluation_id BIGINT NOT NULL,
  parent_folder_id BIGINT,
  folder_status_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  visible_from DATETIME,
  visible_until DATETIME,
  created_by BIGINT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (evaluation_id) REFERENCES evaluation(id),
  FOREIGN KEY (parent_folder_id) REFERENCES material_folder(id),
  FOREIGN KEY (folder_status_id) REFERENCES folder_status(id),
  FOREIGN KEY (created_by) REFERENCES user(id)
);

CREATE TABLE file_resource (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  checksum_hash VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_url VARCHAR(500) NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE file_version (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  file_resource_id BIGINT NOT NULL,
  version_number INT NOT NULL,
  storage_url VARCHAR(500) NOT NULL,
  created_at DATETIME NOT NULL,
  created_by BIGINT NOT NULL,
  CONSTRAINT uq_resource_version UNIQUE (file_resource_id, version_number),
  FOREIGN KEY (file_resource_id) REFERENCES file_resource(id),
  FOREIGN KEY (created_by) REFERENCES user(id)
);

CREATE TABLE material (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  material_folder_id BIGINT NOT NULL,
  file_resource_id BIGINT NOT NULL,
  file_version_id BIGINT NOT NULL,
  material_status_id BIGINT NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  visible_from DATETIME,
  visible_until DATETIME,
  created_by BIGINT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (material_folder_id) REFERENCES material_folder(id),
  FOREIGN KEY (file_resource_id) REFERENCES file_resource(id),
  FOREIGN KEY (file_version_id) REFERENCES file_version(id),
  FOREIGN KEY (material_status_id) REFERENCES material_status(id),
  FOREIGN KEY (created_by) REFERENCES user(id)
);

CREATE TABLE deletion_request (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  requested_by BIGINT NOT NULL,
  deletion_request_status_id BIGINT NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT NOT NULL,
  reason VARCHAR(500),
  reviewed_by BIGINT,
  reviewed_at DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (requested_by) REFERENCES user(id),
  FOREIGN KEY (reviewed_by) REFERENCES user(id),
  FOREIGN KEY (deletion_request_status_id) REFERENCES deletion_request_status(id)
);

CREATE TABLE notification (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  message VARCHAR(500) NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE user_notification (
  user_id BIGINT NOT NULL,
  notification_id BIGINT NOT NULL,
  is_read BOOLEAN NOT NULL,
  PRIMARY KEY (user_id, notification_id),
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (notification_id) REFERENCES notification(id)
);

CREATE TABLE audit_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  audit_action_id BIGINT NOT NULL,
  event_datetime DATETIME NOT NULL,
  entity_type VARCHAR(50),
  entity_id BIGINT,
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (audit_action_id) REFERENCES audit_action(id)
);

CREATE TABLE course_cycle_professor (
  course_cycle_id BIGINT NOT NULL,
  professor_user_id BIGINT NOT NULL,
  assigned_at DATETIME NOT NULL,
  revoked_at DATETIME,
  PRIMARY KEY (course_cycle_id, professor_user_id),
  FOREIGN KEY (course_cycle_id) REFERENCES course_cycle(id),
  FOREIGN KEY (professor_user_id) REFERENCES user(id)
);

CREATE TABLE academic_event (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_cycle_id BIGINT NOT NULL,
  created_by BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  is_cancelled BOOLEAN NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (course_cycle_id) REFERENCES course_cycle(id),
  FOREIGN KEY (created_by) REFERENCES user(id)
);

CREATE TABLE system_setting (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) NOT NULL,
  setting_value VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  created_at DATETIME NOT NULL,
  updated_at DATETIME
);

CREATE TABLE course_testimony (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  course_cycle_id BIGINT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 0 AND 5),
  comment TEXT NOT NULL,
  photo_url VARCHAR(500) NULL,
  photo_source ENUM('profile', 'uploaded', 'none') NOT NULL DEFAULT 'none',
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (course_cycle_id) REFERENCES course_cycle(id),
  CONSTRAINT uq_course_testimony_user_course_cycle UNIQUE (user_id, course_cycle_id)
);

CREATE TABLE featured_testimony (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_cycle_id BIGINT NOT NULL,
  course_testimony_id BIGINT NOT NULL,
  display_order INT NOT NULL,
  is_active BOOLEAN NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (course_cycle_id) REFERENCES course_cycle(id),
  FOREIGN KEY (course_testimony_id) REFERENCES course_testimony(id),
  CONSTRAINT uq_featured_testimony_course_cycle_testimony UNIQUE (course_cycle_id, course_testimony_id)
);

   CREATE TABLE class_event (
     id BIGINT PRIMARY KEY AUTO_INCREMENT,
     evaluation_id BIGINT NOT NULL,
     session_number INT NOT NULL,
     title VARCHAR(255) NOT NULL,
     topic VARCHAR(120) NOT NULL,
     start_datetime DATETIME NOT NULL,
     end_datetime DATETIME NOT NULL,
     meeting_link VARCHAR(500) NOT NULL,
     is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
     created_by BIGINT NOT NULL,
     created_at DATETIME NOT NULL,
     updated_at DATETIME,

     CONSTRAINT fk_class_event_evaluation FOREIGN KEY (evaluation_id) REFERENCES evaluation(id) ON DELETE CASCADE,
     CONSTRAINT fk_class_event_creator FOREIGN KEY (created_by) REFERENCES user(id),
     CONSTRAINT uq_evaluation_session_number UNIQUE (evaluation_id, session_number),
     CONSTRAINT chk_datetime_order CHECK (end_datetime > start_datetime)
 );

   CREATE TABLE class_event_professor (
     class_event_id BIGINT NOT NULL,
     professor_user_id BIGINT NOT NULL,
     assigned_at DATETIME NOT NULL,
     revoked_at DATETIME,
     PRIMARY KEY (class_event_id, professor_user_id),
     CONSTRAINT fk_class_event_professor_event FOREIGN KEY (class_event_id) REFERENCES class_event(id) ON DELETE CASCADE,
     CONSTRAINT fk_class_event_professor_user FOREIGN KEY (professor_user_id) REFERENCES user(id)
   );

CREATE UNIQUE INDEX idx_user_email ON user(email);

CREATE INDEX idx_user_session_user_active
ON user_session(user_id, is_active);

CREATE INDEX idx_user_session_created
ON user_session(user_id, created_at);

CREATE INDEX idx_security_event_user_date
ON security_event(user_id, event_datetime);

CREATE INDEX idx_enrollment_user_course_cycle
ON enrollment(user_id, course_cycle_id);

CREATE INDEX idx_enrollment_status
ON enrollment(enrollment_status_id);

CREATE INDEX idx_enrollment_eval_access
ON enrollment_evaluation(enrollment_id, evaluation_id, is_active);

CREATE INDEX idx_enrollment_eval_dates
ON enrollment_evaluation(access_start_date, access_end_date);

CREATE INDEX idx_course_cycle_course
ON course_cycle(course_id, academic_cycle_id);

CREATE INDEX idx_evaluation_course_cycle
ON evaluation(course_cycle_id);

CREATE INDEX idx_evaluation_type_number
ON evaluation(evaluation_type_id, number);

CREATE INDEX idx_folder_evaluation
ON material_folder(evaluation_id);

CREATE INDEX idx_folder_parent
ON material_folder(parent_folder_id);

CREATE INDEX idx_folder_visibility
ON material_folder(visible_from, visible_until);

CREATE INDEX idx_material_folder
ON material(material_folder_id);

CREATE INDEX idx_material_status
ON material(material_status_id);

CREATE INDEX idx_material_visibility
ON material(visible_from, visible_until);

CREATE INDEX idx_audit_log_user_date
ON audit_log(user_id, event_datetime);

CREATE INDEX idx_user_notification_read
ON user_notification(user_id, is_read);

CREATE INDEX idx_deletion_request_status
ON deletion_request(deletion_request_status_id);

CREATE INDEX idx_deletion_request_entity
ON deletion_request(entity_type, entity_id);

CREATE INDEX idx_academic_event_course_cycle_date
ON academic_event(course_cycle_id, start_datetime);

CREATE UNIQUE INDEX idx_system_setting_key
ON system_setting(setting_key);

CREATE INDEX idx_course_testimony_course
ON course_testimony(course_cycle_id);

CREATE INDEX idx_course_testimony_rating
ON course_testimony(rating);

CREATE INDEX idx_course_testimony_created
ON course_testimony(created_at);

CREATE INDEX idx_featured_testimony_course_active
ON featured_testimony(course_cycle_id, is_active);

CREATE INDEX idx_featured_testimony_order
ON featured_testimony(course_cycle_id, display_order);

CREATE INDEX idx_enrollment_eval_eval_active_dates
ON enrollment_evaluation (evaluation_id, is_active, access_start_date, access_end_date);

CREATE INDEX idx_enrollment_user_active
ON enrollment (user_id, cancelled_at);

CREATE INDEX idx_enrollment_user_status_active
ON enrollment (user_id, enrollment_status_id, cancelled_at);

CREATE INDEX idx_user_session_concurrent_check
ON user_session(user_id, session_status_id, expires_at, device_id);


CREATE INDEX idx_class_event_evaluation ON class_event(evaluation_id);
CREATE INDEX idx_class_event_datetime ON class_event(start_datetime, end_datetime);
CREATE INDEX idx_class_event_cancelled ON class_event(is_cancelled);
CREATE INDEX idx_class_event_creator ON class_event(created_by);

CREATE INDEX idx_class_event_professor_event ON class_event_professor(class_event_id);
CREATE INDEX idx_class_event_professor_user ON class_event_professor(professor_user_id);
CREATE INDEX idx_class_event_professor_active ON class_event_professor(class_event_id, revoked_at);


