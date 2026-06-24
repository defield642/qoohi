import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import Database from 'better-sqlite3';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || './qoohi.db';
const db = new Database(dbPath);

// Initialize database
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// SELF-SEEDING: Ensure test accounts exist
const testUsers = [
  { name: 'Jane Doe', email: 'teacher@qoohi.com', role: 'teacher' },
  { name: 'John Smith', email: 'student@qoohi.com', role: 'student' },
  { name: 'Robert Parent', email: 'parent@qoohi.com', role: 'parent' }
];

testUsers.forEach(u => {
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(u.email);
  if (!exists) {
    db.prepare("INSERT INTO users (full_name, whatsapp, email, role) VALUES (?, '254700000000', ?, ?)")
      .run(u.name, u.email, u.role);
    console.log(`Seeded test account: ${u.email}`);
  }
});

// D1 Wrapper for compatibility with worker code
const d1Wrapper = {
  prepare(sql) {
    const stmt = db.prepare(sql);
    return {
      bind(...params) {
        return {
          async first() {
            return stmt.get(...params);
          },
          async all() {
            return { results: stmt.all(...params) };
          },
          async run() {
            const info = stmt.run(...params);
            return {
              meta: {
                last_row_id: info.lastInsertRowid,
                changes: info.changes,
              },
            };
          },
        };
      },
      async first() {
        return stmt.get();
      },
      async all() {
        return { results: stmt.all() };
      },
      async run() {
        const info = stmt.run();
        return {
          meta: {
            last_row_id: info.lastInsertRowid,
            changes: info.changes,
          },
        };
      },
    };
  },
};

const app = new Hono();

const DEFAULT_SERVICE_CHARGES = [
  { serviceKey: "computer_packages", label: "Computer Packages", description: "MS Word, Excel, PowerPoint and office skills", chargeKsh: 4500, active: 1, sortOrder: 1 },
  { serviceKey: "coding_ai_training", label: "Coding & AI Training", description: "Python, web design and AI learning", chargeKsh: 9500, active: 1, sortOrder: 2 },
  { serviceKey: "both", label: "Full Course", description: "Complete computer packages and coding track", chargeKsh: 13500, active: 1, sortOrder: 3 },
  { serviceKey: "tournament_entry", label: "Tournament Entry", description: "FC 26 tournament registration", chargeKsh: 250, active: 1, sortOrder: 4 },
  { serviceKey: "ai_chat", label: "QOOHI AI Chat", description: "Ask QOOHI AI for help and guidance", chargeKsh: 50, active: 1, sortOrder: 5 },
  { serviceKey: "resume_generation", label: "Resume Builder", description: "Generate and refine a professional resume", chargeKsh: 100, active: 1, sortOrder: 6 },
  { serviceKey: "cyber_services", label: "Cyber Services", description: "Digital applications and online services help", chargeKsh: 200, active: 1, sortOrder: 7 },
  { serviceKey: "iep_assessment", label: "IEP Assessment", description: "Individualized education assessment and support", chargeKsh: 0, active: 1, sortOrder: 8 },
  { serviceKey: "teacher_registration", label: "Teacher Registration", description: "Teacher onboarding and account setup", chargeKsh: 0, active: 1, sortOrder: 9 },
  { serviceKey: "parent_registration", label: "Parent Registration", description: "Parent onboarding and account setup", chargeKsh: 0, active: 1, sortOrder: 10 },
  { serviceKey: "profile_update", label: "Profile Update", description: "Profile photo and details editing", chargeKsh: 0, active: 1, sortOrder: 11 },
];

const DEFAULT_FINANCE_COLUMNS = [
  "mpesa",
  "cash",
  "tv1",
  "tv2",
  "tv3",
  "tv4",
  "cyber",
  "token",
  "movies",
  "total",
];

// Migration: add new columns to users table
try { db.exec("ALTER TABLE users ADD COLUMN referral_code TEXT UNIQUE"); } catch { /* column may already exist */ }
try { db.exec("ALTER TABLE users ADD COLUMN referred_by INTEGER REFERENCES users(id)"); } catch { /* column may already exist */ }
try { db.exec("ALTER TABLE users ADD COLUMN balance REAL NOT NULL DEFAULT 0"); } catch { /* column may already exist */ }
try { db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT"); } catch { /* column may already exist */ }

for (const service of DEFAULT_SERVICE_CHARGES) {
  db.prepare(
    `INSERT OR IGNORE INTO service_charges
     (service_key, label, description, charge_ksh, active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    service.serviceKey,
    service.label,
    service.description,
    service.chargeKsh,
    service.active,
    service.sortOrder,
  );
}

// Ensure each existing user has a referral code
const usersWithoutRef = db.prepare("SELECT id FROM users WHERE referral_code IS NULL").all();
const updateRef = db.prepare("UPDATE users SET referral_code = ? WHERE id = ?");
for (const u of usersWithoutRef) {
  const code = 'QH' + Math.random().toString(36).substring(2, 8).toUpperCase();
  updateRef.run(code, u.id);
}

// Middleware to inject environment (Render/Node specific)
app.use('*', async (c, next) => {
  c.env = {
    DB: d1Wrapper,
    ADMIN_ACCESS_KEY: process.env.ADMIN_ACCESS_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",
    APP_URL: process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`,
  };
  await next();
});

app.use(
  '/api/*',
  cors({
    origin: (origin, c) => origin || c.env.APP_URL || '*',
    allowHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  })
);

// Constants from worker/app.js
const COURSE_PACKAGES = {
  computer_packages: {
    key: "computer_packages",
    name: "Computer Packages",
    priceKsh: 4500,
    courses: ["Computer packages"],
  },
  coding_ai_training: {
    key: "coding_ai_training",
    name: "Coding and AI Training",
    priceKsh: 9500,
    courses: [
      "Machine Learning and AI Skills",
      "Python Programming",
      "Web Design",
      "Vibe Coding",
    ],
  },
  both: {
    key: "both",
    name: "Both Packages",
    priceKsh: 13500,
    courses: [
      "Computer packages",
      "Machine Learning and AI Skills",
      "Python Programming",
      "Web Design",
      "Vibe Coding",
    ],
  },
};

const GROUP_META = {
  computer_packages: {
    key: "computer_packages",
    name: "Computer Packages",
    theme: "skills",
  },
  coding_ai_training: {
    key: "coding_ai_training",
    name: "Coding and AI Training",
    theme: "code",
  },
  both: {
    key: "both",
    name: "Both Packages",
    theme: "all",
  },
  tournament: {
    key: "tournament",
    name: "Tournament",
    theme: "game",
  },
  teacher: {
    key: "teacher",
    name: "Teachers",
    theme: "skills",
  },
  parent: {
    key: "parent",
    name: "Parents",
    theme: "all",
  },
  iep: {
    key: "iep",
    name: "IEP Assessment",
    theme: "code",
  },
};

const TOURNAMENT = {
  title: "FC 26 Tournament",
  slug: "fc-26-tournament",
  capacity: 10,
  feeKsh: 250,
  winnerPrizeKsh: 750,
};

// API Routes
app.get("/api/public/overview", async (c) => {
  const tournamentCountRow = await c.env.DB.prepare(
    "SELECT COUNT(*) as total FROM tournament_registrations",
  ).first();

  const regOpenRow = await c.env.DB.prepare(
    "SELECT value FROM tournament_settings WHERE key = 'registration_open'"
  ).first();
  const registrationOpen = regOpenRow?.value === "true";

  return c.json({
    packages: Object.values(COURSE_PACKAGES),
    tournament: {
      ...TOURNAMENT,
      registrationOpen,
      registered: Number(tournamentCountRow?.total || 0),
      remaining: Math.max(
        TOURNAMENT.capacity - Number(tournamentCountRow?.total || 0),
        0,
      ),
    },
  });
});

