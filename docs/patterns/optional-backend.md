# Pattern: Optional Backend

Some plugins stay local. Others need a backend for AI, auth, persistence, or external APIs.

## Use no backend when

- all logic can stay in Figma + UI
- results are derived locally
- persistence can live in `figma.clientStorage`

## Use a backend when

- the plugin calls an LLM
- auth is required
- durable storage matters
- an external API must be proxied or protected

## Rule

Document the backend as optional unless the plugin truly cannot function without it.

## Contract checklist

- request shape
- response shape
- auth model
- retry or error policy
- timeout expectations
