# Examples

Filled design docs and implementation plans that prove the templates and workflow. Each example is tagged with the archetype it demonstrates so readers can jump straight to the closest match for their plugin.

## Index

| Date | Archetype | Subject | Design doc | Implementation plan |
| --- | --- | --- | --- | --- |
| 2026-04-08 | `llm-analysis` | Frame Review Assistant | [design doc](2026-04-08-design-doc-example.md) | [plan](2026-04-08-implementation-plan-example.md) |
| 2026-04-09 | `local-audit` | Contrast Auditor | [design doc](2026-04-09-local-audit-design-doc-example.md) | [plan](2026-04-09-local-audit-implementation-plan-example.md) |
| 2026-04-09 | `spec-generation` | Component Spec Extractor | [design doc](2026-04-09-spec-generation-design-doc-example.md) | [plan](2026-04-09-spec-generation-implementation-plan-example.md) |

## Archetype coverage

| Archetype | Example(s) |
| --- | --- |
| `llm-analysis` | Frame Review Assistant (2026-04-08) |
| `local-audit` | Contrast Auditor (2026-04-09) |
| `spec-generation` | Component Spec Extractor (2026-04-09) |
| `library-sync` | _no example yet — contributions welcome_ |

See [docs/patterns/README.md](../patterns/README.md) for the full archetype catalogue and supporting decisions.

## How examples are used

- By humans, to see the templates in action before filling their own.
- By AIs, to anchor their design doc and plan output in a concrete reference that follows the contract rules in [AGENTS.md](../../AGENTS.md).
- By the maintenance process, to detect template drift via `scripts/validate-docs.mjs`.

If you add a new example:

1. Follow the canonical templates in [docs/templates/](../templates/).
2. Tag the archetype explicitly in the `Related pattern(s)` field so the validation script can find it.
3. Update the tables above.
4. Run `node scripts/validate-docs.mjs` to confirm links, archetype coverage, and template alignment.
