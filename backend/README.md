# Backend API

This is the Python-based backend for the Script Badge Generator. Currently written with FastAPI, it serves as a robust foundation for offloading heavy badge processing, data validations, and database integrations if required. 

Note: The current primary mode of the web app renders client-side, but this API is structured to handle enterprise-level batching when scaled.

## Setup

1. Make sure Python 3.9+ is installed.
2. Navigate to this directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

The API will run on port `8000`. You can access the auto-generated Swagger documentation at `http://localhost:8000/docs`.

## Configuration

Copy `.env.example` to `.env` and adjust. Key variables:

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | SQLite locally, Postgres in prod | `sqlite:///./badgegen.db` |
| `JWT_SECRET` | **Must** be a strong random value in prod | dev placeholder |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:3000` |

Tables are created automatically on startup (SQLModel `create_all`). Migrate to Alembic before the first production schema change — see `../audit/BACKEND-PLAN.md`.

## Auth / users / plans

Beyond the rendering routes (`/preview`, `/generate`), the API now provides accounts and plan-gated projects:

| Method & path | Auth | Purpose |
|---------------|------|---------|
| `POST /api/auth/register` | – | Create an account (starts on the Free plan) |
| `POST /api/auth/login` | – | OAuth2 password form → access + refresh JWTs |
| `POST /api/auth/refresh` | – | Exchange a refresh token for new tokens |
| `GET /api/auth/me` | Bearer | Current user |
| `GET /api/plans` | – | Plan catalog (Free / Pro / Team + limits) |
| `GET /api/plans/me` | Bearer | Current plan, limits, and usage |
| `GET/POST/PUT/DELETE /api/projects` | Bearer | User-owned projects; creation is quota-gated by plan |

Plan limits (`max_projects`, `max_batch`, watermark, PDF export) are enforced **server-side**; the frontend may read them but is not authoritative. Payments are intentionally deferred — tiers are modeled and gated, "upgrade" is a stub.

## Tests

```bash
cd backend
pip install -r requirements.txt
python -m pytest -q
```

Covers the auth flow (register/login/me/refresh, token-type enforcement) and plan gating (project quota, owner scoping). Uses a throwaway SQLite DB.