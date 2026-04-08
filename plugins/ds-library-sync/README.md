# DS Library Sync

A Figma plugin that extracts Design System library components and tokens from a Figma file, compares them against a stored backend state, and pushes updates.

## What it demonstrates

- **State machine UI** — Clear state transitions (init, extracting, comparing, diff_ready, login, pushing, done, error) drive the entire UI
- **Auth flow** — Email/password login via Supabase Edge Functions, with session persistence in `figma.clientStorage`
- **CRUD with backend** — Fetch stored library state, compute diffs, push updates
- **Figma sandbox extraction** — Iterate published components and local variables from the main thread
- **`enablePrivatePluginApi`** — Required for `figma.fileKey` (identifying which library file is open)

## Prerequisites

### `enablePrivatePluginApi`

This plugin requires `"enablePrivatePluginApi": true` in both `manifest.json` and the `figma-plugin` section of `package.json`. Without it, `figma.fileKey` always returns `null`.

### Backend setup

The plugin expects Supabase Edge Functions at:

- `POST /validate-library` — Check if a file key is a registered library
- `POST /get-library-state` — Fetch stored components/tokens for a library
- `POST /update-library-state` — Push updated components/tokens (requires auth)
- `POST /admin-login` — Email/password authentication

Update `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `@figma-forge/shared/services/supabaseConfig.ts` or via environment variables.

## How to run

```bash
# From the monorepo root
npm install

# Build this plugin
cd plugins/ds-library-sync
npm run build

# Or watch for changes during development
npm run dev
```

Then load the plugin in Figma:
1. Open a Figma file that contains your design system library
2. Plugins > Development > Import plugin from manifest
3. Select `plugins/ds-library-sync/manifest.json`

## Architecture

See `AGENTS.md` for detailed architecture, state machine, and message contracts.
