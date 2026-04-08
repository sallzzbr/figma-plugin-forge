/**
 * _shared/auth.ts
 * ----------------------------------------------------------------
 * JWT verification middleware for protected endpoints.
 * Extracts the Bearer token from the Authorization header, verifies it
 * via the Supabase client, and returns the authenticated user or an error.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'

export interface AuthResult {
  authorized: boolean
  userId?: string
  email?: string
  error?: string
  status?: number
}

/**
 * Verifies a Supabase auth JWT from the request Authorization header.
 * Uses the anon key to initialize the client and then validates the token
 * with supabase.auth.getUser().
 *
 * @param req - Incoming HTTP request with `Authorization: Bearer <token>`
 * @returns AuthResult — check `authorized` before proceeding
 */
export async function verifyAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { authorized: false, error: 'Missing or invalid Authorization header', status: 401 }
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const url = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!url || !anonKey) {
      return { authorized: false, error: 'Server misconfigured: missing Supabase env vars', status: 500 }
    }

    const supabase = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return { authorized: false, error: 'Invalid or expired token', status: 401 }
    }

    return {
      authorized: true,
      userId: user.id,
      email: user.email,
    }
  } catch {
    return { authorized: false, error: 'Token verification failed', status: 401 }
  }
}

/**
 * Convenience: returns an error Response if auth fails, null if authorized.
 * Usage:
 *   const authError = await requireAuth(req)
 *   if (authError) return authError.response
 *   // proceed with authError being null, user is verified
 */
export async function requireAuth(req: Request): Promise<{ response: Response; auth: AuthResult } | { response: null; auth: AuthResult }> {
  const auth = await verifyAuth(req)
  if (!auth.authorized) {
    return {
      response: new Response(
        JSON.stringify({ error: auth.error }),
        { status: auth.status ?? 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      ),
      auth,
    }
  }
  return { response: null, auth }
}
