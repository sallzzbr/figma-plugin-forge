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
