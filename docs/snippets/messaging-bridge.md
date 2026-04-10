# Snippet: Messaging Bridge

Use typed messages and keep them explicit.

```ts
// ui -> main
parent.postMessage(
  {
    pluginMessage: {
      type: 'export-selection-request',
      format: 'jpg',
    },
  },
  '*'
)

// main -> ui
figma.ui.postMessage({
  type: 'export-selection-response',
  frames: exportedFrames,
})
```

## Suggested contract table

| Type | Sender | Purpose |
| --- | --- | --- |
| `selection-changed` | main | Push normalized selection state to the UI |
| `export-selection-request` | UI | Ask main to export supported nodes |
| `export-selection-response` | main | Return exported frames or an error |
| `focus-node` | UI | Ask main to select and focus a node |
| `focus-node-error` | main | Surface navigation failure |