app.post("/api/auth/send-code", async (c) => {
  const body = await c.req.json();
  console.log("Login request body:", JSON.stringify(body));
  const mode = body.mode === "login" ? "login" : "register";
  const email = normalizeEmail(body.email);
  const fullName = (body.fullName || "").trim();
  const whatsapp = (body.whatsapp || "").trim();
  const registrationType = String(body.registrationType || "").trim();

  if (!email) {
    return c.json({ error: "Email is required." }, 400);
  }

  if (mode === "register") {
    if (!fullName || !whatsapp) {
      return c.json(
        { error: "Full name and WhatsApp number are required." },
        400,
      );
    }

    if (registrationType === "course" && !COURSE_PACKAGES[body.selectedPackage]) {
      return c.json({ error: "Choose a valid learning package." }, 400);
    }

    if (registrationType === "tournament") {
      const regOpenRow = await c.env.DB.prepare(
        "SELECT value FROM tournament_settings WHERE key = 'registration_open'"
      ).first();
      if (regOpenRow?.value !== "true") {
        return c.json({ error: "Tournament registration is currently closed." }, 400);
      }

      const countRow = await c.env.DB.prepare(
        "SELECT COUNT(*) as total FROM tournament_registrations",
      ).first();
      if (Number(countRow?.total || 0) >= TOURNAMENT.capacity) {
        return c.json({ error: "Tournament registration is full." }, 400);
      }
    }
  } else {
    console.log(`[AUTH] Login attempt for: ${email}`);
    // Case-insensitive check using LOWER()
    const existingUser = await c.env.DB.prepare(
      "SELECT id FROM users WHERE LOWER(email) = LOWER(?)",
    )
      .bind(email)
      .first();
    
    console.log(`[AUTH] Database found: ${existingUser ? 'YES' : 'NO'}`);

    if (!existingUser) {
      return c.json({ error: `No account found for: ${email}` }, 404);
    }
  }

  const code = generateCode();
  const metadata = JSON.stringify({
    mode,
    registrationType,
    selectedPackage: body.selectedPackage || "",
    fullName,
    whatsapp,
  });
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await c.env.DB.prepare(
    `INSERT INTO auth_codes (email, code, purpose, metadata_json, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(email, code, mode, metadata, expiresAt)
    .run();

  const packageName =
    registrationType === "tournament"
      ? TOURNAMENT.title
      : registrationType === "teacher"
      ? "Teacher Portal"
      : registrationType === "parent"
      ? "Parent Portal"
      : registrationType === "iep"
      ? "IEP Assessment"
      : COURSE_PACKAGES[body.selectedPackage]?.name || "QOOHI Training";

  await sendMail(c.env, {
    to: email,
    subject:
      mode === "login" ? "Your QOOHI login code" : "Complete your QOOHI registration",
    bodyLines: [
      `Hello ${fullName || "QOOHI"},`,
      "",
      `Your QOOHI verification code is: ${code}`,
      "",
      `This code is for ${packageName}. It will expire in 10 minutes.`,
      "",
      "If you did not request this code, ignore this email.",
      "",
      "QOOHI",
    ],
  });

  return c.json({
    ok: true,
    message: "Verification code sent.",
    next: "verify-code",
  });
});

app.post("/api/auth/verify-code", async (c) => {
  const body = await c.req.json();
  const email = normalizeEmail(body.email);
  const code = String(body.code || "").trim();
  const mode = body.mode === "login" ? "login" : "register";

  const codeRow = await c.env.DB.prepare(
    `SELECT * FROM auth_codes
     WHERE email = ? AND code = ? AND purpose = ? AND consumed_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`,
  )
    .bind(email, code, mode)
    .first();

  if (!codeRow) {
    return c.json({ error: "Invalid verification code." }, 400);
  }

  if (new Date(codeRow.expires_at).getTime() < Date.now()) {
    return c.json({ error: "Verification code has expired." }, 400);
  }

  await c.env.DB.prepare(
    "UPDATE auth_codes SET consumed_at = ? WHERE id = ?",
  )
    .bind(new Date().toISOString(), codeRow.id)
    .run();

  const metadata = safeJsonParse(codeRow.metadata_json);
  let user =
    (await c.env.DB.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)")
      .bind(email)
      .first()) || null;

  if (mode === "register") {
    const requestedRole = (metadata.registrationType === "teacher" || metadata.registrationType === "parent" || metadata.registrationType === "iep")
      ? metadata.registrationType
      : "student";

    if (!user) {
      const inserted = await c.env.DB.prepare(
        "INSERT INTO users (full_name, whatsapp, email, role) VALUES (?, ?, ?, ?)",
      )
        .bind(metadata.fullName, metadata.whatsapp, email, requestedRole)
        .run();
      const refCode = 'QH' + Math.random().toString(36).substring(2, 8).toUpperCase();
      await c.env.DB.prepare("UPDATE users SET referral_code = ? WHERE id = ?")
        .bind(refCode, inserted.meta.last_row_id).run();
      user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
        .bind(inserted.meta.last_row_id)
        .first();
    } else {
      const finalRole = (user.role !== "student" && requestedRole === "student") ? user.role : requestedRole;
      await c.env.DB.prepare(
        "UPDATE users SET full_name = ?, whatsapp = ?, role = ? WHERE id = ?",
      )
        .bind(metadata.fullName, metadata.whatsapp, finalRole, user.id)
        .run();
      user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
        .bind(user.id)
        .first();
    }

    if (
      metadata.registrationType === "course" &&
      COURSE_PACKAGES[metadata.selectedPackage]
    ) {
      const pkg = COURSE_PACKAGES[metadata.selectedPackage];
      await c.env.DB.prepare(
        `INSERT OR IGNORE INTO enrollments (user_id, package_key, package_name, price_ksh)
         VALUES (?, ?, ?, ?)`,
      )
        .bind(user.id, pkg.key, pkg.name, pkg.priceKsh)
        .run();
    }

    if (metadata.registrationType === "tournament") {
      const countRow = await c.env.DB.prepare(
        "SELECT COUNT(*) as total FROM tournament_registrations",
      ).first();
      if (Number(countRow?.total || 0) >= TOURNAMENT.capacity) {
        return c.json({ error: "Tournament registration is full." }, 400);
      }

      await c.env.DB.prepare(
        `INSERT OR IGNORE INTO tournament_registrations (user_id, fee_ksh)
         VALUES (?, ?)`,
      )
        .bind(user.id, TOURNAMENT.feeKsh)
        .run();
      await ensureTournamentSchedule(c.env);
    }
  }

  const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  const expiresAt = new Date(
    Date.now() + 14 * 24 * 60 * 60 * 1000,
  ).toISOString();
  await c.env.DB.prepare(
    "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)",
  )
    .bind(user.id, token, expiresAt)
    .run();

  const dashboard = await buildStudentDashboard(c.env, user.id);
  return c.json({
    ok: true,
    sessionToken: token,
    dashboard,
  });
});

app.get("/api/student/dashboard", async (c) => {
  const session = await requireSession(c);
  if (!session.ok) {
    return session.response;
  }
  const dashboard = await buildStudentDashboard(c.env, session.user.id);
  return c.json({ ok: true, dashboard });
});

app.get("/api/teacher/overview", async (c) => {
  const session = await requireSession(c);
  if (!session.ok || session.user.role !== "teacher") {
    return c.json({ error: "Unauthorized." }, 401);
  }

  const groupedStudents = await buildAdminGroups(c.env);
  return c.json({
    ok: true,
    groups: groupedStudents,
  });
});

app.get("/api/admin/overview", async (c) => {
  const groupedStudents = await buildAdminGroups(c.env);
  const tournament = await buildTournamentSummary(c.env);
  const serviceCharges = await getServiceCharges(c.env);

  return c.json({
    ok: true,
    groups: groupedStudents,
    tournament,
    serviceCharges,
  });
});

app.get("/api/admin/service-charges", async (c) => {
  if (!isAdmin(c)) return c.json({ error: "Unauthorized." }, 401);
  return c.json({ ok: true, serviceCharges: await getServiceCharges(c.env) });
});

app.post("/api/admin/service-charges/:key", async (c) => {
  if (!isAdmin(c)) return c.json({ error: "Unauthorized." }, 401);
  const serviceKey = String(c.req.param("key") || "").trim();
  const body = await c.req.json();
  const label = String(body.label || serviceKey).trim();
  const description = String(body.description || "").trim();
  const chargeKsh = Number(body.chargeKsh || 0);
  const active = Number(body.active ? 1 : 0);
  const sortOrder = Number(body.sortOrder || 0);

  if (!serviceKey) {
    return c.json({ error: "Service key is required." }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO service_charges (service_key, label, description, charge_ksh, active, sort_order, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(service_key) DO UPDATE SET
       label = excluded.label,
       description = excluded.description,
       charge_ksh = excluded.charge_ksh,
       active = excluded.active,
       sort_order = excluded.sort_order,
       updated_at = excluded.updated_at`,
  )
    .bind(serviceKey, label, description, chargeKsh, active, sortOrder, new Date().toISOString())
    .run();

  return c.json({ ok: true, serviceCharges: await getServiceCharges(c.env) });
});

