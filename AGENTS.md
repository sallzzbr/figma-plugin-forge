# figma-plugin-forge — agent entrypoint

This repo is a **Claude Code plugin** for building Figma plugins well — but the
knowledge is plain markdown, so any AI (Codex, etc.) can use it. The `skills/`
directory is the **single source of truth**; this file just routes you into it.
(Cursor users: `.cursor/rules/` loads automatically. Claude Code: install the
plugin and the skills/commands/agents activate.)

## When the user wants to build or change a Figma plugin

Do NOT jump to code. Follow the flow, reading the skill at each step:

1. **Brainstorm → design** — `skills/brainstorming/SKILL.md`. One question at a
   time; produce a short design doc.
2. **Pick a pattern** — `skills/plugin-architecture/SKILL.md` and
   `skills/plugin-architecture/references/patterns/` (local-audit, llm-analysis,
   spec-generation, library-sync).
3. **Write a plan** — `skills/writing-plans/SKILL.md` (task-by-task, file paths,
   verification steps).
4. **Scaffold from a verified template — copy verbatim, do not retype config:**
   - no backend → `templates/starter-plugin/`
   - with backend → `templates/starter-plugin-backend/`
5. **Implement** — `skills/figma-api-patterns/` (API + pitfalls),
   `skills/plugin-architecture/` (runtime split + messaging),
   `skills/figma-backend-integration/` (backend + fallback).
6. **Review** — `skills/executing-plans/SKILL.md`; verify the Definition of Done.

## Invariants (every generated plugin must hold)

- **Runtime split.** Main thread = Figma sandbox: owns `figma.*`, selection,
  traversal, export, clientStorage; NO DOM / `fetch` / `btoa` / `window` /
  `document` / `localStorage`. UI iframe = rendering, input, `fetch`; NO `figma.*`.
- **Typed messages.** Every main ↔ UI message is a typed, type-guarded plain
  object (no raw nodes). See `templates/starter-plugin/src/types/messages.ts` and
  the bridge helpers `bridge.ts` / `main-bridge.ts`.
- **manifest.json.** `documentAccess: "dynamic-page"`; `networkAccess.allowedDomains`
  non-empty and specific (`["none"]` if local-only; never `"*"`); `main`/`ui` exist
  after build.
- **Self-contained UI.** `build/ui.html` has no external `<script src>` / `<link
  href>` and no leftover placeholders.
- **Async API.** Node lookups use `figma.getNodeByIdAsync`; cross-page work calls
  `await figma.loadAllPagesAsync()` first; `await figma.loadFontAsync(...)` before
  editing text.
- **Backend.** `fetch` only in the UI; wrap calls in a local fallback; ship only
  public/anon keys (never secrets).

## Definition of Done

`npm run lint && npm run typecheck && npm test && npm run build` in the plugin dir,
then `node scripts/validate-scaffold.mjs --path <plugin-dir>`.

## Repo map

- `skills/` — the method + knowledge (source of truth); each has `SKILL.md` + `references/`.
- `commands/` — Claude Code slash commands: `/new-figma-plugin`, `/add-figma-backend`, `/review-figma-plugin`.
- `agents/` — `figma-plugin-architect` (design) and `code-reviewer` (review).
- `templates/` — `starter-plugin/` (local) and `starter-plugin-backend/` (backend); verified, copy verbatim.
- `scripts/` — `validate-scaffold.mjs` (plugin basics) and `validate-links.mjs` (doc-link integrity).
- `.cursor/rules/` — Cursor adapter pointing at `skills/`.
- `.claude-plugin/` — Claude Code plugin manifest.
