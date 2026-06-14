---
description: Review a Figma plugin against the figma-plugin-forge Definition of Done and architecture rules.
argument-hint: "[path to plugin dir, default .]"
---

Review the Figma plugin for correctness and architecture. Target dir: $ARGUMENTS (default: current directory).

1. Use the `figma-plugin-architect` agent for structure/contracts and the `code-reviewer`
   agent for correctness.
2. Run the mechanical gate in the plugin dir and report the REAL output (not assumptions):
   `node scripts/validate-scaffold.mjs --path <dir>` and
   `npm run lint && npm run typecheck && npm test && npm run build`.
3. Check the Definition of Done:
   - `manifest.json`: `documentAccess` is `"dynamic-page"`; `networkAccess.allowedDomains`
     non-empty and specific (no `"*"`); `main`/`ui` exist after build.
   - `build/ui.html` self-contained (no external `<script src>` / `<link href>`, no placeholders).
   - Runtime split: no `figma.*` in UI files; no DOM / `fetch` / `btoa` in the main thread.
   - Every cross-boundary message is a typed, type-guarded plain object (no raw nodes).
   - Node access across pages calls `await figma.loadAllPagesAsync()` first.
   - Backend (if any): `fetch` only in the UI; calls wrapped in a fallback; only public keys shipped.
4. Cross-check against `skills/figma-api-patterns/references/common-pitfalls.md`.
5. Report findings grouped by severity with `file:line` and concrete fixes.
