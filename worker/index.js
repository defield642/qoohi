import { connect } from "cloudflare:sockets";
import { Hono } from "hono";
import { cors } from "hono/cors";

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
    name: "Computer Packages and Coding + AI Training",
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

const TOURNAMENT = {
  title: "FC 26 Tournament",
  slug: "fc-26-tournament",
  capacity: 10,
  feeKsh: 200,
  winnerPrizeKsh: 500,
};

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: (origin, c) => origin || c.env.APP_URL || "*",
    allowHeaders: ["Content-Type", "Authorization", "x-admin-key"],
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

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
  const mode = body.mode === "login" ? "login" : "register";
  const email = normalizeEmail(body.email);
  const fullName = (body.fullName || "").trim();
  const whatsapp = (body.whatsapp || "").trim();
  const registrationType = String(body.registrationType || "").trim();
  const selectedPackage = body.selectedPackage || "";

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

    if (registrationType === "course" && !COURSE_PACKAGES[selectedPackage]) {
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
    const existingUser = await c.env.DB.prepare(
      "SELECT id FROM users WHERE email = ?1",
    )
      .bind(email)
      .first();
    if (!existingUser) {
      return c.json({ error: "No account found for that email." }, 404);
    }
  }

  const code = generateCode();
  const metadata = JSON.stringify({
    mode,
    registrationType,
    selectedPackage,
    fullName,
    whatsapp,
  });
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await c.env.DB.prepare(
    `INSERT INTO auth_codes (email, code, purpose, metadata_json, expires_at)
     VALUES (?1, ?2, ?3, ?4, ?5)`,
  )
    .bind(email, code, mode, metadata, expiresAt)
    .run();

  await sendOtpEmail(c.env, {
    to: email,
    fullName: fullName || "QOOHI Student",
    code,
    mode,
    registrationType,
    selectedPackage,
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
     WHERE email = ?1 AND code = ?2 AND purpose = ?3 AND consumed_at IS NULL
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
    "UPDATE auth_codes SET consumed_at = ?1 WHERE id = ?2",
  )
    .bind(new Date().toISOString(), codeRow.id)
    .run();

  const metadata = safeJsonParse(codeRow.metadata_json);
  let user =
    (await c.env.DB.prepare("SELECT * FROM users WHERE email = ?1")
      .bind(email)
      .first()) || null;

  if (mode === "register") {
    const role = (metadata.registrationType === "teacher" || metadata.registrationType === "parent" || metadata.registrationType === "iep")
      ? metadata.registrationType
      : "student";

    if (!user) {
      const inserted = await c.env.DB.prepare(
        "INSERT INTO users (full_name, whatsapp, email, role) VALUES (?1, ?2, ?3, ?4)",
      )
        .bind(metadata.fullName, metadata.whatsapp, email, role)
        .run();
      user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?1")
        .bind(inserted.meta.last_row_id)
        .first();
    } else {
      await c.env.DB.prepare(
        "UPDATE users SET full_name = ?1, whatsapp = ?2, role = ?3 WHERE id = ?4",
      )
        .bind(metadata.fullName, metadata.whatsapp, role, user.id)
        .run();
      user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?1")
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
         VALUES (?1, ?2, ?3, ?4)`,
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
         VALUES (?1, ?2)`,
      )
        .bind(user.id, TOURNAMENT.feeKsh)
        .run();
      }
      }

      const token = Math.random().toString(36).substring(2);
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  await c.env.DB.prepare(
    "INSERT INTO sessions (user_id, token, expires_at) VALUES (?1, ?2, ?3)",
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

app.get("/api/admin/overview", async (c) => {
  if (!isAdmin(c)) {
    return c.json({ error: "Unauthorized." }, 401);
  }

  const students = await c.env.DB.prepare(
    `SELECT users.id, users.full_name, users.whatsapp, users.email, users.created_at,
            enrollments.package_name, enrollments.price_ksh
     FROM users
     LEFT JOIN enrollments ON enrollments.user_id = users.id
     ORDER BY users.created_at DESC`,
  ).all();

  const materials = await c.env.DB.prepare(
    "SELECT * FROM materials ORDER BY created_at DESC",
  ).all();

  const tournament = await buildTournamentSummary(c.env);

  return c.json({
    ok: true,
    packages: Object.values(COURSE_PACKAGES),
    students: students.results || [],
    materials: materials.results || [],
    tournament,
  });
});

app.post("/api/admin/materials", async (c) => {
  if (!isAdmin(c)) {
    return c.json({ error: "Unauthorized." }, 401);
  }

  const body = await c.req.json();
  const courseKey = body.courseKey;
  const topic = String(body.topic || "").trim();
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const fileUrl = String(body.fileUrl || "").trim();

  if (!courseKey || !topic || !title || !fileUrl) {
    return c.json({ error: "Course, topic, title and file URL are required." }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO materials (course_key, topic, title, description, file_url)
     VALUES (?1, ?2, ?3, ?4, ?5)`,
  )
    .bind(courseKey, topic, title, description, fileUrl)
    .run();

  return c.json({ ok: true });
});

app.post("/api/admin/tournament/matches/:id", async (c) => {
  if (!isAdmin(c)) {
    return c.json({ error: "Unauthorized." }, 401);
  }

  const matchId = Number(c.req.param("id"));
  const body = await c.req.json();
  const homeScore = Number(body.homeScore);
  const awayScore = Number(body.awayScore);

  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore)) {
    return c.json({ error: "Scores must be whole numbers." }, 400);
  }

  await c.env.DB.prepare(
    `UPDATE tournament_matches
     SET home_score = ?1, away_score = ?2, updated_at = ?3
     WHERE id = ?4`,
  )
    .bind(homeScore, awayScore, new Date().toISOString(), matchId)
    .run();

  return c.json({
    ok: true,
    tournament: await buildTournamentSummary(c.env),
  });
});

app.get("/api/health", (c) => c.json({ ok: true }));

export default app;

async function requireSession(c) {
  const authHeader = c.req.header("Authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return { ok: false, response: c.json({ error: "Unauthorized." }, 401) };
  }

  const session = await c.env.DB.prepare(
    `SELECT sessions.*, users.id as user_id, users.full_name, users.email, users.whatsapp
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE token = ?1
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
    },
  };
}

function isAdmin(c) {
  const provided = c.req.header("x-admin-key") || "";
  return Boolean(c.env.ADMIN_ACCESS_KEY) && provided === c.env.ADMIN_ACCESS_KEY;
}

async function buildStudentDashboard(env, userId) {
  const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?1")
    .bind(userId)
    .first();
  const enrollments = await env.DB.prepare(
    "SELECT * FROM enrollments WHERE user_id = ?1 ORDER BY created_at DESC",
  )
    .bind(userId)
    .all();
  const tournamentRegistration = await env.DB.prepare(
    "SELECT * FROM tournament_registrations WHERE user_id = ?1",
  )
    .bind(userId)
    .first();

  const packageKeys = (enrollments.results || []).map((item) => item.package_key);
  const courseKeys = new Set();
  packageKeys.forEach((key) => {
    const pkg = COURSE_PACKAGES[key];
    if (pkg) {
      pkg.courses.forEach((course) => courseKeys.add(normalizeCourseKey(course)));
    }
  });

  const materials = [];
  for (const courseKey of courseKeys) {
    const rows = await env.DB.prepare(
      "SELECT * FROM materials WHERE course_key = ?1 ORDER BY created_at DESC",
    )
      .bind(courseKey)
      .all();
    materials.push(...(rows.results || []));
  }

  return {
    student: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      whatsapp: user.whatsapp,
    },
    enrollments: (enrollments.results || []).map((item) => ({
      ...item,
      courses: COURSE_PACKAGES[item.package_key]?.courses || [],
    })),
    materials,
    tournamentRegistration,
    tournament: tournamentRegistration ? await buildTournamentSummary(env) : null,
  };
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

  const standings = computeStandings(registrations.results || [], matches.results || []);

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
    if (!Number.isInteger(match.home_score) || !Number.isInteger(match.away_score)) {
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
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
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

  const pairings = buildRoundRobinPairs(registrations.map((item) => item.id));
  for (const match of pairings) {
    await env.DB.prepare(
      `INSERT INTO tournament_matches
       (stage, round_number, home_registration_id, away_registration_id)
       VALUES (?1, ?2, ?3, ?4)`,
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

function safeJsonParse(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

function normalizeCourseKey(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function sendOtpEmail(env, payload) {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM) {
    console.log(
      JSON.stringify({
        type: "otp-preview",
        to: payload.to,
        code: payload.code,
      }),
    );
    return;
  }

  const socket = connect(
    {
      hostname: env.SMTP_HOST,
      port: Number(env.SMTP_PORT || 465),
    },
    {
      secureTransport:
        env.SMTP_SECURE === "starttls" ? "starttls" : env.SMTP_SECURE === "off" ? "off" : "on",
    },
  );

  let activeSocket = socket;
  let reader = activeSocket.readable.getReader();
  let writer = activeSocket.writable.getWriter();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const readResponse = async () => {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\r\n").filter(Boolean);
      if (lines.length > 0 && /^\d{3} /.test(lines[lines.length - 1])) {
        buffer = "";
        return lines;
      }
    }
    return [];
  };

  const send = async (line) => {
    await writer.write(encoder.encode(`${line}\r\n`));
    return readResponse();
  };

  const expectOk = (lines, command) => {
    const last = lines[lines.length - 1] || "";
    if (!/^[23]/.test(last)) {
      throw new Error(`SMTP ${command} failed: ${last}`);
    }
  };

  try {
    expectOk(await readResponse(), "greeting");
    expectOk(await send("EHLO qoohi.app"), "EHLO");

    if (env.SMTP_SECURE === "starttls") {
      expectOk(await send("STARTTLS"), "STARTTLS");
      writer.releaseLock();
      reader.releaseLock();
      activeSocket = activeSocket.startTls();
      reader = activeSocket.readable.getReader();
      writer = activeSocket.writable.getWriter();
      expectOk(await send("EHLO qoohi.app"), "EHLO TLS");
    }

    expectOk(await send("AUTH LOGIN"), "AUTH LOGIN");
    expectOk(await send(btoa(env.SMTP_USER)), "AUTH USER");
    expectOk(await send(btoa(env.SMTP_PASS)), "AUTH PASS");
    expectOk(await send(`MAIL FROM:<${env.SMTP_FROM}>`), "MAIL FROM");
    expectOk(await send(`RCPT TO:<${payload.to}>`), "RCPT TO");
    expectOk(await send("DATA"), "DATA");

    const subject =
      payload.mode === "login"
        ? "Your QOOHI login code"
        : "Complete your QOOHI registration";

    const packageName =
      payload.registrationType === "tournament"
        ? TOURNAMENT.title
        : payload.registrationType === "teacher"
        ? "Teacher Portal"
        : payload.registrationType === "parent"
        ? "Parent Portal"
        : payload.registrationType === "iep"
        ? "IEP Assessment"
        : COURSE_PACKAGES[payload.selectedPackage]?.name || "QOOHI Training";

    const message = [
      `From: QOOHI <${env.SMTP_FROM}>`,
      `To: <${payload.to}>`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "",
      `Hello ${payload.fullName},`,
      "",
      `Your QOOHI verification code is: ${payload.code}`,
      "",
      `This code is for ${packageName}. It will expire in 10 minutes.`,
      "",
      "If you did not request this code, ignore this email.",
      "",
      "QOOHI",
      ".",
    ].join("\r\n");

    expectOk(await send(message), "DATA BODY");
    expectOk(await send("QUIT"), "QUIT");
  } finally {
    writer.releaseLock();
    reader.releaseLock();
    await activeSocket.close();
  }
}
