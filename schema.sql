CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student',
  assessment_status TEXT NOT NULL DEFAULT 'waiting',
  performance_level INTEGER NOT NULL DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by INTEGER REFERENCES users(id),
  balance REAL NOT NULL DEFAULT 0,
  avatar_url TEXT,
  specializations TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS parent_students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_user_id INTEGER NOT NULL,
  child_name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  goals TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS auth_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL,
  metadata_json TEXT,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  package_key TEXT NOT NULL,
  package_name TEXT NOT NULL,
  price_ksh INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, package_key),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_key TEXT NOT NULL,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  audience_type TEXT NOT NULL,
  audience_key TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  pdf_links_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tournament_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  fee_ksh INTEGER NOT NULL DEFAULT 250,
  status TEXT NOT NULL DEFAULT 'registered',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tournament_matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stage TEXT NOT NULL,
  round_number INTEGER NOT NULL DEFAULT 1,
  home_registration_id INTEGER NOT NULL,
  away_registration_id INTEGER NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (home_registration_id) REFERENCES tournament_registrations(id),
  FOREIGN KEY (away_registration_id) REFERENCES tournament_registrations(id)
);

CREATE TABLE IF NOT EXISTS finance_records (
  date TEXT PRIMARY KEY,
  columns_json TEXT NOT NULL,
  values_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finance (
  date TEXT PRIMARY KEY,
  mpesa TEXT DEFAULT '',
  cash TEXT DEFAULT '',
  tv1 TEXT DEFAULT '',
  tv2 TEXT DEFAULT '',
  tv3 TEXT DEFAULT '',
  tv4 TEXT DEFAULT '',
  cyber TEXT DEFAULT '',
  token TEXT DEFAULT '',
  movies TEXT DEFAULT '',
  total TEXT DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tournament_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO tournament_settings (key, value) VALUES ('registration_open', 'false');

CREATE TABLE IF NOT EXISTS service_charges (
  service_key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT DEFAULT '',
  charge_ksh REAL NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO service_charges (service_key, label, description, charge_ksh, active, sort_order) VALUES
  ('computer_packages', 'Computer Packages', 'MS Word, Excel, PowerPoint and office skills', 4500, 1, 1),
  ('coding_ai_training', 'Coding & AI Training', 'Python, web design and AI learning', 9500, 1, 2),
  ('both', 'Full Course', 'Complete computer packages and coding track', 13500, 1, 3),
  ('tournament_entry', 'Tournament Entry', 'FC 26 tournament registration', 250, 1, 4),
  ('ai_chat', 'QOOHI AI Chat', 'Ask QOOHI AI for help and guidance', 50, 1, 5),
  ('resume_generation', 'Resume Builder', 'Generate and refine a professional resume', 100, 1, 6),
  ('cyber_services', 'Cyber Services', 'Digital applications and online services help', 200, 1, 7),
  ('iep_assessment', 'IEP Assessment', 'Individualized education assessment and support', 0, 1, 8),
  ('teacher_registration', 'Teacher Registration', 'Teacher onboarding and account setup', 0, 1, 9),
  ('parent_registration', 'Parent Registration', 'Parent onboarding and account setup', 0, 1, 10),
  ('materials_download', 'Materials Download', 'AI-generated Kenyan curriculum materials', 10, 1, 11),
  ('profile_update', 'Profile Update', 'Profile photo and details editing', 0, 1, 12);

CREATE TABLE IF NOT EXISTS admin_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  access_key TEXT NOT NULL UNIQUE,
  is_superadmin INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('deposit','withdrawal','service_payment','referral_bonus','admin_adjustment')),
  amount REAL NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('pending','completed','failed','cancelled')),
  reference TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS deposits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  mpesa_ref TEXT,
  phone TEXT,
  proof_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','verified','rejected')),
  admin_note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  mpesa_name TEXT NOT NULL,
  mpesa_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processed','rejected')),
  admin_note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
