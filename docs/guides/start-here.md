# Start Here

This guide explains how to use `figma-plugin-forge` without confusing it for a plugin monorepo or code package.

## Your first plugin in 15 minutes

You do not need to write code. Your AI reads this repo, asks you questions, and writes the plugin. Here's the happy path from zero to a running plugin:

1. **Clone the repo** onto your computer: `git clone https://github.com/sallzzbr/figma-plugin-forge.git`
2. **Open the folder** in your AI tool (Claude Code, Cursor, Codex, or any AI that can read files).
3. **Give the AI its starting instructions**, for example:
   > "Read `AGENTS.md` and `docs/guides/spec-driven-workflow.md`, then help me build a plugin that highlights frames with low contrast."
4. **Answer the AI's clarifying questions.** The AI runs a brainstorming checklist covering purpose, UI shape, canvas interaction, backend needs, and more. Answer in plain language — if you don't know the answer, say so and the AI will explain the tradeoffs.
5. **Review the design doc.** When the AI has enough to decide, it writes a design doc under `docs/plans/` (or proposes a path). Read it. Correct anything wrong. This is the most important step — catching a mistake here costs one edit; catching it in code costs hours.
6. **Review the implementation plan.** Once the design is approved, the AI breaks it into small tasks with exact files and verification steps.
7. **Let the AI implement.** It creates a new folder for your plugin (the *target repo*) and fills it in task by task.
8. **Load the plugin into Figma Desktop.** Open Figma Desktop → menu → Plugins → Development → Import plugin from manifest → select the `manifest.json` the AI created. The plugin appears under Plugins → Development → your plugin name.
9. **Iterate.** If something isn't right, tell the AI what to change and it updates the plan before touching code.

### Signals things are working

- A new file appears under `docs/plans/` within the first session.
- The AI asks questions before writing code.
- The AI references a specific pattern file (`docs/patterns/local-audit.md`, `llm-analysis.md`, `spec-generation.md`, or `library-sync.md`).
- The generated `manifest.json` matches the archetype you're building (see [`docs/snippets/manifest.md`](../snippets/manifest.md) for the decision table).

### Signals something is off

- The AI jumps straight to writing code. → Tell it to read `AGENTS.md` first.
- The AI generates a `manifest.json` with fields you don't need (like `networkAccess` on a plugin that never calls an API). → Point it at [`docs/snippets/manifest.md`](../snippets/manifest.md).
- The AI edits files inside this repo instead of creating a new target repo. → Remind it: "This repo is the method, not the target. Create a new folder for my plugin."

For the build tools the AI will use (esbuild, Preact, Tailwind), see [project-setup.md](project-setup.md). You do not need to install or configure these manually — the AI does it.

## Pick your mode first

Before you do anything else, decide how you are using this repo. There are two modes:

- **Repo mode** (canonical): clone this repo as your workspace and read `AGENTS.md` plus `docs/` directly. This is the default and recommended path.
- **Bundle mode**: install this repo's skills or adapter assets into another assistant context while you work in a different target repo.

See [distribution-modes.md](distribution-modes.md) for the full explanation, the assistant support matrix, and the conflict rule.

The rest of this guide assumes repo mode. Bundle mode users should still read the guide in repo mode first, then return to their target repo.

## Use this repo to think

Use this repository to:

- shape a plugin idea
- choose an architecture
- document the design
- plan implementation
- review work against explicit contracts

## Do not use this repo as the target app

This repository does not try to be:

- a ready-made plugin package
- a backend you should deploy as-is
- a shared UI library you should install blindly

## Use the target repo to build

After the design is clear:

1. create or open the real target repo
2. apply the patterns and snippets there
3. keep the design doc and implementation plan with the work

## Come back here to improve the method

Return to `figma-plugin-forge` only when you want to improve:

- a guide
- a pattern
- a snippet
- a template
- an example
- a skill or adapter

## Recommended path

1. Read `AGENTS.md` if an assistant is involved
2. Read `docs/guides/spec-driven-workflow.md`
3. Pick the closest match in `docs/patterns/`
4. Write a design doc with `docs/templates/design-doc.md`
5. Write an implementation plan with `docs/templates/implementation-plan.md`
6. Implement in the target repo
