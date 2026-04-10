# figma-plugin-forge

> If you are an AI or agent, start with `AGENTS.md`.

`figma-plugin-forge` is a docs-first, assistant-agnostic base for designing Figma plugins with AI. The product is the method: guides, patterns, snippets, templates, examples, and optional assistant adapters that help humans and assistants work from the same playbook.

## What This Repo Is

- A reference library for common Figma plugin architectures and decisions
- A spec-driven workflow for brainstorming, design docs, implementation plans, and review
- An AGENTS-first knowledge base that can be used by any AI, with optional adapters for specific tools

## What This Repo Is Not

- Not a monorepo of production-ready plugins
- Not a shared UI/backend package to install as-is
- Not a promise that Claude, Cursor, and Codex have identical integration surfaces

## Two Modes of Use

`figma-plugin-forge` is used in two distinct modes:

- **Repo mode (canonical)**: clone this repo as your workspace and read `AGENTS.md` plus `docs/` directly. All patterns, snippets, templates, examples, and guides are available with zero setup. This is the recommended path.
- **Bundle mode (convenience)**: install this repo's skills or adapter assets into another assistant context so the workflow is available while you work in a different target repo. Skills are self-contained and carry mirrored template shapes; bundle mode still benefits from a local checkout of this repo alongside your target repo.

When the two modes disagree on a fact, repo mode wins. See [Distribution Modes](docs/guides/distribution-modes.md) for the support matrix, limitations, and conflict rules.

## Choose Your Path

### 1. Human-first

Read [Start Here](docs/guides/start-here.md), then [Spec-Driven Workflow](docs/guides/spec-driven-workflow.md), then browse the pattern catalog in [docs/patterns/README.md](docs/patterns/README.md).

### 2. AI-first, tool-agnostic

Read [AGENTS.md](AGENTS.md), then [Source of Truth](docs/guides/source-of-truth.md), then the relevant guide, pattern, snippet, template, or example.

### 3. Optional assistant adapters

Read [Assistant Integrations](docs/guides/assistant-integrations.md). The official path is still AGENTS-first; tool-specific assets are optional adapters, not the source of truth.

## Repo Map

```text
figma-plugin-forge/
|-- README.md                  # Human-facing entrypoint
|-- AGENTS.md                  # AI-facing entrypoint
|-- CLAUDE.md                  # Claude-friendly alias to AGENTS.md
|-- docs/
|   |-- guides/                # How to use the repo and maintain the method
|   |-- patterns/              # Architectural archetypes and decision guides
|   |-- snippets/              # Copy-adapt snippets with context and limits
|   |-- templates/             # Blank design doc and implementation plan templates
|   |-- examples/              # Filled examples that prove the workflow
|   `-- plans/                 # User-generated active plans and design docs
|-- skills/                    # Optional workflow adapters for assistants
|-- agents/                    # Optional reviewer personas
|-- .claude-plugin/            # Optional Claude-facing metadata
|-- .cursor-plugin/            # Optional Cursor-facing metadata
|-- .codex/                    # Optional Codex usage notes
`-- hooks/                     # Optional helper scripts for assistant adapters
```

## Recommended Reading Order

- Humans: [docs/guides/start-here.md](docs/guides/start-here.md) -> [docs/guides/spec-driven-workflow.md](docs/guides/spec-driven-workflow.md) -> [docs/patterns/README.md](docs/patterns/README.md)
- AIs: [AGENTS.md](AGENTS.md) -> [docs/guides/source-of-truth.md](docs/guides/source-of-truth.md) -> relevant guide/pattern/snippet
- Maintainers: [docs/guides/maintaining-the-method.md](docs/guides/maintaining-the-method.md)

## Philosophy

- Docs are the product
- `AGENTS.md` plus `docs/` are the canonical source of truth
- Skills and adapters should route into the docs, not compete with them
- Snippets should teach shape and constraints, not pretend to be a framework package
- Working plugin code should usually live in the target repo, not here

## License

MIT
