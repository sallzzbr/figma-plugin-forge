// Single source of truth for everything crossing the main <-> UI boundary.
//
// There are two channels, on purpose:
//
//   1. Events   — fire-and-forget. One side notifies the other; no reply.
//                 e.g. the main thread tells the UI the selection changed.
//   2. Requests — a round-trip. The UI asks the main thread for something and
//                 awaits a typed reply, correlated by a numeric `requestId`.
//                 e.g. the UI reads/writes figma.clientStorage (main-only).
//
// Adding a message is a one-line change to the union/registry below; the bridge
// helpers (src/bridge.ts, src/main-bridge.ts) stay generic and type-safe.

export type SelectionItem = {
  id: string
  name: string
  type: string
}

/* ------------------------------- Events ------------------------------- */

/** Fire-and-forget, main thread -> UI iframe. */
export type MainEvent = {
  type: 'selection-changed'
  items: SelectionItem[]
  pageName: string
}

/** Fire-and-forget, UI iframe -> main thread. */
export type UiEvent = {
  type: 'focus-node'
  nodeId: string
}

/* ------------------------------ Requests ------------------------------ */

/**
 * Typed request/response registry. Each entry maps a request `kind` to the
 * `params` that travel UI -> main and the `result` that travels main -> UI.
 * Add a key here to expose a new round-trip call — nothing else in the bridge
 * needs to change.
 */
export type RequestRegistry = {
  'get-storage': { params: { key: string }; result: string | null }
  'set-storage': { params: { key: string; value: string }; result: boolean }
}

export type RequestKind = keyof RequestRegistry
export type RequestParams<K extends RequestKind> = RequestRegistry[K]['params']
export type RequestResult<K extends RequestKind> = RequestRegistry[K]['result']

/* ---- Wire envelopes (internal to the bridge; you rarely touch these) ---- */

export type RequestEnvelope<K extends RequestKind = RequestKind> = {
  channel: 'request'
  requestId: number
  kind: K
  params: RequestParams<K>
}

export type ResponseEnvelope<K extends RequestKind = RequestKind> = {
  channel: 'response'
  requestId: number
  kind: K
} & ({ ok: true; result: RequestResult<K> } | { ok: false; error: string })

/* ------------------------------- Guards ------------------------------- */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// Listing the kinds as a record forces this guard to stay in sync with the
// registry above: add a key to RequestRegistry and TypeScript flags this object.
const REQUEST_KINDS: Record<RequestKind, true> = {
  'get-storage': true,
  'set-storage': true,
}

export function isMainEvent(value: unknown): value is MainEvent {
  return isObject(value) && value.type === 'selection-changed'
}

export function isUiEvent(value: unknown): value is UiEvent {
  return isObject(value) && value.type === 'focus-node'
}

export function isRequestEnvelope(value: unknown): value is RequestEnvelope {
  return (
    isObject(value) &&
    value.channel === 'request' &&
    typeof value.requestId === 'number' &&
    typeof value.kind === 'string' &&
    value.kind in REQUEST_KINDS
  )
}

export function isResponseEnvelope(value: unknown): value is ResponseEnvelope {
  return (
    isObject(value) &&
    value.channel === 'response' &&
    typeof value.requestId === 'number' &&
    typeof value.kind === 'string'
  )
}
