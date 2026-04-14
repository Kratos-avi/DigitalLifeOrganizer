CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('newcomer', 'admin') NOT NULL DEFAULT 'newcomer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tasks (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  due_date DATE NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  is_starter TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tasks_user (user_id),
  KEY idx_tasks_status (status),
  CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS deadlines (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'other',
  due_date DATETIME NOT NULL,
  notes TEXT NULL,
  priority VARCHAR(30) NOT NULL DEFAULT 'medium',
  status VARCHAR(30) NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_deadlines_user_date (user_id, due_date),
  CONSTRAINT fk_deadlines_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS announcements (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  created_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_announcements_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS study_schedules (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  study_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject VARCHAR(255) NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_study_schedule_user_date (user_id, study_date),
  CONSTRAINT fk_study_schedules_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS work_schedules (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  workplace VARCHAR(255) NULL,
  role VARCHAR(100) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_work_schedule_user_date (user_id, shift_date),
  CONSTRAINT fk_work_schedules_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS study_templates (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  subject VARCHAR(255) NOT NULL,
  weekday TINYINT UNSIGNED NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_study_templates_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS work_templates (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  workplace VARCHAR(255) NULL,
  role VARCHAR(100) NULL,
  weekday TINYINT UNSIGNED NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_work_templates_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO users (id, full_name, email, password_hash, role)
VALUES
  (1, 'Local Admin', 'admin@local.test', '$2b$10$V2BlN8VunYBmnrmkLBFZxOBW4ZcSGw9GB8diznLNdBmlBQMrZ8MLS', 'admin'),
  (2, 'Local Newcomer', 'user@local.test', '$2b$10$cPVdiHifq.quD4xtZvSqqOJmbPFEj2lYFuADFh2VoFWFQYUXe5WlC', 'newcomer');

INSERT IGNORE INTO announcements (id, title, message, category, created_by)
VALUES (1, 'Welcome', 'Local development database is ready.', 'general', 1);

INSERT IGNORE INTO tasks (id, user_id, title, description, due_date, status, is_starter)
VALUES
  (1, 2, 'Apply for SIN', 'Visit Service Canada and submit application documents.', '2026-04-21', 'pending', 1),
  (2, 2, 'Open a bank account', 'Compare chequing accounts and choose one.', '2026-04-23', 'pending', 1),
  (3, 2, 'Create a Canadian-style resume', 'Update resume with local formatting and contact details.', '2026-04-25', 'completed', 1),
  (4, 2, 'Get a transit card', 'Buy or activate a local transit card.', '2026-04-19', 'pending', 1),
  (5, 2, 'Set up email folder', 'Organize important documents in one folder.', '2026-04-18', 'completed', 1),
  (6, 1, 'Review dashboard stats', 'Verify admin widgets and database counts.', '2026-04-20', 'pending', 0),
  (7, 1, 'Publish weekly announcement', 'Post a welcome note for users.', '2026-04-22', 'pending', 0);

INSERT IGNORE INTO deadlines (id, user_id, title, category, due_date, notes, priority, status)
VALUES
  (1, 2, 'Passport copy ready', 'immigration', '2026-04-20 17:00:00', 'Keep a scanned copy in the document folder.', 'high', 'upcoming'),
  (2, 2, 'Bank appointment', 'finance', '2026-04-23 10:30:00', 'Bring ID and proof of address.', 'medium', 'upcoming'),
  (3, 2, 'Job applications batch', 'career', '2026-04-26 18:00:00', 'Apply to at least 5 roles.', 'high', 'upcoming'),
  (4, 1, 'Check admin reports', 'admin', '2026-04-21 09:00:00', 'Review active users and task counts.', 'medium', 'upcoming');

INSERT IGNORE INTO study_schedules (id, user_id, study_date, start_time, end_time, subject, notes)
VALUES
  (1, 2, '2026-04-19', '18:00:00', '20:00:00', 'English Practice', 'Focus on speaking and vocabulary.'),
  (2, 2, '2026-04-21', '19:00:00', '21:00:00', 'Computer Skills', 'Review email, files, and browsing.'),
  (3, 1, '2026-04-20', '08:00:00', '09:00:00', 'System Review', 'Verify deployment and metrics.');

INSERT IGNORE INTO work_schedules (id, user_id, shift_date, start_time, end_time, workplace, role, notes)
VALUES
  (1, 2, '2026-04-22', '09:00:00', '13:00:00', 'City Cafe', 'Barista', 'Bring uniform and arrive 15 minutes early.'),
  (2, 2, '2026-04-24', '14:00:00', '18:00:00', 'Library Help Desk', 'Assistant', 'Prepare student ID and schedule.'),
  (3, 1, '2026-04-23', '10:00:00', '12:00:00', 'Remote', 'Admin', 'Check user requests and announcements.');

INSERT IGNORE INTO study_templates (id, user_id, subject, weekday, start_time, end_time, start_date, end_date, notes)
VALUES
  (1, 2, 'English Practice', 1, '18:00:00', '20:00:00', '2026-04-14', '2026-07-14', 'Weekly language study block.'),
  (2, 2, 'Computer Skills', 3, '19:00:00', '21:00:00', '2026-04-14', '2026-07-14', 'Practice common digital tasks.');

INSERT IGNORE INTO work_templates (id, user_id, workplace, role, weekday, start_time, end_time, start_date, end_date, notes)
VALUES
  (1, 2, 'City Cafe', 'Barista', 2, '09:00:00', '13:00:00', '2026-04-14', '2026-07-14', 'Consistent morning shift.'),
  (2, 2, 'Library Help Desk', 'Assistant', 4, '14:00:00', '18:00:00', '2026-04-14', '2026-07-14', 'Afternoon support shift.');

INSERT IGNORE INTO announcements (id, title, message, category, created_by)
VALUES
  (2, 'Sample data loaded', 'Sample tasks, deadlines, schedules, and templates are available for testing.', 'general', 1),
  (3, 'Admin reminder', 'Check Railway variables and redeploy after config updates.', 'system', 1);
