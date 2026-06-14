// UI-side bridge (runs in the iframe / browser context).
//
// figma.* does NOT exist here. Talk to the main thread with:
//   - sendEvent(event)        fire-and-forget
//   - request(kind, params)   typed round-trip, resolves with the result
//   - onMainEvent(handler)    subscribe to fire-and-forget events from main
//
// Request/response correlation uses a monotonic requestId so concurrent calls
// never cross wires, and every request has a timeout so a missing reply rejects
// instead of hanging the UI forever.

import {
  isMainEvent,
  isResponseEnvelope,
  type MainEvent,
  type RequestEnvelope,
  type RequestKind,
  type RequestParams,
  type RequestResult,
  type UiEvent,
} from './types/messages'

// The pluginMessage wrapper and '*' origin are both required by Figma.
function postRaw(message: unknown): void {
  parent.postMessage({ pluginMessage: message }, '*')
}

/** Send a fire-and-forget event to the main thread. */
export function sendEvent(event: UiEvent): void {
  postRaw(event)
}

let lastRequestId = 0
function nextRequestId(): number {
  lastRequestId = (lastRequestId + 1) % Number.MAX_SAFE_INTEGER
  return lastRequestId || 1
}

/** Ask the main thread for something and await its typed reply. */
export function request<K extends RequestKind>(
  kind: K,
  params: RequestParams<K>,
  timeoutMs = 15_000,
): Promise<RequestResult<K>> {
  const requestId = nextRequestId()

  return new Promise<RequestResult<K>>((resolve, reject) => {
    const timer = setTimeout(() => {
      window.removeEventListener('message', onMessage)
      reject(new Error(`request "${kind}" timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    function onMessage(event: MessageEvent): void {
      const data = (event.data as { pluginMessage?: unknown } | undefined)?.pluginMessage
      if (!isResponseEnvelope(data) || data.requestId !== requestId) return

      clearTimeout(timer)
      window.removeEventListener('message', onMessage)
      if (data.ok) resolve(data.result as RequestResult<K>)
      else reject(new Error(data.error))
    }

    window.addEventListener('message', onMessage)
    const envelope: RequestEnvelope<K> = { channel: 'request', requestId, kind, params }
    postRaw(envelope)
  })
}

/** Subscribe to fire-and-forget events from the main thread. Returns an unsubscribe. */
export function onMainEvent(handler: (event: MainEvent) => void): () => void {
  function listener(event: MessageEvent): void {
    const data = (event.data as { pluginMessage?: unknown } | undefined)?.pluginMessage
    if (isMainEvent(data)) handler(data)
  }
  window.addEventListener('message', listener)
  return () => window.removeEventListener('message', listener)
}