app.post("/api/admin/messages", async (c) => {
  if (!isAdmin(c)) {
    return c.json({ error: "Unauthorized." }, 401);
  }

  const body = await c.req.json();
  const targetType = body.targetType === "group" ? "group" : "user";
  const targetId = String(body.targetId || "").trim();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();
  const pdfLinks = Array.isArray(body.pdfLinks)
    ? body.pdfLinks.map((item) => String(item).trim()).filter(Boolean)
    : [];

  if (!targetId || !subject || !message) {
    return c.json({ error: "Target, subject and message are required." }, 400);
  }

  const recipients =
    targetType === "group"
      ? await getRecipientsForGroup(c.env, targetId)
      : await getRecipientForUser(c.env, Number(targetId));

  if (!recipients.length) {
    return c.json({ error: "No recipients found." }, 404);
  }

  for (const recipient of recipients) {
    await c.env.DB.prepare(
      `INSERT INTO admin_messages
       (user_id, audience_type, audience_key, subject, body, pdf_links_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        recipient.id,
        targetType,
        targetId,
        subject,
        message,
        JSON.stringify(pdfLinks),
      )
      .run();

    await sendMail(c.env, {
      to: recipient.email,
      subject,
      bodyLines: buildAdminEmailLines(recipient.full_name, message, pdfLinks),
    });
  }

  return c.json({
    ok: true,
    sent: recipients.length,
    groups: await buildAdminGroups(c.env),
  });
});

app.post("/api/admin/tournament/matches/:id", async (c) => {
  const matchId = Number(c.req.param("id"));
  const body = await c.req.json();
  const homeScore = Number(body.homeScore);
  const awayScore = Number(body.awayScore);

  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore)) {
    return c.json({ error: "Scores must be whole numbers." }, 400);
  }

  await c.env.DB.prepare(
    `UPDATE tournament_matches
     SET home_score = ?, away_score = ?, updated_at = ?
     WHERE id = ?`,
  )
    .bind(homeScore, awayScore, new Date().toISOString(), matchId)
    .run();

  const summary = await buildTournamentSummary(c.env);

  // Mark tournament as completed when all matches have scores
  const unfinished = await c.env.DB.prepare(
    "SELECT COUNT(*) as total FROM tournament_matches WHERE home_score IS NULL OR away_score IS NULL"
  ).first();

  if (summary.matches.length > 0 && Number(unfinished?.total || 0) === 0) {
    await c.env.DB.prepare("INSERT OR REPLACE INTO tournament_settings (key, value) VALUES ('registration_open', 'false')").run();
  }

  return c.json({
    ok: true,
    tournament: summary,
  });
});

app.post("/api/admin/tournament/toggle-registration", async (c) => {
  const body = await c.req.json();
  const open = body.open === true ? "true" : "false";
  await c.env.DB.prepare(
    "INSERT OR REPLACE INTO tournament_settings (key, value) VALUES ('registration_open', ?)"
  ).bind(open).run();
  return c.json({ ok: true, registrationOpen: open === "true" });
});

app.post("/api/admin/tournament/start", async (c) => {
  const registrationRows = await c.env.DB.prepare(
    "SELECT id FROM tournament_registrations ORDER BY created_at ASC",
  ).all();
  const registrations = registrationRows.results || [];
  
  if (registrations.length < 2) {
    return c.json({ error: "Need at least 2 players to start." }, 400);
  }

  // Close registration when starting matches
  await c.env.DB.prepare(
    "INSERT OR REPLACE INTO tournament_settings (key, value) VALUES ('registration_open', 'false')"
  ).run();

  await c.env.DB.prepare("DELETE FROM tournament_matches").run();
  
  const pairings = buildRoundRobinPairs(registrations.map((item) => item.id));
  for (const match of pairings) {
    await c.env.DB.prepare(
      `INSERT INTO tournament_matches
       (stage, round_number, home_registration_id, away_registration_id)
       VALUES (?, ?, ?, ?)`,
    )
      .bind("league", match.round, match.homeId, match.awayId)
      .run();
  }

  return c.json({ ok: true, tournament: await buildTournamentSummary(c.env) });
});

app.post("/api/admin/users/:id/iep", async (c) => {
  const isAdminRequest = isAdmin(c);
  if (!isAdminRequest) {
    const res = await requireSession(c);
    if (!res.ok || res.user.role !== "teacher") {
      return c.json({ error: "Unauthorized." }, 401);
    }
  }

  const userId = Number(c.req.param("id"));
  const body = await c.req.json();
  const assessmentStatus = String(body.assessmentStatus || "waiting");
  const performanceLevel = Number(body.performanceLevel || 0);

  await c.env.DB.prepare(
    "UPDATE users SET assessment_status = ?, performance_level = ? WHERE id = ?",
  )
    .bind(assessmentStatus, performanceLevel, userId)
    .run();

  return c.json({
    ok: true,
    groups: await buildAdminGroups(c.env),
  });
});

app.post("/api/ai/chat", async (c) => {
  try {
    const body = await c.req.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const session = await getOptionalSession(c);
    if (session?.error) return session.error;

    if (session) {
      const chargeResult = await chargeUserForService(c.env, session.id, "ai_chat");
      if (!chargeResult.ok) {
        return c.json(
          {
            error: chargeResult.error,
            balance: chargeResult.balance,
            charge: chargeResult.charge,
            service: chargeResult.service,
          },
          402,
        );
      }
    }

    const result = await getChatReply(c.env, messages, {
      systemPrompt:
        "You are QOOHI AI, a smart assistant that helps learners with math, coding, career guidance, and clear explanations.",
      temperature: 0.7,
    });

    if (!result.ok) {
      return c.json({ reply: result.error }, 500);
    }

    return c.json({ reply: result.reply });
  } catch (err) {
    console.error(err);
    return c.json({
      reply: "Server error connecting to the AI service.",
    });
  }
});

app.post("/api/ai/resume/generate", async (c) => {
  try {
    const body = await c.req.json();
    const sessionId = String(body.sessionId || "").trim();
    const name = String(body.name || "").trim();
    const location = String(body.location || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const skill = String(body.skill || "").trim();
    const workExperience = String(body.workExperience || "").trim();
    const school = String(body.school || "").trim();
    const areaOfStudy = String(body.areaOfStudy || "").trim();
    const feedback = String(body.feedback || "").trim();
    const session = await getOptionalSession(c);
    if (session?.error) return session.error;

    if (
      !sessionId ||
      !name ||
      !location ||
      !email ||
      !phone ||
      !skill ||
      !workExperience ||
      !school ||
      !areaOfStudy
    ) {
      return c.json(
        {
          error:
            "sessionId, name, location, email, phone, skill, workExperience, school and areaOfStudy are required.",
        },
        400,
      );
    }

    if (session) {
      const chargeResult = await chargeUserForService(c.env, session.id, "resume_generation");
      if (!chargeResult.ok) {
        return c.json(
          {
            error: chargeResult.error,
            balance: chargeResult.balance,
            charge: chargeResult.charge,
            service: chargeResult.service,
          },
          402,
        );
      }
    }

    const resumeText = await generateResumeText(c.env, {
      name,
      location,
      email,
      phone,
      skill,
      workExperience,
      school,
      areaOfStudy,
      feedback,
    });

    return c.json({
      ok: true,
      resume: resumeText,
      filename: buildResumeFilename(name),
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to generate resume." }, 500);
  }
});

app.post("/api/ai/stream", async (c) => {
  const body = await c.req.json();
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const session = await getOptionalSession(c);
  if (session?.error) return session.error;

  if (session) {
    const chargeResult = await chargeUserForService(c.env, session.id, "ai_chat");
    if (!chargeResult.ok) {
      return c.json(
        {
          error: chargeResult.error,
          balance: chargeResult.balance,
          charge: chargeResult.charge,
          service: chargeResult.service,
        },
        402,
      );
    }
  }

  const result = await requestChatCompletion(c.env, messages, {
    systemPrompt: "You are QOOHI AI. Be helpful, clear, and solve problems step by step.",
    temperature: 0.7,
    stream: true,
  });

  if (!result) {
    return c.json({ error: "AI provider not configured." }, 500);
  }

  return new Response(result.response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
});

app.post("/api/admin/tournament/restart", async (c) => {
  await c.env.DB.prepare("DELETE FROM tournament_matches").run();
  await c.env.DB.prepare("DELETE FROM tournament_registrations").run();
  await c.env.DB.prepare(
    "INSERT OR REPLACE INTO tournament_settings (key, value) VALUES ('registration_open', 'false')"
  ).run();

  return c.json({
    ok: true,
    tournament: await buildTournamentSummary(c.env),
  });
});

app.post("/api/finance/save", async (c) => {
  try {
    const body = await c.req.json();
    const date = String(body.date || "").trim();

    if (!date) {
      return c.json({ error: "Date is required" }, 400);
    }

    const normalized = normalizeFinancePayload(body);
    await saveFinanceRecord(c.env, date, normalized);

    return c.json({
      ok: true,
      record: await getFinanceRecord(c.env, date),
    });
  } catch (e) {
    console.error("finance save failed", e);
    return c.json(
      { error: e.message || "Failed to save finance" },
      500
    );
  }
});

app.get("/api/finance/get", async (c) => {
  const date = c.req.query("date");

  if (!date) {
    return c.json({ error: "Date required" }, 400);
  }

  return c.json(await getFinanceRecord(c.env, date));
});

app.get("/api/health", (c) => c.json({ ok: true }));

// ──────────────────────────────────────────────
// BALANCE & PROFILE API
// ──────────────────────────────────────────────

app.get("/api/user/profile", async (c) => {
  const session = await requireSession(c);
  if (!session.ok) return session.response;
  const u = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(session.user.id).first();
  return c.json({
    ok: true,
    user: {
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      whatsapp: u.whatsapp,
      role: u.role,
      balance: u.balance,
      referralCode: u.referral_code,
      referredBy: u.referred_by,
      avatarUrl: u.avatar_url,
    },
  });
});

app.post("/api/user/profile", async (c) => {
  const session = await requireSession(c);
  if (!session.ok) return session.response;
  const body = await c.req.json();
  const current = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(session.user.id)
    .first();

  const nextFullName = String(body.fullName || current?.full_name || "").trim();
  const nextWhatsapp = String(body.whatsapp || current?.whatsapp || "").trim();
  const nextAvatarUrl = body.avatarUrl === undefined
    ? current?.avatar_url || null
    : String(body.avatarUrl || "").trim() || null;

  if (nextFullName) {
    await c.env.DB.prepare(
      "UPDATE users SET full_name = ?, whatsapp = ?, avatar_url = ? WHERE id = ?",
    )
      .bind(nextFullName, nextWhatsapp, nextAvatarUrl, session.user.id)
      .run();
  }

  const u = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(session.user.id).first();
  return c.json({
    ok: true,
    user: {
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      whatsapp: u.whatsapp,
      role: u.role,
      balance: u.balance,
      referralCode: u.referral_code,
      referredBy: u.referred_by,
      avatarUrl: u.avatar_url,
    },
  });
});

app.get("/api/user/balance", async (c) => {
  const session = await requireSession(c);
  if (!session.ok) return session.response;
  const u = await c.env.DB.prepare("SELECT balance, referral_code FROM users WHERE id = ?").bind(session.user.id).first();
  const txns = await c.env.DB.prepare(
    "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50"
  ).bind(session.user.id).all();
  return c.json({ ok: true, balance: u.balance, referralCode: u.referral_code, transactions: txns.results || [] });
});

app.post("/api/user/deduct", async (c) => {
  const session = await requireSession(c);
  if (!session.ok) return session.response;
  const body = await c.req.json();
  const amount = Number(body.amount);
  const description = String(body.description || "Service payment").trim();
  if (!amount || amount <= 0) return c.json({ error: "Invalid amount." }, 400);
  const u = await c.env.DB.prepare("SELECT balance FROM users WHERE id = ?").bind(session.user.id).first();
  if (Number(u.balance) < amount) return c.json({ error: "Insufficient balance." }, 400);
  await c.env.DB.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").bind(amount, session.user.id).run();
  await c.env.DB.prepare(
    "INSERT INTO transactions (user_id, type, amount, description, status) VALUES (?, 'service_payment', ?, ?, 'completed')"
  ).bind(session.user.id, -amount, description).run();
  const updated = await c.env.DB.prepare("SELECT balance FROM users WHERE id = ?").bind(session.user.id).first();
  return c.json({ ok: true, balance: updated.balance });
});
app.post("/api/user/service/use", async (c) => {
  const session = await requireSession(c);
  if (!session.ok) return session.response;
  const body = await c.req.json();
  const serviceKey = String(body.serviceKey || "").trim();
  if (!serviceKey) return c.json({ error: "Service key is required." }, 400);

  const result = await chargeUserForService(c.env, session.user.id, serviceKey);
  if (!result.ok) {
    return c.json(
      {
        error: result.error,
        balance: result.balance,
        charge: result.charge,
        service: result.service,
      },
      402,
    );
  }

  return c.json({
    ok: true,
    balance: result.balance,
    charge: result.charge,
    service: result.service,
  });
});


// ──────────────────────────────────────────────
// DEPOSIT VERIFICATION
// ──────────────────────────────────────────────

app.post("/api/deposit/submit", async (c) => {
  const session = await requireSession(c);
  if (!session.ok) return session.response;
  const body = await c.req.json();
  const amount = Number(body.amount);
  const mpesaRef = String(body.mpesaRef || "").trim();
  const phone = String(body.phone || "").trim();
  if (!amount || amount <= 0) return c.json({ error: "Invalid amount." }, 400);
  if (!mpesaRef) return c.json({ error: "M-Pesa reference is required." }, 400);
  const deposit = await c.env.DB.prepare(
    "INSERT INTO deposits (user_id, amount, mpesa_ref, phone, status) VALUES (?, ?, ?, ?, 'pending')"
  ).bind(session.user.id, amount, mpesaRef, phone).run();
  return c.json({
    ok: true,
    depositId: deposit.meta.last_row_id,
    message: "Deposit submitted for verification. Admin will confirm shortly.",
  });
});

app.get("/api/deposits/mine", async (c) => {
  const session = await requireSession(c);
  if (!session.ok) return session.response;
  const deposits = await c.env.DB.prepare(
    "SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
  ).bind(session.user.id).all();
  return c.json({ ok: true, deposits: deposits.results || [] });
});

// ──────────────────────────────────────────────
// WITHDRAWAL
// ──────────────────────────────────────────────

app.post("/api/withdraw/request", async (c) => {
  const session = await requireSession(c);
  if (!session.ok) return session.response;
  const body = await c.req.json();
  const amount = Number(body.amount);
  const mpesaName = String(body.mpesaName || "").trim();
  const mpesaNumber = String(body.mpesaNumber || "").trim();
  if (!amount || amount <= 0) return c.json({ error: "Invalid amount." }, 400);
  if (!mpesaName || !mpesaNumber) return c.json({ error: "M-Pesa name and number are required." }, 400);
  const u = await c.env.DB.prepare("SELECT balance FROM users WHERE id = ?").bind(session.user.id).first();
  if (Number(u.balance) < amount) return c.json({ error: "Insufficient balance." }, 400);
  // Hold the amount
  await c.env.DB.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").bind(amount, session.user.id).run();
  await c.env.DB.prepare(
    "INSERT INTO transactions (user_id, type, amount, description, status) VALUES (?, 'withdrawal', ?, ?, 'pending')"
  ).bind(session.user.id, -amount, `Withdrawal request to ${mpesaName} (${mpesaNumber})`).run();
  const w = await c.env.DB.prepare(
    "INSERT INTO withdrawals (user_id, amount, mpesa_name, mpesa_number, status) VALUES (?, ?, ?, ?, 'pending')"
  ).bind(session.user.id, amount, mpesaName, mpesaNumber).run();
  return c.json({ ok: true, withdrawalId: w.meta.last_row_id, message: "Withdrawal request submitted." });
});

// ──────────────────────────────────────────────
// REFERRAL
// ──────────────────────────────────────────────

app.post("/api/referral/apply", async (c) => {
  const session = await requireSession(c);
  if (!session.ok) return session.response;
  const body = await c.req.json();
  const code = String(body.code || "").trim().toUpperCase();
  if (!code) return c.json({ error: "Referral code is required." }, 400);
  const referrer = await c.env.DB.prepare("SELECT id FROM users WHERE referral_code = ?").bind(code).first();
  if (!referrer) return c.json({ error: "Invalid referral code." }, 400);
  if (referrer.id === session.user.id) return c.json({ error: "Cannot refer yourself." }, 400);
  const u = await c.env.DB.prepare("SELECT referred_by FROM users WHERE id = ?").bind(session.user.id).first();
  if (u.referred_by) return c.json({ error: "You have already been referred." }, 400);
  // Apply referral: referrer gets 10, new user gets 10
  await c.env.DB.prepare("UPDATE users SET referred_by = ?, balance = balance + 10 WHERE id = ?").bind(referrer.id, session.user.id).run();
  await c.env.DB.prepare("UPDATE users SET balance = balance + 10 WHERE id = ?").bind(referrer.id).run();
  await c.env.DB.prepare(
    "INSERT INTO transactions (user_id, type, amount, description, status) VALUES (?, 'referral_bonus', 10, ?, 'completed')"
  ).bind(session.user.id, "Referral bonus (welcome)").run();
  await c.env.DB.prepare(
    "INSERT INTO transactions (user_id, type, amount, description, status) VALUES (?, 'referral_bonus', 10, ?, 'completed')"
  ).bind(referrer.id, "Referral bonus for referring a friend").run();
  return c.json({ ok: true, message: "Referral applied! You both get KSH 10." });
});

app.get("/api/referral/info", async (c) => {
  const session = await requireSession(c);
  if (!session.ok) return session.response;
  const u = await c.env.DB.prepare("SELECT referral_code, referred_by, balance FROM users WHERE id = ?").bind(session.user.id).first();
  let referredBy = null;
  if (u.referred_by) {
    const r = await c.env.DB.prepare("SELECT full_name FROM users WHERE id = ?").bind(u.referred_by).first();
    referredBy = r?.full_name || null;
  }
  const referrals = await c.env.DB.prepare(
    "SELECT full_name, created_at FROM users WHERE referred_by = ? ORDER BY created_at DESC"
  ).bind(session.user.id).all();
  return c.json({ ok: true, referralCode: u.referral_code, referredBy, balance: u.balance, referrals: referrals.results || [] });
});

// ──────────────────────────────────────────────
// ADMIN BALANCE CONTROL
// ──────────────────────────────────────────────

app.post("/api/admin/balance/update", async (c) => {
  if (!isAdmin(c)) return c.json({ error: "Unauthorized." }, 401);
  const body = await c.req.json();
  const userId = Number(body.userId);
  const amount = Number(body.amount);
  const reason = String(body.reason || "Admin adjustment").trim();
  if (!userId || !amount) return c.json({ error: "User ID and amount are required." }, 400);
  await c.env.DB.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").bind(amount, userId).run();
  await c.env.DB.prepare(
    "INSERT INTO transactions (user_id, type, amount, description, status) VALUES (?, 'admin_adjustment', ?, ?, 'completed')"
  ).bind(userId, amount, reason).run();
  const u = await c.env.DB.prepare("SELECT id, full_name, email, balance FROM users WHERE id = ?").bind(userId).first();
  return c.json({ ok: true, user: u });
});

app.get("/api/admin/users/all", async (c) => {
  if (!isAdmin(c)) return c.json({ error: "Unauthorized." }, 401);
  const users = await c.env.DB.prepare(
    "SELECT id, full_name, email, whatsapp, role, balance, referral_code, avatar_url, created_at FROM users ORDER BY full_name ASC"
  ).all();
  return c.json({ ok: true, users: users.results || [] });
});

app.get("/api/admin/deposits", async (c) => {
  if (!isAdmin(c)) return c.json({ error: "Unauthorized." }, 401);
  const deposits = await c.env.DB.prepare(
    `SELECT deposits.*, users.full_name, users.email FROM deposits
     JOIN users ON users.id = deposits.user_id
     ORDER BY deposits.created_at DESC`
  ).all();
  return c.json({ ok: true, deposits: deposits.results || [] });
});

app.post("/api/admin/deposits/:id/verify", async (c) => {
  if (!isAdmin(c)) return c.json({ error: "Unauthorized." }, 401);
  const depositId = Number(c.req.param("id"));
  const body = await c.req.json();
  const status = body.status === "verified" ? "verified" : "rejected";
  const deposit = await c.env.DB.prepare("SELECT * FROM deposits WHERE id = ?").bind(depositId).first();
  if (!deposit) return c.json({ error: "Deposit not found." }, 404);
  if (status === "verified") {
    await c.env.DB.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").bind(deposit.amount, deposit.user_id).run();
    await c.env.DB.prepare(
      "INSERT INTO transactions (user_id, type, amount, description, status) VALUES (?, 'deposit', ?, 'Deposit verified', 'completed')"
    ).bind(deposit.user_id, deposit.amount).run();
  }
  await c.env.DB.prepare(
    "UPDATE deposits SET status = ?, admin_note = ?, verified_at = ? WHERE id = ?"
  ).bind(status, body.note || null, new Date().toISOString(), depositId).run();
  return c.json({ ok: true });
});

app.get("/api/admin/withdrawals", async (c) => {
  if (!isAdmin(c)) return c.json({ error: "Unauthorized." }, 401);
  const withdrawals = await c.env.DB.prepare(
    `SELECT withdrawals.*, users.full_name, users.email FROM withdrawals
     JOIN users ON users.id = withdrawals.user_id
     ORDER BY withdrawals.created_at DESC`
  ).all();
  return c.json({ ok: true, withdrawals: withdrawals.results || [] });
});

app.post("/api/admin/withdrawals/:id/process", async (c) => {
  if (!isAdmin(c)) return c.json({ error: "Unauthorized." }, 401);
  const withdrawalId = Number(c.req.param("id"));
  const body = await c.req.json();
  const status = body.status === "processed" ? "processed" : "rejected";
  const w = await c.env.DB.prepare("SELECT * FROM withdrawals WHERE id = ?").bind(withdrawalId).first();
  if (!w) return c.json({ error: "Withdrawal not found." }, 404);
  if (status === "rejected") {
    await c.env.DB.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").bind(w.amount, w.user_id).run();
    await c.env.DB.prepare(
      "INSERT INTO transactions (user_id, type, amount, description, status) VALUES (?, 'withdrawal', ?, 'Withdrawal rejected - refund', 'completed')"
    ).bind(w.user_id, w.amount).run();
  }
  await c.env.DB.prepare(
    "UPDATE withdrawals SET status = ?, admin_note = ?, processed_at = ? WHERE id = ?"
  ).bind(status, body.note || null, new Date().toISOString(), withdrawalId).run();
  return c.json({ ok: true });
});

// Helper functions
async function requireSession(c) {
  const authHeader = c.req.header("Authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return { ok: false, response: c.json({ error: "Unauthorized." }, 401) };
  }

  const session = await c.env.DB.prepare(
    `SELECT sessions.*, users.id as user_id, users.full_name, users.email, users.whatsapp, users.role
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE token = ?
     ORDER BY created_at DESC
     LIMIT 1`,
  )
    .bind(token)
    .first();

  if (!session || new Date(session.expires_at).getTime() < Date.now()) {
    return { ok: false, response: c.json({ error: "Session expired." }, 401) };
  }

  return {
    ok: true,
    user: {
      id: session.user_id,
      fullName: session.full_name,
      email: session.email,
      whatsapp: session.whatsapp,
      role: session.role,
    },
  };
}

function isAdmin(c) {
  const provided = c.req.header("x-admin-key") || "";
  return Boolean(c.env.ADMIN_ACCESS_KEY) && provided === c.env.ADMIN_ACCESS_KEY;
}

async function buildStudentDashboard(env, userId) {
  const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(userId)
    .first();
  const enrollments = await env.DB.prepare(
    "SELECT * FROM enrollments WHERE user_id = ? ORDER BY created_at DESC",
  )
    .bind(userId)
    .all();
  const tournamentRegistration = await env.DB.prepare(
    "SELECT * FROM tournament_registrations WHERE user_id = ?",
  )
    .bind(userId)
    .first();
  const messages = await env.DB.prepare(
    `SELECT * FROM admin_messages
     WHERE user_id = ?
     ORDER BY created_at DESC`,
  )
    .bind(userId)
    .all();
  const transactions = await env.DB.prepare(
    `SELECT * FROM transactions
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 20`,
  )
    .bind(userId)
    .all();
  const deposits = await env.DB.prepare(
    `SELECT * FROM deposits
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 10`,
  )
    .bind(userId)
    .all();
  const withdrawals = await env.DB.prepare(
    `SELECT * FROM withdrawals
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 10`,
  )
    .bind(userId)
    .all();

  return {
    student: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      whatsapp: user.whatsapp,
      role: user.role,
      assessmentStatus: user.assessment_status,
      performanceLevel: user.performance_level,
      balance: user.balance,
      referralCode: user.referral_code,
      avatarUrl: user.avatar_url,
    },
    enrollments: (enrollments.results || []).map((item) => ({
      ...item,
      courses: COURSE_PACKAGES[item.package_key]?.courses || [],
    })),
    messages: (messages.results || []).map((item) => ({
      ...item,
      pdfLinks: safeJsonParse(item.pdf_links_json, []),
    })),
    recentTransactions: transactions.results || [],
    deposits: deposits.results || [],
    withdrawals: withdrawals.results || [],
    serviceCharges: await getServiceCharges(env),
    tournamentRegistration,
    tournament: tournamentRegistration ? await buildTournamentSummary(env) : null,
  };
}

async function buildAdminGroups(env) {
  const packages = [];
  for (const key of ["computer_packages", "coding_ai_training", "both"]) {
    const result = await env.DB.prepare(
      `SELECT id, full_name, email, whatsapp, created_at, role, assessment_status, performance_level, balance, avatar_url
       FROM users
       WHERE id IN (SELECT user_id FROM enrollments WHERE package_key = ?)
       ORDER BY full_name ASC`,
    )
      .bind(key)
      .all();
    packages.push({
      ...GROUP_META[key],
      members: result.results || [],
      count: (result.results || []).length,
    });
  }

  const tournamentMembers = await env.DB.prepare(
    `SELECT users.id, users.full_name, users.email, users.whatsapp, users.created_at,
            users.role, users.assessment_status, users.performance_level,
            users.balance, users.avatar_url,
            tournament_registrations.id as registration_id
     FROM users
     JOIN tournament_registrations ON tournament_registrations.user_id = users.id
     ORDER BY users.full_name ASC`,
  ).all();

  packages.push({
    ...GROUP_META.tournament,
    members: tournamentMembers.results || [],
    count: (tournamentMembers.results || []).length,
  });

  for (const role of ["teacher", "parent", "iep"]) {
    const result = await env.DB.prepare(
      `SELECT id, full_name, email, whatsapp, created_at, role, assessment_status, performance_level, balance, avatar_url
       FROM users
       WHERE role = ?
       ORDER BY full_name ASC`,
    )
      .bind(role)
      .all();
    packages.push({
      ...GROUP_META[role],
      members: result.results || [],
      count: (result.results || []).length,
    });
  }

  return packages;
}

async function getRecipientsForGroup(env, groupKey) {
  if (groupKey === "tournament") {
    const rows = await env.DB.prepare(
      `SELECT users.id, users.full_name, users.email
       FROM users
       JOIN tournament_registrations ON tournament_registrations.user_id = users.id
       ORDER BY users.full_name ASC`,
    ).all();
    return rows.results || [];
  }

  if (["teacher", "parent", "iep"].includes(groupKey)) {
    const rows = await env.DB.prepare(
      `SELECT id, full_name, email FROM users WHERE role = ? ORDER BY full_name ASC`,
    )
      .bind(groupKey)
      .all();
    return rows.results || [];
  }

  const rows = await env.DB.prepare(
    `SELECT users.id, users.full_name, users.email
     FROM users
     JOIN enrollments ON enrollments.user_id = users.id
     WHERE enrollments.package_key = ?
     ORDER BY users.full_name ASC`,
  )
    .bind(groupKey)
    .all();

  return rows.results || [];
}

async function getRecipientForUser(env, userId) {
  const row = await env.DB.prepare(
    "SELECT id, full_name, email FROM users WHERE id = ?",
  )
    .bind(userId)
    .first();
  return row ? [row] : [];
}

async function buildTournamentSummary(env) {
  const registrations = await env.DB.prepare(
    `SELECT tournament_registrations.id, tournament_registrations.status,
            tournament_registrations.created_at, users.full_name, users.email
     FROM tournament_registrations
     JOIN users ON users.id = tournament_registrations.user_id
     ORDER BY tournament_registrations.created_at ASC`,
  ).all();

  const matches = await env.DB.prepare(
    `SELECT tournament_matches.*,
            home.full_name as home_name,
            away.full_name as away_name
     FROM tournament_matches
     JOIN (
       SELECT tournament_registrations.id, users.full_name
       FROM tournament_registrations
       JOIN users ON users.id = tournament_registrations.user_id
     ) home ON home.id = tournament_matches.home_registration_id
     JOIN (
       SELECT tournament_registrations.id, users.full_name
       FROM tournament_registrations
       JOIN users ON users.id = tournament_registrations.user_id
     ) away ON away.id = tournament_matches.away_registration_id
     ORDER BY stage ASC, round_number ASC, id ASC`,
  ).all();

  const standings = computeStandings(
    registrations.results || [],
    matches.results || [],
  );

  return {
    info: TOURNAMENT,
    registered: registrations.results || [],
    matches: matches.results || [],
    standings,
    qualification: {
      directQuarterFinals: standings.slice(0, 2),
      knockoutPlayoffs:
        standings.length >= 6
          ? [
              { label: "3rd vs 6th", home: standings[2], away: standings[5] },
              { label: "4th vs 5th", home: standings[3], away: standings[4] },
            ]
          : [],
    },
  };
}

function computeStandings(registrations, matches) {
  const table = new Map();

  registrations.forEach((player) => {
    table.set(player.id, {
      registrationId: player.id,
      name: player.full_name,
      email: player.email,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  });

  matches.forEach((match) => {
    if (
      !Number.isInteger(match.home_score) ||
      !Number.isInteger(match.away_score)
    ) {
      return;
    }
    const home = table.get(match.home_registration_id);
    const away = table.get(match.away_registration_id);
    if (!home || !away) {
      return;
    }
    home.played += 1;
    away.played += 1;
    home.goalsFor += match.home_score;
    home.goalsAgainst += match.away_score;
    away.goalsFor += match.away_score;
    away.goalsAgainst += match.home_score;
    if (match.home_score > match.away_score) {
      home.wins += 1;
      away.losses += 1;
      home.points += 3;
    } else if (match.home_score < match.away_score) {
      away.wins += 1;
      home.losses += 1;
      away.points += 3;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  });

  return Array.from(table.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.name.localeCompare(b.name);
  });
}

async function ensureTournamentSchedule(env) {
  const registrationRows = await env.DB.prepare(
    "SELECT id FROM tournament_registrations ORDER BY created_at ASC",
  ).all();
  const registrations = registrationRows.results || [];
  if (registrations.length !== TOURNAMENT.capacity) {
    return;
  }

  const existingMatches = await env.DB.prepare(
    "SELECT COUNT(*) as total FROM tournament_matches",
  ).first();
  if (Number(existingMatches?.total || 0) > 0) {
    return;
  }

  const pairings = buildRoundRobinPairs(
    registrations.map((item) => item.id),
  );
  for (const match of pairings) {
    await env.DB.prepare(
      `INSERT INTO tournament_matches
       (stage, round_number, home_registration_id, away_registration_id)
       VALUES (?, ?, ?, ?)`,
    )
      .bind("league", match.round, match.homeId, match.awayId)
      .run();
  }
}

function buildRoundRobinPairs(playerIds) {
  const ids = [...playerIds];
  const rounds = [];
  if (ids.length % 2 !== 0) {
    ids.push(null);
  }
  const fixed = ids[0];
  let rotating = ids.slice(1);

  for (let round = 1; round <= ids.length - 1; round += 1) {
    const roundIds = [fixed, ...rotating];
    for (let i = 0; i < roundIds.length / 2; i += 1) {
      const homeId = roundIds[i];
      const awayId = roundIds[roundIds.length - 1 - i];
      if (homeId && awayId) {
        rounds.push({ round, homeId, awayId });
      }
    }
    rotating = [
      rotating[rotating.length - 1],
      ...rotating.slice(0, rotating.length - 1),
    ];
  }

  return rounds;
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function getOptionalSession(c) {
  const authHeader = c.req.header("Authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return null;
  }

  const session = await c.env.DB.prepare(
    `SELECT sessions.*, users.id as user_id, users.full_name, users.email, users.whatsapp, users.role
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE token = ?
     ORDER BY created_at DESC
     LIMIT 1`,
  )
    .bind(token)
    .first();

  if (!session || new Date(session.expires_at).getTime() < Date.now()) {
    return {
      error: c.json({ error: "Session expired." }, 401),
    };
  }

  return {
    id: session.user_id,
    fullName: session.full_name,
    email: session.email,
    whatsapp: session.whatsapp,
    role: session.role,
  };
}

async function getServiceCharges(env) {
  const rows = await env.DB.prepare(
    `SELECT service_key, label, description, charge_ksh, active, sort_order, updated_at
     FROM service_charges
     ORDER BY sort_order ASC, label ASC`,
  ).all();

  return rows.results || [];
}

async function getServiceCharge(env, serviceKey) {
  const charge = await env.DB.prepare(
    `SELECT service_key, label, description, charge_ksh, active, sort_order, updated_at
     FROM service_charges
     WHERE service_key = ?`,
  )
    .bind(serviceKey)
    .first();
  return charge || null;
}

async function chargeUserForService(env, userId, serviceKey) {
  const charge = await getServiceCharge(env, serviceKey);
  if (!charge) {
    return { ok: true, charge: 0, balance: null, service: null };
  }

  if (Number(charge.active || 0) !== 1) {
    return { ok: true, charge: 0, balance: null, service: charge };
  }

  const amount = Number(charge.charge_ksh || 0);
  if (amount <= 0) {
    return { ok: true, charge: 0, balance: null, service: charge };
  }

  const user = await env.DB.prepare("SELECT balance FROM users WHERE id = ?")
    .bind(userId)
    .first();
  const currentBalance = Number(user?.balance || 0);
  if (currentBalance < amount) {
    return {
      ok: false,
      error: "Insufficient balance. Please deposit funds to continue.",
      balance: currentBalance,
      charge: amount,
      service: charge,
    };
  }

  await env.DB.prepare("UPDATE users SET balance = balance - ? WHERE id = ?")
    .bind(amount, userId)
    .run();
  await env.DB.prepare(
    "INSERT INTO transactions (user_id, type, amount, description, status) VALUES (?, 'service_payment', ?, ?, 'completed')",
  )
    .bind(
      userId,
      -amount,
      `Service charge: ${charge.label || serviceKey}`,
    )
    .run();

  const updated = await env.DB.prepare("SELECT balance FROM users WHERE id = ?")
    .bind(userId)
    .first();

  return {
    ok: true,
    charge: amount,
    balance: Number(updated?.balance || 0),
    service: charge,
  };
}

function safeJsonParse(value, fallback = {}) {
  try {
    return JSON.parse(value || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function normalizeFinancePayload(body) {
  const rawValues =
    body.values && typeof body.values === "object" && !Array.isArray(body.values)
      ? body.values
      : body;
  const values = {};
  DEFAULT_FINANCE_COLUMNS.forEach((column) => {
    values[column] = String(rawValues[column] ?? "");
  });

  return { columns: [...DEFAULT_FINANCE_COLUMNS], values };
}

async function getFinanceRecord(env, date) {
  await ensureFinanceTable(env);

  try {
    const legacyRow = await env.DB.prepare("SELECT * FROM finance WHERE date = ?")
      .bind(date)
      .first();
    if (legacyRow) {
      const values = {};
      DEFAULT_FINANCE_COLUMNS.forEach((column) => {
        values[column] = legacyRow[column] == null ? "" : String(legacyRow[column]);
      });
      return {
        date,
        columns: [...DEFAULT_FINANCE_COLUMNS],
        values,
        updatedAt: legacyRow.updated_at || null,
      };
    }
  } catch {
    // Table may not exist yet in older deployments
  }

  const values = {};
  DEFAULT_FINANCE_COLUMNS.forEach((column) => {
    values[column] = "";
  });

  return {
    date,
    columns: [...DEFAULT_FINANCE_COLUMNS],
    values,
    updatedAt: null,
  };
}

async function saveFinanceRecord(env, date, normalized) {
  await ensureFinanceTable(env);

  const values = normalized.values;
  const boundValues = [
    date,
    values.mpesa ?? "",
    values.cash ?? "",
    values.tv1 ?? "",
    values.tv2 ?? "",
    values.tv3 ?? "",
    values.tv4 ?? "",
    values.cyber ?? "",
    values.token ?? "",
    values.movies ?? "",
    values.total ?? "",
  ];

  try {
    const updated = await env.DB.prepare(
      `UPDATE finance SET
         mpesa = ?,
         cash = ?,
         tv1 = ?,
         tv2 = ?,
         tv3 = ?,
         tv4 = ?,
         cyber = ?,
         token = ?,
         movies = ?,
         total = ?,
         updated_at = ?
       WHERE date = ?`,
    )
      .bind(
        values.mpesa ?? "",
        values.cash ?? "",
        values.tv1 ?? "",
        values.tv2 ?? "",
        values.tv3 ?? "",
        values.tv4 ?? "",
        values.cyber ?? "",
        values.token ?? "",
        values.movies ?? "",
        values.total ?? "",
        new Date().toISOString(),
        date
      )
      .run();

    if (Number(updated.meta?.changes || 0) > 0) {
      return;
    }

    await env.DB.prepare(
      `INSERT INTO finance
       (date, mpesa, cash, tv1, tv2, tv3, tv4, cyber, token, movies, total, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        date,
        values.mpesa ?? "",
        values.cash ?? "",
        values.tv1 ?? "",
        values.tv2 ?? "",
        values.tv3 ?? "",
        values.tv4 ?? "",
        values.cyber ?? "",
        values.token ?? "",
        values.movies ?? "",
        values.total ?? "",
        new Date().toISOString()
      )
      .run();
    return;
  } catch (error) {
    if (!String(error?.message || "").includes("updated_at")) {
      throw error;
    }
  }

  const updatedLegacy = await env.DB.prepare(
    `UPDATE finance SET
       mpesa = ?,
       cash = ?,
       tv1 = ?,
       tv2 = ?,
       tv3 = ?,
       tv4 = ?,
       cyber = ?,
       token = ?,
       movies = ?,
       total = ?
     WHERE date = ?`,
  )
    .bind(...boundValues)
    .run();

  if (Number(updatedLegacy.meta?.changes || 0) > 0) {
    return;
  }

  await env.DB.prepare(
    `INSERT INTO finance
     (date, mpesa, cash, tv1, tv2, tv3, tv4, cyber, token, movies, total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(...boundValues)
    .run();
}

async function ensureFinanceTable(env) {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS finance (
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
    )`,
  ).run();
}

function normalizeChatMessages(messages, defaultSystemPrompt) {
  const normalized = Array.isArray(messages)
    ? messages
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          role: String(item.role || "user"),
          content: String(item.content || ""),
        }))
    : [];

  if (defaultSystemPrompt && !normalized.some((message) => message.role === "system")) {
    normalized.unshift({ role: "system", content: defaultSystemPrompt });
  }

  return normalized;
}

