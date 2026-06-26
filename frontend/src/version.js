/**
 * Centralized version management.
 *
 * Bump rules:
 *   PATCH  x.x.↑  – bug fixes, copy edits, minor style tweaks
 *   MINOR  x.↑.0  – new features, new pages, UI enhancements
 *   MAJOR  ↑.0.0  – breaking changes, full redesign, auth system launch
 *
 * Update VERSION and add an entry to CHANGELOG on every meaningful release.
 */

export const VERSION = "1.2.0";

export const CHANGELOG = [
  {
    version: "1.2.0",
    date: "2026-06-26",
    note: "Legal pages (About, Terms, Privacy), auth stubs (Coming Soon), footer & navbar redesign, WCAG color improvements",
  },
  {
    version: "1.1.0",
    date: "2026-06-26",
    note: "SVG icon system, landing page redesign with hero visual and How-it-works section, step-icon navbar",
  },
  {
    version: "1.0.0",
    date: "2025-01-01",
    note: "Initial public release — client-side badge generation, Arabic RTL support, ZIP export",
  },
];
