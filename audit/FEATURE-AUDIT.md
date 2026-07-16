# BadgeGen — Feature Audit & Roadmap

**Date:** 2026-07-03
**Scope:** Product capabilities of the client-side badge generator (`frontend/src`), plus the optional FastAPI export fallback.
**Purpose:** Inventory what exists, find the gaps, and lay out a prioritized, *creative* backlog — then start shipping from the top.

---

## 1. What the product does today (inventory)

BadgeGen turns **one template image + a list of names** into **N personalized badges**, entirely in the browser, and packages them as a ZIP.

| Area | Capability | Where |
|------|-----------|-------|
| **Ingest** | Upload template image (drag & drop) | Setup |
| | Upload names via TXT / CSV | Setup |
| | Event name (becomes ZIP folder name) | Setup |
| **Design** | Font family / size / weight / style | Design |
| | Color, X/Y position, alignment, rotation | Design |
| | Shadow (color/offset/blur), outline, underline, strikethrough | Design |
| | Arabic / RTL auto-detection + Arabic-friendly fonts | Design |
| | **Live canvas preview** (no server round-trip) | Design |
| | Save / load / delete design **presets** (localStorage) | Design |
| **Batch** | Generate all badges to a gallery | Gallery |
| | **Search / filter** by name | Gallery |
| | **Per-badge overrides** (font size, X/Y, color) + reset | Gallery |
| | Rename, regenerate one, regenerate all, remove | Gallery |
| | Prev/next badge navigation | Gallery |
| **Export** | Client-side ZIP (JSZip) with progress | Export |
| | Server fallback ZIP (FastAPI `/generate`) | Export |
| | Per-badge PNG download | Gallery |
| **Shell** | Landing, About, Terms, Privacy, Coming-Soon (auth stub) | Pages |
| | Versioned "What's New" banner, scroll-to-top on nav | Components |

**Verdict:** the core loop is genuinely complete and the per-badge override system is more advanced than most free tools. The gaps are in **data richness, output flexibility, and persistence**, not the core loop.

---

## 2. Gap analysis — where it falls short

1. **Single text field.** A badge = one name. Real event badges carry **name + role/title + company + tier** (Speaker/VIP/Staff). No multi-field support.
2. **No QR / barcode.** Check-in, LinkedIn, vCard — QR codes are table stakes for event badges. Absent.
3. **Names only — no rich data.** CSV columns beyond the first are ignored; no column→field mapping.
4. **Work is volatile.** Only *design presets* persist. Uploaded template + names + generated gallery are lost on refresh. No project autosave.
5. **Positioning is numeric.** X/Y are sliders/inputs — no drag-on-preview. High-friction.
6. **One output shape.** PNG-per-badge in a ZIP. No **print-ready PDF sheet** (A4 with crop marks), no badge-size presets (A6, lanyard, credit-card).
7. **Presets are trapped.** Saved designs live in one browser's localStorage — can't back up, share, or move between machines.
8. **No photos/avatars.** No per-person image (headshot) support.
9. **Discoverability.** No keyboard shortcuts, no onboarding hints beyond copy.

---

## 3. Prioritized backlog

Scored by **Impact** (user value) × **Effort** (build cost) × **Risk** (chance of breaking the working core). Client-side unless noted.

### 🟢 Quick wins — high value, low effort, low risk
| ID | Feature | Why it matters | Notes |
|----|---------|----------------|-------|
| **F1** | **Preset Export / Import (JSON)** | Back up & share design configs; escape single-browser lock-in (gap #7) | Serialize `savedDesigns` → download; import merges. Pure data. **← shipping now** |
| **F2** | **Preview with real names** | Design against actual data, not "Sample Name" (gap #5-adjacent) | "🎲 Try a real name" cycles `previewName` through uploaded `names`. **← shipping now** |
| F3 | Badge-size presets | A6 / credit-card / lanyard / custom canvas dims | Dropdown feeding canvas size |
| F4 | Keyboard shortcuts | Power-user speed (⌘S save preset, ←/→ in gallery) | Additive listeners |
| F5 | Gallery bulk select | Multi-delete / download-selected | Selection set + toolbar actions |

### 🟡 Strategic bets — high value, medium effort
| ID | Feature | Why it matters |
|----|---------|----------------|
| F6 | **QR code per badge** | Check-in / vCard / LinkedIn — core event need (gap #2) |
| F7 | **Multi-field badges** (name + role + company + tier) | Matches real badge anatomy (gap #1) |
| F8 | **CSV column mapping** | Unlocks F7 from real spreadsheets (gap #3) |
| F9 | **Project autosave & restore** | Never lose work on refresh (gap #4); template as dataURL in IndexedDB |
| F10 | **Drag-to-position text** on the live preview | Removes the biggest UX friction (gap #5) |
| F11 | **Print-ready PDF sheet** (A4, crop marks) | The other half of "export" (gap #6) |

### 🔵 Platform / longer horizon
| ID | Feature | Why it matters |
|----|---------|----------------|
| F12 | Real auth + cloud projects | The "Sign In (Soon)" stub implies it |
| F13 | Template gallery / starter designs | Cold-start help for new users |
| F14 | Per-person photo/avatar merge | Photo badges (gap #8) |
| F15 | Team sharing / collaborative projects | Multi-user events |

---

## 4. Shipping in this pass

Two **Quick Wins** — self-contained, no backend, no risk to the core render/export loop:

- **F1 — Preset Export / Import (JSON):** export all saved designs to a `.json` file and import them back (with a version tag and de-duplication). Turns localStorage-only presets into portable, shareable, backup-able assets.
- **F2 — Preview with real names:** a shuffle control in the Design footer that cycles the live preview through the actually-uploaded names, so you design against real data (including long names and RTL) instead of a placeholder.

See the "Shipped" table at the bottom after implementation.

---

## 5. Shipped this pass

| ID | Feature | What changed | Files |
|----|---------|--------------|-------|
| **F1** | Preset **Export / Import (JSON)** | `exportDesigns()` downloads all saved designs as a versioned JSON (`type: badgegen-designs`, `version: 1`); `importDesigns(file)` parses our export shape *or* a bare array, validates each entry, re-IDs collisions, and merges. New **Export / Import** buttons in the Design → Presets tab (Export disabled when empty; Import via hidden file picker). | `context/BadgeContext.js`, `pages/DesignPage.js` |
| **F2** | **Preview with real names** | 🎲 shuffle button in the Design footer cycles the live preview through the actually-uploaded `names` (only shown when names exist), so you design against real data — long names, RTL, etc. | `pages/DesignPage.js` |

**Verified:** `npm run build` compiles cleanly with both features wired.

### Try it
- **F1:** Design → *Presets* tab → save a design → **Export** (downloads `badgegen-designs-YYYY-MM-DD.json`) → **Import** the file back to restore/merge.
- **F2:** Upload a names file in *Setup* → Design → click **🎲** next to *Preview Name* to preview real names.

---

*Next up from the backlog (recommended order): F3 badge-size presets → F6 QR codes → F9 project autosave.*
