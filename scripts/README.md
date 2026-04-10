# Scripts

Editorial and maintenance scripts for `figma-plugin-forge`. These are not part of the canonical method (which lives in `AGENTS.md` plus `docs/`). They are tools that protect the method from drift.

## Runtime

- Node 18 or newer
- No dependencies. Run scripts directly with `node scripts/<file>.mjs`.
- There is no `package.json` in this repo by design. Scripts are invoked directly, not via `npm run`.

## Scripts

### `validate-docs.mjs`

Editorial drift check. Run before committing method changes.

```bash
node scripts/validate-docs.mjs
```

Exit code `0` on pass, `1` on any failure. All failures are printed with file paths and line numbers.

#### Checks

1. **Relative link targets exist.** Every markdown link in a tracked documentation file (root `README.md`, `AGENTS.md`, `CLAUDE.md`, everything under `docs/` and `skills/`, and the adapter README files) must resolve to a real file on disk. Anchors and query strings are ignored. External URLs (http, https, mailto) are skipped. Content inside fenced code blocks is ignored so code examples cannot produce false positives.
2. **No machine-local absolute paths.** Flags patterns like `C:\Users\`, `/home/<name>`, `/Users/<name>` in versioned docs. Content inside fenced code blocks and inline backticks is ignored so meta-examples of bad paths (such as the one in `docs/guides/maintaining-the-method.md`) do not count as leaks.
3. **Archetype coverage.** Every archetype listed under `## Archetypes` in `docs/patterns/README.md` must have at least one example file in `docs/examples/` that references `docs/patterns/<archetype>.md` in its first 30 lines. Archetypes explicitly listed as `_no example yet ..._` in `docs/examples/README.md` are exempt.
4. **Mirror drift.** Every skill file that declares `> Mirror provenance: [name](path)` must have a fenced markdown block whose heading set exactly matches the headings of the canonical file at `path`. This catches cases where the canonical template changes but the embedded mirror in the skill does not.
5. **Integration matrix consistency.** Every backticked asset path named in the `Assets in repo` column of `docs/guides/assistant-integrations.md` must exist on disk.

#### How to fix typical failures

- **Broken link**: either rename/recreate the target file or update the link. If the link is correct but points to a file that should exist, create it. If the link is obsolete, remove it.
- **Absolute path**: replace with a path relative to the repo root, or wrap in inline backticks if it is a meta-example that should not be treated as a real path.
- **Missing archetype example**: either add a design-doc and implementation-plan example pair under `docs/examples/` that references the archetype, or mark the archetype as a known gap in `docs/examples/README.md` with the `_no example yet_` phrase.
- **Mirror drift**: update the `\`\`\`markdown` block inside the skill file to match the canonical template in `docs/templates/`. The canonical file is authoritative; the mirror must follow.
- **Matrix inconsistency**: either create the missing asset or remove its mention from the matrix. Adding an asset to the matrix without creating it on disk is a promise the repo does not keep.

#### When to run

- Before committing any change to `docs/`, `skills/`, `AGENTS.md`, `README.md`, `CLAUDE.md`, or adapter metadata.
- After renaming or moving any file in the tracked set.
- After editing `docs/templates/` (mirror drift is silent otherwise).
- Before tagging a release or publishing the repo as a reference.

## Adding new scripts

- One file per script, named `<purpose>.mjs`.
- Plain Node ESM, no dependencies, no `package.json`.
- Document the script in this README.
- Document how to run it and what exit codes it returns.
- If the script is meant to run in CI, also add a note under "When to run" above.
