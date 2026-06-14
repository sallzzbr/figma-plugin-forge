---
name: figma-backend-integration
description: Use when a Figma plugin needs a backend (LLM calls, shared state, auth). Vendor-agnostic HTTP client + local fallback; Supabase adapter as a concrete example.
---

# Figma Backend Integration

Use this skill when a plugin needs a server: LLM calls, shared/durable state, auth, or a protected external API. The goal is a backend the plugin does not depend on — a vendor-agnostic core that degrades to a local fallback when no backend is configured or reachable.

## When you actually need a backend

First confirm a backend is warranted — see the decision tree in [`../plugin-architecture/references/patterns/optional-backend.md`](../plugin-architecture/references/patterns/optional-backend.md). Add one only when secret keys are involved, an LLM/external API must be proxied, auth is required, or durable storage matters. Otherwise keep the plugin local.

## Agnostic core + adapter

The plugin talks to a small, generic HTTP layer and a JSON contract — never to a vendor SDK. One concrete adapter (Supabase Edge Functions) sits behind that contract and is swappable.

The verified scaffold is [`templates/starter-plugin-backend/`](../../templates/starter-plugin-backend/):

- [`src/backend/config.ts`](../../templates/starter-plugin-backend/src/backend/config.ts) — the single place to repoint the plugin: `baseUrl` + headers. Swap this file to use a different backend.
- [`src/backend/client.ts`](../../templates/starter-plugin-backend/src/backend/client.ts) — generic `post<T>()` with a timeout and typed errors. Uses `fetch`, so it runs in the UI iframe only. No backend SDK.
- [`src/backend/fallback.ts`](../../templates/starter-plugin-backend/src/backend/fallback.ts) — `withFallback(remote, local)`: try the remote call, fall back to a local computation on failure.
- [`src/backend/analyze.ts`](../../templates/starter-plugin-backend/src/backend/analyze.ts) — an example feature wired remote-first with a local fallback.
- [`backend/`](../../templates/starter-plugin-backend/backend/) — one concrete Supabase adapter (Deno Edge Functions). Delete it and bring your own; the plugin only depends on the JSON contract. See its [`README.md`](../../templates/starter-plugin-backend/backend/README.md).

## Local-fallback pattern

Wrap every backend call so the plugin stays useful without a backend and degrades gracefully when one exists but is down:

```ts
const { data, source } = await withFallback(
  () => post<AnalyzeResponse>('analyze-selection', request), // remote
  () => computeLocally(request),                              // local fallback
  (err) => console.warn('backend unavailable, using local', err),
)
// source is 'remote' | 'local' — surface it in the UI if it matters
```

Until `config.ts` is pointed at a real backend, calls fall through to the local path automatically.

## Contract and code shape

Cross the network boundary with explicit request, response, and error types. The [`references/optional-backend-snippet.md`](references/optional-backend-snippet.md) shows a self-contained typed client (request/response/error union, injected auth, never throws). The canonical "when to add a backend" decision and contract checklist live in [`../plugin-architecture/references/patterns/optional-backend.md`](../plugin-architecture/references/patterns/optional-backend.md).

## Non-negotiables

- **`fetch` only in the UI iframe** — never in the main thread. The Figma sandbox has no `fetch`; network I/O belongs in the UI side (`src/backend/` here is UI-side).
- **Wrap calls in `withFallback`** so the plugin works offline / before the backend exists, and degrades instead of breaking.
- **`manifest.json` → `networkAccess.allowedDomains` must be specific** — list the exact backend origin, never `"*"`. It ships as `https://your-backend.example.com`; replace it.
- **Ship only public/anon keys, never secrets.** Everything under `src/` is fully readable by anyone who installs the plugin. Keep service-role keys and other secrets in the backend environment.

## Checklist

- [ ] a backend is genuinely needed (re-check the optional-backend decision tree)
- [ ] all network calls live in the UI iframe, never the main thread
- [ ] every backend call is wrapped in `withFallback` with a real local path
- [ ] the request/response/error contract is typed in one place
- [ ] `config.ts` is the only place that names the backend origin
- [ ] `networkAccess.allowedDomains` lists the exact origin (no `"*"`)
- [ ] only public/anon keys are in `src/`; secrets stay server-side
