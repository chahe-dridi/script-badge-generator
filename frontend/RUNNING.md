# Running the Frontend

The BadgeGen web client — a React 18 single-page app that renders badges entirely in the browser (HTML5 Canvas + JSZip). It runs **fully standalone**; the backend is optional (only needed for the server-side ZIP fallback and, going forward, accounts/plans).

## Prerequisites

- **Node.js 18+** and **npm** (`node -v`, `npm -v`)

## Install & run

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000**.

## Other commands

| Command | What it does |
|---------|--------------|
| `npm start` | Dev server with hot reload (port 3000) |
| `npm run build` | Optimized production build → `build/` |
| `npm test` | Run the test runner |

## Configuration

Optional environment variables (create `frontend/.env` — see `.env.example`):

| Variable | Purpose | Default |
|----------|---------|---------|
| `REACT_APP_API_URL` | Base URL of the backend API | `http://localhost:8000` |
| `PORT` | Dev server port | `3000` |

> The client generates badges and ZIPs on its own. It only calls the backend for the **server ZIP fallback** (large batches) and the **auth/plans** endpoints. If you change the dev port, update `CORS_ORIGINS` in the backend `.env` to match.

## Running the full stack

Run the two servers in separate terminals:

```bash
# terminal 1 — backend (port 8000)
cd backend && uvicorn main:app --reload

# terminal 2 — frontend (port 3000)
cd frontend && npm start
```

See [`../backend/RUNNING.md`](../backend/RUNNING.md) for the API side.
