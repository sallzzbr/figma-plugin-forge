#!/usr/bin/env node
/**
 * figma-plugin-forge scaffold validation script.
 *
 * Validates that a Figma plugin directory (default: templates/starter-plugin)
 * gets the basics right — the things that, when wrong, stop a plugin from
 * running in Figma at all. It runs two layers of checks:
 *
 *   Static (always, offline):
 *     1. manifest.json is valid JSON and has the required fields.
 *     2. documentAccess === "dynamic-page" (the only valid value).
 *     3. networkAccess.allowedDomains is a non-empty array
 *        (["none"] for local-only plugins; never [] and never omitted).
 *     4. Runtime split across all src files: main-side files use no browser-only
 *        APIs the sandbox lacks (btoa/atob, fetch, window, document, localStorage),
 *        and UI-side files never reference figma.* (which exists only in main).
 *     5. Project health: package.json declares build/typecheck/lint/test scripts,
 *        at least one test file exists, and no obvious secrets live in src/.
 *     6. Backend (only when src/backend/ exists): networkAccess declares real
 *        domains (not ["none"]) and backend files (UI context) never use figma.*.
 *
 *   Build (when node_modules is present, or with --build):
 *     7. `npm run build` succeeds.
 *     8. The files named by manifest.main and manifest.ui exist after build.
 *     9. build ui.html is self-contained: no external <script src=> / <link href=>
 *        and no leftover CSS_PLACEHOLDER / JS_PLACEHOLDER.
 *
 * Usage:
 *   node scripts/validate-scaffold.mjs                 # default scaffold, build if deps present
 *   node scripts/validate-scaffold.mjs --build         # npm install + build, then check
 *   node scripts/validate-scaffold.mjs --path <dir>    # validate a different plugin dir
 *
 * Exit codes: 0 on pass, 1 on any failure. No npm dependencies.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const REPO_ROOT = resolve(__dirname, '..')

// ---------- args ----------

const args = process.argv.slice(2)
const forceBuild = args.includes('--build')
const pathFlagIdx = args.indexOf('--path')
const targetRel =
  pathFlagIdx !== -1 && args[pathFlagIdx + 1]
    ? args[pathFlagIdx + 1]
    : 'templates/starter-plugin'
const PLUGIN_DIR = resolve(REPO_ROOT, targetRel)

const failures = []
function fail(msg) {
  failures.push(msg)
}

// ---------- static checks ----------

function loadManifest() {
  const manifestPath = join(PLUGIN_DIR, 'manifest.json')
  if (!existsSync(manifestPath)) {
    fail(`manifest.json not found at ${targetRel}/manifest.json`)
    return null
  }
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch (err) {
    fail(`manifest.json is not valid JSON: ${err.message}`)
    return null
  }
}

function checkManifest(manifest) {
  if (!manifest) return

  for (const field of ['name', 'id', 'api', 'main', 'editorType']) {
    if (manifest[field] === undefined) {
      fail(`manifest.json is missing required field "${field}"`)
    }
  }

  if (manifest.documentAccess !== 'dynamic-page') {
    fail(
      `manifest.documentAccess must be "dynamic-page" (only valid value), got ${JSON.stringify(
        manifest.documentAccess,
      )}`,
    )
  }

  const na = manifest.networkAccess
  if (!na || typeof na !== 'object') {
    fail(
      'manifest.networkAccess is required. Use {"allowedDomains": ["none"]} for local-only plugins.',
    )
  } else if (!Array.isArray(na.allowedDomains) || na.allowedDomains.length === 0) {
    fail(
      'manifest.networkAccess.allowedDomains must be a non-empty array. Use ["none"] for local-only plugins, never [].',
    )
  } else if (na.allowedDomains.includes('*')) {
    fail('manifest.networkAccess.allowedDomains uses "*"; declare specific domains instead.')
  }

  if (manifest.ui !== undefined && typeof manifest.ui !== 'string') {
    fail('manifest.ui must be a string path to the built HTML file.')
  }
}

// Browser-only globals that do NOT exist in the Figma main-thread sandbox.
const SANDBOX_FORBIDDEN = [
  { re: /\bbtoa\s*\(/, hint: 'use figma.base64Encode() instead of btoa()' },
  { re: /\batob\s*\(/, hint: 'use figma.base64Decode() instead of atob()' },
  { re: /\bfetch\s*\(/, hint: 'fetch is UI-only; do network calls from the UI iframe' },
  { re: /\bwindow\./, hint: 'window does not exist in the sandbox' },
  { re: /\bdocument\./, hint: 'document does not exist in the sandbox' },
  { re: /\blocalStorage\b/, hint: 'use figma.clientStorage (async) instead of localStorage' },
]

// figma.* exists only in the main thread; UI files must never reference it.
const UI_FORBIDDEN = [
  {
    re: /\bfigma\s*\./,
    hint: 'figma.* exists only in the main thread; request data from main via postMessage',
  },
]

function stripCommentsAndStrings(source) {
  // Rough strip of line/block comments and string/template literals so we do not
  // flag forbidden words that appear only in comments or message text.
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/`(?:\\.|[^`\\])*`/g, ' ')
    .replace(/'(?:\\.|[^'\\])*'/g, ' ')
    .replace(/"(?:\\.|[^"\\])*"/g, ' ')
}

function walkSrcFiles(dir) {
  const out = []
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...walkSrcFiles(full))
    } else if (/\.tsx?$/.test(entry) && !/\.d\.ts$/.test(entry)) {
      out.push(full)
    }
  }
  return out
}

// A file is UI-side if it is JSX (.tsx) or imports a UI framework. Import
// detection runs on raw source because string contents are stripped below.
function isUiFile(file, rawSource) {
  if (file.endsWith('.tsx')) return true
  return /\bfrom\s+['"](?:preact|react)(?:\/[^'"]*)?['"]/.test(rawSource)
}

// Walk every src file and enforce the runtime split: no browser-only APIs on
// the main side, no figma.* on the UI side. Classification is content-based so
// it works for any layout, not just src/main.ts.
function checkRuntimeBoundaries() {
  const files = walkSrcFiles(join(PLUGIN_DIR, 'src'))
  for (const file of files) {
    const raw = readFileSync(file, 'utf8')
    const code = stripCommentsAndStrings(raw)
    const rel = file.slice(PLUGIN_DIR.length + 1).split('\\').join('/')

    if (isUiFile(file, raw)) {
      for (const { re, hint } of UI_FORBIDDEN) {
        if (re.test(code)) fail(`${rel} (UI side) references a main-thread API: ${hint}`)
      }
      continue
    }

    // Non-UI .ts: treat as main-side when it touches figma.* or is a known main
    // entry name. A plain shared/types file (no figma, no UI framework) is skipped
    // because we cannot tell which runtime it ends up in.
    const base = rel.split('/').pop()
    if (/\bfigma\s*\./.test(code) || base === 'main.ts' || base === 'code.ts') {
      for (const { re, hint } of SANDBOX_FORBIDDEN) {
        if (re.test(code)) {
          fail(`${rel} (main thread) uses a browser-only API not in the Figma sandbox: ${hint}`)
        }
      }
    }
  }
}

// ---------- project health (scripts + tests + secrets) ----------

// Obvious secrets that must never ship inside a plugin (src/ is fully readable).
const SECRET_PATTERNS = [
  { re: /service_role/i, hint: 'service_role key' },
  { re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, hint: 'private key' },
  { re: /\bsk-[A-Za-z0-9]{20,}/, hint: 'secret API key (sk-...)' },
  { re: /eyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{8,}/, hint: 'hardcoded JWT' },
]

function readPackageJson() {
  const pkgPath = join(PLUGIN_DIR, 'package.json')
  if (!existsSync(pkgPath)) {
    fail('package.json not found')
    return null
  }
  try {
    return JSON.parse(readFileSync(pkgPath, 'utf8'))
  } catch (err) {
    fail(`package.json is not valid JSON: ${err.message}`)
    return null
  }
}

function checkProjectHealth(pkg) {
  if (!pkg) return
  const scripts = pkg.scripts || {}
  for (const name of ['build', 'typecheck', 'lint', 'test']) {
    if (!scripts[name]) fail(`package.json is missing the "${name}" script`)
  }
  const tests = walkSrcFiles(join(PLUGIN_DIR, 'src')).filter((f) => /\.(test|spec)\.tsx?$/.test(f))
  if (tests.length === 0) {
    fail('no test files found (expected at least one src/**/*.test.ts)')
  }

  for (const file of walkSrcFiles(join(PLUGIN_DIR, 'src'))) {
    const raw = readFileSync(file, 'utf8')
    const rel = file.slice(PLUGIN_DIR.length + 1).split('\\').join('/')
    for (const { re, hint } of SECRET_PATTERNS) {
      if (re.test(raw)) fail(`${rel} appears to contain a ${hint}; never ship secrets in plugin source`)
    }
  }
}

