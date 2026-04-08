/**
 * services/figmaBridge.ts
 * ---------------------------------------------------------------
 * Bridge UI <-> Main thread for Figma plugins.
 *
 * Main thread requirements:
 *  - Respond to 'get-storage'              -> 'storage-value' | 'storage-error'
 *  - Respond to 'set-storage'              -> 'storage-set'   | 'storage-error'
 *  - Respond to 'request-selection-export'  -> 'selection-exported' | 'selection-export-error'
 *  - Emit 'selection-changed' on selectionchange (ideally also once on open)
 */

export type ExportedFrame = {
  id: string
  name: string
  imageBase64: string
  imageType: string // e.g. "image/png" | "image/jpeg"
}

const LOG_MESSAGES = false

function post(msg: any) {
  if (LOG_MESSAGES) console.debug('[bridge->main]', msg)
  window.parent.postMessage({ pluginMessage: msg }, '*')
}

function onMessage(handler: (m: any) => void) {
  const fn = (ev: MessageEvent) => {
    const m = ev?.data?.pluginMessage
    if (!m) return
    if (LOG_MESSAGES) console.debug('[bridge<-main]', m)
    handler(m)
  }
  window.addEventListener('message', fn)
  return () => window.removeEventListener('message', fn)
}

let _req = 0
function nextId() {
  _req = (_req + 1) % Number.MAX_SAFE_INTEGER
  return _req || 1
}

/** Timeout helper for promises waiting on main thread responses. */
function withTimeout<T>(p: Promise<T>, ms = 15000, label = 'timeout'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(label)), ms)
    p.then((v) => {
      clearTimeout(t)
      resolve(v)
    }).catch((e) => {
      clearTimeout(t)
      reject(e)
    })
  })
}

/* ------------------------------------------------------------------ */
/*  Storage (figma.clientStorage)                                     */
/* ------------------------------------------------------------------ */

export const figmaStorage = {
  /** Read a string from clientStorage. Returns null if missing or on error. */
  async get(key: string): Promise<string | null> {
    const requestId = nextId()
    const p = new Promise<string | null>((resolve) => {
      const off = onMessage((m) => {
        if (
          (m.type === 'storage-value' || m.type === 'storage-error') &&
          m.requestId === requestId
        ) {
          off()
          resolve(m.type === 'storage-value' ? (m.value ?? null) : null)
        }
      })
      post({ type: 'get-storage', key, defaultValue: '', requestId })
    })
    return withTimeout(p, 10000, `get-storage(${key}) timeout`)
  },

  /** Write a string to clientStorage. Returns true on success. */
  async set(key: string, value: string): Promise<boolean> {
    const requestId = nextId()
    const p = new Promise<boolean>((resolve) => {
      const off = onMessage((m) => {
        if (
          (m.type === 'storage-set' || m.type === 'storage-error') &&
          m.requestId === requestId
        ) {
          off()
          resolve(m.type === 'storage-set')
        }
      })
      post({ type: 'set-storage', key, value, requestId })
    })
    return withTimeout(p, 10000, `set-storage(${key}) timeout`)
  },
}

/* ------------------------------------------------------------------ */
/*  Selection                                                          */
/* ------------------------------------------------------------------ */

/**
 * Ask main thread to export the current selection as base64.
 * Returns the list of exported frames.
 */
export async function requestSelectionExport(): Promise<ExportedFrame[]> {
  const p = new Promise<ExportedFrame[]>((resolve, reject) => {
    const off = onMessage((m) => {
      if (m.type === 'selection-exported') {
        off()
        resolve(Array.isArray(m.frames) ? m.frames : [])
      }
      if (m.type === 'selection-export-error') {
        off()
        reject(new Error(m.error || 'selection export failed'))
      }
    })
    post({ type: 'request-selection-export' })
  })
  return withTimeout(p, 60000, 'selection export timeout')
}

/**
 * Subscribe to selection changes reported by the main thread.
 * Returns an unsubscribe function.
 */
export function onSelectionChange(
  cb: (info: { count: number; names: string[] }) => void
): () => void {
  return onMessage((m) => {
    if (m.type === 'selection-changed') {
      cb({ count: Number(m.count || 0), names: Array.isArray(m.names) ? m.names : [] })
    }
  })
}

/* ------------------------------------------------------------------ */
/*  Focus / Navigation                                                 */
/* ------------------------------------------------------------------ */

/** Navigate the Figma viewport to a specific node (scroll + zoom + select). */
export function focusNode(nodeId: string) {
  post({ type: 'focus-node', nodeId })
}

/** Navigate the Figma viewport to multiple nodes (scroll + zoom + select). */
export function focusNodes(nodeIds: string[]) {
  post({ type: 'focus-nodes', nodeIds })
}

/* ------------------------------------------------------------------ */
/*  File key                                                           */
/* ------------------------------------------------------------------ */

/**
 * Subscribe to the 'file-key' event emitted by the main thread on plugin open.
 * Returns an unsubscribe function.
 */
export function onFileKey(cb: (fileKey: string | null) => void): () => void {
  return onMessage((m) => {
    if (m.type === 'file-key') {
      cb(m.fileKey ?? null)
    }
  })
}

/**
 * Ask the main thread to (re)send the fileKey.
 * Call AFTER registering the listener with onFileKey to avoid race conditions.
 */
export function requestFileKey(): void {
  post({ type: 'request-file-key' })
}

/* ------------------------------------------------------------------ */
/*  Signaling                                                          */
/* ------------------------------------------------------------------ */

/** Signal that the UI is ready (optional handshake). */
export function hello() {
  post('hello-from-main')
}
