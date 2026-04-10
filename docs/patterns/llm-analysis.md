# Pattern: LLM Analysis

Use this when the plugin exports frames or selections, adds context, and asks an AI service to evaluate what it sees.

## Good fit

- UX or UI heuristic review
- visual consistency feedback
- content critique tied to screenshots

## Core shape

- Main thread exports selected frames as images
- UI collects user context and sends a request to an optional backend
- Backend prepares the model input and returns structured analysis
- UI renders sections, scores, or recommendations

## Key decisions

- What the exported payload includes
- Whether the backend is required or can be swapped
- Which response schema is stable enough to document

## Failure modes

- payloads too large
- backend timeout or auth failure
- unstructured model output that the UI cannot render safely
