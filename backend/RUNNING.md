# Running the Backend

The BadgeGen API — a FastAPI service that handles server-side badge rendering (Pillow, full Arabic/RTL support) plus **accounts, JWT auth, and plan tiers**.

## Prerequisites

- **Python 3.9+** (3.11 recommended — see `python-version`)
- `pip`

## Install & run

```bash
cd backend

# (recommended) create an isolated environment
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux:  source .venv/bin/activate

pip install -r requirements.txt

# copy and adjust config (see table below)
cp .env.example .env

uvicorn main:app --reload
```

The API runs at **http://localhost:8000**. Interactive Swagger docs: **http://localhost:8000/docs**.

## Configuration (`.env`)

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | SQLite locally; Postgres in prod (`postgresql+psycopg2://…`) | `sqlite:///./badgegen.db` |
| `JWT_SECRET` | **Must** be a strong random value in production | dev placeholder |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime | `14` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:3000` |

Database tables are created automatically on startup (SQLModel `create_all`). No manual migration step for local dev.

## Endpoints

| Method & path | Auth | Purpose |
|---------------|------|---------|
| `POST /preview` | – | Render a single badge preview (base64 PNG) |
| `POST /generate` | – | Render all badges → ZIP |
| `POST /api/auth/register` | – | Create account (starts on Free plan) |
| `POST /api/auth/login` | – | OAuth2 password form → access + refresh JWTs |
| `POST /api/auth/refresh` | – | Exchange refresh token for new tokens |
| `GET /api/auth/me` | Bearer | Current user |
| `GET /api/plans` | – | Plan catalog (Free / Pro / Team) |
| `GET /api/plans/me` | Bearer | Current plan, limits, usage |
| `GET/POST/PUT/DELETE /api/projects` | Bearer | User projects (creation quota-gated by plan) |

## Tests

```bash
python -m pytest -q
```

Covers the auth flow and plan/quota gating against a throwaway SQLite DB (11 cases).

## Running the full stack

```bash
# terminal 1 — backend (port 8000)
cd backend && uvicorn main:app --reload

# terminal 2 — frontend (port 3000)
cd frontend && npm start
```

See [`../frontend/RUNNING.md`](../frontend/RUNNING.md) for the client side.
