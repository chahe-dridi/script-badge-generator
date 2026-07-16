# BadgeGen — Admin Dashboard & Plans Specification

## 1. Overview

BadgeGen is evolving from a single-user tool into a multi-tenant SaaS with plan tiers. This document specifies the admin dashboard, role-based access control, plan management system, and the reasoning behind every architectural and UI/UX decision.

---

## 2. Role System

### 2.1 The `is_admin` Flag

The simplest correct primitive for "is this user an admin?" is a boolean flag on the `User` model rather than a separate `roles` table. Reasoning:

- BadgeGen has exactly two access levels (user / admin) today — a roles junction table would be premature normalisation.
- A flat boolean is trivially queryable, serialisable to JWT claims, and auditable in the DB.
- Promotion/demotion is a single `PATCH /api/admin/users/{id}` with `{ "is_admin": true/false }`.

Future expansion (moderator, support, billing-only) can introduce a `role: Enum` column via an Alembic migration without touching the current logic.

### 2.2 Bootstrapping the First Admin

The first admin cannot be created via the API because no admin exists yet to authorise the request. Two supported strategies:

1. **Direct DB edit** (development): `UPDATE user SET is_admin = 1 WHERE email = 'you@example.com';`
2. **Environment variable** (production): On startup, if `ADMIN_EMAIL` is set and the matching user exists, the app promotes that user. Set it once, then remove it from `.env`.

---

## 3. RBAC Architecture

### 3.1 JWT Claims

The `access_token` payload already contains `sub` (user ID). We do **not** embed `is_admin` in the JWT — doing so would allow a promoted user's old tokens to keep admin access after demotion. Instead:

- Every admin endpoint calls `get_current_admin`, which fetches the live `User` row and checks `user.is_admin`.
- The cost is one extra DB read per admin request, which is acceptable for an infrequently called API.

### 3.2 Dependency Chain

```
get_current_user  →  decode JWT → fetch User row → assert is_active
get_current_admin →  get_current_user → assert is_admin == True
```

`get_current_admin` raises `HTTP 403 Forbidden` (not 401) because the identity is confirmed — only the privilege is missing.

---

## 4. Plan Tier System

### 4.1 Tier Names

| DB enum value | Display label | Monthly price (default) |
|---------------|---------------|------------------------|
| `free`        | Free          | $0                     |
| `pro`         | Pro           | $9                     |
| `team`        | Premier       | $29                    |

The enum value `team` is kept in the DB for backward compatibility; the frontend and admin UI render it as "Premier".

### 4.2 Plan Limits (defaults)

| Feature          | Free        | Pro         | Premier     |
|------------------|-------------|-------------|-------------|
| Projects         | 3           | 50          | Unlimited   |
| Badges per batch | 50          | 5,000       | Unlimited   |
| Watermark        | Yes         | No          | No          |
| PDF export       | No          | Yes         | Yes         |

### 4.3 Admin-Configurable Values (`PlanConfig` table)

Limits and prices are seeded from code defaults but are **stored in the DB** so admins can update them without a redeployment:

```
PlanConfig
  id            INTEGER  PK
  tier          ENUM     UNIQUE (free / pro / team)
  label         TEXT     (display name — e.g. "Premier")
  price_usd     REAL     (monthly price in USD)
  max_projects  INTEGER  (NULL = unlimited)
  max_batch     INTEGER  (NULL = unlimited)
  watermark     BOOLEAN
  pdf_export    BOOLEAN
  updated_at    DATETIME
```

`init_db()` calls `seed_plan_configs()` on startup, which inserts a row for each tier **only if one doesn't already exist**. This makes the first run self-configuring and subsequent runs idempotent.

---

## 5. Backend API

### 5.1 Admin Router — `/api/admin/*`

All routes in this router are protected by `Depends(get_current_admin)`.

| Method | Path                        | Description                       |
|--------|-----------------------------|-----------------------------------|
| GET    | `/api/admin/stats`          | Aggregate dashboard statistics    |
| GET    | `/api/admin/users`          | Paginated user list (+ search)    |
| GET    | `/api/admin/users/{id}`     | Single user detail                |
| PATCH  | `/api/admin/users/{id}`     | Update plan / active / is_admin   |
| GET    | `/api/admin/plans`          | List all plan configs from DB     |
| PUT    | `/api/admin/plans/{tier}`   | Update a plan's price or limits   |

### 5.2 Updated Public Routes

`GET /api/plans` now reads from `PlanConfig` DB rows instead of the hardcoded `PLAN_LIMITS` dict, so frontend pricing always reflects admin-set values.

### 5.3 Key Request/Response Schemas

**`UserAdminRead`** — extends `UserRead` with:
```json
{ "is_admin": false }
```

**`UserAdminUpdate`** — all fields optional:
```json
{ "plan": "pro", "is_active": true, "is_admin": false }
```

**`PlanConfigRead`**:
```json
{
  "tier": "pro", "label": "Pro", "price_usd": 9.0,
  "max_projects": 50, "max_batch": 5000,
  "watermark": false, "pdf_export": true,
  "updated_at": "2026-07-04T..."
}
```

**`PlanConfigUpdate`** — all fields optional:
```json
{ "price_usd": 12.0, "max_batch": 10000 }
```

**`AdminStats`**:
```json
{
  "total_users": 142,
  "active_users": 139,
  "inactive_users": 3,
  "recent_signups_7d": 11,
  "by_plan": { "free": 118, "pro": 20, "team": 4 }
}
```

---

## 6. Frontend Architecture

