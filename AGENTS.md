# figma-plugin-forge - Agent Context

## Repo contract

This repository is a docs-first, assistant-agnostic base for designing and planning Figma plugins with AI.

Its primary outputs are:

- workflow guidance
- architecture patterns
- reusable snippets
- design doc and implementation plan templates
- examples that prove the method
- optional assistant skills and adapters

This repository is not a buildable monorepo of plugin applications. Implementation code should usually live in the user's target repo, not here, unless the user is explicitly improving this method repository.

## Canonical source of truth

`AGENTS.md` plus `docs/` are the canonical source of truth for this repo.

If any skill, adapter, helper script, or assistant-specific metadata disagrees with `AGENTS.md` or `docs/`, follow `AGENTS.md` plus `docs/` and treat the other asset as stale.

Read [docs/guides/source-of-truth.md](docs/guides/source-of-truth.md) for ownership and conflict rules.

## Reading hierarchy

Use this order unless the user gives a more specific path:

1. [docs/guides/source-of-truth.md](docs/guides/source-of-truth.md)
2. [docs/guides/distribution-modes.md](docs/guides/distribution-modes.md)
3. [docs/guides/spec-driven-workflow.md](docs/guides/spec-driven-workflow.md)
4. The relevant pattern in [docs/patterns/README.md](docs/patterns/README.md)
5. The matching snippet in [docs/snippets/README.md](docs/snippets/README.md) only if you need code shape
6. The relevant template or filled example

When writing implementation code, also read:

7. [docs/guides/figma-api-reference.md](docs/guides/figma-api-reference.md) — curated API with gotchas and correct examples
8. [docs/guides/common-pitfalls.md](docs/guides/common-pitfalls.md) — the 15 most common mistakes
9. [docs/guides/project-setup.md](docs/guides/project-setup.md) — opinionated stack for new projects

## Responsibility by surface

- `README.md`: human positioning and path selection
- `AGENTS.md`: AI-facing contract, invariants, and routing
- `docs/guides/`: usage and maintenance of the method, including `distribution-modes.md` for repo mode vs bundle mode
- `docs/patterns/`: architecture and decision guidance
- `docs/snippets/`: code references with context and limits
- `docs/templates/`: blank artifacts
- `docs/examples/`: filled artifacts that prove the method
- `docs/plans/`: active, user-generated work artifacts
- `skills/`: thin workflow adapters
- `.claude-plugin/`, `.cursor-plugin/`, `.codex/`, `hooks/`: optional assistant-specific adapters

## Standard workflow

1. Clarify the plugin idea
2. Pick the closest pattern
3. Write a design doc
4. Write an implementation plan
5. Implement in the target repo
6. Review against the plan and runtime rules
7. Feed reusable improvements back into this method repo

## Runtime rules

Main thread:

- Runs inside Figma's sandbox
- Owns `figma.*`, selection, traversal, export, and client storage
- Must not rely on DOM or browser-only APIs

UI iframe:

- Owns rendering, input, fetch, and browser helpers
- Must not access `figma.*` directly

Communication:

- Cross the boundary explicitly with typed messages
- Keep request and response shapes stable once documented
- Document every contract that crosses runtime or backend boundaries

## Working rules

- Prefer AGENTS-first over tool-specific setup
- Prefer patterns over fake framework packaging
- Prefer explicit contracts over hidden conventions
- Treat examples and snippets as illustrative, not canonical production code
- Preserve assistant agnosticism unless the user explicitly asks for a tool-specific path

## Assistant adapters

- `CLAUDE.md` is an alias file for Claude-oriented tooling. It is not a filesystem symlink.
- `.cursor-plugin/` and `hooks/` are optional Cursor-oriented adapters.
- `.claude-plugin/` is intentionally lightweight metadata.
- `.codex/README.md` documents the current Codex path. There is no `.codex-plugin` in this repository.

Read [docs/guides/assistant-integrations.md](docs/guides/assistant-integrations.md) for the current adapter matrix, requirements, and limits.

## Editorial drift checklist

Before finishing changes to the method:

- If `README.md` or `AGENTS.md` changed, review `docs/guides/assistant-integrations.md`
- If a template changed, review `docs/examples/` and any skills that mention that template
- If a pattern changed, review related snippets and skills that route to it
- If an adapter changed, review the integration matrix and state runtime requirements explicitly
- Confirm there are no machine-local absolute links in versioned docs

Read [docs/guides/maintaining-the-method.md](docs/guides/maintaining-the-method.md) for the full maintenance checklist.
