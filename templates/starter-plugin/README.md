# Starter Plugin — verified Figma plugin scaffold

This is the **canonical, build-verified starter** for figma-plugin-forge. Copy this whole
directory into the target repo and modify it — do **not** re-derive the manifest, build
script, or tsconfig from prose. Every basic that Figma requires to run is already correct
here, and `scripts/validate-scaffold.mjs` keeps it that way.

## Stack

esbuild + Preact + Tailwind + TypeScript + `@figma/plugin-typings`. Lightweight, transparent,
minimal dependencies. (For the heavier-but-proven `@create-figma-plugin` alternative, see
`docs/guides/project-setup.md`.)

## What it does

A minimal but complete plugin: it lists the current selection in the UI iframe and lets you
click a layer to focus it on the canvas. It exercises the two things every plugin needs —
the typed `main <-> UI` message bridge and async node access under `dynamic-page`.

## Layout

```text
manifest.json        # documentAccess: dynamic-page, networkAccess: ["none"], paths match build/
build.mjs            # esbuild; produces build/main.js + a single-file build/ui.html
src/main.ts          # Figma sandbox entry (figma.*, selection, viewport)
src/ui.tsx           # UI iframe entry (mounts <App/>)
src/App.tsx          # Preact UI; talks to main only via typed messages
src/types/messages.ts# the message contract (imported by both sides)
src/ui.html          # HTML shell; CSS/JS inlined at build into build/ui.html
src/input.css        # Tailwind entry
```

## Build & run

```bash
npm install
npm run build       # -> build/main.js and build/ui.html
npm run typecheck   # tsc --noEmit
npm run watch       # rebuilds build/ui.html on every change
```

Load in **Figma Desktop**: Plugins → Development → Import plugin from manifest → select this
`manifest.json`. Re-run the plugin after each build (Figma plugins have no hot reload).

## Before publishing

- Replace `"id": "REPLACE_WITH_PLUGIN_ID"` in `manifest.json` with the ID from the
  [Figma Plugin Dashboard](https://www.figma.com/developers).
- If the UI makes network calls, add the domains to `networkAccess.allowedDomains`
  (keep `["none"]` for local-only plugins — never an empty array, never omit the field).
- Keep `documentAccess` as `"dynamic-page"`; to read nodes on other pages, call
  `await figma.loadAllPagesAsync()` first.

## Key correctness rules baked in

- `__html__` is the contents of the `ui` file, injected by Figma at runtime — the bundler
  does not put HTML into `main.js`. `build/ui.html` must stay self-contained (CSS+JS inline).
- The main thread sandbox has no DOM/browser APIs: no `window`, no `fetch`, no `btoa`.
  Use `figma.base64Encode()` for binary, and do network calls from the UI iframe.
- Node access under `dynamic-page` is async: `figma.getNodeByIdAsync(id)`.
- Messages cross the boundary as typed, type-guarded plain objects — never raw nodes.
