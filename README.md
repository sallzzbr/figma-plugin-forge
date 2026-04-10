# figma-plugin-forge

A complete method for designing and building Figma plugins with AI, built on composable docs, skills, and patterns that make sure your coding agent doesn't skip the thinking before it starts writing.

## How It Works

It starts from the moment you fire up your coding agent. Instead of jumping straight into writing plugin code (and immediately hitting Figma API gotchas), the agent steps back and asks what you're really trying to build.

Once it has teased a spec out of the conversation, it picks the closest architecture pattern — local audit, LLM analysis, spec generation, or library sync — and writes a design doc with explicit contracts for every runtime boundary.

After you sign off on the design, the agent produces a task-by-task implementation plan with exact file paths, typed message contracts, and verification steps. Each task is small enough to review and commit independently.

When it's time to code, the agent knows the Figma Plugin API: which calls are async, why you need `loadFontAsync` before touching text, why fills aren't always solid colors, and how to export without blowing up memory. It follows a curated pitfalls guide so it doesn't make the mistakes every AI makes on its first Figma plugin.

There's a bunch more to it — snippets, templates, examples, a validation script — but that's the core. Your coding agent gets a method, not just autocomplete.

## Installation

> **If you are an AI or agent**, start with [`AGENTS.md`](AGENTS.md).

Installation differs by platform. Some have full adapter support, others use the docs-first path directly. See [distribution modes](docs/guides/distribution-modes.md) for the full explanation.

### Claude Code

Clone the repo and use it as a reference workspace, or install as a plugin:

```shell
# Option 1: Clone as workspace (full access to all docs, patterns, examples)
git clone https://github.com/sallzzbr/figma-plugin-forge.git
cd figma-plugin-forge
# Start Claude Code — it reads AGENTS.md automatically

# Option 2: Install as plugin (skills only, bundle mode)
claude plugin add sallzzbr/figma-plugin-forge
```

**Status:** Repo mode fully supported. Plugin mode provides metadata only (`.claude-plugin/plugin.json`); no dedicated hook adapter in this cycle.

### Cursor

```shell
# Clone the repo and open it as a Cursor workspace
git clone https://github.com/sallzzbr/figma-plugin-forge.git
# Open the folder in Cursor — the plugin adapter loads automatically
```

**Status:** Repo mode fully supported. Optional Cursor hook adapter (`.cursor-plugin/plugin.json` + `hooks/session-start.js`) injects startup context automatically. The adapter assumes this repo is the workspace root.

### Codex

```shell
# Clone the repo and point Codex at AGENTS.md
git clone https://github.com/sallzzbr/figma-plugin-forge.git
```

Or tell Codex directly:

```
Read AGENTS.md and docs/guides/source-of-truth.md from this repository, then follow the reading hierarchy.
```

**Status:** Repo mode only. No `.codex-plugin` bundle in this cycle. See [`.codex/README.md`](.codex/README.md).

### Any Other AI

The method is assistant-agnostic. Any AI that can read files works:

1. Clone the repo
2. Point the AI at `AGENTS.md`
3. Follow the reading hierarchy

No adapter required. The docs are the product.

### Verify Installation

Start a new session and describe a Figma plugin idea. The agent should:
- Ask clarifying questions instead of jumping to code
- Reference a pattern from `docs/patterns/`
- Propose a design doc before writing implementation code

If it goes straight to coding, it hasn't picked up the method. Check that `AGENTS.md` is visible to the agent.

## The Basic Workflow

1. **Brainstorming** — The agent asks questions one at a time across 9 areas (purpose, UI shape, canvas interaction, backend needs, etc.), then writes a design doc. No code until the design is explicit.

2. **Pattern selection** — The agent picks the closest architecture: [local-audit](docs/patterns/local-audit.md), [llm-analysis](docs/patterns/llm-analysis.md), [spec-generation](docs/patterns/spec-generation.md), or [library-sync](docs/patterns/library-sync.md).

3. **Writing plans** — The design becomes a task-by-task implementation plan with exact file paths, typed contracts, verification steps, and commit messages. Each task is 2–5 minutes of work.

4. **Executing plans** — Tasks are implemented one at a time with verification gates. If the plan is wrong, the agent updates the plan before continuing — no silent scope drift.

5. **Figma API awareness** — During implementation, the agent follows the [curated API reference](docs/guides/figma-api-reference.md) and [common pitfalls guide](docs/guides/common-pitfalls.md). It knows about `loadFontAsync`, type narrowing, export constraints, and the 15 most common plugin bugs.

6. **Project setup** — New projects follow an [opinionated stack](docs/guides/project-setup.md): esbuild + Preact + Tailwind + `@figma/plugin-typings`, with a working build script and file structure.

The agent checks for relevant skills before any task. These are mandatory workflows, not suggestions.

## What's Inside

### Skills (workflow adapters)

| Skill | When it activates |
| --- | --- |
| `using-figma-plugin-forge` | Session start — routes into the docs-first workflow |
| `brainstorming` | Shaping a new plugin or major feature |
| `writing-plans` | After a design doc is approved |
| `executing-plans` | When a plan exists and it's time to implement |
| `figma-api-patterns` | Working with the Figma Plugin API |
| `plugin-architecture` | Questions about structure, setup, or boundaries |

