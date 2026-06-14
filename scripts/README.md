# Scripts

Editorial and maintenance scripts for `figma-plugin-forge`. These are not part of the canonical method (which lives in the `skills/` tree). They are tools that protect the method from drift.

## Runtime

- Node 18 or newer
- No dependencies. Run scripts directly with `node scripts/<file>.mjs`.
- There is no `package.json` in this repo by design. Scripts are invoked directly, not via `npm run`.

## Scripts

### `validate-links.mjs`

Link/reference integrity across the method surfaces (`README.md`, `AGENTS.md`, `skills/`, `commands/`, `agents/`, `.cursor/`, `templates/`). Since `skills/` is the single source of truth and everything else points into it, this keeps those pointers honest.

```bash
node scripts/validate-links.mjs
```

Checks: (1) relative markdown links resolve; (2) no machine-local absolute paths; (3) backticked repo paths (`skills/...`, `templates/...`, etc.) point at files/dirs that exist. Exit `0` on pass, `1` on failure.

The editorial guidance for maintaining the method now lives in `skills/using-figma-plugin-forge/references/maintaining-the-method.md`.

### `validate-scaffold.mjs`

Plugin-correctness check for `templates/starter-plugin/` (or any plugin directory). Catches the
"basic things wrong" that stop a plugin running in Figma.

```bash
node scripts/validate-scaffold.mjs                 # static checks; builds if node_modules present
node scripts/validate-scaffold.mjs --build         # npm install + build, then check outputs
node scripts/validate-scaffold.mjs --path path/to/plugin
```

Exit code `0` on pass, `1` on any failure.

#### Checks

- **Static (always, offline):** `manifest.json` is valid and has required fields; `documentAccess === "dynamic-page"`; `networkAccess.allowedDomains` is a non-empty array; the runtime split holds across all `src` files — main-side files use no sandbox-forbidden browser APIs (`btoa`/`atob`, `fetch`, `window`, `document`, `localStorage`) and UI-side files (`.tsx` or framework importers) never reference `figma.*`; `package.json` declares `build`/`typecheck`/`lint`/`test` scripts with at least one test file and no obvious secrets in `src/`; and for backend plugins (`src/backend/` present) `networkAccess` declares real domains and backend files never reference `figma.*`.
- **Build (when `node_modules` exists or `--build`):** `npm run build` succeeds; the files named by `manifest.main`/`manifest.ui` exist; the built UI HTML is self-contained (no external `<script src>`/`<link href>`, no leftover placeholders).

#### When to run

- After editing `templates/starter-plugin/` (use `--build` to confirm it still compiles).
- As the Definition-of-Done gate for a generated plugin (`--path <plugin-dir>`).

## Adding new scripts

- One file per script, named `<purpose>.mjs`.
- Plain Node ESM, no dependencies, no `package.json`.
- Document the script in this README.
- Document how to run it and what exit codes it returns.
- If the script is meant to run in CI, also add a note under "When to run" above.
