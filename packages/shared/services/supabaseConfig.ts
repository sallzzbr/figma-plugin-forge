/**
 * services/supabaseConfig.ts
 * ---------------------------------------------------------------
 * Centralized Supabase configuration for all plugins.
 * Contains the anon key (public by Supabase design) and project URL.
 *
 * The service_role_key must NEVER live here — it belongs
 * exclusively in Edge Functions (backend).
 */

export interface SupabaseConfig {
  URL: string
  ANON_KEY: string
}

export const SUPABASE_URL =
  import.meta.env?.VITE_SUPABASE_URL ?? 'https://YOUR_PROJECT_ID.supabase.co'

export const SUPABASE_ANON_KEY =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ?? 'YOUR_ANON_KEY'

export const SUPABASE_CONFIG: SupabaseConfig = {
  URL: SUPABASE_URL,
  ANON_KEY: SUPABASE_ANON_KEY,
}

/** Default headers for calls with the anon key (public reads). */
export function anonHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
    apikey: SUPABASE_CONFIG.ANON_KEY,
  }
}

/** Headers for authenticated calls (with user JWT). */
export function authHeaders(accessToken: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    apikey: SUPABASE_CONFIG.ANON_KEY,
  }
}
