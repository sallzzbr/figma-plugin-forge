# Starter Plugin (local-only)

A minimal, production-shaped Figma plugin: a typed message bridge, a small UI
component set, Tailwind v4, tests, and lint. Copy this folder, rename it, and
build from here. For a plugin that calls a backend, start from
`../starter-plugin-backend/` instead.

## What it does

Lists the current selection (click an item to focus it on the canvas) and
persists a note via `figma.clientStorage`. This exercises both bridge channels:
fire-and-forget **events** and typed **request/response**.

## Stack

- **esbuild** (custom `build.mjs`) — bundles `main` + `ui` and inlines CSS/JS
  into one self-contained `build/ui.html` (the iframe can't fetch sibling files).
- **Preact** — small UI runtime.
- **Tailwind CSS v4** — styling via `@theme` tokens in `src/input.css` (no JS config).
- **TypeScript**, **ESLint** (flat config), **Prettier**, **Vitest**.

## Layout

```text
src/
  main.ts            main thread (Figma sandbox): figma.*, selection, storage
  main-bridge.ts     main side of the bridge: emit() + serve()
  bridge.ts          UI side of the bridge: sendEvent() + request() + onMainEvent()
  types/messages.ts  the message contract (events + typed request registry)
  ui.tsx / App.tsx   UI iframe entry + root component
  components/        reusable Preact components (Button, Input, Spinner, ErrorBanner)
  input.css          Tailwind v4 entry + design tokens
build.mjs            bundler + Tailwind + HTML inlining
manifest.json        set id + networkAccess before publishing
```

## Commands

```bash
npm install
npm run build       # one-off build into build/
npm run watch       # rebuild on change
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # vitest
npm run format      # prettier --write
```

Load in **Figma Desktop**: Plugins → Development → Import plugin from manifest →
select this `manifest.json`. Re-run the plugin after each build (no hot reload).

## Before you publish

- Set `manifest.json` `id` (Figma → Plugins → Development → New plugin… copies an id).
- Keep `networkAccess.allowedDomains` as `["none"]` unless you call a backend.
- Keep `documentAccess` as `"dynamic-page"`; to read nodes on other pages, call
  `await figma.loadAllPagesAsync()` first.

## Correctness rules baked in

- `__html__` is the contents of the `ui` file, injected by Figma at runtime — the
  bundler does not put HTML into `main.js`. `build/ui.html` stays self-contained.
- The sandbox has no DOM/browser APIs: no `window`, `fetch`, or `btoa` in `main.ts`.
  Use `figma.base64Encode()` and do network calls from the UI iframe.
- Node access under `dynamic-page` is async: `figma.getNodeByIdAsync(id)`.
- Messages cross the boundary as typed, type-guarded plain objects — never raw nodes.

## Adding a message

Edit `src/types/messages.ts`:

- A one-way notification → add to `MainEvent` (main → UI) or `UiEvent` (UI → main).
- A round-trip call → add a key to `RequestRegistry`, then implement it in the
  `serve({ … })` map in `main.ts`. The UI calls it with `request('your-kind', params)`
  and gets a typed result back.
