# Distribution Modes

`figma-plugin-forge` is both a method you read and a set of assets you can install into an assistant. This guide defines the two modes in which the repo is used and which mode is supported where.

## Repo mode (canonical)

Clone or open this repo as your workspace and read `AGENTS.md` plus `docs/` directly.

- Works with any AI or human, with zero setup beyond reading files.
- All patterns, snippets, templates, examples, and guides are available.
- The source of truth is always visible and inspectable.
- Recommended for anyone designing or maintaining a Figma plugin with this method.

Repo mode is the canonical path. Any other mode is a convenience layer over it.

## Bundle mode (convenience)

Install this repo's skills or adapter assets into another assistant context, so the workflow is available while you work on a different target repo.

- Skills are self-contained: they embed a mirror of the design-doc and implementation-plan template shape so they can run without access to `docs/templates/`.
- Mirrors declare provenance and are drift-checked by `scripts/validate-docs.mjs`.
- Bundle mode still recommends having a local checkout of this repo alongside your target repo, so you can reach the full pattern catalog, examples, and guides when the embedded shape is not enough.
- Bundle mode does not promise parity with repo mode. It is a router into the method, not a replacement for it.

## Support matrix

| Assistant | Repo mode | Bundle mode | Current limitation |
| --- | --- | --- | --- |
| Any AI | Yes | N/A | None beyond the host reading repo files |
| Claude | Yes | Metadata only (`.claude-plugin/plugin.json`) | No dedicated hook or skill bundle in this cycle |
| Cursor | Yes | Optional hook adapter via `.cursor-plugin/plugin.json` and `hooks/hooks-cursor.json` | Paths in `plugin.json` resolve from the workspace root, so the Cursor bundle assumes this repo is the Cursor workspace; it is not a portable drop-in for arbitrary repos |
| Codex | Yes | Not shipped this cycle | `.codex/README.md` documents the AGENTS-first path only |

See [assistant-integrations.md](assistant-integrations.md) for per-assistant asset inventory and runtime requirements.

## Conflict rule

When the two modes describe the same fact differently, repo mode wins.

- If an embedded mirror in a skill disagrees with the canonical file in `docs/templates/`, the canonical file is correct.
- If an adapter metadata file disagrees with `AGENTS.md`, treat the adapter as stale.
- If a bundle mode install seems to promise more than it delivers, read [source-of-truth.md](source-of-truth.md) and follow repo mode instead.

## When to choose which

Choose **repo mode** when:

- you are designing a new plugin from scratch
- you are maintaining or extending `figma-plugin-forge` itself
- you need access to every pattern, snippet, and example
- you want the method's canonical reading hierarchy visible in the file tree

Choose **bundle mode** when:

- you are already working in a different target repo and want the workflow routed into your assistant
- you only need the spec-driven loop (brainstorm, design doc, plan, execute) rather than the full pattern catalog
- you accept that some embedded shapes may lag the canonical files and should be drift-checked

## Keeping mode discipline

- Skills must declare whether they are repo-mode-only or bundle-mode-safe. Bundle-mode-safe skills carry a mirror provenance block at the top.
- Mirrors must be kept in sync with the canonical files in `docs/templates/`. Drift is caught by `scripts/validate-docs.mjs`.
- New adapters should describe their supported modes and current limitations in [assistant-integrations.md](assistant-integrations.md) before they are announced anywhere else.
