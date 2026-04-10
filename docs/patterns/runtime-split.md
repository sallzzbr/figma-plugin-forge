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
