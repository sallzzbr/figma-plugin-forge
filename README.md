# figma-plugin-forge

A **Claude Code plugin** for building Figma plugins well — skills, slash commands,
specialized agents, and two verified starter templates (with or without a backend).
The knowledge is plain markdown, so Cursor and Codex (or any AI) can use it too.

It makes your coding agent stop and think before it writes: brainstorm the idea,
pick an architecture pattern, write a plan, scaffold from a build-verified template,
implement against the Figma API (without the usual gotchas), and verify a clear
Definition of Done.

## Install

### Claude Code (recommended)

```shell
/plugin marketplace add sallzzbr/figma-plugin-forge
/plugin install figma-plugin-forge@figma-plugin-forge
```

Installs the skills, commands (`/new-figma-plugin`, `/add-figma-backend`,
`/review-figma-plugin`), and agents. Skills activate automatically as you work.

### Cursor

```shell
git clone https://github.com/sallzzbr/figma-plugin-forge.git
```

Open the folder as a workspace — `.cursor/rules/figma-plugin-forge.mdc` loads the
method and points Cursor at `skills/`.

### Codex / any other AI

```shell
git clone https://github.com/sallzzbr/figma-plugin-forge.git
```

Point the AI at [`AGENTS.md`](AGENTS.md). It routes into `skills/`, the single
source of truth. No adapter required.

## How it works

1. **Brainstorm → design** (`skills/brainstorming/`) — one question at a time, then
   a short design doc. No code yet.
2. **Pick a pattern** (`skills/plugin-architecture/references/patterns/`) —
   local-audit, llm-analysis, spec-generation, or library-sync.
3. **Write a plan** (`skills/writing-plans/`) — task-by-task, with file paths and
   verification steps.
4. **Scaffold** — copy a verified template verbatim (never retype config):
   `templates/starter-plugin/` (local) or `templates/starter-plugin-backend/` (backend).
5. **Implement** — with the Figma API knowledge in `skills/figma-api-patterns/`
   (curated reference + common pitfalls) and the typed bridge from the template.
6. **Review** — verify the Definition of Done (`/review-figma-plugin`).

## What's inside

### Skills (the method + knowledge — source of truth)

| Skill | For |
| --- | --- |
| `using-figma-plugin-forge` | Routes into the whole flow |
| `brainstorming` | Shaping a new plugin or feature |
| `writing-plans` | Turning a design into a task-by-task plan |
| `executing-plans` | Implementing with verification gates |
| `figma-api-patterns` | Figma Plugin API + the common pitfalls |
| `plugin-architecture` | Patterns, runtime split, messaging |
| `figma-backend-integration` | Agnostic backend + local fallback |

Each skill is a concise `SKILL.md` plus a `references/` folder holding the absorbed
reference material (API reference, pitfalls, patterns, snippets, templates, examples).

### Commands

- `/new-figma-plugin` — brainstorm → design → plan → scaffold → implement.
- `/add-figma-backend` — add an agnostic backend path (with fallback) to a plugin.
- `/review-figma-plugin` — review against the Definition of Done.

### Agents

- `figma-plugin-architect` — designs the runtime split and typed contracts.
- `code-reviewer` — reviews against the Definition of Done.

### Templates (verified — copy verbatim)

- `templates/starter-plugin/` — local-only. esbuild + Preact + Tailwind v4, a
  **typed message bridge** (fire-and-forget events + correlated request/response),
  a small UI component set, Vitest, ESLint, and CI.
- `templates/starter-plugin-backend/` — the above plus a **vendor-agnostic backend
  layer** (`config`/`client`/`fallback`) and a **Supabase Edge Function** adapter,
  with a local fallback so the plugin works even when the backend is down.

### Validation

```bash
node scripts/validate-scaffold.mjs --path templates/starter-plugin   # plugin basics + build
node scripts/validate-links.mjs                                      # doc/link integrity
```

## Definition of Done

Every generated plugin must pass:

- `npm run lint && npm run typecheck && npm test && npm run build` succeed.
- `manifest.json`: `documentAccess: "dynamic-page"`; `networkAccess.allowedDomains`
  non-empty and specific (`["none"]` if local-only; never `"*"`); `main`/`ui` exist.
- `build/ui.html` is self-contained (no external `<script src>` / `<link href>`).
- Runtime split: no `figma.*` in the UI; no DOM / `fetch` / `btoa` in the main thread.
- Cross-page access calls `await figma.loadAllPagesAsync()`; text edits call
  `await figma.loadFontAsync(...)` first.
- Every main ↔ UI message is a typed, type-guarded plain object (no raw nodes).
- Backend (if any): `fetch` only in the UI, wrapped in a fallback; only public keys shipped.

## Philosophy

- **Think before you code.** Design docs and plans prevent the most expensive bug:
  building the wrong thing.
- **One source of truth.** The method lives in `skills/`; everything else points to it.
- **Explicit contracts.** Every runtime and backend boundary gets a typed contract.
- **Teach the API.** Patterns without API knowledge produce elegant, broken plugins.
- **Templates are canonical.** Examples and snippets illustrate; the templates are
  build-verified and meant to be copied verbatim.

## Repo map

```text
figma-plugin-forge/
├── README.md                  # you are here
├── AGENTS.md                  # AI entrypoint → routes into skills/
├── skills/                    # the method + knowledge (source of truth)
├── commands/                  # Claude Code slash commands
├── agents/                    # architect + reviewer
├── templates/
│   ├── starter-plugin/         # verified local-only scaffold
│   └── starter-plugin-backend/ # verified backend scaffold (+ Supabase adapter)
├── scripts/                   # validate-scaffold.mjs, validate-links.mjs
├── .cursor/rules/             # Cursor adapter
└── .claude-plugin/            # Claude Code plugin manifest
```

## Contributing

1. Fork the repo.
2. Make changes; keep skills as the source of truth and templates build-verified.
3. Run `node scripts/validate-links.mjs` and
   `node scripts/validate-scaffold.mjs --path templates/starter-plugin` (and the
   backend template) before submitting.
4. Open a PR.

## License

MIT
