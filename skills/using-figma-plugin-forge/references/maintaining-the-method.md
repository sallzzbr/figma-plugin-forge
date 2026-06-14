# Maintaining the Method

Use this guide whenever you change the method itself — the skills, their references, or the templates.

## Source of truth

The `skills/` tree is the single source of truth. Each skill is a concise `SKILL.md` plus a `references/` folder holding the absorbed reference material. The `templates/` directory holds the **canonical, build-verified** scaffolds (`starter-plugin/` and `starter-plugin-backend/`) — code is copied from there, never retyped from the prose in a reference file.

Before editing a `SKILL.md`, ask whether the real change belongs in one of its `references/` files instead. Keep each `SKILL.md` short and routing-focused; put depth in `references/`.

## Synchronization checklist

- Changed a `SKILL.md`:
  confirm it still routes to the right files in its own `references/` and to sibling skills, and that no link points at a file that has moved.
- Changed a reference under `skills/*/references/`:
  confirm the owning `SKILL.md` still summarizes it correctly, and that any sibling skill that links to it still resolves.
- Changed a pattern in `skills/plugin-architecture/references/patterns/`:
  review the matching snippet(s) and the examples in `skills/writing-plans/references/examples/` that cite it.
- Changed a snippet:
  confirm the linked pattern still explains when to use it.
- Changed a template under `templates/`:
  review `skills/writing-plans/references/examples/` and any skill that references the template, then run `node scripts/validate-scaffold.mjs --build` to confirm it still compiles.
- Changed an example:
  confirm it still matches the templates and its declared target-repo assumptions.

## Editorial verification

Before calling the method update complete:

- verify there are no machine-local absolute paths such as `/C:/Users/...`
- verify links are portable and relative inside the versioned tree
- verify examples still prove the templates
- verify each `SKILL.md` summarizes and routes, rather than becoming parallel documentation
- verify every relative link inside `skills/**` resolves to a real file

## Scaffold validation

The scaffold check confirms a plugin actually runs in Figma:

```bash
node scripts/validate-scaffold.mjs --build               # for templates/starter-plugin/
node scripts/validate-scaffold.mjs --path <plugin-dir>   # for a generated plugin
```

Exit code `0` means clean. See [scripts/README.md](../../../scripts/README.md) for the full list of checks and how to fix typical failures.

## Review mindset

Ask: can an AI use this repo by reading the skills (and the templates they point to) alone, without any external context? If not, the method still has drift.
