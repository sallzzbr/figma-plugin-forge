import { build, context } from 'esbuild'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const isWatch = process.argv.includes('--watch')

// Compile Tailwind from src/input.css into build/ui.css.
function buildCSS() {
  try {
    execFileSync(
      'npx',
      ['tailwindcss', '-i', 'src/input.css', '-o', 'build/ui.css', '--minify'],
      { stdio: 'pipe' },
    )
  } catch {
    console.warn('Tailwind not installed or failed; continuing without CSS')
  }
}

// Produce a single self-contained build/ui.html by inlining the built CSS and JS.
// Figma loads this file (via the manifest "ui" field) and exposes its contents to
// the main thread as the global __html__. The iframe cannot fetch sibling files,
// so everything must be inlined here.
function inlineHTML() {
  mkdirSync('build', { recursive: true })
  const template = readFileSync('src/ui.html', 'utf8')
  let css = ''
  let js = ''
  try {
    css = readFileSync('build/ui.css', 'utf8')
  } catch {
    /* no CSS */
  }
  try {
    js = readFileSync('build/ui.js', 'utf8')
  } catch {
    /* no JS */
  }

  // Use function replacements so `$` sequences inside the bundled JS/CSS
  // are not interpreted as special replacement patterns.
  const html = template
    .replace('/* CSS_PLACEHOLDER */', () => css)
    .replace('/* JS_PLACEHOLDER */', () => js)

  writeFileSync('build/ui.html', html)
}

// Rebuild CSS and re-inline the HTML after every successful UI bundle. Attaching
// this to esbuild's onEnd is what keeps build/ui.html fresh in watch mode.
const htmlPlugin = {
  name: 'inline-ui-html',
  setup(pluginBuild) {
    pluginBuild.onEnd((result) => {
      if (result.errors.length === 0) {
        buildCSS()
        inlineHTML()
      }
    })
  },
}

const mainOptions = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'build/main.js',
  target: 'es2020',
  format: 'iife',
  minify: !isWatch,
}

const uiOptions = {
  entryPoints: ['src/ui.tsx'],
  bundle: true,
  outfile: 'build/ui.js',
  target: 'es2020',
  format: 'iife',
  jsx: 'automatic',
  jsxImportSource: 'preact',
  loader: { '.css': 'empty' }, // CSS is handled separately by Tailwind
  minify: !isWatch,
  plugins: [htmlPlugin],
}

async function run() {
  mkdirSync('build', { recursive: true })
  if (isWatch) {
    const mainCtx = await context(mainOptions)
    const uiCtx = await context(uiOptions)
    await mainCtx.watch()
    await uiCtx.watch()
    console.log('watching for changes...')
  } else {
    await build(mainOptions)
    await build(uiOptions) // onEnd runs buildCSS() + inlineHTML()
    console.log('build complete')
  }
}

run()
