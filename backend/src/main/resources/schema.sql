CREATE TABLE IF NOT EXISTS users (
 id BIGSERIAL PRIMARY KEY, full_name VARCHAR(200) NOT NULL, email VARCHAR(320) UNIQUE,
 whatsapp VARCHAR(40), role VARCHAR(30) NOT NULL DEFAULT 'parent', home_location TEXT,
 latitude DOUBLE PRECISION, longitude DOUBLE PRECISION, subjects_json TEXT NOT NULL DEFAULT '[]',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS institutions (
 id UUID PRIMARY KEY, name VARCHAR(240) NOT NULL, email VARCHAR(320) UNIQUE NOT NULL,
 location TEXT NOT NULL DEFAULT '', phone VARCHAR(40), school_type VARCHAR(30) NOT NULL DEFAULT 'junior',
 logo_url TEXT, motto TEXT, latitude DOUBLE PRECISION, longitude DOUBLE PRECISION,
 initialized BOOLEAN NOT NULL DEFAULT false, owner_user_id BIGINT REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS institution_staff (
 institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 PRIMARY KEY(institution_id,user_id)
);
CREATE TABLE IF NOT EXISTS school_classes (
 id BIGSERIAL PRIMARY KEY, institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
 grade VARCHAR(40) NOT NULL, name VARCHAR(120) NOT NULL, UNIQUE(institution_id,name)
);
CREATE TABLE IF NOT EXISTS school_students (
 id BIGSERIAL PRIMARY KEY, institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
 full_name VARCHAR(200) NOT NULL, registration_no VARCHAR(120) NOT NULL, parent_name VARCHAR(200) NOT NULL,
 parent_email VARCHAR(320) NOT NULL, parent_phone VARCHAR(40) NOT NULL, parent_location TEXT NOT NULL DEFAULT '',
 parent_latitude DOUBLE PRECISION, parent_longitude DOUBLE PRECISION, grade_key VARCHAR(40) NOT NULL, class_name VARCHAR(120) NOT NULL,
 current_teacher TEXT, underperforming_subjects_json TEXT NOT NULL DEFAULT '[]', created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(institution_id,registration_no)
);
ALTER TABLE school_students ADD COLUMN IF NOT EXISTS subjects_json TEXT NOT NULL DEFAULT '[]';
CREATE TABLE IF NOT EXISTS teacher_profiles (
 user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, location_label TEXT NOT NULL DEFAULT '',
 latitude DOUBLE PRECISION, longitude DOUBLE PRECISION, subjects_json TEXT NOT NULL DEFAULT '[]', available BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS auth_codes (
 id BIGSERIAL PRIMARY KEY, email VARCHAR(320) NOT NULL, code_hash VARCHAR(128) NOT NULL, purpose VARCHAR(30) NOT NULL,
 expires_at TIMESTAMPTZ NOT NULL, consumed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
 token UUID PRIMARY KEY, user_id BIGINT REFERENCES users(id) ON DELETE CASCADE, institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
 expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS parent_student_links (
 parent_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, student_id BIGINT NOT NULL REFERENCES school_students(id) ON DELETE CASCADE,
 PRIMARY KEY(parent_user_id,student_id)
);
CREATE TABLE IF NOT EXISTS recommendations (
 id BIGSERIAL PRIMARY KEY, student_id BIGINT NOT NULL REFERENCES school_students(id) ON DELETE CASCADE, teacher_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 subject VARCHAR(120) NOT NULL, match_score DOUBLE PRECISION NOT NULL, reason TEXT NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'pending', created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(student_id,teacher_user_id,subject)
);
CREATE TABLE IF NOT EXISTS notifications (
 id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, type VARCHAR(50) NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL,
 data_json TEXT NOT NULL DEFAULT '{}', read_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_school_students_institution ON school_students(institution_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE TABLE IF NOT EXISTS blocked_accounts (
 id BIGSERIAL PRIMARY KEY,
 email VARCHAR(320) UNIQUE,
 whatsapp VARCHAR(40) UNIQUE,
 reason TEXT NOT NULL DEFAULT 'Account deleted by superadmin',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CHECK (email IS NOT NULL OR whatsapp IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS ai_settings (
 setting_key VARCHAR(80) PRIMARY KEY,
 setting_value TEXT NOT NULL DEFAULT '',
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS iep_books (
 id BIGSERIAL PRIMARY KEY,
 grade INT NOT NULL CHECK (grade BETWEEN 1 AND 12),
 subject VARCHAR(160) NOT NULL,
 title VARCHAR(240) NOT NULL,
 filename VARCHAR(255) NOT NULL,
 content_type VARCHAR(120) NOT NULL DEFAULT 'application/pdf',
 content BYTEA NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(grade, subject)
);

ALTER TABLE auth_codes ADD COLUMN IF NOT EXISTS metadata_json TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS secondary_roles TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(30);
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS specializations TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS grade_level VARCHAR(40) NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by BIGINT REFERENCES users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE TABLE IF NOT EXISTS parent_students (id BIGSERIAL PRIMARY KEY,parent_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,child_name VARCHAR(200) NOT NULL,grade_level VARCHAR(80) NOT NULL,goals TEXT NOT NULL DEFAULT '',assessment_status VARCHAR(40) NOT NULL DEFAULT 'waiting',performance_level VARCHAR(40) NOT NULL DEFAULT '0',created_at TIMESTAMPTZ NOT NULL DEFAULT now(),subjects_json TEXT NOT NULL DEFAULT '[]');
ALTER TABLE parent_students ADD COLUMN IF NOT EXISTS subjects_json TEXT NOT NULL DEFAULT '[]';
CREATE TABLE IF NOT EXISTS enrollments (id BIGSERIAL PRIMARY KEY,user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,package_key VARCHAR(80) NOT NULL,package_name VARCHAR(200) NOT NULL,price_ksh INT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),UNIQUE(user_id,package_key));
CREATE TABLE IF NOT EXISTS deposits (id BIGSERIAL PRIMARY KEY,user_id BIGINT NOT NULL REFERENCES users(id),amount NUMERIC(12,2) NOT NULL,mpesa_ref VARCHAR(100),phone VARCHAR(40),mpesa_message TEXT,proof_image_url TEXT,status VARCHAR(30) NOT NULL DEFAULT 'pending',admin_note TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),verified_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS withdrawals (id BIGSERIAL PRIMARY KEY,user_id BIGINT NOT NULL REFERENCES users(id),amount NUMERIC(12,2) NOT NULL,mpesa_name TEXT NOT NULL,mpesa_number VARCHAR(40) NOT NULL,status VARCHAR(30) NOT NULL DEFAULT 'pending',admin_note TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),processed_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS service_charges (service_key VARCHAR(80) PRIMARY KEY,label TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',charge_ksh NUMERIC(12,2) NOT NULL DEFAULT 0,active BOOLEAN NOT NULL DEFAULT true,sort_order INT NOT NULL DEFAULT 0,updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS finance (date DATE PRIMARY KEY,columns_json TEXT NOT NULL DEFAULT '{}',values_json TEXT NOT NULL DEFAULT '{}',updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS admin_accounts (id BIGSERIAL PRIMARY KEY,name TEXT NOT NULL,email VARCHAR(320) UNIQUE NOT NULL,access_key TEXT UNIQUE NOT NULL,is_superadmin BOOLEAN NOT NULL DEFAULT false,active BOOLEAN NOT NULL DEFAULT true,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS chat_messages (id BIGSERIAL PRIMARY KEY,sender_id BIGINT NOT NULL REFERENCES users(id),recipient_id BIGINT NOT NULL REFERENCES users(id),body TEXT NOT NULL,read_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS idx_chat_participants ON chat_messages(sender_id,recipient_id,created_at);

CREATE TABLE IF NOT EXISTS teacher_classes (
 id BIGSERIAL PRIMARY KEY,
 teacher_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 name VARCHAR(180) NOT NULL,
 subject VARCHAR(160) NOT NULL DEFAULT '',
 grade VARCHAR(40) NOT NULL DEFAULT '',
 description TEXT NOT NULL DEFAULT '',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(teacher_id,name)
);
ALTER TABLE teacher_classes ADD COLUMN IF NOT EXISTS subject VARCHAR(160) NOT NULL DEFAULT '';
ALTER TABLE teacher_classes ADD COLUMN IF NOT EXISTS grade VARCHAR(40) NOT NULL DEFAULT '';
ALTER TABLE teacher_classes ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
CREATE TABLE IF NOT EXISTS teacher_class_students (
 class_id BIGINT NOT NULL REFERENCES teacher_classes(id) ON DELETE CASCADE,
 student_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 PRIMARY KEY(class_id,student_user_id)
);
CREATE TABLE IF NOT EXISTS teacher_class_members (
 class_id BIGINT NOT NULL REFERENCES teacher_classes(id) ON DELETE CASCADE,
 learner_type VARCHAR(24) NOT NULL CHECK (learner_type IN ('user','parent_child','institution')),
 learner_id BIGINT NOT NULL,
 enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(class_id,learner_type,learner_id)
);
CREATE INDEX IF NOT EXISTS idx_teacher_class_members_learner ON teacher_class_members(learner_type,learner_id,class_id);
INSERT INTO teacher_class_members(class_id,learner_type,learner_id)
 SELECT class_id,'user',student_user_id FROM teacher_class_students ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS teacher_lessons (
 id BIGSERIAL PRIMARY KEY,
 class_id BIGINT NOT NULL REFERENCES teacher_classes(id) ON DELETE CASCADE,
 teacher_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 title VARCHAR(240) NOT NULL,
 subject VARCHAR(160) NOT NULL DEFAULT '',
 starts_at TIMESTAMPTZ,
 meeting_url TEXT NOT NULL DEFAULT '',
 notes TEXT NOT NULL DEFAULT '',
 lesson_number INTEGER NOT NULL DEFAULT 0,
 notes_filename VARCHAR(255),
 notes_content_type VARCHAR(120) NOT NULL DEFAULT 'application/pdf',
 notes_content BYTEA,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE teacher_lessons ADD COLUMN IF NOT EXISTS lesson_number INTEGER NOT NULL DEFAULT 0;
ALTER TABLE teacher_lessons ADD COLUMN IF NOT EXISTS notes_filename VARCHAR(255);
ALTER TABLE teacher_lessons ADD COLUMN IF NOT EXISTS notes_content_type VARCHAR(120) NOT NULL DEFAULT 'application/pdf';
ALTER TABLE teacher_lessons ADD COLUMN IF NOT EXISTS notes_content BYTEA;
ALTER TABLE teacher_classes ADD COLUMN IF NOT EXISTS lesson_count INTEGER NOT NULL DEFAULT 0;
WITH numbered AS (
 SELECT id,ROW_NUMBER() OVER (PARTITION BY class_id ORDER BY created_at,id)::INTEGER AS lesson_number
 FROM teacher_lessons WHERE lesson_number=0
)
UPDATE teacher_lessons lesson SET lesson_number=numbered.lesson_number
FROM numbered WHERE lesson.id=numbered.id;
UPDATE teacher_classes class SET lesson_count=GREATEST(class.lesson_count,counts.total)
FROM (SELECT class_id,COUNT(*)::INTEGER AS total FROM teacher_lessons GROUP BY class_id) counts
WHERE class.id=counts.class_id;
CREATE UNIQUE INDEX IF NOT EXISTS idx_teacher_lessons_sequence ON teacher_lessons(class_id,lesson_number);
CREATE TABLE IF NOT EXISTS teacher_progress (
 id BIGSERIAL PRIMARY KEY,
 teacher_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 student_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
 parent_student_id BIGINT REFERENCES parent_students(id) ON DELETE CASCADE,
 subject VARCHAR(160) NOT NULL DEFAULT '',
 record_type VARCHAR(30) NOT NULL,
 value TEXT NOT NULL DEFAULT '',
 notes TEXT NOT NULL DEFAULT '',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CHECK (student_user_id IS NOT NULL OR parent_student_id IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS teacher_assignments (
 id BIGSERIAL PRIMARY KEY,
 teacher_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 class_id BIGINT REFERENCES teacher_classes(id) ON DELETE CASCADE,
 title VARCHAR(240) NOT NULL,
 filename VARCHAR(255) NOT NULL,
 content_type VARCHAR(120) NOT NULL DEFAULT 'application/pdf',
 content BYTEA NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE teacher_assignments ADD COLUMN IF NOT EXISTS subject VARCHAR(160) NOT NULL DEFAULT '';
ALTER TABLE teacher_assignments ADD COLUMN IF NOT EXISTS instructions TEXT NOT NULL DEFAULT '';
ALTER TABLE teacher_assignments ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ;
ALTER TABLE teacher_assignments ADD COLUMN IF NOT EXISTS link_url TEXT NOT NULL DEFAULT '';
ALTER TABLE teacher_assignments ALTER COLUMN filename DROP NOT NULL;
ALTER TABLE teacher_assignments ALTER COLUMN content DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_class ON teacher_assignments(class_id,teacher_id);
CREATE TABLE IF NOT EXISTS teacher_assignment_submissions (
 id BIGSERIAL PRIMARY KEY,
 assignment_id BIGINT NOT NULL REFERENCES teacher_assignments(id) ON DELETE CASCADE,
 learner_type VARCHAR(24) NOT NULL CHECK (learner_type IN ('user','parent_child','institution')),
 learner_id BIGINT NOT NULL,
 filename VARCHAR(255) NOT NULL,
 content_type VARCHAR(120) NOT NULL DEFAULT 'application/pdf',
 content BYTEA NOT NULL,
 submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 score NUMERIC(8,2),
 max_score NUMERIC(8,2),
 feedback TEXT NOT NULL DEFAULT '',
 marked_at TIMESTAMPTZ,
 marked_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
 UNIQUE(assignment_id,learner_type,learner_id)
);
CREATE TABLE IF NOT EXISTS teacher_prices (
 teacher_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 daily NUMERIC(12,2) NOT NULL DEFAULT 0,
 weekly NUMERIC(12,2) NOT NULL DEFAULT 0,
 monthly NUMERIC(12,2) NOT NULL DEFAULT 0,
 six_month NUMERIC(12,2) NOT NULL DEFAULT 0,
 yearly NUMERIC(12,2) NOT NULL DEFAULT 0,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public_ai_usage (
 client_key CHAR(64) NOT NULL,
 window_start TIMESTAMPTZ NOT NULL,
 request_count INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(client_key, window_start)
);
CREATE TABLE IF NOT EXISTS teacher_transactions (
 id BIGSERIAL PRIMARY KEY,
 teacher_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 payer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
 amount NUMERIC(12,2) NOT NULL,
 platform_share NUMERIC(12,2) NOT NULL DEFAULT 0,
 teacher_share NUMERIC(12,2) NOT NULL DEFAULT 0,
 type VARCHAR(40) NOT NULL,
 description TEXT NOT NULL DEFAULT '',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
