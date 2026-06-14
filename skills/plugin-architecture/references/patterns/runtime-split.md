# Pattern: Runtime Split

Every Figma plugin has at least two runtimes:

- main thread in the Figma sandbox
- UI iframe in the browser context

## Main thread owns

- `figma.*`
- selection
- node traversal
- export
- client storage
- viewport focus

## UI iframe owns

- rendering
- forms and input
- browser helpers
- fetch and backend calls
- local UI state

## Rule

If a capability depends on `figma.*`, keep it in main. If it depends on DOM or `fetch`, keep it in UI.

## Anti-patterns

- calling `figma.*` from UI code
- trying to fetch directly from the main thread
- passing raw node objects into UI state

## Related

- [main-thread snippet](../../../figma-api-patterns/references/snippets/main-thread.md) — starter code for the sandbox side
- [ui-iframe snippet](../../../figma-api-patterns/references/snippets/ui-iframe.md) — starter code for the UI side
- [messaging-bridge](messaging-bridge.md) — how the two sides communicate
- [figma-api-reference](../../../figma-api-patterns/references/api-reference.md) — which APIs live on which side
- [common-pitfalls](../../../figma-api-patterns/references/common-pitfalls.md) — pitfalls #8 (figma in UI) and #9 (fetch in main)
