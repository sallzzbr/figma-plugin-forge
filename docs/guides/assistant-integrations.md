# Assistant Integrations

The official path for `figma-plugin-forge` is always AGENTS-first.

Assistant-specific assets are optional adapters that route into the same method.

## Integration matrix

| Assistant | Official path | Assets in repo | Runtime requirements | Current limitations |
| --- | --- | --- | --- | --- |
| Any AI | Read `AGENTS.md` and `docs/` directly | `AGENTS.md`, `docs/`, `skills/` | None beyond the host reading repo files | No tool-specific automation |
| Claude Code | AGENTS-first, or install via marketplace | `CLAUDE.md`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `skills/`, `agents/` | None for docs-first use; marketplace install requires Claude Code CLI | Marketplace installs skills and agents; full docs/patterns/examples available in repo mode. See [Claude Code marketplace model](#claude-code-marketplace-model) below |
| Cursor | AGENTS-first, optionally with Cursor hook adapter | `.cursor-plugin/plugin.json`, `hooks/hooks-cursor.json`, `hooks/session-start.js` | Node 18+ only if you want the optional hook helper | Hook helper injects startup context only; method still lives in `AGENTS.md` plus `docs/`. See [Cursor distribution model](#cursor-distribution-model) below for portability limits |
| Codex | AGENTS-first | `.codex/README.md` | None for docs-first use | No `.codex-plugin` bundle in this cycle |

## Positioning rules

- AGENTS-first is always the canonical path
- Adapters are optional
- The repo does not promise parity between Claude, Cursor, and Codex
- Tool-specific assets must describe their own limitations explicitly

## Practical rule

If an adapter makes the method less clear than reading `AGENTS.md` directly, prefer the docs path.

## Claude Code marketplace model

`figma-plugin-forge` is available as a Claude Code plugin via a custom marketplace:

```shell
# 1. Add the marketplace
/plugin marketplace add sallzzbr/figma-plugin-forge

# 2. Install the plugin
/plugin install figma-plugin-forge@figma-plugin-forge

# Update
/plugin update figma-plugin-forge@figma-plugin-forge
```

The `marketplace.json` lives in `.claude-plugin/` inside this repo (`source: "./"` points to itself). Claude Code fetches the plugin directly from `sallzzbr/figma-plugin-forge`.

**What gets installed:** All skills in `skills/` and agents in `agents/`. These trigger automatically during your workflow — brainstorming, writing plans, executing plans, and Figma API guidance.

**What is NOT included in the plugin install:** The full `docs/` tree (guides, patterns, snippets, examples, templates). Skills that reference `docs/` paths include bundle-mode fallbacks, but for full access to the pattern catalog and API reference, clone the repo as a sibling:

```shell
git clone https://github.com/sallzzbr/figma-plugin-forge.git ../figma-plugin-forge
```

**Distribution model:** The marketplace is a pointer, not a fork. Installing via marketplace always fetches the latest version from this repo's `main` branch.

## Cursor distribution model

`.cursor-plugin/plugin.json` in this repo declares these paths:

```json
"skills": "./skills/",
"agents": "./agents/",
"hooks": "./hooks/hooks-cursor.json"
```

These paths resolve from the workspace root (the directory that contains `.cursor-plugin/`), not from inside `.cursor-plugin/` itself. The referenced directories live at the repo root, so the Cursor adapter loads correctly when this repo IS the Cursor workspace.

**Implication for distribution**: the Cursor adapter is a repo-mode asset. It assumes the Cursor workspace is a checkout of `figma-plugin-forge`. Copying `.cursor-plugin/` alone into another repo will not work, because the referenced `skills/`, `agents/`, and `hooks/` directories will not be present.

If you need a portable Cursor bundle that can drop into an arbitrary workspace, that is a separate distribution path that is not shipped in this cycle. Use bundle mode via skills instead (see [distribution-modes.md](distribution-modes.md)).

The Cursor hook itself (`hooks/session-start.js`) is also coupled to this layout: it reads `skills/using-figma-plugin-forge/SKILL.md` via a relative path from its own file. If the skill file is missing, the hook falls back to generic output rather than failing. This makes the hook safe to run in unexpected contexts, but it only produces useful output in repo mode.
