# Badge Generator — Full Codebase Audit

**Date:** 2026-07-16  
**Branch:** dev (d094427)  
**Scope:** Frontend (React 18), Backend (FastAPI + SQLModel), Canvas rendering, Name parsing

---

## 1. Project Health Summary

| Area | Status | Notes |
|------|--------|-------|
| Core badge rendering | ✅ Working | Canvas preview + PIL server render |
| Name parsing (TXT) | ✅ Working | Whitespace handling needs improvement |
| Name parsing (CSV) | ⚠️ Partial | Naive parser — fails on quoted fields |
| Name parsing (Excel) | ❌ Broken in frontend | Returns `[]` in browser; server works |
| Design controls | ✅ Working | Font, position, effects all functional |
| Arabic / RTL | ⚠️ Partial | Preview ≠ server render for some fonts |
| Gallery editing | ⚠️ Partial | Only 4 override fields; sliders capped too low |
| ZIP export (client) | ✅ Working | jszip CDN with server fallback |
| Auth + plan system | ✅ Working | JWT refresh, quota enforcement |
| Admin dashboard | ✅ Working | Stats, user mgmt, plan config |
| Watermark (plan tier) | ❌ Not implemented | Defined in plan tier, no code |
| PDF export (plan tier) | ❌ Not implemented | Defined in plan tier, no code |
| Rate limiting | ❌ Missing | `/generate` is public + unlimited |
| File size limits | ❌ Missing | Can upload 100MB+ templates |

---

## 2. Critical Bugs

### BUG-01 — Excel names not parsed in frontend
**File:** `frontend/src/utils/canvas.js`, `frontend/src/pages/SetupPage.js`  
**Impact:** Users who upload `.xlsx`/`.xls` files see 0 names loaded. Only the server-side `/generate` call parses Excel. The preview name shows "Sample Name" instead of a real name.  
**Fix:** Integrate `xlsx` or `exceljs` npm package in frontend, or use the server `/preview` endpoint for name extraction.

### BUG-02 — Gallery context function name mismatch
**File:** `frontend/src/pages/GalleryPage.js:24`  
**Impact:** `updateGalleryItem` is referenced but `BadgeContext` exports `removeBadge`. Runtime error on badge removal.  
**Fix:** Align the destructured name with the context export.

### BUG-03 — CSV quoted fields break name parsing
**File:** `frontend/src/utils/canvas.js:87`  
```js
l.split(",")[0].replace(/^"|"$/g, "").trim()
// → "Smith, John" in quotes becomes "Smith" (cuts at comma inside quotes)
```
**Fix:** Use proper RFC 4180 CSV parsing (PapaParse or manual state machine).

---

## 3. High-Priority Gaps

### GAP-01 — No file size validation
- Frontend accepts files without size checks.
- Backend has no `Content-Length` limit.
- A 50MB template image can freeze the browser tab.
- **Fix:** Enforce ≤ 10MB for templates, ≤ 2MB for names files.

### GAP-02 — No maximum names limit
- No cap before generating badges from a 50,000-name list.
- **Fix:** Enforce plan-based `max_batch` limit before starting `buildGallery()`.

### GAP-03 — Position sliders capped too aggressively
- Design page: X/Y max = 3000px. Gallery override: X/Y max = 2000px.
- Large templates (4K event banners) can't be positioned correctly.
- **Fix:** Derive max from `templateImg.naturalWidth / naturalHeight`.