// ---------- backend checks ----------

function checkBackend(manifest) {
  const backendDir = join(PLUGIN_DIR, 'src', 'backend')
  if (!existsSync(backendDir)) return

  const domains = manifest && manifest.networkAccess && manifest.networkAccess.allowedDomains
  if (Array.isArray(domains) && domains.length === 1 && domains[0] === 'none') {
    fail('src/backend/ exists but networkAccess.allowedDomains is ["none"]; declare the backend origin(s)')
  }

  // Backend code runs in the UI iframe; it must not touch figma.*.
  for (const file of walkSrcFiles(backendDir)) {
    const code = stripCommentsAndStrings(readFileSync(file, 'utf8'))
    const rel = file.slice(PLUGIN_DIR.length + 1).split('\\').join('/')
    if (/\bfigma\s*\./.test(code)) {
      fail(`${rel} (backend, UI context) references figma.*; backend code runs in the UI iframe`)
    }
  }
}

// ---------- build checks ----------

function run(cmd, cmdArgs) {
  execFileSync(cmd, cmdArgs, { cwd: PLUGIN_DIR, stdio: 'inherit' })
}

function maybeBuild() {
  const hasDeps = existsSync(join(PLUGIN_DIR, 'node_modules'))
  if (!hasDeps && !forceBuild) {
    console.log(
      '  SKIP build checks (no node_modules; pass --build to npm install + build)\n',
    )
    return false
  }
  try {
    if (!hasDeps) {
      console.log('  installing dependencies...')
      run('npm', ['install', '--no-audit', '--no-fund'])
    }
    console.log('  running build...')
    run('npm', ['run', 'build'])
    return true
  } catch (err) {
    fail(`build failed: ${err.message}`)
    return false
  }
}

