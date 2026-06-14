# Starter Plugin (with backend)

The local-only starter plus a **vendor-agnostic backend layer** and a local
**fallback**, so the plugin works whether or not a backend is configured or
reachable. Start here when your plugin needs a server (LLM calls, shared state,
auth). For a purely local plugin, use `../starter-plugin/`.

## What it does

Everything the local starter does (typed bridge, selection focus, persisted
notes) **plus** an "Analyze selection" action that calls the backend and falls
back to a local computation if the backend is down or not configured yet.

## Backend architecture

```
src/backend/
  config.ts    baseUrl + headers — the ONE place to repoint the plugin
  client.ts    generic POST (timeout + typed errors); uses fetch, UI-only
  fallback.ts  withFallback(remote, local) — degrade gracefully
  analyze.ts   example feature: remote-first, local fallback
backend/       one concrete adapter (Supabase Edge Functions, Deno) — swappable
```

The plugin depends only on a JSON **contract**, not on any provider. Point
`config.ts` at any HTTP backend that honours it, or delete `backend/` and bring
your own. See [`backend/README.md`](backend/README.md).

## Stack

esbuild + Preact + Tailwind v4 + TypeScript, with ESLint, Prettier, and Vitest.
`fetch` runs in the UI iframe only; the main thread never does network I/O.

## Commands

```bash
npm install
npm run build       # one-off build into build/
npm run watch       # rebuild on change
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (backend/ is Deno — lint it with Deno)
npm test            # vitest (bridge guards + fallback)
npm run format      # prettier --write
```

## Wiring the backend

1. Set `src/backend/config.ts` `baseUrl` to your backend (and `anonKey` if needed).
2. Add that origin to `manifest.json` → `networkAccess.allowedDomains`
   (it ships as `https://your-backend.example.com`; replace it).
3. Only ship **public/anon** keys — `src/` is fully readable by anyone who
   installs the plugin. Keep secrets in the backend environment.

Until you do, "Analyze selection" simply falls back to the local summary.

## Before you publish

- Set `manifest.json` `id` and keep `documentAccess` as `"dynamic-page"`.
- Keep `networkAccess.allowedDomains` accurate and specific (never `"*"`).

## Adding a message or a backend call

- Cross-thread message → edit `src/types/messages.ts` (see the local starter's README).
- Backend call → add a function in `src/backend/` that uses `post<T>()` and wrap
  it in `withFallback(remote, local)` so it degrades gracefully.
