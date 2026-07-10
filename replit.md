# QOOHI

Kenyan CBC educational platform — Learning, Creativity & Play for Grades 1–9.

## Stack
- **Frontend:** React 19 + Vite + Tailwind CSS + Framer Motion (port 5000)
- **Backend:** Hono + Node.js + better-sqlite3 (port 3000)
- **AI:** Groq (primary), OpenAI, or Gemini for material generation

## How to run

The workflow `Start application` runs both services together:
```
node app.js & npm run dev
```
- Vite dev server: http://localhost:5000 (webview)
- Hono API: http://localhost:3000 (proxied via `/api`)

## Required secrets
- `GROQ_API_KEY` — for AI material generation on the parent page (get free at console.groq.com)

## Optional secrets
- `OPENAI_API_KEY` / `OPENAI_MODEL` — fallback AI provider
- `GEMINI_API_KEY` — fallback AI provider
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — email/OTP delivery
- `ADMIN_ACCESS_KEY` — admin panel access

## Test accounts (auto-seeded)
- teacher@qoohi.com
- student@qoohi.com
- parent@qoohi.com

## Key pages
- `/` — main app
- `/admin` — admin panel
- `/caleb` — special page

## User preferences