function checkBuildOutputs(manifest) {
  if (!manifest) return

  if (manifest.main) {
    const mainOut = join(PLUGIN_DIR, manifest.main)
    if (!existsSync(mainOut)) {
      fail(`manifest.main points to ${manifest.main}, which does not exist after build`)
    }
  }

  if (manifest.ui) {
    const uiOut = join(PLUGIN_DIR, manifest.ui)
    if (!existsSync(uiOut)) {
      fail(`manifest.ui points to ${manifest.ui}, which does not exist after build`)
      return
    }
    const html = readFileSync(uiOut, 'utf8')
    if (/CSS_PLACEHOLDER|JS_PLACEHOLDER/.test(html)) {
      fail(`${manifest.ui} still contains an unreplaced placeholder; HTML inlining did not run`)
    }
    if (/<script[^>]*\ssrc=/i.test(html)) {
      fail(`${manifest.ui} has an external <script src=...>; the UI HTML must be self-contained`)
    }
    if (/<link[^>]*\shref=/i.test(html)) {
      fail(`${manifest.ui} has an external <link href=...>; inline CSS into the HTML instead`)
    }
  }
}

// ---------- runner ----------

console.log('figma-plugin-forge scaffold validation')
console.log('plugin dir: ' + targetRel)
console.log('')

const manifest = loadManifest()
checkManifest(manifest)
checkRuntimeBoundaries()
checkProjectHealth(readPackageJson())
checkBackend(manifest)

const built = maybeBuild()
if (built) {
  checkBuildOutputs(manifest)
}

console.log('')
if (failures.length > 0) {
  console.log(`RESULT: failed (${failures.length} issue${failures.length === 1 ? '' : 's'})`)
  for (const f of failures) console.log('  - ' + f)
  process.exit(1)
} else {
  console.log('RESULT: passed')
  process.exit(0)
}
