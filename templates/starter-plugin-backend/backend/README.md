# Backend (optional, swappable)

The plugin UI talks to a backend through a **vendor-agnostic core** and depends
only on a JSON contract — not on any specific provider:

```
src/backend/
  config.ts    baseUrl + headers (the one place to repoint the plugin)
  client.ts    generic POST with timeout + typed errors (uses fetch, UI-only)
  fallback.ts  withFallback(remote, local) — degrade gracefully
  analyze.ts   example feature: summarize selection, remote-first, local fallback
```

This folder is **one concrete adapter** that satisfies that contract, using
Supabase Edge Functions (Deno). Use it, or replace it with anything that speaks
the same JSON.

## Contract

`POST /analyze-selection` with `{ items: { id, name, type }[] }` →
`{ total: number, byType: Record<string, number>, headline: string }`.

## Run this adapter

```bash
# https://supabase.com/docs/guides/functions
supabase functions serve analyze-selection            # local
supabase functions deploy analyze-selection           # deploy
```

Then point the plugin at it:

1. Set `src/backend/config.ts` `baseUrl` to your Functions URL
   (e.g. `https://<project-ref>.supabase.co/functions/v1`).
2. Add that origin to `manifest.json` → `networkAccess.allowedDomains`.
3. Put your **anon/public** key in `config.ts` `anonKey` if your function needs it.

## Use a different backend

Delete this `backend/` folder and rewrite `src/backend/config.ts` to point at
your service. As long as the endpoint honours the contract above, nothing else in
the plugin changes. With no backend reachable, `analyze.ts` falls back to the
local summary — so the plugin keeps working.

## Security

- Only ship **public/anon** keys in the plugin. Anything in `src/` is readable by
  anyone who installs the plugin.
- Keep service-role keys and other secrets in the backend's own environment
  (e.g. `supabase secrets set`), never in `src/backend/config.ts`.
