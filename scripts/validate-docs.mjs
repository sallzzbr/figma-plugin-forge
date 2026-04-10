#!/usr/bin/env node
/**
 * figma-plugin-forge editorial validation script.
 *
 * Runs a set of drift checks against the repo:
 *
 *   1. Broken relative links in markdown files.
 *   2. Machine-local absolute paths leaking into versioned docs.
 *   3. Archetype coverage: every archetype in docs/patterns/README.md
 *      has at least one example (except archetypes explicitly flagged
 *      as a known gap in docs/examples/README.md).
 *   4. Mirror drift: skills that declare "Mirror provenance: <path>"
 *      must have a fenced markdown mirror whose heading set matches
 *      the canonical file.
 *   5. Integration matrix consistency: every asset named in the
 *      assistant-integrations.md matrix exists on disk.
 *
 * Usage:
 *   node scripts/validate-docs.mjs
 *
 * Exit codes:
 *   0 on pass, 1 on any failure.
 *
 * No dependencies. Plain Node ESM. Uses String.prototype.matchAll for
 * regex iteration (not child_process).
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const REPO_ROOT = resolve(__dirname, '..')

// ---------- helpers ----------

function toPosix(p) {
  return p.split('\\').join('/')
}

function walk(dir, filter) {
  const out = []
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      out.push(...walk(full, filter))
    } else if (filter(full)) {
      out.push(full)
    }
  }
  return out
}

function collectMarkdownFiles() {
  const files = new Set()

  // Root-level markdown
  for (const name of ['README.md', 'AGENTS.md', 'CLAUDE.md']) {
    const p = join(REPO_ROOT, name)
    if (existsSync(p)) files.add(p)
  }

  // docs/
  for (const f of walk(join(REPO_ROOT, 'docs'), (p) => p.endsWith('.md'))) {
    files.add(f)
  }

  // skills/
  for (const f of walk(join(REPO_ROOT, 'skills'), (p) => p.endsWith('.md'))) {
    files.add(f)
  }

  // adapter READMEs
  for (const name of [
    '.codex/README.md',
    '.claude-plugin/README.md',
    '.cursor-plugin/README.md',
  ]) {
    const p = join(REPO_ROOT, name)
    if (existsSync(p)) files.add(p)
  }

  return Array.from(files).sort()
}

function readFile(path) {
  return readFileSync(path, 'utf8')
}

function stripCodeFences(markdown) {
  // Replace fenced code blocks with blank lines of the same count so that
  // line numbers stay stable but code-block content is ignored for link
  // and heading scanning.
  const lines = markdown.split(/\r?\n/)
  const out = []
  let inFence = false
  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence
      out.push('')
      continue
    }
    out.push(inFence ? '' : line)
  }
  return out.join('\n')
}

// ---------- check 1: broken relative links ----------

function checkRelativeLinks(files) {
  const failures = []
  const linkRe = /\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g

  for (const file of files) {
    const content = stripCodeFences(readFile(file))
    const lines = content.split(/\r?\n/)
    lines.forEach((line, idx) => {
      for (const match of line.matchAll(linkRe)) {
        const target = match[2]
        if (
          /^[a-z]+:/i.test(target) || // http:, https:, mailto:, etc
          target.startsWith('#') ||
          target.startsWith('<') ||
          target === ''
        ) {
          continue
        }
        // Strip anchor and query from the target
        const cleaned = target.split('#')[0].split('?')[0]
        if (cleaned === '') continue
        const baseDir = dirname(file)
        const resolved = resolve(baseDir, cleaned)
        if (!existsSync(resolved)) {
          failures.push({
            file: relative(REPO_ROOT, file),
            line: idx + 1,
            target,
            reason: `target does not exist (resolved to ${toPosix(relative(REPO_ROOT, resolved))})`,
          })
        }
      }
    })
  }

  return failures
}

// ---------- check 2: absolute path leakage ----------

function stripInlineCode(line) {
  // Remove anything inside single backticks so meta-examples like
  // `/C:/Users/...` do not count as real absolute paths.
  return line.replace(/`[^`]*`/g, '')
}

function checkAbsolutePathLeakage(files) {
  const failures = []
  // Windows absolute paths, /home/, /Users/
  const patterns = [
    { re: /[A-Z]:[\\/]Users[\\/]/, name: 'Windows Users path' },
    { re: /[A-Z]:[\\/]home[\\/]/, name: 'Windows home path' },
    { re: /(?<![a-zA-Z0-9._/-])\/home\/[a-zA-Z0-9._-]/, name: 'Unix home path' },
    { re: /(?<![a-zA-Z0-9._/-])\/Users\/[a-zA-Z0-9._-]/, name: 'macOS Users path' },
  ]

  for (const file of files) {
    // Strip fenced code blocks AND inline backticks so meta-examples of
    // bad paths in the maintenance guide do not count as real leaks.
    const content = stripCodeFences(readFile(file))
    const lines = content.split(/\r?\n/)
    lines.forEach((line, idx) => {
      const cleanLine = stripInlineCode(line)
      for (const { re, name } of patterns) {
        if (re.test(cleanLine)) {
          failures.push({
            file: relative(REPO_ROOT, file),
            line: idx + 1,
            match: line.trim().slice(0, 120),
            reason: `machine-local path (${name})`,
          })
        }
      }
    })
  }

  return failures
}

// ---------- check 3: archetype coverage ----------

function checkArchetypeCoverage() {
  const failures = []
  const patternsReadme = join(REPO_ROOT, 'docs', 'patterns', 'README.md')
  if (!existsSync(patternsReadme)) {
    return [{ reason: 'docs/patterns/README.md not found' }]
  }

  const patternsContent = readFile(patternsReadme)

  // Parse archetypes from the "## Archetypes" section only, not supporting decisions.
  const sections = patternsContent.split(/^##\s+/m)
  const archetypeSection = sections.find((s) => /^Archetypes\b/i.test(s))
  const archetypes = new Set()
  if (archetypeSection) {
    const sectionRe = /\[([a-z][a-z0-9-]*)\.md\]\(\1\.md\)/g
    for (const match of archetypeSection.matchAll(sectionRe)) {
      archetypes.add(match[1])
    }
  }

  // Parse known gaps from docs/examples/README.md
  const knownGaps = new Set()
  const examplesReadme = join(REPO_ROOT, 'docs', 'examples', 'README.md')
  if (existsSync(examplesReadme)) {
    const examplesContent = readFile(examplesReadme)
    // Rows like: | `library-sync` | _no example yet ... _ |
    const gapRe = /\|\s*`([a-z][a-z0-9-]*)`\s*\|\s*_no example yet[^|]*\|/g
    for (const match of examplesContent.matchAll(gapRe)) {
      knownGaps.add(match[1])
    }
  }

  // For each non-gap archetype, confirm at least one file in docs/examples/
  // references it in its first 30 lines.
  const examplesDir = join(REPO_ROOT, 'docs', 'examples')
  const exampleFiles = existsSync(examplesDir)
    ? readdirSync(examplesDir)
        .filter((f) => f.endsWith('.md') && f !== 'README.md')
        .map((f) => join(examplesDir, f))
    : []

  for (const archetype of archetypes) {
    if (knownGaps.has(archetype)) continue
    const found = exampleFiles.some((f) => {
      const content = readFile(f)
      const head = content.split(/\r?\n/).slice(0, 30).join('\n')
      return head.includes(`docs/patterns/${archetype}.md`)
    })
    if (!found) {
      failures.push({
        archetype,
        reason: `no example in docs/examples/ references docs/patterns/${archetype}.md in its first 30 lines, and it is not listed as a known gap in docs/examples/README.md`,
      })
    }
  }

  return failures
}

// ---------- check 4: mirror drift ----------

function extractHeadings(markdown) {
  const headings = []
  const lines = markdown.split(/\r?\n/)
  for (const line of lines) {
    const m = line.trim().match(/^(#{1,6})\s+(.*)$/)
    if (m) {
      headings.push(`${'#'.repeat(m[1].length)} ${m[2].trim()}`)
    }
  }
  return headings
}

function checkMirrorDrift() {
  const failures = []
  const skillsDir = join(REPO_ROOT, 'skills')
  if (!existsSync(skillsDir)) return failures
  const skillFiles = walk(skillsDir, (p) => p.endsWith('.md'))

  const provenanceRe =
    /^>\s*Mirror provenance:\s*\[([^\]]+)\]\(([^)]+)\)/m

  for (const file of skillFiles) {
    const content = readFile(file)
    const match = content.match(provenanceRe)
    if (!match) continue

    const canonicalLinkPath = match[2]
    const baseDir = dirname(file)
    const canonicalFile = resolve(baseDir, canonicalLinkPath.split('#')[0])

    if (!existsSync(canonicalFile)) {
      failures.push({
        file: relative(REPO_ROOT, file),
        reason: `Mirror provenance points to ${canonicalLinkPath}, which does not exist at ${toPosix(relative(REPO_ROOT, canonicalFile))}`,
      })
      continue
    }

    // Find the first fenced markdown code block after the provenance line
    const matchIndex = content.indexOf(match[0])
    const afterProvenance = content.slice(matchIndex + match[0].length)
    const fenceMatch = afterProvenance.match(/```markdown\r?\n([\s\S]*?)```/)
    if (!fenceMatch) {
      failures.push({
        file: relative(REPO_ROOT, file),
        reason: `Mirror provenance declared but no fenced markdown block found after it`,
      })
      continue
    }

    const mirrorContent = fenceMatch[1]
    const canonicalContent = readFile(canonicalFile)
    const mirrorHeadings = extractHeadings(mirrorContent)
    const canonicalHeadings = extractHeadings(canonicalContent)

    if (mirrorHeadings.length !== canonicalHeadings.length) {
      failures.push({
        file: relative(REPO_ROOT, file),
        reason: `Mirror heading count (${mirrorHeadings.length}) does not match canonical ${toPosix(relative(REPO_ROOT, canonicalFile))} (${canonicalHeadings.length})`,
      })
      continue
    }

    for (let i = 0; i < mirrorHeadings.length; i++) {
      if (mirrorHeadings[i] !== canonicalHeadings[i]) {
        failures.push({
          file: relative(REPO_ROOT, file),
          reason: `Mirror heading #${i + 1} "${mirrorHeadings[i]}" does not match canonical "${canonicalHeadings[i]}" in ${toPosix(relative(REPO_ROOT, canonicalFile))}`,
        })
        break
      }
    }
  }

  return failures
}

// ---------- check 5: integration matrix consistency ----------

function checkIntegrationMatrix() {
  const failures = []
  const matrixFile = join(REPO_ROOT, 'docs', 'guides', 'assistant-integrations.md')
  if (!existsSync(matrixFile)) {
    return [{ reason: 'docs/guides/assistant-integrations.md not found' }]
  }

  const content = readFile(matrixFile)
  const lines = content.split(/\r?\n/)

  // Find the matrix table. Rows start with `|` and the header row contains
  // "Assets in repo". The assets column is the third column (index 2).
  let headerIndex = -1
  for (let i = 0; i < lines.length; i++) {
    if (/^\|/.test(lines[i]) && /Assets in repo/i.test(lines[i])) {
      headerIndex = i
      break
    }
  }

  if (headerIndex === -1) {
    return [{ reason: 'Could not find matrix header containing "Assets in repo"' }]
  }

  // Skip the header and separator row
  for (let i = headerIndex + 2; i < lines.length; i++) {
    const line = lines[i]
    if (!/^\|/.test(line)) break
    const cells = line.split('|').map((c) => c.trim()).filter(Boolean)
    if (cells.length < 3) continue
    const assetsCell = cells[2]

    const assetRe = /`([^`]+)`/g
    for (const m of assetsCell.matchAll(assetRe)) {
      const asset = m[1].trim()
      // Skip obvious non-paths like "None"
      if (!/[./\\]/.test(asset)) continue
      const assetPath = join(REPO_ROOT, asset)
      if (!existsSync(assetPath)) {
        failures.push({
          file: 'docs/guides/assistant-integrations.md',
          line: i + 1,
          asset,
          reason: `matrix names asset ${asset} but it does not exist at ${toPosix(relative(REPO_ROOT, assetPath))}`,
        })
      }
    }
  }

  return failures
}

// ---------- runner ----------

function printFailures(name, failures, formatter) {
  if (failures.length === 0) {
    console.log(`  PASS ${name} (0 issues)`)
    return false
  }
  console.log(`  FAIL ${name} (${failures.length} issue${failures.length === 1 ? '' : 's'})`)
  for (const f of failures) {
    console.log('    - ' + formatter(f))
  }
  return true
}

function main() {
  console.log('figma-plugin-forge editorial validation')
  console.log('repo: ' + REPO_ROOT)
  console.log('')

  const files = collectMarkdownFiles()
  console.log(`scanning ${files.length} markdown files`)
  console.log('')

  let anyFailure = false

  anyFailure |= printFailures(
    'check 1: relative link targets exist',
    checkRelativeLinks(files),
    (f) => `${f.file}:${f.line} -> ${f.target}  (${f.reason})`
  )

  anyFailure |= printFailures(
    'check 2: no machine-local absolute paths',
    checkAbsolutePathLeakage(files),
    (f) => `${f.file}:${f.line}  ${f.reason}  ::  ${f.match}`
  )

  anyFailure |= printFailures(
    'check 3: archetype coverage',
    checkArchetypeCoverage(),
    (f) => (f.archetype ? `${f.archetype}: ${f.reason}` : f.reason)
  )

  anyFailure |= printFailures(
    'check 4: mirror drift',
    checkMirrorDrift(),
    (f) => `${f.file}: ${f.reason}`
  )

  anyFailure |= printFailures(
    'check 5: integration matrix consistency',
    checkIntegrationMatrix(),
    (f) => (f.asset ? `${f.file}:${f.line}  ${f.asset}  (${f.reason})` : f.reason)
  )

  console.log('')
  if (anyFailure) {
    console.log('RESULT: failed')
    process.exit(1)
  } else {
    console.log('RESULT: passed')
    process.exit(0)
  }
}

main()
