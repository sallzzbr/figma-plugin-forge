# Pattern: Spec Generation

Use this when the plugin turns a visual selection into a structured product artifact.

## Good fit

- requirements generation
- acceptance criteria drafting
- QA scenario generation
- product documentation starter output

## Core shape

- Main thread exports the selection
- UI collects product context
- Optional backend calls the model and normalizes the output
- UI renders a structured artifact that can be copied or exported

## Key decisions

- Which schema must stay stable
- Whether the output is editable in place
- How much traceability back to frames or flows is required

## Failure modes

- schema drift between backend and renderer
- vague context leading to generic output
- oversized selections producing weak or partial results
