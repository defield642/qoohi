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
- `/` — public guest dashboard preview; switch between parent, teacher, and student views before registering
- `/admin` and `/admin/` — admin panel
- `/institution/` — institution portal
- `/caleb` — special page

The signed-out user and institution previews read public aggregate totals from `/api/public/preview-stats`. Guest users can browse books actually available for a selected grade and safely preview supported PDF, image, and text files from the uploaded book archives. The user preview also offers a short AI tutor session; anonymous AI requests are server rate-limited and prompt length is capped. Teacher discovery cards omit private contact information, while the authenticated teacher learner directory exposes only learner display name, source, grade, and opted-in course interests.

## Frontend modules
- `src/UserPortal.jsx` is the main user application entry and uses the role modules in `src/student.jsx`, `src/parent.jsx`, `src/teacher.jsx`, and their registration modules.
- `src/InstitutionPortal.jsx` is the institution application entry and uses `src/institution.jsx` and `src/institutionregister.jsx`.
- `src/UserApp.jsx` and `src/InstitutionApp.jsx` are compatibility re-exports only; the app entries no longer depend on them, so they can be removed when older imports are no longer needed.

## User preferences
