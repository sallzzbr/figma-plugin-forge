# Start Here

This guide explains how to use `figma-plugin-forge` without confusing it for a plugin monorepo or code package.

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
