# Spec-Driven Workflow

`figma-plugin-forge` is organized around a simple sequence:

1. Clarify the idea
2. Write the design
3. Break it into implementation tasks
4. Implement in the target repo
5. Verify against the design and plan

## Step 1: Clarify the idea

Use the `brainstorming` skill or mirror its questions manually:

- What problem does the plugin solve?
- What does the user select or do in Figma?
- Is the plugin read-only, read-write, or both?
- Does it need backend, auth, AI, or storage?
- What is the full data flow?

## Step 2: Write the design doc

Use `docs/templates/design-doc.md`.

The design doc should lock:

- architecture
- UI shape
- runtime responsibilities
- data flow
- contracts
- error handling
- verification criteria

## Step 3: Write the implementation plan

Use `docs/templates/implementation-plan.md`.

The plan should be decision-complete and task-oriented:

- exact files
- expected outcome
- verification step
- commit message

## Step 4: Implement in the target repo

This repository is not the target app. Use the patterns and snippets as references, then build in the user's real workspace.

Every task must still use the canonical happy path (manifest shape, `figma.showUI` + typed `postMessage`, runtime split, esbuild output) defined in [`AGENTS.md § Happy path`](../../AGENTS.md#happy-path). Deviations belong in the design doc's `## Architecture` section with a stated reason.

## Step 5: Review and feed back

If the implementation teaches you something new about the method, update this repository's docs, patterns, snippets, skills, or examples.
