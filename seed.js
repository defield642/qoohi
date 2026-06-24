import Database from 'better-sqlite3';
import dotenv from 'dotenv';
dotenv.config();

const db = new Database(process.env.DATABASE_PATH || './qoohi.db');

console.log('Seeding database with test data...');

// 1. Clear existing data (optional, but good for a clean test)
db.exec('DELETE FROM users');
db.exec('DELETE FROM enrollments');
db.exec('DELETE FROM materials');
db.exec('DELETE FROM tournament_registrations');
db.exec('DELETE FROM tournament_matches');
db.exec('DELETE FROM sessions');
db.exec('DELETE FROM finance');

// 2. Create Users
const insertUser = db.prepare(`
  INSERT INTO users (full_name, whatsapp, email, role, assessment_status, performance_level)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const teacher = insertUser.run('Jane Doe', '254700000001', 'teacher@qoohi.com', 'teacher', 'waiting', 0);
const student1 = insertUser.run('John Smith', '254700000002', 'student@qoohi.com', 'student', 'approaching', 3);
const student2 = insertUser.run('Alice Wanjiku', '254700000003', 'alice@qoohi.com', 'student', 'developing', 2);
insertUser.run('Robert Parent', '254700000004', 'parent@qoohi.com', 'parent', 'waiting', 0);

console.log('Users created.');

// 3. Create Enrollments
const insertEnrollment = db.prepare(`
  INSERT INTO enrollments (user_id, package_key, package_name, price_ksh)
  VALUES (?, ?, ?, ?)
`);

insertEnrollment.run(student1.lastInsertRowid, 'coding_ai_training', 'Coding and AI Training', 9500);
insertEnrollment.run(student2.lastInsertRowid, 'computer_packages', 'Computer Packages', 4500);

console.log('Enrollments created.');

// 4. Create Materials
const insertMaterial = db.prepare(`
  INSERT INTO materials (course_key, topic, title, description, file_url)
  VALUES (?, ?, ?, ?, ?)
`);

insertMaterial.run('python-programming', 'Basics', 'Intro to Python', 'Learn variables and loops.', 'https://example.com/python1.pdf');
insertMaterial.run('web-design', 'HTML/CSS', 'Modern CSS', 'Mastering Flexbox and Grid.', 'https://example.com/css.pdf');

console.log('Materials created.');

// 5. Create Tournament Data
const insertTournReg = db.prepare(`
  INSERT INTO tournament_registrations (user_id, fee_ksh, status)
  VALUES (?, ?, ?)
`);

const reg1 = insertTournReg.run(student1.lastInsertRowid, 250, 'registered');
const reg2 = insertTournReg.run(student2.lastInsertRowid, 250, 'registered');

const insertMatch = db.prepare(`
  INSERT INTO tournament_matches (stage, round_number, home_registration_id, away_registration_id, home_score, away_score)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertMatch.run('league', 1, reg1.lastInsertRowid, reg2.lastInsertRowid, 2, 1);

console.log('Tournament data created.');

// 6. Create Finance Records
const insertFinance = db.prepare(`
  INSERT INTO finance (date, mpesa, cash, tv1, tv2, tv3, tv4, cyber, token, movies, total)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const today = new Date().toISOString().split('T')[0];
insertFinance.run(today, '5000', '2000', '100', '100', '100', '100', '500', '200', '300', '8400');

console.log('Finance records created.');

// 7. Create Sessions for testing
const insertSession = db.prepare(`
  INSERT INTO sessions (user_id, token, expires_at)
  VALUES (?, ?, ?)
`);

const expiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
insertSession.run(teacher.lastInsertRowid, 'test-token-teacher', expiry);
insertSession.run(student1.lastInsertRowid, 'test-token-student', expiry);

console.log('Sessions created.');
console.log('\n--- TEST TOKENS ---');
console.log('Teacher Token:', 'test-token-teacher');
console.log('Student Token:', 'test-token-student');
console.log('-------------------\n');

db.close();
console.log('Seeding complete.');
