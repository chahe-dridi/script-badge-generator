# BadgeGen — UX / UI Design Audit

**Date:** 2026-07-03
**Scope:** `frontend/src` — all CSS in `styles/`, layout/nav/footer components, and page markup.
**Method:** Manual review of design tokens, typography, color, spacing, component states, accessibility (WCAG 2.1 AA), and CSS architecture.

This is a deliberately critical review. The product already looks polished — a dark, neon-lime "developer tool" aesthetic with a coherent visual voice. The issues below are the difference between *looks good in a screenshot* and *holds up under a keyboard, a screen reader, a slow network, and a second developer editing the CSS.*

---

## 1. The Good ✅

These are genuine strengths worth protecting — don't regress them.

| Area | What's working |
|------|----------------|
| **Visual identity** | Strong, consistent brand: `#b8ff45` lime accent + near-black `#0a0a0f` base + subtle noise overlay reads as a confident "dev tool" aesthetic. |
| **Token foundation** | A real `:root` token layer exists (`--bg/2/3/4`, `--bdr`, `--a/a2/a3`, `--txt`, `--muted`, radii, fonts). The *skeleton* of a design system is here. |
| **Accent restraint** | The lime is used as an *accent*, not a flood — most surfaces are neutral, so the accent still pops. Secondary/tertiary accents (`--a2` cyan, `--a3` pink) are reserved for state, not decoration. |
| **Component polish** | Hover lifts, focus glows on inputs, the step-progress connector, floating hero badge, shimmer progress bar, pulse dots — lots of considered micro-interaction. |
| **Responsive intent** | Navbar degrades through 4 breakpoints (labels → icons → counter badge), footer regrid 4→3→2→1, hero stacks. Someone thought about small screens. |
| **Recent a11y start** | `--muted` was already bumped to `#8888a8` with a contrast comment; some `aria-label`/`aria-live` exist (WhatsNew banner, ComingSoon email). The intent is there — it's just not applied *systematically*. |

---

## 2. The Bad ❌ (findings)

Ordered by severity. IDs are referenced in the fix table at the bottom.

### 🔴 Critical — accessibility (WCAG failures / real user lockout)

**A1 — No visible keyboard focus indicator.**
`outline: none` appears **8×** across the stylesheets and there is **zero** `:focus-visible` styling anywhere in the codebase. Inputs get a `:focus` box-shadow glow, but every button (`.cta`, `.ghost`, `.dpill`, `.dtab`, `.snap9-btn`, nav buttons, pills) removes the outline and never replaces it. A keyboard-only user literally cannot see where they are. **Fails WCAG 2.4.7 (Focus Visible).**

**A2 — No `prefers-reduced-motion` support.**
Infinite animations run unconditionally: `float` (hero card + 3 chips), `pulse-dot`, `pulse-status`, `shimmer`, `spin`, plus `fadeUp`/`scale-pop` entrances. Nothing respects the OS "reduce motion" setting. **Fails WCAG 2.3.3 (Animation from Interactions)** and is a vestibular-discomfort risk.

**A3 — Form inputs without programmatic labels.**
`htmlFor` count in the codebase: **0**. The event-name input (`SetupPage`), both design-name inputs (`DesignPage`) rely on `placeholder` only. Placeholder is not an accessible name and vanishes on input. Screen-reader users hear "edit text, blank." **Fails WCAG 1.3.1 / 4.1.2 / 3.3.2.**

