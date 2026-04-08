/**
 * services/api.ts
 * ---------------------------------------------------------------
 * HTTP client for the DS Library Sync backend (Supabase Edge Functions).
 * Uses SUPABASE_CONFIG from shared for URL and anon key.
 */

import {
  SUPABASE_CONFIG,
  anonHeaders,
  authHeaders,
} from '@figma-forge/shared/services'
import type { LibraryState } from '../types'

const FUNCTIONS_URL = `${SUPABASE_CONFIG.URL}/functions/v1`
const TIMEOUT_MS = 30_000

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchWithTimeout(
  url: string,
  options: RequestInit
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg =
      (body as Record<string, string>).error ||
      (body as Record<string, string>).message ||
      `HTTP error ${res.status}`
    throw new Error(msg)
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/**
 * Validate that a Figma file key corresponds to a registered library.
 * Returns the library state if it exists, or null if not found.
 */
export async function validateLibrary(
  fileKey: string
): Promise<{ valid: boolean; libraryKey?: string }> {
  const res = await fetchWithTimeout(`${FUNCTIONS_URL}/validate-library`, {
    method: 'POST',
    headers: anonHeaders(),
    body: JSON.stringify({ file_key: fileKey }),
  })
  return handleResponse<{ valid: boolean; libraryKey?: string }>(res)
}

/**
 * Fetch the stored library state (components + tokens) from the backend.
 */
export async function getLibraryState(
  libraryKey: string
): Promise<LibraryState> {
  const res = await fetchWithTimeout(`${FUNCTIONS_URL}/get-library-state`, {
    method: 'POST',
    headers: anonHeaders(),
    body: JSON.stringify({ library_key: libraryKey }),
  })
  return handleResponse<LibraryState>(res)
}

/**
 * Push updated library state to the backend (requires auth).
 */
export async function updateLibraryState(
  state: LibraryState,
  accessToken: string
): Promise<{ success: boolean; inserted: number; updated: number; removed: number }> {
  const res = await fetchWithTimeout(`${FUNCTIONS_URL}/update-library-state`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      library_key: state.libraryKey,
      components: state.components,
      tokens: state.tokens,
    }),
  })
  return handleResponse<{
    success: boolean
    inserted: number
    updated: number
    removed: number
  }>(res)
}
