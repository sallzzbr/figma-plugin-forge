/**
 * _shared/supabase.ts
 * ----------------------------------------------------------------
 * Supabase client factories for Edge Functions.
 * All credentials come from Deno environment variables — never hardcode.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Client with service_role key — bypasses RLS.
 * Use for server-side reads/writes to protected tables.
 * @throws Error if SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are missing
 */
export function createServiceClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. ' +
      'Run: supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...'
    )
  }
  return createClient(url, key)
}

/**
 * Client with anon key — respects RLS.
 * Use for public/unauthenticated reads.
 * @throws Error if SUPABASE_URL or SUPABASE_ANON_KEY are missing
 */
export function createAnonClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_ANON_KEY')
  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_ANON_KEY must be set. ' +
      'Run: supabase secrets set SUPABASE_URL=... SUPABASE_ANON_KEY=...'
    )
  }
  return createClient(url, key)
}
