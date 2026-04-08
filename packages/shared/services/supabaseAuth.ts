/**
 * services/supabaseAuth.ts
 * ---------------------------------------------------------------
 * Authentication service via Supabase Edge Function.
 * Uses figma.clientStorage (via figmaBridge) to persist the session.
 *
 * Flow:
 *  1. signIn(email, password) -> access_token (custom JWT)
 *  2. Token stored in clientStorage
 *  3. getSession() recovers session if not expired
 *  4. signOut() clears everything
 */

import { SUPABASE_CONFIG } from './supabaseConfig'
import { figmaStorage } from './figmaBridge'

const STORAGE_KEY = 'auth_session'
const FUNCTIONS_URL = `${SUPABASE_CONFIG.URL}/functions/v1`

export interface AuthSession {
  access_token: string
  expires_at: number
  user: {
    id: string
    email: string
  }
}

/** Sign in with email/password via an Edge Function. */
export async function signIn(email: string, password: string): Promise<AuthSession> {
  const res = await fetch(`${FUNCTIONS_URL}/admin-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_CONFIG.ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as Record<string, string>).error || `Auth error ${res.status}`)
  }

  const data = await res.json()

  const session: AuthSession = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
    user: {
      id: data.user.id,
      email: data.user.email,
    },
  }

  await figmaStorage.set(STORAGE_KEY, JSON.stringify(session))
  return session
}

/** Recover session from clientStorage. Returns null if missing or expired. */
export async function getSession(): Promise<AuthSession | null> {
  const raw = await figmaStorage.get(STORAGE_KEY)
  if (!raw) return null

  try {
    const session: AuthSession = JSON.parse(raw)

    // Expired (with 1 min margin)
    if (Date.now() >= session.expires_at - 60_000) {
      await signOut()
      return null
    }

    return session
  } catch {
    return null
  }
}

/** Clear the session from clientStorage. */
export async function signOut(): Promise<void> {
  await figmaStorage.set(STORAGE_KEY, '')
}
