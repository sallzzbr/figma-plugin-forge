---
description: Add a backend path (agnostic core + adapter) to an existing Figma plugin, with a local fallback.
argument-hint: [what the backend should do]
---

Add a backend to the current Figma plugin without breaking its local-only behavior.

Goal (may be empty): $ARGUMENTS

1. Invoke the `figma-backend-integration` skill.
2. Introduce the vendor-agnostic backend layer (mirror `templates/starter-plugin-backend/src/backend/`):
   - `config.ts` — `baseUrl` + headers; the ONE place to repoint the plugin.
   - `client.ts` — generic POST with timeout + typed errors; `fetch` runs in the UI only.
   - `fallback.ts` — `withFallback(remote, local)` to degrade gracefully.
3. Define the request/response as a typed JSON contract. The plugin depends on the contract,
   not on any provider SDK.
4. Add a concrete adapter only if asked (e.g. a Supabase Edge Function like
   `templates/starter-plugin-backend/backend/`). Otherwise document the contract and leave
   `config.ts` pointing at a placeholder.
5. Wrap every backend call in `withFallback` so the plugin still works offline / unconfigured.
6. Update `manifest.json` → `networkAccess.allowedDomains` to the exact origin(s); never `"*"`.
   Ship only public/anon keys — never secrets (`src/` is fully readable).
7. Verify: `npm run lint && npm run typecheck && npm test && npm run build`, then
   `node scripts/validate-scaffold.mjs --path <plugin-dir>`.
