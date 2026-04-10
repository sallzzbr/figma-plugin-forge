# Project Setup — Opinionated Stack

This guide sets up a working Figma plugin project from zero using the recommended stack. Follow it when creating the target repo for a plugin designed with this method.

## Recommended Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Bundler | **esbuild** | Fast, zero-config for TS, handles main and UI separately |
| UI framework | **Preact** | React API, ~3KB gzipped, fits the iframe size budget |
| CSS | **Tailwind CSS** | Utility classes, no runtime, works well with Preact |
| Types | **TypeScript + @figma/plugin-typings** | Type safety for the Figma API in main thread |
| Manifest | `manifest.json` at repo root | Required by Figma |

### Alternatives (if the user already has a different preference)

| Instead of | Use | Trade-off |
| --- | --- | --- |
| esbuild | Vite | Better HMR dev experience, but heavier for a plugin |
| Preact | React | Larger bundle (~40KB), but familiar API |
| Preact | Vanilla TS | No framework overhead, but more boilerplate for UI |
| Tailwind | CSS Modules | Scoped styles, but more files |
| Tailwind | Inline styles | Zero setup, but harder to maintain |

If the user does not express a preference, use the recommended stack.

## File Structure

```text
my-figma-plugin/
├── manifest.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── build.mjs                  # esbuild script
├── src/
│   ├── main.ts                # Figma sandbox entry
│   ├── ui.tsx                  # UI iframe entry
│   ├── ui.html                # HTML shell (inlined at build)
│   ├── App.tsx                 # Root Preact component
│   ├── input.css               # Tailwind entry
│   ├── types/
│   │   └── messages.ts         # Typed message contract (shared)
│   └── components/
│       └── ...                 # UI components
├── build/                      # Build output (gitignored)
│   ├── main.js
│   └── ui.html
└── docs/
    └── features/               # Target-repo docs
```

## manifest.json

```json
{
  "name": "My Plugin",
  "id": "YOUR_PLUGIN_ID",
  "api": "1.0.0",
  "editorType": ["figma"],
  "main": "build/main.js",
  "ui": "build/ui.html",
  "documentAccess": "dynamic-page",
  "networkAccess": {
    "allowedDomains": []
  }
}
```

Notes:
- Get your plugin ID from [Figma Plugin Dashboard](https://www.figma.com/developers)
- Set `documentAccess` to `"dynamic"` only if you need to access pages other than the current one
- Add backend domains to `allowedDomains` only if the UI makes network calls
- Remove `networkAccess` entirely if the plugin is local-only

## package.json

```json
{
  "name": "my-figma-plugin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "node build.mjs",
    "watch": "node build.mjs --watch",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@figma/plugin-typings": "^1.104.0",
    "esbuild": "^0.24.0",
    "typescript": "^5.7.0"
  },
  "dependencies": {
    "preact": "^10.25.0"
  }
}
```

Add Tailwind if using it:
```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "typeRoots": ["./node_modules/@figma/plugin-typings", "./node_modules/@types"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

Key points:
- `jsxImportSource: "preact"` makes JSX work with Preact without manual imports
- `typeRoots` must include `@figma/plugin-typings` so `figma.*`, `__html__`, and node types are available
- `noEmit: true` because esbuild handles the actual compilation

## tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      fontSize: {
        'figma-xs': '11px',
        'figma-sm': '12px',
        'figma-base': '13px',
      },
      colors: {
        'figma-bg': '#2c2c2c',
        'figma-bg-hover': '#3c3c3c',
        'figma-text': '#e5e5e5',
        'figma-text-secondary': '#b3b3b3',
        'figma-border': '#444444',
        'figma-blue': '#0d99ff',
      },
    },
  },
  plugins: [],
}
```

Notes:
- Figma plugin UI uses a dark theme by default
- The `figma-*` color tokens approximate Figma's own palette
- Font sizes in Figma's UI are smaller than typical web (11-13px base)

## src/input.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 13px;
  color: #e5e5e5;
  background: #2c2c2c;
}
```

## src/ui.html

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>/* CSS_PLACEHOLDER */</style>
</head>
<body>
  <div id="root"></div>
  <script>/* JS_PLACEHOLDER */</script>
</body>
</html>
```

The build script replaces `/* CSS_PLACEHOLDER */` and `/* JS_PLACEHOLDER */` with the actual built CSS and JS. This produces a single self-contained HTML file that Figma can load as `__html__`.

## build.mjs

