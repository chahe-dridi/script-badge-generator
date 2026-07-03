# BadgeGen — Frontend ↔ Backend Integration Audit

**Date:** 2026-07-03
**Question asked:** Do the frontend and backend actually work together? What features/design fixes are next?

---

## 1. Do they work together? — Partly.

**Verified at runtime** (uvicorn on :8000, requests from origin `http://localhost:3000`):

| Check | Result |
|-------|--------|
| `GET /` health | ✅ `{"status":"ok"}` |
| CORS preflight on `/api/auth/login` from `:3000` | ✅ `access-control-allow-origin: http://localhost:3000`, credentials allowed |
| `POST /api/auth/register` | ✅ 201, returns user on Free plan |
| `POST /api/auth/login` → JWT | ✅ access + refresh tokens |
| `GET /api/auth/me` (bearer) | ✅ current user |
| `GET /api/plans/me` (bearer) | ✅ tier + limits + usage |

So the **backend is fully functional and CORS is correctly scoped to the frontend origin.**

**But the frontend never calls any of it.** The only cross-service call in the whole client is the ZIP fallback:

```
frontend/src/context/BadgeContext.js:246  const API = process.env.REACT_APP_API_URL || "http://localhost:8000";
frontend/src/context/BadgeContext.js:304  const res = await fetch(API + "/generate", …)
```

`/api/auth`, `/api/plans`, `/api/projects` are **unused**. "Sign In" still routes to the **Coming Soon** stub. So today they work together only for server-side ZIP — the accounts/plans system is a backend with no client.

## 2. Integration findings

| ID | Finding | Severity |
|----|---------|----------|
| **I1** | No auth wiring on the frontend — login/register/me/plans endpoints unused; Sign In is a stub | 🔴 Critical (this is "make them work together") |
| **I2** | No central API client — the one backend call inlines `process.env.REACT_APP_API_URL` + `fetch`; no shared base URL, auth-header injection, or error handling | 🟠 High |
| **I3** | `frontend/.env.example` is empty — `REACT_APP_API_URL` is undocumented | 🟡 Medium |
| **I4** | No token storage / refresh handling on the client | 🟠 High (part of I1) |
| **I5** | Plans are modeled server-side but there's no pricing/plans UI to render them | 🟡 Medium (feature) |
| **I6** | No signed-in state anywhere in the shell (navbar always shows "Sign In · Soon") | 🟠 High (part of I1) |

## 3. Feature opportunities (next)

- **Live pricing page** rendered from `GET /api/plans` (public) — showcases the tiers we modeled.
- **Cloud projects**: persist the current design to `/api/projects` for logged-in users (backend CRUD already exists, quota-gated).
- **Plan-aware UI**: reflect `max_batch` / watermark / PDF gates from `/api/plans/me`.
- Carried over from the feature backlog: QR codes, multi-field badges, PDF sheet export, drag-to-position.

## 4. Design fixes still open (from DESIGN-AUDIT)

- **A16** — click-only `<div>`s (Setup upload cards, Gallery cards) aren't keyboard-operable.
- **A13** — no "skip to content" link.
- **A17** — remaining Gallery `<label>`s not associated with controls.

## 5. Shipping in this pass

Close the **critical integration gap (I1/I2/I4/I6)** so the two halves genuinely work together:

1. **`src/api/client.js`** — one place for the base URL, JSON/form requests, bearer-token injection, and error normalization.
2. **`src/context/AuthContext.js`** — `user` state, `register` / `login` / `logout`, token persistence, `/me` restore on load; `AuthProvider` mounted in `index.js`.
3. **Real Login & Register pages** replacing the Coming Soon stubs on `/login` and `/register`.
4. **Navbar** reflects auth: Sign In (logged out) vs. account + Sign Out (logged in).
5. **`frontend/.env.example`** documents `REACT_APP_API_URL`.

Results are recorded in the "Shipped" section below after implementation.

## 6. Shipped

Closed the critical integration gap — the frontend now consumes the backend auth system, so the two halves genuinely work together.

| ID | What shipped | Files |
|----|--------------|-------|
| **I2** | Central API client — base URL, JSON/form requests, bearer-token injection, token storage helpers, error normalization (incl. friendly "backend not running" + pydantic 422 messages) | `src/api/client.js` |
| **I1 / I4 / I6** | `AuthProvider` with `register` / `login` / `logout`, token persistence in localStorage, and `/me` session restore on load; mounted in `index.js` | `src/context/AuthContext.js`, `src/index.js` |
| **I1** | Real **Login** + **Register** pages replacing the Coming Soon stubs; routed at `/login` and `/register` | `src/pages/LoginPage.js`, `src/pages/RegisterPage.js`, `src/styles/Pages-Auth.css`, `src/App.js` |
| **I6** | Navbar reflects auth: **Sign In** when logged out; account chip (name + plan badge) + **Sign Out** when logged in; hidden until the session resolves to avoid flicker | `src/components/Navbar.js`, `src/styles/Navbar.css` |
| **I3** | `REACT_APP_API_URL` documented | `frontend/.env.example` |

**Verified:** backend endpoints + CORS confirmed at runtime (curl from origin `:3000`); frontend build compiles clean with the full auth flow wired. `ComingSoonPage.js` is now unused (kept for future stubs).

### Try it (full stack)
1. `cd backend && uvicorn main:app --reload`
2. `cd frontend && npm start`
3. Click **Sign In → Create an account** → you're registered, logged in, and the navbar shows your name + **free** plan badge.

### Still open (documented, not in this pass)
- **I5 / features:** live pricing page from `/api/plans`, cloud projects via `/api/projects`, plan-aware UI gates.
- **Design:** A16 keyboard-operable cards, A13 skip-link, A17 remaining label associations.
