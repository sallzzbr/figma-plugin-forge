# figma-plugin-forge

> If you are an AI or agent, start with `AGENTS.md`.

Open-source framework for building Figma plugins with AI-assisted spec-driven development. This monorepo provides a shared component library, four boilerplate plugins covering common Figma plugin patterns, an optional Supabase backend template, and AI skills for Claude Code, Codex, and Cursor.

## What is inside

```text
figma-plugin-forge/
|-- packages/
|   `-- shared/                    # Reusable UI, services, types, and styles
|-- plugins/
|   |-- ds-audit/                  # Design System audit (local rules)
|   |-- ui-review/                 # LLM-powered UX/UI analysis
|   |-- ds-library-sync/           # DS library extraction and sync
|   `-- spec-generator/            # Requirements generation from frames
|-- backend/                       # Optional Supabase Edge Functions template
|-- skills/                        # AI skills for Claude Code, Codex, Cursor
|-- agents/                        # Code reviewer agent
|-- docs/
|   |-- templates/                 # Design doc and plan templates
|   `-- plans/                     # Design docs and execution plans
|-- AGENTS.md                      # Global rules for AI and agents
`-- README.md                      # This file
```

## Boilerplate plugins

| Plugin             | What it does                                            | Backend required |
| ------------------ | ------------------------------------------------------- | ---------------- |
| `ds-audit`         | Audits Design System usage locally against synced state | No               |
| `ui-review`        | Analyzes frames with LLM across UX/UI heuristic tabs   | Yes              |
| `ds-library-sync`  | Extracts DS library components/variables and syncs      | Yes              |
| `spec-generator`   | Generates product requirements from selected frames     | Yes              |

## Quick start

### Prerequisites

- Node.js >= 18
- npm (ships with Node)
- A Figma desktop app for loading plugins in development

### Install dependencies

```bash
npm install
```

### Run a plugin in development

```bash
npm run ds-audit:dev
npm run ui-review:dev
npm run ds-library-sync:dev
npm run spec-generator:dev
```

### Build a plugin

```bash
npm run ds-audit:build
npm run ui-review:build
npm run ds-library-sync:build
npm run spec-generator:build
```

### Build all plugins

```bash
npm run build:all
```

## Using with AI assistants

### Option A: Just read the docs (any AI)

Point your AI assistant at `AGENTS.md` in the repository root. It contains the full context needed to navigate and contribute to this codebase without installing anything.

### Option B: Install as plugin (Claude Code / Cursor / Codex)

The `skills/` directory contains AI skills that can be installed into Claude Code, Cursor, or Codex for guided workflows like brainstorming, plan writing, and plan execution.

## Build pipeline

Each plugin follows this build flow:

1. **Tailwind CSS**: `src/input.css` is compiled to `src/output.css`
2. **@create-figma-plugin/build**: compiles `main.ts` and `ui.tsx` into `build/main.js` and `build/ui.js`
3. **build-html.js**: embeds the compiled CSS and JS into `build/ui.html` for the Figma iframe

Generated artifacts (`output.css`, `build/`) should never be edited directly. Always edit the source.

## Documentation convention

Each module maintains two documentation files:

- `README.md` for human onboarding, usage, and commands
- `AGENTS.md` for AI/agent operational context and maintenance rules

Root-level `AGENTS.md` holds global patterns and contracts. Module-level `AGENTS.md` files hold local context. Prefer linking to the root file over duplicating global rules.

## License

MIT
