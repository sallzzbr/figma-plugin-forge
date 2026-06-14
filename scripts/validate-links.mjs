#!/usr/bin/env node
/**
 * figma-plugin-forge link/reference validation.
 *
 * Since the knowledge lives in skills/ (single source of truth) and is pointed at
 * from commands/, agents/, .cursor/, README.md, and AGENTS.md, this script keeps
 * those references honest:
 *
 *   1. Broken relative markdown links: [text](path) targets that don't exist.
 *   2. Machine-local absolute paths leaking into versioned files.
 *   3. Repo path references in backticks (e.g. `skills/...`, `templates/...`)
 *      that point at a file/dir which does not exist.
 *
 * Usage:   node scripts/validate-links.mjs
 * Exit:    0 on pass, 1 on any failure. No dependencies.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const REPO_ROOT = resolve(__dirname, '..')

// Repo-rooted prefixes worth verifying when seen inside backticks.
// NOTE: `docs/` is intentionally excluded — this repo has no docs/ folder, so any
// `docs/...` reference describes a *generated plugin's* layout (design docs/plans),
// not a path in this repo.
const REPO_PREFIXES = [
  'skills/',
  'templates/',
  'commands/',
  'agents/',
  'scripts/',
  '.cursor/',
  '.claude-plugin/',
]

function toPosix(p) {
  return p.split('\\').join('/')
}

function walk(dir, filter) {
  const out = []
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git' || entry === 'build') continue
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walk(full, filter))
    else if (filter(full)) out.push(full)
  }
  return out
}

function collectFiles() {
  const files = new Set()
  for (const name of ['README.md', 'AGENTS.md']) {
    const p = join(REPO_ROOT, name)
    if (existsSync(p)) files.add(p)
  }
  const isDoc = (p) => p.endsWith('.md') || p.endsWith('.mdc')
  for (const base of ['skills', 'commands', 'agents', '.cursor', 'templates']) {
    for (const f of walk(join(REPO_ROOT, base), isDoc)) files.add(f)
  }
  return Array.from(files).sort()
}

function stripCodeFences(markdown) {
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

function cleanTarget(target) {
  return target.split('#')[0].split('?')[0]
}

// ---------- check 1: broken relative markdown links ----------

function checkRelativeLinks(files) {
  const failures = []
  const linkRe = /\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
  for (const file of files) {
    const content = stripCodeFences(readFileSync(file, 'utf8'))
    content.split(/\r?\n/).forEach((line, idx) => {
      for (const match of line.matchAll(linkRe)) {
        const target = match[2]
        if (/^[a-z]+:/i.test(target) || target.startsWith('#') || target.startsWith('<') || target === '') {
          continue
        }
        const cleaned = cleanTarget(target)
        if (cleaned === '') continue
        const resolved = resolve(dirname(file), cleaned)
        if (!existsSync(resolved)) {
          failures.push({
            file: relative(REPO_ROOT, file),
            line: idx + 1,
            detail: `${target} -> missing (${toPosix(relative(REPO_ROOT, resolved))})`,
          })
        }
      }
    })
  }
  return failures
}

// ---------- check 2: absolute path leakage ----------

function checkAbsolutePathLeakage(files) {
  const failures = []
  const patterns = [
    { re: /[A-Z]:[\\/]Users[\\/]/, name: 'Windows Users path' },
    { re: /(?<![a-zA-Z0-9._/-])\/home\/[a-zA-Z0-9._-]/, name: 'Unix home path' },
    { re: /(?<![a-zA-Z0-9._/-])\/Users\/[a-zA-Z0-9._-]/, name: 'macOS Users path' },
  ]
  for (const file of files) {
    const content = stripCodeFences(readFileSync(file, 'utf8'))
    content.split(/\r?\n/).forEach((line, idx) => {
      const clean = line.replace(/`[^`]*`/g, '')
      for (const { re, name } of patterns) {
        if (re.test(clean)) {
          failures.push({
            file: relative(REPO_ROOT, file),
            line: idx + 1,
            detail: `${name} :: ${line.trim().slice(0, 100)}`,
          })
        }
      }
    })
  }
  return failures
}

// ---------- check 3: backticked repo path references exist ----------

function checkRepoPathRefs(files) {
  const failures = []
  const tokenRe = /`([^`]+)`/g
  for (const file of files) {
    const content = readFileSync(file, 'utf8')
    content.split(/\r?\n/).forEach((line, idx) => {
      for (const match of line.matchAll(tokenRe)) {
        let token = match[1].trim()
        if (/[\s<>*$()]/.test(token)) continue
        if (!REPO_PREFIXES.some((p) => token.startsWith(p))) continue
        token = cleanTarget(token).replace(/[.,;:]+$/, '')
        const resolved = resolve(REPO_ROOT, token)
        if (!existsSync(resolved)) {
          failures.push({
            file: relative(REPO_ROOT, file),
            line: idx + 1,
            detail: `\`${token}\` does not exist`,
          })
        }
      }
    })
  }
  return failures
}

// ---------- runner ----------

function report(name, failures) {
  if (failures.length === 0) {
    console.log(`  PASS ${name} (0 issues)`)
    return false
  }
  console.log(`  FAIL ${name} (${failures.length} issue${failures.length === 1 ? '' : 's'})`)
  for (const f of failures) console.log(`    - ${f.file}:${f.line}  ${f.detail}`)
  return true
}

console.log('figma-plugin-forge link validation')
const files = collectFiles()
console.log(`scanning ${files.length} markdown/mdc files\n`)

let failed = false
failed = report('check 1: relative markdown links resolve', checkRelativeLinks(files)) || failed
failed = report('check 2: no machine-local absolute paths', checkAbsolutePathLeakage(files)) || failed
failed = report('check 3: backticked repo paths exist', checkRepoPathRefs(files)) || failed

console.log('')
if (failed) {
  console.log('RESULT: failed')
  process.exit(1)
} else {
  console.log('RESULT: passed')
  process.exit(0)
}
