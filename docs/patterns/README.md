# Pattern Catalog

These pattern docs replace the old idea of "boilerplate plugins". Use them to choose architecture, not to copy a fake framework wholesale.

## Archetypes

| Pattern | Good fit | Proven by |
| --- | --- | --- |
| [local-audit.md](local-audit.md) | Design system audits, accessibility checks, naming validation — no backend | [Contrast Auditor (2026-04-09)](../examples/2026-04-09-local-audit-design-doc-example.md) |
| [llm-analysis.md](llm-analysis.md) | LLM-powered review of selections, optional backend | [Frame Review Assistant (2026-04-08)](../examples/2026-04-08-design-doc-example.md) |
| [library-sync.md](library-sync.md) | Component and token sync, fingerprinting, library state tracking | _no example yet — contributions welcome_ |
| [spec-generation.md](spec-generation.md) | Turn selections into structured artifacts (specs, requirements, QA) | [Component Spec Extractor (2026-04-09)](../examples/2026-04-09-spec-generation-design-doc-example.md) |

See [docs/examples/README.md](../examples/README.md) for the full example index and archetype coverage.

## Supporting decisions

- [runtime-split.md](runtime-split.md)
- [messaging-bridge.md](messaging-bridge.md)
- [optional-backend.md](optional-backend.md)
- [shared-concerns.md](shared-concerns.md)

## How to read a pattern

Every archetype doc follows the same shape:

- **Good fit**: what kinds of plugins this archetype is a natural match for
- **Core shape**: the runtime split and responsibilities
- **Key decisions**: the choices the target repo still owns
- **Failure modes**: the common ways this archetype goes wrong

Read the archetype that sounds closest to your idea, then read the supporting decisions for the specific concerns that apply. Pair the pattern with the matching snippet in [docs/snippets/](../snippets/) when you need concrete code shape, and with a filled [example](../examples/) when you need to see the template in action.
