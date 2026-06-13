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
 *     4. src/main.ts (if present) uses no browser-only APIs that the Figma
 *        sandbox lacks: btoa/atob, fetch, window, document, localStorage.
 *
 *   Build (when node_modules is present, or with --build):
 *     5. `npm run build` succeeds.
 *     6. The files named by manifest.main and manifest.ui exist after build.
 *     7. build ui.html is self-contained: no external <script src=> / <link href=>
 *        and no leftover CSS_PLACEHOLDER / JS_PLACEHOLDER.
 *
 * Usage:
 *   node scripts/validate-scaffold.mjs                 # default scaffold, build if deps present
 *   node scripts/validate-scaffold.mjs --build         # npm install + build, then check
 *   node scripts/validate-scaffold.mjs --path <dir>    # validate a different plugin dir
 *
 * Exit codes: 0 on pass, 1 on any failure. No npm dependencies.
 */

import { readFileSync, existsSync } from 'node:fs'
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

function checkMainSandbox() {
  const mainPath = join(PLUGIN_DIR, 'src', 'main.ts')
  if (!existsSync(mainPath)) return // not all layouts use src/main.ts; skip quietly
  const code = stripCommentsAndStrings(readFileSync(mainPath, 'utf8'))
  for (const { re, hint } of SANDBOX_FORBIDDEN) {
    if (re.test(code)) {
      fail(`src/main.ts uses a browser-only API not available in the Figma sandbox: ${hint}`)
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
checkMainSandbox()

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
