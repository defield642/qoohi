# QOOHI Spring Boot backend

This is the PostgreSQL-only API for institution, parent, teacher, and admin workflows. It uses the Neon `DATABASE_URL` by default, runs schema initialization from `src/main/resources/schema.sql`, and is deployed by the root `render.yaml`.

Set `GOOGLE_PLACES_API_KEY` for Kenya institution/location autocomplete and place details. Set SMTP variables for email OTP and notification delivery. WhatsApp delivery can be added by setting the existing Twilio variables; notifications are always persisted in PostgreSQL.

For local Google login, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/oauth/google/callback`. Register that exact URI in the Google OAuth client.

Run locally with `mvn spring-boot:run` from this directory. The frontend should use `VITE_API_BASE=http://localhost:8080`.
