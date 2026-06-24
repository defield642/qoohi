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
    const existingUser = await c.env.DB.prepare(
      "SELECT id FROM users WHERE LOWER(email) = LOWER(?1)",
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
    selectedPackage: body.selectedPackage || "",
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
    (await c.env.DB.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?1)")
      .bind(email)
      .first()) || null;

  if (mode === "register") {
    const requestedRole = (metadata.registrationType === "teacher" || metadata.registrationType === "parent" || metadata.registrationType === "iep")
      ? metadata.registrationType
      : "student";

    if (!user) {
      const inserted = await c.env.DB.prepare(
        "INSERT INTO users (full_name, whatsapp, email, role) VALUES (?1, ?2, ?3, ?4)",
      )
        .bind(metadata.fullName, metadata.whatsapp, email, requestedRole)
        .run();
      user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?1")
        .bind(inserted.meta.last_row_id)
        .first();
    } else {
      const finalRole = (user.role !== "student" && requestedRole === "student") ? user.role : requestedRole;
      await c.env.DB.prepare(
        "UPDATE users SET full_name = ?1, whatsapp = ?2, role = ?3 WHERE id = ?4",
      )
        .bind(metadata.fullName, metadata.whatsapp, finalRole, user.id)
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

  const token = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + 14 * 24 * 60 * 60 * 1000,
  ).toISOString();
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

  return c.json({
    ok: true,
    groups: groupedStudents,
    tournament,
  });
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
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
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
     SET home_score = ?1, away_score = ?2, updated_at = ?3
     WHERE id = ?4`,
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
    "INSERT OR REPLACE INTO tournament_settings (key, value) VALUES ('registration_open', ?1)"
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
       VALUES (?1, ?2, ?3, ?4)`,
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
    "UPDATE users SET assessment_status = ?1, performance_level = ?2 WHERE id = ?3",
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
    const { messages } = await c.req.json();
    const normalizedMessages = Array.isArray(messages) ? messages : [];

    let response;

    if (c.env.OPENAI_API_KEY) {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: c.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are QOOHI AI, a smart assistant that solves math, coding, and explains simply.",
            },
            ...normalizedMessages,
          ],
          temperature: 0.7,
        }),
      });
    } else if (c.env.GROQ_API_KEY) {
      response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${c.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content:
                  "You are QOOHI AI, a smart assistant that solves math, coding, and explains simply.",
              },
              ...normalizedMessages,
            ],
            temperature: 0.7,
          }),
        },
      );
    } else {
      return c.json({ reply: "Missing AI API key." }, 500);
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return c.json({
        reply: "AI did not return a response. Check API key or model.",
      });
    }

    return c.json({ reply });
  } catch (err) {
    console.error(err);
    return c.json({
      reply: "Server error connecting to AI.",
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
  const { messages } = await c.req.json();
  const normalizedMessages = Array.isArray(messages) ? messages : [];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let response;

      if (c.env.OPENAI_API_KEY) {
        response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: c.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are QOOHI AI. Be helpful, clear, and solve problems step by step.",
              },
              ...normalizedMessages,
            ],
            stream: true,
          }),
        });
      } else if (c.env.GROQ_API_KEY) {
        response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${c.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: "llama-3.1-8b-instant",
              messages: [
                {
                  role: "system",
                  content:
                    "You are QOOHI AI. Be helpful, clear, and solve problems step by step.",
                },
                ...normalizedMessages,
              ],
              stream: true,
            }),
          },
        );
      } else {
        controller.error(new Error("Missing AI API key."));
        return;
      }

      if (!response.ok || !response.body) {
        controller.error(new Error("AI streaming failed."));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const data = line.replace("data: ", "").trim();

          if (data === "[DONE]") continue;

          try {
            const json = JSON.parse(data);
            const text = json?.choices?.[0]?.delta?.content;

            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          } catch {
            continue;
          }
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Transfer-Encoding": "chunked",
    },
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
    `SELECT sessions.*, users.id as user_id, users.full_name, users.email, users.whatsapp, users.role
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
      role: session.role,
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
  const messages = await env.DB.prepare(
    `SELECT * FROM admin_messages
     WHERE user_id = ?1
     ORDER BY created_at DESC`,
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
    },
    enrollments: (enrollments.results || []).map((item) => ({
      ...item,
      courses: COURSE_PACKAGES[item.package_key]?.courses || [],
    })),
    messages: (messages.results || []).map((item) => ({
      ...item,
      pdfLinks: safeJsonParse(item.pdf_links_json, []),
    })),
    tournamentRegistration,
    tournament: tournamentRegistration ? await buildTournamentSummary(env) : null,
  };
}

async function buildAdminGroups(env) {
  const packages = [];
  for (const key of ["computer_packages", "coding_ai_training", "both"]) {
    const result = await env.DB.prepare(
      `SELECT id, full_name, email, whatsapp, created_at, role, assessment_status, performance_level
       FROM users
       WHERE id IN (SELECT user_id FROM enrollments WHERE package_key = ?1)
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
      `SELECT id, full_name, email, whatsapp, created_at, role, assessment_status, performance_level
       FROM users
       WHERE role = ?1
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
      `SELECT id, full_name, email FROM users WHERE role = ?1 ORDER BY full_name ASC`,
    )
      .bind(groupKey)
      .all();
    return rows.results || [];
  }

  const rows = await env.DB.prepare(
    `SELECT users.id, users.full_name, users.email
     FROM users
     JOIN enrollments ON enrollments.user_id = users.id
     WHERE enrollments.package_key = ?1
     ORDER BY users.full_name ASC`,
  )
    .bind(groupKey)
    .all();

  return rows.results || [];
}

async function getRecipientForUser(env, userId) {
  const row = await env.DB.prepare(
    "SELECT id, full_name, email FROM users WHERE id = ?1",
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

/* async function ensureTournamentSchedule(env) {
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
       VALUES (?1, ?2, ?3, ?4)`,
    )
      .bind("league", match.round, match.homeId, match.awayId)
      .run();
  }
} */

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

function safeJsonParse(value, fallback = {}) {
  try {
    return JSON.parse(value || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
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
    console.log(
      JSON.stringify({
        type: "mail-preview",
        to,
        subject,
        body: bodyLines.join("\n"),
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
        env.SMTP_SECURE === "starttls"
          ? "starttls"
          : env.SMTP_SECURE === "off"
            ? "off"
            : "on",
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
    expectOk(await send(`RCPT TO:<${to}>`), "RCPT TO");
    expectOk(await send("DATA"), "DATA");

    const message = [
      `From: QOOHI <${env.SMTP_FROM}>`,
      `To: <${to}>`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "",
      ...bodyLines,
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
