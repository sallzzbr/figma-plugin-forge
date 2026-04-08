/**
 * Edge Function: update-library-state
 * ----------------------------------------------------------------
 * Upserts components and tokens for a given library.
 * Requires authentication (JWT).
 *
 * POST /functions/v1/update-library-state
 * {
 *   libraryKey: string,
 *   components: [{ key: string, name: string, description: string }],
 *   tokens: [{ key: string, name: string, type: string, value: string }]
 * }
 *
 * Response (200):
 * { success: true, libraryKey: string, updatedAt: string }
 */
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { requireAuth } from '../_shared/auth.ts'

// ---- Types ----

interface ComponentItem {
  key: string
  name: string
  description: string
}

interface TokenItem {
  key: string
  name: string
  type: string
  value: string
}

// ---- Handler ----

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResp = handleCors(req)
  if (corsResp) return corsResp

  try {
    // 1. Verify authentication
    const { response: authError } = await requireAuth(req)
    if (authError) return authError

    // 2. Parse and validate request body
    const body = await req.json()
    const { libraryKey, components, tokens } = body

    if (!libraryKey || typeof libraryKey !== 'string') {
      return jsonResponse({ error: 'libraryKey is required (string)' }, 400)
    }
    if (!Array.isArray(components)) {
      return jsonResponse({ error: 'components is required (array)' }, 400)
    }
    if (!Array.isArray(tokens)) {
      return jsonResponse({ error: 'tokens is required (array)' }, 400)
    }

    // Basic shape validation
    for (const c of components as ComponentItem[]) {
      if (!c.key || !c.name) {
        return jsonResponse({ error: `Invalid component: missing key or name` }, 400)
      }
    }
    for (const t of tokens as TokenItem[]) {
      if (!t.key || !t.name) {
        return jsonResponse({ error: `Invalid token: missing key or name` }, 400)
      }
    }

    // 3. Upsert to the library_state table
    const supabase = createServiceClient()
    const now = new Date().toISOString()

    const { error: upsertError } = await supabase
      .from('library_state')
      .upsert(
        {
          library_key: libraryKey,
          components,
          tokens,
          updated_at: now,
        },
        { onConflict: 'library_key' }
      )

    if (upsertError) {
      throw upsertError
    }

    return jsonResponse({
      success: true,
      libraryKey,
      updatedAt: now,
    })
  } catch (err) {
    console.error('update-library-state error:', err)
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
