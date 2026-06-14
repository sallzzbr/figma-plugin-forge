// Main-thread bridge (runs in the Figma sandbox).
//
// Owns figma.*. Use:
//   - emit(event)               push a fire-and-forget event to the UI
//   - serve(handlers, onEvent)  answer typed requests + handle UI events
//
// serve() installs a single figma.ui.onmessage that routes request envelopes to
// the matching handler, wraps the result (or thrown error) in a response
// envelope, and forwards plain UI events to onEvent. Handlers may be sync or
// async. Call serve() exactly once.

import {
  isRequestEnvelope,
  isUiEvent,
  type MainEvent,
  type RequestEnvelope,
  type RequestKind,
  type RequestParams,
  type RequestResult,
  type ResponseEnvelope,
  type UiEvent,
} from './types/messages'

/** Push a fire-and-forget event to the UI iframe. */
export function emit(event: MainEvent): void {
  figma.ui.postMessage(event)
}

export type RequestHandlers = {
  [K in RequestKind]: (params: RequestParams<K>) => RequestResult<K> | Promise<RequestResult<K>>
}

/** Wire up request handling and (optionally) UI event handling. Call once. */
export function serve(handlers: RequestHandlers, onEvent?: (event: UiEvent) => void): void {
  figma.ui.onmessage = async (raw: unknown) => {
    if (isRequestEnvelope(raw)) {
      await handleRequest(handlers, raw)
      return
    }
    if (isUiEvent(raw)) onEvent?.(raw)
  }
}

async function handleRequest(handlers: RequestHandlers, env: RequestEnvelope): Promise<void> {
  const { requestId, kind } = env
  try {
    // `kind` indexes the handler map; params/result line up by construction, so
    // a single cast to an opaque signature is enough to dispatch dynamically.
    const handler = handlers[kind] as (params: unknown) => unknown
    const result = await handler(env.params)
    figma.ui.postMessage({ channel: 'response', requestId, kind, ok: true, result } as ResponseEnvelope)
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    const response: ResponseEnvelope = { channel: 'response', requestId, kind, ok: false, error }
    figma.ui.postMessage(response)
  }
}
