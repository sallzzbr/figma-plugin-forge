# Pattern: Messaging Bridge

Main and UI talk through explicit messages. Treat those messages as a contract.

## Good message design

- one clear responsibility per message
- stable type names
- typed payloads
- request and response shapes that are easy to document

## Recommended naming

- kebab-case message types
- suffixes like `-loaded`, `-changed`, `-error`, `-request`, `-response` when helpful

## What to document

- sender
- receiver
- trigger
- payload
- success response
- error response

## Anti-patterns

- hidden shared mutable state across the boundary
- loose string messages with undocumented payloads
- changing payload shape without updating docs and consumers

## Related

- [messaging-bridge snippet](../snippets/messaging-bridge.md) — exemplar typed contract with table
- [main-thread snippet](../snippets/main-thread.md) — matching main-side handler with type guard
- [ui-iframe snippet](../snippets/ui-iframe.md) — matching UI-side handler with type guard
- [runtime-split](runtime-split.md) — which side sends which messages
- [common-pitfalls](../guides/common-pitfalls.md) — pitfall #4 (raw nodes to UI), #8 (figma in UI)
