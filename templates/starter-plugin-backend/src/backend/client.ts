// Generic, vendor-agnostic HTTP client for the plugin UI. fetch lives here (the
// UI iframe), never in the main thread. Adds a timeout and typed error handling;
// no backend SDK, so any HTTP backend works behind BACKEND_CONFIG.baseUrl.

import { anonHeaders, BACKEND_CONFIG } from './config'

const DEFAULT_TIMEOUT_MS = 30_000

export class BackendError extends Error {
  readonly status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'BackendError'
    this.status = status
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new BackendError(`request to ${url} timed out after ${timeoutMs}ms`)
    }
    throw new BackendError(err instanceof Error ? err.message : String(err))
  } finally {
    clearTimeout(timer)
  }
}

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
    throw new BackendError(body.error || body.message || `HTTP ${res.status}`, res.status)
  }
  return res.json() as Promise<T>
}

export type PostOptions = {
  headers?: Record<string, string>
  timeoutMs?: number
}

/** POST JSON to `${baseUrl}/<path>` and return the typed JSON response. */
export async function post<T>(path: string, body: unknown, options: PostOptions = {}): Promise<T> {
  const base = BACKEND_CONFIG.baseUrl.replace(/\/$/, '')
  const url = `${base}/${path.replace(/^\//, '')}`
  const res = await fetchWithTimeout(
    url,
    { method: 'POST', headers: options.headers ?? anonHeaders(), body: JSON.stringify(body) },
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  )
  return parse<T>(res)
}