**A4 — Non-descriptive / missing alt text.**
`GalleryPage` selected-preview image is `alt='sel'` — meaningless to a screen reader. Alt text should describe the badge (e.g. the person's name).

**A5 — Toast is not announced.**
`Toast.js` renders a visual-only `<div>` with no `role="status"` / `aria-live`. Success/error feedback is invisible to assistive tech. (The newer `WhatsNew` banner does this correctly — `Toast` was never updated to match.)

### 🟠 High — CSS architecture correctness

**A6 — Colliding `@keyframes` names (global namespace bug).**
`@keyframes` are global. Two names are defined **twice with different bodies**:
- `pulse-dot` — `Footer.css` (opacity only) vs `Pages-Landing.css` (opacity **+ scale**).
- `fadeUp` — `Pages-Landing.css` (24px travel) vs `Pages-Legal.css` (20px travel).

Whichever file loads last silently wins for *both* consumers. This is a latent bug: reorder imports and animations change. Symptom of no single-source-of-truth for motion.

**A7 — Duplicated component rules across files.**
`.noise` and `.pg` are each defined in **both** `Global.css` and `Layout.css`, with *conflicting* values — `.noise` z-index is `1000` in Global but `1` in Layout; `.pg` has `overflow: hidden` in Global but not Layout. Last-imported wins. Dead, contradictory CSS that will mislead the next editor.

### 🟡 Medium — design-system consistency

**A8 — Hardcoded colors bypass the token layer.**
The accent lime is written as raw `#b8ff45`, its gradient partner `#7de820`, hover `#caff5a`, and `rgba(184,255,69,…)` **dozens of times** instead of `var(--a)`. The gradient-dark green and hover-lime aren't tokens at all. Result: the token system is decorative — you cannot retheme, and a color tweak means a find-and-replace across 10 files.

**A9 — Radius & spacing tokens are ignored.**
Radii tokens exist (`--r/r2/r3` = 8/12/16) but components freely use raw `9px, 10px, 14px, 20px, 22px, 100px`. There is **no spacing scale at all** — paddings/gaps are ad-hoc (`6,7,8,9,10,12,13,14,16,18,20,24,28…`). No rhythm, hard to keep consistent.

**A10 — No type scale.**
Font sizes are hand-picked per component from `9px` up to `54px` with no defined steps. `9px` and `10px` mono labels appear repeatedly — below comfortable reading size, and combined with `--muted` on elevated surfaces likely dips under 4.5:1.

### 🟡 Medium — typography

**A11 — A display font is doing body-text duty.**
`Syne` is a geometric *display* family; it's set as `--fui` and used for UI/body text down to 12–13px. At small sizes Syne is less legible than a workhorse UI face. The tell-tale symptom is already in the code: `.nav-brand-name` needs a `padding-bottom: 3px` descender hack and `letter-spacing: 0` comments to fight the display metrics. Consider a readable UI font for body, reserving Syne for headings.

**A12 — Render-blocking font load.**
Fonts come in via `@import url(...)` at the top of `Global.css` — the slowest way to load web fonts (it blocks the CSSOM and can't be preconnected). Prefer `<link rel="preconnect">` + `<link rel="stylesheet">` in `index.html`. (`display=swap` is at least present, good.)

### 🟢 Low — polish / UX

**A13 — No "skip to content" link** for keyboard users to bypass the nav.
**A14 — Low-contrast inactive step labels.** Nav step labels use `rgba(255,255,255,0.35)` (~2.5:1) — acceptable only because they're genuinely disabled, but visually near-invisible.
**A15 — Focus glows use `box-shadow` only.** Fine visually, but pair with a token so the ring color is themeable and consistent with the new `:focus-visible` ring.

### 🔴 Critical — surfaced by IDE static analysis during remediation

**A16 — Click-only `<div>`s as primary controls (no keyboard).**
The Setup upload cards and Gallery badge cards are `<div onClick>` with no `role`, `tabIndex`, or `onKeyDown`. Keyboard and screen-reader users **cannot upload files or select a badge at all** — these are the core interactions of those pages. **Fails WCAG 2.1.1 (Keyboard).** Deferred: correct fix is per-component (add `role="button"` + `tabIndex={0}` + Enter/Space handlers, or restructure around a real `<button>`/hidden `<input type=file>`), touching interaction logic — out of scope for a low-risk CSS/attribute pass.

**A17 — `<label>`s not associated with controls.**
Several `<label>` elements in Gallery/Design are visual-only (no `htmlFor`/`id` pairing, not wrapping their input). Same root cause as A3. Inputs edited in this pass received `aria-label` as an interim fix; the durable fix is `htmlFor`/`id` wiring. Deferred for the remaining Gallery labels.

---

## 3. Fixes applied

Prioritized **Critical + High** items that are objective, low-risk, and high-impact (accessibility + CSS correctness). Larger refactors (tokenization sweep, type/spacing scales, font swap, keyboard-enabling interactive divs) are documented above as tracked follow-ups so a single audit pass doesn't destabilize the working design.

| ID | Finding | Before | After (fixed) |
|----|---------|--------|---------------|
| **A1** | No visible keyboard focus | `outline: none` ×8, zero `:focus-visible` | Global `:focus-visible` ring (`2px solid var(--focus)`, offset) applies to every button/input/link |
| **A2** | No reduced-motion support | All animations run unconditionally | `@media (prefers-reduced-motion: reduce)` collapses animations/transitions app-wide |
| **A5** | Toast not announced | Visual-only `<div>` | `role=status/alert` + `aria-live` (assertive for errors, polite otherwise) + `aria-atomic` |
| **A6** | Colliding `@keyframes` | `pulse-dot` ×2 and `fadeUp` ×2 with different bodies across files | Single canonical `pulse-dot` + `fadeUp` in `Global.css`; 4 duplicate blocks removed |
| **A7** | Duplicated component rules | `.noise` & `.pg` defined in both Global + Layout with conflicting values | Consolidated to `Global.css` (noise `z-index: 1`); Layout copies removed |
| **A8** (partial) | Untokenized accent colors | `#7de820` / `#caff5a` were raw magic hex | Added `--a-d` and `--a-h` tokens (adoption across files = follow-up) |
| **A3 / A4 / A17** (interim) | Unlabeled inputs & vague alt | `event-inp`, both `pname-inp` had placeholder-only; gallery `alt='sel'` | `aria-label`s added to the three inputs; gallery alt now `Badge preview for {name}` |
| **A11** | Extended display font as body text (the "stretched" look) | `Syne` set as the single `--fui`, used for body **and** headings; needed a `padding-bottom` descender hack | Two-font system: `--fui: Inter` (body/UI, readable at 13px) + `--fdisp: Space Grotesk` (headings). All prominent titles repointed to `--fdisp`; Syne removed |
| **A12** | Render-blocking font `@import` | `@import url(...Syne...)` in **both** `Global.css` and `App.css` | Removed both; fonts now load via `<link rel="preconnect">` + stylesheet in `index.html` |

### Deferred (documented, not yet applied)

| ID | Finding | Why deferred |
|----|---------|--------------|
| A16 | Keyboard-inaccessible interactive `<div>`s | Needs per-component interaction rework (roles + key handlers) — higher risk than a CSS/attr pass |
| A8 (full) | Replace all raw `#b8ff45`/`rgba(184,255,69,…)` with tokens | Mechanical but wide (10 files); do as a focused sweep with visual regression check |
| A9 / A10 | Introduce spacing + type scales | Design-system decision; needs sign-off on the scale steps |
| A13 / A14 / A17 | Skip-link, disabled-label contrast, remaining `<label>` wiring | Small, low-risk — batch in a follow-up a11y pass |

---

## 4. How to verify the fixes

- **Keyboard:** `Tab` through any page — a lime ring should now track focus on every button, link, and input.
- **Reduced motion:** OS setting → "Reduce motion"; reload — hero card/chips/pulse dots stop looping.
- **Screen reader:** trigger a toast — it should be announced. Focus the event-name field — it should read "Event name, edit text."
- **CSS correctness:** reordering stylesheet imports no longer changes `pulse-dot`/`fadeUp` behavior or the noise layer.

---

## 3. Fixes applied

See the table at the bottom (populated after remediation). Fixes prioritize **Critical + High** (accessibility + CSS correctness) because they are objective, low-risk, and high-impact. Medium/typography items (tokenization, type scale, font swap) are larger refactors flagged as follow-ups so a single audit pass doesn't destabilize the visual design.
