/**
 * Edge Function: get-library-state
 * ----------------------------------------------------------------
 * Returns the stored components and tokens for a given library.
 * Requires authentication (JWT).
 *
 * GET /functions/v1/get-library-state?libraryKey=<key>
 *   or
 * POST /functions/v1/get-library-state  { libraryKey: string }
 *
 * Response (200):
 * {
 *   libraryKey: string,
 *   components: [{ key, name, description }],
 *   tokens: [{ key, name, type, value }],
 *   updatedAt: string | null
 * }
 */
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { requireAuth } from '../_shared/auth.ts'

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResp = handleCors(req)
  if (corsResp) return corsResp

  try {
    // 1. Verify authentication
    const { response: authError } = await requireAuth(req)
    if (authError) return authError

    // 2. Extract libraryKey from query params (GET) or body (POST)
    let libraryKey: string | null = null

    if (req.method === 'GET') {
      const url = new URL(req.url)
      libraryKey = url.searchParams.get('libraryKey')
    } else {
      const body = await req.json()
      libraryKey = body.libraryKey ?? null
    }

    if (!libraryKey || typeof libraryKey !== 'string') {
      return jsonResponse({ error: 'libraryKey is required' }, 400)
    }

    // 3. Query the library_state table
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('library_state')
      .select('library_key, components, tokens, updated_at')
      .eq('library_key', libraryKey)
      .maybeSingle()

    if (error) {
      throw error
    }

    // Return stored state or empty defaults
    if (!data) {
      return jsonResponse({
        libraryKey,
        components: [],
        tokens: [],
        updatedAt: null,
      })
    }

    return jsonResponse({
      libraryKey: data.library_key,
      components: data.components ?? [],
      tokens: data.tokens ?? [],
      updatedAt: data.updated_at,
    })
  } catch (err) {
    console.error('get-library-state error:', err)
    return jsonResponse({ error: (err as Error).message }, 500)
  }
})

// ---- Helpers ----

/** Returns a JSON Response with CORS headers. */
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
