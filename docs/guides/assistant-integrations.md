# Assistant Integrations

The official path for `figma-plugin-forge` is always AGENTS-first.

Assistant-specific assets are optional adapters that route into the same method.

## Integration matrix

| Assistant | Official path | Assets in repo | Runtime requirements | Current limitations |
| --- | --- | --- | --- | --- |
| Any AI | Read `AGENTS.md` and `docs/` directly | `AGENTS.md`, `docs/`, `skills/` | None beyond the host reading repo files | No tool-specific automation |
| Claude | AGENTS-first, optionally with Claude-facing entrypoints | `CLAUDE.md`, `.claude-plugin/plugin.json` | None for docs-first use | Metadata only; no dedicated hook adapter in this cycle |
| Cursor | AGENTS-first, optionally with Cursor hook adapter | `.cursor-plugin/plugin.json`, `hooks/hooks-cursor.json`, `hooks/session-start.js` | Node 18+ only if you want the optional hook helper | Hook helper injects startup context only; method still lives in `AGENTS.md` plus `docs/`. See [Cursor distribution model](#cursor-distribution-model) below for portability limits |
| Codex | AGENTS-first | `.codex/README.md` | None for docs-first use | No `.codex-plugin` bundle in this cycle |

## Positioning rules

- AGENTS-first is always the canonical path
- Adapters are optional
- The repo does not promise parity between Claude, Cursor, and Codex
- Tool-specific assets must describe their own limitations explicitly

## Practical rule

If an adapter makes the method less clear than reading `AGENTS.md` directly, prefer the docs path.

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
