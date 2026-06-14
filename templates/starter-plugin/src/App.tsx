// UI iframe (regular browser context). Owns rendering, input, and fetch.
// figma.* does NOT exist here — request data from the main thread via messages.

import { useEffect, useState } from 'preact/hooks'
import {
  isMainToUiMessage,
  type SelectionItem,
  type UiToMainMessage,
} from './types/messages'

function postToMain(message: UiToMainMessage): void {
  // The pluginMessage wrapper and '*' origin are required by Figma.
  parent.postMessage({ pluginMessage: message }, '*')
}

export default function App() {
  const [items, setItems] = useState<SelectionItem[]>([])
  const [pageName, setPageName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const payload = (event.data as { pluginMessage?: unknown } | undefined)?.pluginMessage
      if (!isMainToUiMessage(payload)) return

      switch (payload.type) {
        case 'selection-changed':
          setItems(payload.items)
          setPageName(payload.pageName)
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
    <div className="p-3">
      <h1 className="text-figma-base font-semibold mb-2">Selection</h1>
      <p className="text-figma-sm text-figma-text-secondary mb-2">
        {pageName ? `Page: ${pageName}` : 'No page'} · {items.length} item(s)
      </p>
      {error && (
        <p role="alert" className="text-figma-sm text-red-400 mb-2">
          {error}
        </p>
      )}
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              className="w-full text-left px-2 py-1 rounded bg-figma-bg hover:bg-figma-bg-hover text-figma-sm"
              onClick={() => postToMain({ type: 'focus-node', nodeId: item.id })}
            >
              {item.name} <span className="text-figma-text-secondary">({item.type})</span>
            </button>
          </li>
        ))}
      </ul>
      {items.length === 0 && (
        <p className="text-figma-sm text-figma-text-secondary">
          Select one or more layers on the canvas.
        </p>
      )}
    </div>
  )
}
