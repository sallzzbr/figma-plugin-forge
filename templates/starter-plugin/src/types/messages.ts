// Single source of truth for every message that crosses the main <-> UI boundary.
// Both src/main.ts and src/App.tsx import from here so the contract stays in sync.

export type SelectionItem = {
  id: string
  name: string
  type: string
}

// main thread -> UI iframe
export type MainToUiMessage =
  | { type: 'selection-changed'; items: SelectionItem[]; pageName: string }
  | { type: 'focus-node-error'; message: string }

// UI iframe -> main thread
export type UiToMainMessage = { type: 'focus-node'; nodeId: string }

export function isMainToUiMessage(value: unknown): value is MainToUiMessage {
  if (typeof value !== 'object' || value === null) return false
  const msg = value as { type?: unknown }
  return msg.type === 'selection-changed' || msg.type === 'focus-node-error'
}

export function isUiToMainMessage(value: unknown): value is UiToMainMessage {
  if (typeof value !== 'object' || value === null) return false
  const msg = value as { type?: unknown }
  return msg.type === 'focus-node'
}
