# QOOHI

Kenyan CBC educational platform — Learning, Creativity & Play for Grades 1–9.

## Stack
- **Frontend:** React 19 + Vite + Tailwind CSS + Framer Motion (port 5000)
- **Backend:** Java 17 + Spring Boot + PostgreSQL/Neon (port 8080, in `backend/`)
- **AI:** Groq (primary), OpenAI, or Gemini for material generation

## How to run

Run the backend and frontend separately:
```
cd backend && mvn spring-boot:run
npm run dev
```
- Vite dev server: http://localhost:5000 (webview)
- Spring API: http://localhost:8080 (proxied via `/api`)

## Required secrets
- `OPENAI_API_KEY` — for QOOHI AI responses

## Optional secrets
- `OPENAI_MODEL` — optional model override
- `GOOGLE_PLACES_API_KEY` — Kenya institution and home-location autocomplete
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
