# BadgeGen — Backend Plan: Auth, Users & Plans

**Date:** 2026-07-03
**Decision (confirmed):** Extend the existing **FastAPI** backend. Stack = SQLModel + Postgres (SQLite for local dev) + JWT. Plans = **model tiers + gate features server-side, no payment integration yet**.

---

## 1. Starting point

`backend/main.py` today is a **stateless rendering microservice**: FastAPI + Pillow, routes `/preview` and `/generate`, `CORS allow_origins=["*"]`, no DB, no auth, no users. Everything below is net-new and lives under a new `backend/app/` package so the rendering code stays untouched.

## 2. Architecture

```
backend/
  main.py                 # existing render routes + mounts new routers, init_db on startup
  app/
    config.py             # pydantic-settings: DATABASE_URL, JWT_SECRET, CORS_ORIGINS…
    db.py                 # SQLModel engine + get_session dependency + init_db()
    models.py             # User, Project, PlanTier enum, PLAN_LIMITS (server source of truth)
    schemas.py            # Pydantic request/response DTOs
    security.py           # bcrypt hashing + JWT access/refresh create/decode
    deps.py               # get_current_user (OAuth2 bearer)
    routers/
      auth.py             # POST /api/auth/register | /login | /refresh, GET /api/auth/me
      plans.py            # GET /api/plans, GET /api/plans/me (limits + usage)
      projects.py         # CRUD for user-owned projects, gated by plan quota
  tests/                  # pytest: auth flow + plan gating
```

## 3. Data model

**User** — `id, email (unique), hashed_password, full_name, plan (FREE|PRO|TEAM), is_active, created_at`
**Project** — `id, owner_id → user, name, config (JSON string), created_at, updated_at`

## 4. Plans (server-side source of truth — `PLAN_LIMITS`)

| Tier | Price | Max projects | Max batch | Watermark | PDF export |
|------|-------|--------------|-----------|-----------|------------|
| **Free** | $0 | 3 | 50 | yes | no |
| **Pro** | $9 | 50 | 5000 | no | yes |
| **Team** | $29 | ∞ | ∞ | no | yes |

Limits are enforced **server-side** (e.g. project creation checks `max_projects`). The frontend may read `/api/plans/me` to reflect limits, but the server is authoritative. `null` = unlimited.

## 5. Auth

- **Passwords:** bcrypt via passlib.
- **Tokens:** JWT — short-lived **access** (30 min) + longer **refresh** (14 d). `sub` = user id, `type` claim distinguishes access vs refresh so a refresh token can't be used as an access token.
- **Login:** OAuth2 password flow (`/api/auth/login`, form `username`+`password`) → returns both tokens.
- **Protected routes:** `Depends(get_current_user)` decodes the bearer access token and loads the active user.

## 6. Security notes

- CORS tightened from `*` to an env-configured allow-list (`CORS_ORIGINS`), required now that requests carry credentials.
- `JWT_SECRET` **must** be overridden in production (defaults to a dev value with a warning).
- 404 (not 403) is used where leaking resource existence would matter (e.g. another user's project).

## 7. Deliberately deferred (documented follow-ups)

- **Alembic migrations** — this pass uses `SQLModel.metadata.create_all()` on startup, which is fine for greenfield but must move to Alembic before the first production schema change.
- **Payments (Stripe)** — tiers are modeled and gated; checkout/webhooks/billing-portal come later. "Upgrade" is a stub until then.
- **Email verification + password reset** — needs an email provider; auth works without it for now.
- **Refresh-token rotation / revocation list** — current refresh tokens are stateless; add a denylist when needed.
- **Rate limiting** on auth endpoints.

## 8. Shipped this pass

Auth (register/login/refresh/me), User + Project models, plan tiers with server-side quota gating on projects, `/api/plans` + `/api/plans/me`, tightened CORS, `.env.example`, and pytest coverage for the auth flow and project quota. See commits.
