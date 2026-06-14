---
name: using-figma-plugin-forge
description: Use when starting any conversation about building or changing a Figma plugin with figma-plugin-forge — routes into the spec-driven workflow and the right skill
---

# Using Figma Plugin Forge

This is the router. It describes the end-to-end method and points to the skill for each step. The `skills/` tree is the single source of truth; the `templates/` directory holds the canonical, build-verified scaffolds that implementation copies from.

## The workflow

Build a plugin as a short sequence. Use the smallest next skill for the step you are on.

1. **Clarify the idea** → [`brainstorming`](../brainstorming/SKILL.md)
   Walk the nine-area checklist until the design is decision-complete, then write a design doc.
2. **Pick the architecture** → [`plugin-architecture`](../plugin-architecture/SKILL.md)
   Choose an archetype (local-audit, llm-analysis, spec-generation, library-sync) and decide whether a backend is needed.
3. **Write the plan** → [`writing-plans`](../writing-plans/SKILL.md)
   Turn the approved design into a task-by-task plan with files, verification, and commit messages.
4. **Scaffold from a template**
   Copy [`templates/starter-plugin/`](../../templates/starter-plugin/) (local) or [`templates/starter-plugin-backend/`](../../templates/starter-plugin-backend/) (backend) verbatim, then adapt. Never reconstruct the manifest/build/config from prose.
5. **Implement** → [`executing-plans`](../executing-plans/SKILL.md)
   Work task by task, verifying each, until the Definition of Done passes.
6. **Review and feed back**
   If implementation teaches you something new about the method, update the relevant skill or its `references/`.

## Cross-cutting skills

Pull these in whenever the step needs them:

- [`figma-api-patterns`](../figma-api-patterns/SKILL.md) — Figma Plugin API surfaces, pitfalls, and code snippets.
- [`figma-backend-integration`](../figma-backend-integration/SKILL.md) — when the plugin needs a backend (LLM calls, shared state, auth).

## Source of truth

- The skills (their `SKILL.md` plus `references/`) are canonical for the method.
- The templates under `templates/` are canonical for code — they are verified to build and run, so copy them rather than retyping scaffolding.
- When code and prose disagree, the verified template wins for code; the skill wins for method.

## Implementing a plugin

When it is time to write code, copy a template verbatim as the starting point and adapt it. Validate with `node scripts/validate-scaffold.mjs --path <plugin-dir>` and check the Definition of Done in the [`executing-plans`](../executing-plans/SKILL.md) skill.

## Maintenance

If you change templates, patterns, snippets, or any skill, review [`references/maintaining-the-method.md`](references/maintaining-the-method.md). If you change `templates/starter-plugin/`, run `node scripts/validate-scaffold.mjs --build` to confirm it still compiles cleanly.