### Guides

| Guide | What it covers |
| --- | --- |
| [start-here.md](docs/guides/start-here.md) | How to use this repo without confusing it for a plugin package |
| [distribution-modes.md](docs/guides/distribution-modes.md) | Repo mode vs bundle mode |
| [spec-driven-workflow.md](docs/guides/spec-driven-workflow.md) | The full design → plan → implement → review loop |
| [figma-api-reference.md](docs/guides/figma-api-reference.md) | Curated Figma API with gotchas and correct examples |
| [common-pitfalls.md](docs/guides/common-pitfalls.md) | 15 errors every AI makes and their fixes |
| [project-setup.md](docs/guides/project-setup.md) | Opinionated stack: esbuild + Preact + Tailwind |
| [source-of-truth.md](docs/guides/source-of-truth.md) | Ownership rules and conflict resolution |
| [assistant-integrations.md](docs/guides/assistant-integrations.md) | Per-platform adapter matrix and limitations |
| [maintaining-the-method.md](docs/guides/maintaining-the-method.md) | Drift checklist + scripted validation |

### Patterns (architecture archetypes)

| Pattern | Good fit |
| --- | --- |
| [local-audit](docs/patterns/local-audit.md) | Accessibility checks, naming validation, style compliance — no backend |
| [llm-analysis](docs/patterns/llm-analysis.md) | LLM-powered review of selections, optional backend |
| [spec-generation](docs/patterns/spec-generation.md) | Turn selections into structured artifacts (specs, requirements, QA) |
| [library-sync](docs/patterns/library-sync.md) | Component and token sync, library state tracking |

Plus supporting decisions: [runtime-split](docs/patterns/runtime-split.md), [messaging-bridge](docs/patterns/messaging-bridge.md), [optional-backend](docs/patterns/optional-backend.md), [shared-concerns](docs/patterns/shared-concerns.md).

### Snippets (typed code shapes)

- [main-thread](docs/snippets/main-thread.md) — Figma sandbox side with typed messages
- [ui-iframe](docs/snippets/ui-iframe.md) — UI side with type guards
- [messaging-bridge](docs/snippets/messaging-bridge.md) — Cross-boundary contract exemplar
- [optional-backend](docs/snippets/optional-backend.md) — Backend request with typed errors
- [manifest](docs/snippets/manifest.md) — Plugin manifest checklist

### Examples (end-to-end proofs)

| Archetype | Example | Files |
| --- | --- | --- |
| `llm-analysis` | Frame Review Assistant | [design doc](docs/examples/2026-04-08-design-doc-example.md), [plan](docs/examples/2026-04-08-implementation-plan-example.md) |
| `local-audit` | Contrast Auditor | [design doc](docs/examples/2026-04-09-local-audit-design-doc-example.md), [plan](docs/examples/2026-04-09-local-audit-implementation-plan-example.md) |
| `spec-generation` | Component Spec Extractor | [design doc](docs/examples/2026-04-09-spec-generation-design-doc-example.md), [plan](docs/examples/2026-04-09-spec-generation-implementation-plan-example.md) |

### Validation

```bash
node scripts/validate-docs.mjs
```

Checks broken links, absolute path leakage, archetype coverage, mirror drift, and integration matrix consistency. Run before committing method changes.

## Philosophy

- **Docs are the product.** The method lives in `AGENTS.md` plus `docs/`, not in plugin code.
- **Think before you code.** Design docs and plans prevent the most expensive class of bugs: building the wrong thing.
- **Explicit contracts over hidden conventions.** Every runtime boundary gets a typed message contract.
- **Teach the API, not just the architecture.** Patterns without API knowledge produce elegant designs and broken plugins.
- **Honest about limitations.** Not all platforms have full adapter support. The docs always work.

## Repo Map

```text
figma-plugin-forge/
├── README.md                  # You are here
├── AGENTS.md                  # AI-facing entrypoint
├── CLAUDE.md                  # Claude-friendly alias
├── docs/
│   ├── guides/                # How to use the repo, API reference, pitfalls, setup
│   ├── patterns/              # Architecture archetypes and decisions
│   ├── snippets/              # Typed code shapes
│   ├── templates/             # Blank design doc and plan templates
│   ├── examples/              # Filled examples proving the workflow
│   └── plans/                 # User-generated active plans
├── skills/                    # Workflow adapters for assistants
├── agents/                    # Reviewer personas
├── scripts/                   # Editorial validation (validate-docs.mjs)
├── .claude-plugin/            # Claude metadata (optional)
├── .cursor-plugin/            # Cursor adapter (optional)
├── .codex/                    # Codex usage notes (optional)
└── hooks/                     # Helper scripts for adapters
```

## Contributing

1. Fork the repository
2. Read `docs/guides/maintaining-the-method.md` for the editorial rules
3. Run `node scripts/validate-docs.mjs` before submitting
4. Submit a PR

To add a new pattern, example, or skill, follow the existing format in the relevant directory.

## License

MIT