```js
import { build, context } from 'esbuild'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const isWatch = process.argv.includes('--watch')

// --- Build main thread ---
const mainOptions = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'build/main.js',
  target: 'es2020',
  format: 'iife',
}

// --- Build UI ---
const uiOptions = {
  entryPoints: ['src/ui.tsx'],
  bundle: true,
  outfile: 'build/ui.js',
  target: 'es2020',
  format: 'iife',
  jsxImportSource: 'preact',
  jsx: 'automatic',
  loader: { '.css': 'empty' },  // CSS handled separately by Tailwind
}

function buildCSS() {
  try {
    execFileSync('npx', [
      'tailwindcss', '-i', 'src/input.css', '-o', 'build/ui.css', '--minify'
    ], { stdio: 'pipe' })
  } catch {
    console.warn('Tailwind not installed or failed; skipping CSS build')
  }
}

function inlineHTML() {
  mkdirSync('build', { recursive: true })
  const template = readFileSync('src/ui.html', 'utf8')
  let css = ''
  let js = ''
  try { css = readFileSync('build/ui.css', 'utf8') } catch { /* no CSS */ }
  try { js = readFileSync('build/ui.js', 'utf8') } catch { /* no JS */ }

  const html = template
    .replace('/* CSS_PLACEHOLDER */', css)
    .replace('/* JS_PLACEHOLDER */', js)

  writeFileSync('build/ui.html', html)
}

async function run() {
  if (isWatch) {
    const mainCtx = await context(mainOptions)
    const uiCtx = await context(uiOptions)
    await mainCtx.watch()
    await uiCtx.watch()
    console.log('watching for changes...')
  } else {
    await build(mainOptions)
    await build(uiOptions)
    buildCSS()
    inlineHTML()
    console.log('build complete')
  }
}

run()
```

## src/ui.tsx

```tsx
import { render } from 'preact'
import App from './App'

render(<App />, document.getElementById('root')!)
```

## src/App.tsx

```tsx
import { useState, useEffect } from 'preact/hooks'
import type { MainToUiMessage } from './types/messages'

export default function App() {
  const [status, setStatus] = useState('waiting for selection...')

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data?.pluginMessage as MainToUiMessage | undefined
      if (!msg) return
      if (msg.type === 'selection-changed') {
        setStatus(`${msg.items.length} item(s) selected`)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return <div className="p-3"><p>{status}</p></div>
}
```

## src/main.ts

```ts
import type { UiToMainMessage, MainToUiMessage } from './types/messages'

figma.showUI(__html__, { width: 360, height: 520 })

function postToUi(msg: MainToUiMessage) {
  figma.ui.postMessage(msg)
}

figma.on('selectionchange', () => {
  const items = figma.currentPage.selection.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
  }))
  postToUi({ type: 'selection-changed', items, pageName: figma.currentPage.name })
})

figma.ui.onmessage = async (raw: unknown) => {
  // Add typed message handling here
}
```

## src/types/messages.ts

```ts
type SelectionItem = { id: string; name: string; type: string }

export type MainToUiMessage =
  | { type: 'selection-changed'; items: SelectionItem[]; pageName: string }

export type UiToMainMessage =
  | { type: 'focus-node'; nodeId: string }
```

Define all message shapes in this one file. Both main and UI import from here.

## Dev Workflow

1. **Install dependencies:** `npm install`
2. **Build:** `npm run build`
3. **Load in Figma:**
   - Open Figma Desktop
   - Go to Plugins > Development > Import plugin from manifest
   - Select `manifest.json` from your project root
4. **Iterate:**
   - Run `npm run build` after each change
   - In Figma, right-click > Plugins > Development > your plugin name
   - The plugin reloads with the new build
5. **Type check:** `npm run typecheck` to catch errors without building

For faster iteration, use `npm run watch` and reload the plugin manually in Figma. There is no hot-reload for Figma plugins — you must re-open the plugin each time.

## .gitignore additions

```text
node_modules/
build/
dist/
*.log
```

## What this setup gives you

- Type-safe main thread with all Figma API types available
- Type-safe UI with Preact JSX and shared message contracts
- A single `build/ui.html` that works as `__html__` in `figma.showUI`
- Tailwind CSS for utility-first styling with Figma-appropriate defaults
- A clear separation between main thread and UI iframe

## Related

- [figma-api-reference.md](figma-api-reference.md) — API surfaces you will use
- [common-pitfalls.md](common-pitfalls.md) — errors to avoid during implementation
- [runtime-split pattern](../patterns/runtime-split.md) — which code goes where
- [messaging-bridge snippet](../snippets/messaging-bridge.md) — typed message contract
