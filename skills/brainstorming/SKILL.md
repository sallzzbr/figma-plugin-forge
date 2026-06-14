---
name: brainstorming
description: Use when the user wants to shape a new Figma plugin or a major feature before implementation
---

# Brainstorming a Figma Plugin

Shape a plugin idea into an explicit, decision-complete design before any code.

## Read first

- the closest archetype in [`../plugin-architecture/references/patterns/`](../plugin-architecture/references/patterns/index.md)
- the design-doc template: [`references/design-doc-template.md`](references/design-doc-template.md)

## Checklist

Cover these nine areas in order. For each area, ask the user a clarifying question whenever the answer is not already explicit. Do not fill gaps with assumptions.

1. Purpose
2. User interaction in Figma
3. UI shape
4. Canvas interaction
5. Backend needs
6. Authentication needs
7. AI or LLM role
8. Local storage needs
9. Data flow summary

## Iterative clarification rule

Whenever the user gives a vague or partial answer, restate what you heard and ask a follow-up before moving on. Do not move to the next area until the current one has an explicit, confirmed decision. If the user pushes to "just start", summarize what is still unresolved and let them choose which gaps to leave open on purpose.

## Decision-complete gate

Only write the design doc when every area in the checklist has an explicit decision the user has confirmed. "Confirmed" means the user either said so directly or reviewed a restatement without correction. If any area is deliberately deferred, record that deferral in the `Notes` section of the design doc.

## Output

Write a design doc using the template at [`references/design-doc-template.md`](references/design-doc-template.md).

Save it to:

- `docs/plans/YYYY-MM-DD-<topic>-design.md` in the target repo if that repo already uses a `docs/plans/` layout; or
- a path the user explicitly chooses.

Never write the file to an implicit or guessed path.

## Rule

Do not write implementation code until the design is explicit enough to capture in the design doc, and the design doc's nine-area checklist has been walked through with the user.
