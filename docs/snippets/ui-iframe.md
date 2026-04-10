# Snippet: UI Iframe

Use this as a starting point for the UI side. The handler uses a discriminated union and a type guard so every message branch is typed and unhandled shapes are rejected at the boundary.

```ts
import { render, h } from 'preact'
import { useEffect, useState } from 'preact/hooks'

// ---------- message contract ----------

type SelectionItem = {
  id: string
  name: string
  type: string
}

// main -> ui
type MainToUiMessage =
  | { type: 'selection-changed'; items: SelectionItem[]; pageName: string }
  | { type: 'focus-node-error'; message: string }

// ui -> main
type UiToMainMessage =
  | { type: 'focus-node'; nodeId: string }
  | { type: 'export-selection-request'; format: 'png' | 'jpg' | 'svg' }

function isMainToUiMessage(value: unknown): value is MainToUiMessage {
  if (typeof value !== 'object' || value === null) return false
  const msg = value as { type?: unknown }
  return msg.type === 'selection-changed' || msg.type === 'focus-node-error'
}

function postToMain(message: UiToMainMessage): void {
  parent.postMessage({ pluginMessage: message }, '*')
}

// ---------- component ----------

function App() {
  const [items, setItems] = useState<SelectionItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const payload = (event.data as { pluginMessage?: unknown } | undefined)?.pluginMessage
      if (!isMainToUiMessage(payload)) return

      switch (payload.type) {
        case 'selection-changed':
          setItems(payload.items)
          setError(null)
          break
        case 'focus-node-error':
          setError(payload.message)
          break
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div>
      <h1>Selection</h1>
      {error && <p role="alert">{error}</p>}
      <pre>{JSON.stringify(items, null, 2)}</pre>
      <button onClick={() => postToMain({ type: 'export-selection-request', format: 'png' })}>
        Export selection
      </button>
    </div>
  )
}

export default function (rootNode: HTMLElement) {
  render(<App />, rootNode)
}
```

## Keep in UI

- rendering
- fetch
- text inputs
- tabs, filters, and interaction state

## Rules this snippet follows

- Messages crossing the runtime boundary use a discriminated union on `type`.
- An `isMainToUiMessage` type guard rejects anything that does not match a known shape. Unknown messages are dropped, not guessed.
- Outgoing messages go through `postToMain`, which only accepts the declared `UiToMainMessage` union.
- Errors from the main thread are surfaced through a typed `focus-node-error` message rather than throwing.

## Related

- [messaging-bridge snippet](messaging-bridge.md) — full cross-boundary contract style
- [main-thread snippet](main-thread.md) — matching sandbox-side handler
- [runtime-split pattern](../patterns/runtime-split.md) — which side owns which concern
- [messaging-bridge pattern](../patterns/messaging-bridge.md) — how to document the contract itself
