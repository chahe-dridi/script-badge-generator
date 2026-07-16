# Script Badge Generator

A full-suite solution for generating professional event badges at scale. It evolved from simple Python Tkinter scripts into a full-stack web application with instant, in-browser rendering.

## What's inside

### Web app (full stack)

- **`frontend/`** — a React 18 SPA that renders badges **client-side** (HTML5 Canvas + JSZip). Works fully standalone.
- **`backend/`** — a FastAPI service for server-side rendering **plus accounts, JWT auth, and plan tiers**.

### Legacy desktop scripts
Original local batch tools remain available:
- `badge_generator.py` — essential generator with a minimal Tkinter UI.
- `professional_badge_generator.py` — adds shadows, outlines, and multi-threading.

## Features

**Create badges**
- Upload a template image + a names list (TXT / CSV / Excel) + an event name
- Live canvas preview — no server round-trip
- Font family / size / weight / style, color, X/Y position, alignment, rotation
- Text shadow, outline, underline, strikethrough
- Arabic / RTL auto-detection with Arabic-friendly fonts

**Batch & refine**
- Generate all badges into a searchable gallery
- Per-badge overrides (size / position / color) with reset
- Rename, regenerate one / all, remove
- Preview against real uploaded names (🎲 shuffle)

**Save & export**
- Design presets saved in the browser, with **JSON export / import** (backup & share)
- Client-side ZIP export (with server fallback for large batches)
- Per-badge PNG download

**Accounts & plans** (backend)
- Register / login / refresh (JWT), current-user endpoint
- **Free / Pro / Team** tiers with server-side quota enforcement (e.g. project limits)
- User-owned projects (CRUD). *Payments are not wired yet — tiers are modeled and gated.*

## Quick start (web app)

Run the two servers in separate terminals:

```bash
# Frontend (http://localhost:3000)
cd frontend && npm install && npm start

# Backend (http://localhost:8000, Swagger at /docs)
cd backend && pip install -r requirements.txt && uvicorn main:app --reload
```

The client works on its own; the backend adds the server ZIP fallback and accounts/plans.

## Documentation

| Doc | Purpose |
|-----|---------|
| [`frontend/RUNNING.md`](frontend/RUNNING.md) | Run & configure the web client |
| [`backend/RUNNING.md`](backend/RUNNING.md) | Run & configure the API (env, endpoints, tests) |
| [`audit/DESIGN-AUDIT.md`](audit/DESIGN-AUDIT.md) | UX / accessibility / CSS audit + fixes |
| [`audit/FEATURE-AUDIT.md`](audit/FEATURE-AUDIT.md) | Feature inventory & roadmap |
| [`audit/BACKEND-PLAN.md`](audit/BACKEND-PLAN.md) | Auth / users / plans architecture |
| [`DEPLOY.md`](DEPLOY.md) | Deployment notes |

---

## License
MIT License