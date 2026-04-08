/**
 * _shared/cors.ts
 * ----------------------------------------------------------------
 * CORS headers and preflight handler for Edge Functions.
 * Allows all origins ('*') — auth is enforced via JWT on protected endpoints.
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

/**
 * Returns a 200 Response for OPTIONS preflight requests, null otherwise.
 * Usage:
 *   const cors = handleCors(req)
 *   if (cors) return cors
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  return null
}