async function requestChatCompletion(env, messages, { systemPrompt, temperature = 0.7, stream = false } = {}) {
  const finalMessages = normalizeChatMessages(messages, systemPrompt);
  const body = {
    messages: finalMessages,
    temperature,
  };

  if (stream) {
    body.stream = true;
  }

  if (env.OPENAI_API_KEY) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || "gpt-4o-mini",
        ...body,
      }),
    });

    return { provider: "openai", response };
  }

  if (env.GROQ_API_KEY) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        ...body,
      }),
    });

    return { provider: "groq", response };
  }

  return null;
}

async function getChatReply(env, messages, options = {}) {
  const result = await requestChatCompletion(env, messages, options);
  if (!result) {
    return {
      ok: false,
      error: "AI provider not configured.",
    };
  }

  const data = await result.response.json().catch(() => ({}));
  const reply = data?.choices?.[0]?.message?.content?.trim();

  if (!result.response.ok || !reply) {
    return {
      ok: false,
      error: "AI did not return a response. Check API key or model.",
    };
  }

  return {
    ok: true,
    reply,
    provider: result.provider,
  };
}

async function generateResumeText(env, resumeData) {
  const prompt = buildResumePrompt(resumeData);

  if (!env.OPENAI_API_KEY) {
    return buildFallbackResume(resumeData);
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You write polished professional resumes. Improve wording, structure, and bullet quality while staying truthful to the candidate details. Return plain text only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();
  const resumeText = data?.choices?.[0]?.message?.content?.trim();

  if (!response.ok || !resumeText) {
    console.error("OpenAI resume generation failed", JSON.stringify(data));
    return buildFallbackResume(resumeData);
  }

  return resumeText;
}

function buildResumePrompt({
  name,
  location,
  email,
  phone,
  skill,
  workExperience,
  school,
  areaOfStudy,
  feedback,
}) {
  return [
    "Create a professional resume using the exact section order and style pattern below.",
    "Start with the candidate name on the first line.",
    "Second line must be: Location | Email | Phone.",
    "Then include these uppercase section titles in this order:",
    "SUMMARY",
    "EDUCATION",
    "PROFESSIONAL EXPERIENCE",
    "TECHNICAL SKILLS",
    "Write a strong professional summary from the supplied details.",
    "Rewrite the user's skill and work experience into polished resume language and bullet points.",
    "Do not simply repeat the user's raw wording.",
    "If feedback is provided, revise the whole resume according to the feedback while keeping it professional and fully formatted.",
    "Return plain text only. No markdown. No code fences.",
    "",
    `Name: ${name}`,
    `Location: ${location}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Main skill: ${skill}`,
    `Work experience details: ${workExperience}`,
    `School: ${school}`,
    `Area of study: ${areaOfStudy}`,
    feedback ? `Revision request: ${feedback}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildFallbackResume({
  name,
  location,
  email,
  phone,
  skill,
  workExperience,
  school,
  areaOfStudy,
  feedback,
}) {
  const sections = [
    name.toUpperCase(),
    "",
    `${location} | ${email} | ${phone}`,
    "",
    "SUMMARY",
    `${name} is a motivated professional with strengths in ${skill.toLowerCase()} and a growing background in delivering reliable, high-quality work. Brings practical capability, adaptability, and a strong commitment to professional standards.`,
    "",
    "EDUCATION",
    school,
    areaOfStudy,
    "",
    "PROFESSIONAL EXPERIENCE",
    `• Applied ${skill.toLowerCase()} skills in practical environments and delivered assigned responsibilities with consistency and professionalism.`,
    `• ${workExperience}`,
    `• Worked collaboratively, communicated effectively, and maintained focus on quality results.`,
    "",
    "TECHNICAL SKILLS",
    `• ${skill}`,
    "• Communication",
    "• Teamwork",
    "• Time management",
    "• Problem solving",
    "",
    "REFERENCES",
    "Available on request.",
  ];

  if (feedback) {
    sections.push("", "REVISION REQUEST APPLIED", feedback);
  }

  return sections.join("\n");
}

function buildResumeFilename(name) {
  const normalized = String(name || "resume")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${normalized || "resume"}-qoohi-resume.doc`;
}

function buildAdminEmailLines(name, message, pdfLinks) {
  const lines = [`Hello ${name},`, "", message];
  if (pdfLinks.length > 0) {
    lines.push("", "PDF links:");
    pdfLinks.forEach((link, index) => {
      lines.push(`${index + 1}. ${link}`);
    });
  }
  lines.push("", "QOOHI");
  return lines;
}

async function sendMail(env, { to, subject, bodyLines }) {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM) {
    console.log("SMTP Config missing, skipping email. OTP/Body preview:", bodyLines[2] || bodyLines[0]);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: env.SMTP_PORT === '465',
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"QOOHI" <${env.SMTP_FROM}>`,
      to,
      subject,
      text: bodyLines.join('\n'),
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

// Serve static files from the React app
app.use('/*', serveStatic({ root: './dist' }));

const port = process.env.PORT || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
});