### GAP-04 — Event name not sanitized
- `main.py:371` only replaces spaces with underscores.
- Characters like `/`, `\`, `<`, `>`, `:` corrupt ZIP folder names.
- **Fix:** Strip non-alphanumeric characters except dash/underscore.

### GAP-05 — Missing override fields in gallery side panel
- Only font_size, text_x, text_y, font_color can be overridden per badge.
- Shadow, outline, rotation, and effects cannot be set per-badge.
- **Fix:** Expose more override controls in the side panel (at minimum: font_family, text_align, rotation).

### GAP-06 — No text wrapping for long names
- Names longer than the template width overflow out of bounds.
- **Fix:** Add a configurable max-width with automatic line wrapping.

### GAP-07 — No text transform
- All names render as entered (no uppercase, lowercase, title case).
- **Fix:** Add `text_transform` option.

### GAP-08 — No letter spacing control
- Fixed kerning only; cannot create spaced-out formal badge styles.
- **Fix:** Add `letter_spacing` in px to INIT_CFG and apply in canvas/backend.

### GAP-09 — No text background / highlight box
- Text is always rendered directly on the template with no fill behind it.
- **Fix:** Add optional background box with configurable color, opacity, padding.

---

## 4. Medium-Priority Issues

| ID | File | Issue |
|----|------|-------|
| M-01 | `canvas.js:20` | Text height hardcoded as `font_size * 1.2` — ignores font metrics |
| M-02 | `canvas.js:29` | Rotation around `text_y + th/2`, not a true anchor point |
| M-03 | `SetupPage.js:84` | `URL.createObjectURL()` never revoked — memory leak on repeated uploads |
| M-04 | `main.py:91` | Font size has no maximum — render with `font_size=9999` would behave unexpectedly |
| M-05 | `main.py:273` | Server-side rotation rotates entire canvas, not text in place |
| M-06 | `DesignPage.js:149` | Snap-to-grid fallback is hardcoded `800` when no template loaded |
| M-07 | `config.py` | `jwt_secret` defaults to `"dev-secret-change-me"` — must be rotated in prod |
| M-08 | `main.py:27` | CORS `allow_credentials=True` without origin whitelist validation |

---

## 5. Name Handling — Full Analysis

### What works
- TXT: one name per line, parsed in frontend and backend.
- CSV: first column, basic quoted-string stripping.
- Excel: parsed on server (but not in frontend preview).
- Arabic names: reshape + bidi on backend; preview relies on browser font.

### What needs fixing

**Frontend `parseNamesFile()` issues:**
1. CSV: `split(",")[0]` breaks on `"Smith, John Jr."` — name gets cut to `"Smith"`.
2. CSV: header detection skips only rows containing `"name"` — misses `"attendee"`, `"participant"`, `"full_name"`, etc.
3. TXT: no UTF-8 BOM stripping — `﻿` prepends to first name.
4. All formats: no whitespace normalization (tabs, double spaces preserved).
5. No deduplication option — 1,000-entry list with 50 duplicates generates duplicate badges silently.

**Backend `main.py` issues:**
1. CSV header check: `arr[0].toLowerCase().includes("name")` is fragile — misses multi-word headers.
2. Arabic detection range `[؀-ۿ]` misses `ݐ-ݿ` Supplement and some extended blocks.
3. Names not trimmed after parsing from Excel — trailing whitespace in column cells persists.

### Planned fixes (v2.2.0)
- Replace naïve CSV split with a proper parser (state-machine that handles quoted commas).
- Normalize whitespace and strip BOM in all format paths.
- Detect common header keywords: `name`, `full_name`, `attendee`, `participant`, `prénom`, `اسم`.
- Add optional client-side deduplication with count shown to user.
- Add name validation: warn on empty strings, very long names (> 120 chars).

---

## 6. Design Controls — Current vs. Planned

| Control | v2.1 | v2.2 Plan |
|---------|------|-----------|
| Font family | ✅ 11 fonts | + Google Fonts loading |
| Font size | ✅ 8–300px | Keep |
| Font weight | ✅ normal/bold | Keep |
| Font style | ✅ normal/italic | Keep |
| Font color | ✅ hex picker | Keep |
| Text alignment | ✅ left/center/right | Keep |
| Position X/Y | ✅ 0–3000px | Fix: derive from template |
| Rotation | ✅ −180→+180° | Keep |
| Shadow | ✅ color/offset/blur | Keep |
| Outline | ✅ color/width | Keep |
| Underline | ✅ toggle | Keep |
| Strikethrough | ✅ toggle | Keep |
| **Letter spacing** | ❌ Missing | Add (0–20px) |
| **Text transform** | ❌ Missing | Add (none/upper/lower/title) |
| **Text background** | ❌ Missing | Add (color/opacity/padding) |
| **Text wrap / max-width** | ❌ Missing | Add (toggle + width in px) |
| **Line height** | ❌ Missing | Add (when wrap enabled) |

---

## 7. Backend Security Notes

- `/generate` and `/preview` endpoints have no authentication, rate limiting, or file size enforcement.
- `jwt_secret` must be rotated before any production deployment.
- `allow_credentials=True` in CORS config — validate origin list explicitly.
- Event name used as ZIP folder — sanitize before path construction.

---

## 8. Feature Backlog (Post v2.2)

| Priority | Feature | Effort |
|----------|---------|--------|
| High | Excel name parsing in frontend (xlsxjs) | Medium |
| High | File size validation (template ≤ 10MB) | Small |
| High | Rate limiting on `/generate` (slowapi) | Small |
| High | Watermark overlay for Free plan | Medium |
| Medium | PDF export (reportlab or fpdf2) | Large |
| Medium | Google Fonts integration (100+ fonts) | Medium |
| Medium | Second text field (role/company below name) | Large |
| Medium | Undo/redo in design editor | Medium |
| Medium | Batch apply design change to selected badges | Medium |
| Low | Custom font upload | Large |
| Low | Template cropping / resizing | Large |
| Low | Regex/advanced gallery search | Small |

---

## 9. Architecture Notes

- `BadgeContext` is the single source of truth — all pages read from it. Keeps state consistent across route changes.
- `renderBadgeToCanvas()` in `canvas.js` must stay in sync with `draw_badge()` in `main.py` — any new style property needs to be implemented in both.
- `INIT_CFG` in `BadgeContext.js` is the schema for badge config — always add defaults here when adding new fields so old saved presets don't break.
- localStorage saves raw `cfg` objects — adding new fields with defaults is backward-compatible; removing fields would need a migration.