### 6.1 Route Structure

```
/admin                  → AdminDashboardPage  (stats overview)
/admin/users            → AdminUsersPage      (user list + management)
/admin/plans            → AdminPlansPage      (plan price/feature editor)
```

All three are wrapped in an `AdminRoute` guard:

```jsx
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user?.is_admin) return <Navigate to="/" replace />;
  return children;
}
```

This is client-side gating only — true enforcement is on the backend via `get_current_admin`. The guard just prevents flashing admin UI to regular users.

### 6.2 Admin Navbar Indicator

When `user.is_admin` is true, the navbar shows an "Admin" chip link → `/admin`. It is styled distinctly (amber/yellow instead of the standard lime green) so the admin context is always visually clear and impossible to confuse with a regular user view.

---

## 7. Admin Dashboard UI/UX

### 7.1 Layout

The dashboard is a single-column page with:

1. **Header row** — page title + quick-link buttons (→ Users, → Plans)
2. **Stats grid** — 4 metric cards: Total Users, Active, 7-day Signups, Plan breakdown
3. **Plan breakdown bar** — inline visual of Free/Pro/Premier proportions

### 7.2 Metric Cards

Each card shows one number in large type + a label. Colours follow the existing accent system:
- Total Users → neutral (--txt)
- Active → lime (--a)
- Inactive → pink (--a3)
- 7-day Signups → cyan (--a2)

Reasoning: numbers are the primary information; colour encodes sentiment (good/warning/neutral) at a glance.

### 7.3 Navigation

The admin section has its own sub-nav (tabs: Dashboard / Users / Plans) rendered below the global navbar. This avoids polluting the global navbar and makes the admin area feel like a distinct context.

---

## 8. User Management UI/UX

### 8.1 Table Layout

Columns: # | Name | Email | Plan | Status | Admin | Joined | Actions

- **Plan** — colour-coded badge (grey = Free, cyan = Pro, yellow = Premier)
- **Status** — green dot = active, red dot = suspended
- **Admin** — shield icon if `is_admin`, empty otherwise
- **Actions** — plan dropdown + suspend/activate toggle

### 8.2 Search

Live filter on `full_name` and `email` (client-side on the fetched list — no separate debounced API call, since admin user lists are expected to be small-to-medium).

### 8.3 Plan Change Flow

Admin clicks the plan badge → dropdown opens with the 3 options → select one → optimistic UI update → `PATCH /api/admin/users/{id}` → toast success/error. No modal required; the table cell itself becomes the interaction target.

### 8.4 Suspend / Activate

A single button that toggles `is_active`. Suspended users cannot log in (the `get_current_user` dependency checks `is_active`). The admin cannot suspend themselves.

### 8.5 Make / Revoke Admin

A toggle button visible in the expanded row or a dedicated column icon. The admin cannot revoke their own admin status (backend enforces this; frontend disables the button for `user.id === currentAdmin.id`).

---

## 9. Plan Management UI/UX

### 9.1 Layout

Three side-by-side cards (one per tier), matching the landing page pricing card style. Below the landing pricing, the admin version adds **editable fields**.

### 9.2 Editable Fields

Each plan card contains:

- **Price** — numeric input (`$X / month`)
- **Max projects** — numeric input, or a "Unlimited" checkbox
- **Max batch** — numeric input, or a "Unlimited" checkbox
- **Watermark** — toggle switch
- **PDF Export** — toggle switch

### 9.3 Save Flow

Each card has its own "Save" button (not a global save). This isolates changes: updating Pro pricing doesn't require re-validating Free and Premier. On save: `PUT /api/admin/plans/{tier}` → toast confirmation + optimistic update.

### 9.4 Why Per-Card Save?

A global save button is simpler to implement but creates a footgun: the admin edits Free, then edits Pro, then accidentally clicks Save on the Free card after changing her mind — all three would have been submitted. Per-card save is safer and the extra friction is negligible.

---

## 10. Landing Page Pricing Section

### 10.1 Placement

Between the Features grid and the bottom CTA banner. This is the standard SaaS landing page information hierarchy: prove value first (features), then present the pricing decision.

### 10.2 Design

Three cards in a row. The Pro card is visually elevated (scale + border highlight) to direct attention — this is the target conversion plan. The "Popular" badge sits on Pro.

### 10.3 Feature Lists

Each card shows a short bullet list of what's included. Uses `IconCheck` (lime) for included features and `IconX` (muted/pink) for features not available on that tier.

### 10.4 CTA per Card

- Free: "Start for Free" → `/setup`
- Pro: "Get Pro" → `/register` (or `/login` if signed in)
- Premier: "Contact Us" → GitHub Issues (placeholder until billing is wired)

---

## 11. Schema Migration Note

Adding `is_admin` to the `User` table and creating `PlanConfig` requires a fresh DB or a manual migration. In development: delete `badgegen.db` and restart the backend — `init_db()` will recreate all tables and seed plan configs. Before production, switch to Alembic:

```bash
alembic init alembic
alembic revision --autogenerate -m "add_is_admin_and_plan_config"
alembic upgrade head
```

---

## 12. Security Checklist

- [ ] Admin endpoints always go through `get_current_admin` — never skip this dep
- [ ] Admin cannot suspend or revoke admin from themselves (enforced backend + frontend)
- [ ] `is_admin` is not embedded in JWT claims (always live DB read)
- [ ] Plan config updates are validated (price ≥ 0, max_* > 0 or null)
- [ ] All admin routes return 403 (not 404) for non-admin users so the existence of the endpoint is not masked
