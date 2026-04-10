# Maintaining the Method

Use this guide whenever you change the method itself.

## Keep the source of truth stable

Before editing an adapter or skill, check whether the real change belongs in `AGENTS.md` or `docs/`.

## Synchronization checklist

- Changed `README.md` or `AGENTS.md`:
  review `docs/guides/assistant-integrations.md`
- Changed a guide:
  review `README.md`, `AGENTS.md`, and any skill that routes to it
- Changed a pattern:
  review related snippets and skills that point to it
- Changed a snippet:
  confirm the linked pattern still explains when to use it
- Changed a template:
  review `docs/examples/` and any skill that references the template
- Changed an example:
  confirm it still matches the template and declared target repo assumptions
- Changed an adapter:
  update the integration matrix and runtime requirements

## Editorial verification

Before calling the method update complete:

- verify there are no machine-local absolute paths such as `/C:/Users/...`
- verify links are portable and relative inside versioned docs
- verify examples still prove the templates
- verify skills summarize and route, rather than becoming parallel documentation
- verify adapters do not promise more than they actually automate

## Scripted validation

Run the editorial validation script before committing:

```bash
node scripts/validate-docs.mjs
```

It catches five classes of drift automatically:

1. Broken relative links in tracked markdown files
2. Machine-local absolute paths leaking into versioned docs
3. Archetype coverage gaps in `docs/examples/`
4. Mirror drift between skills and `docs/templates/`
5. Integration matrix entries that reference files that do not exist

Exit code `0` means clean. Any failure prints the file path, line, and reason. See [scripts/README.md](../../scripts/README.md) for the full list of checks and how to fix typical failures.

The script is additive: it does not replace the editorial verification checklist above. Run both.

## Review mindset

Ask two questions:

1. Can a human understand the repo without reading tool-specific assets?
2. Can an AI use the repo by reading `AGENTS.md` and `docs/` alone?

If either answer is no, the method still has drift.
