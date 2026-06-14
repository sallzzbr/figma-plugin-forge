// Shared CORS headers for the Edge Functions. The plugin UI iframe has a null
// origin, so the functions must allow cross-origin requests.

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
