---
description: Start a new Figma plugin — brainstorm, design, plan, scaffold, and implement with figma-plugin-forge.
argument-hint: [short description of the plugin idea]
---

Start a new Figma plugin using the figma-plugin-forge method. Do not skip ahead to code.

Idea (may be empty): $ARGUMENTS

1. Invoke the `brainstorming` skill to turn the idea into a design. Ask one question at a
   time across purpose, UI shape, canvas interaction, backend needs, auth, storage, and data
   flow. Produce a short design doc (template: `skills/brainstorming/references/design-doc-template.md`).
2. Pick the closest architecture pattern (see `skills/plugin-architecture/references/patterns/`):
   local-audit, llm-analysis, spec-generation, or library-sync. State the runtime split and
   every typed message / backend contract explicitly.
3. Invoke `writing-plans` for a task-by-task implementation plan with exact file paths and
   verification steps (template: `skills/writing-plans/references/plan-template.md`).
4. Scaffold by COPYING a verified template verbatim — never retype config from prose:
   - no backend → `templates/starter-plugin/`
   - calls a backend → `templates/starter-plugin-backend/`
   Copy it to the target location, rename it, and set `manifest.json` `id` + `networkAccess`.
5. Implement against the plan. Keep the runtime split (no `figma.*` in the UI; no DOM/`fetch`
   in main). Add cross-thread messages via `src/types/messages.ts` + the bridge helpers.
6. Verify the Definition of Done in the plugin dir:
   `npm run lint && npm run typecheck && npm test && npm run build`, then
   `node scripts/validate-scaffold.mjs --path <plugin-dir>`.

Reference knowledge lives in the skills: `figma-api-patterns` (API + pitfalls),
`plugin-architecture` (patterns, runtime split, messaging), `figma-backend-integration`
(backend + fallback).
