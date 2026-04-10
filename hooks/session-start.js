#!/usr/bin/env node
/**
 * SessionStart helper for figma-plugin-forge.
 * Reads the using-figma-plugin-forge skill and returns it as startup context.
 *
 * Distribution assumption: this script is a repo-mode asset. It assumes the
 * workspace layout is a clone of `figma-plugin-forge`, with `skills/` at the
 * repo root as a sibling of `hooks/`. The skill file is located via a relative
 * path from this script (`../skills/using-figma-plugin-forge/SKILL.md`).
 *
 * If the skill file is not found (for example, when this script is copied into
 * another workspace without the canonical repo layout), the hook falls back to
 * an empty additional-context payload so it never breaks the host session. The
 * trade-off is that the hook only produces useful output in repo mode.
 *
 * See docs/guides/distribution-modes.md and docs/guides/assistant-integrations.md
 * for the full distribution model.
 */

const fs = require('fs')
const path = require('path')

const skillFile = path.join(__dirname, '..', 'skills', 'using-figma-plugin-forge', 'SKILL.md')

function stripFrontmatter(text) {
  if (!text.startsWith('---')) return text
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
}

function output(payload) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`)
}

if (!fs.existsSync(skillFile)) {
  output({ hookSpecificOutput: { additionalContext: '' } })
  process.exit(0)
}

const raw = fs.readFileSync(skillFile, 'utf8')
const skillContent = stripFrontmatter(raw)

if (process.env.CURSOR_PLUGIN_ROOT) {
  output({ additional_context: skillContent })
} else if (process.env.CLAUDE_PLUGIN_ROOT) {
  output({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: skillContent,
    },
  })
} else {
  output({ additionalContext: skillContent })
}
