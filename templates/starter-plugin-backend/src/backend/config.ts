// Backend configuration — the single place to point the plugin at your API.
// Swap these values (or this whole file) to use a different backend; the rest of
// the plugin talks to the generic client in ./client, never to a vendor SDK.

export const BACKEND_CONFIG = {
  // Must match a domain in manifest.json -> networkAccess.allowedDomains.
  baseUrl: 'https://your-backend.example.com',
  // Public/anon key sent on every request (optional). NEVER put service-role or
  // other secrets here — this code ships inside the plugin and is fully readable.
  anonKey: '',
}

export function anonHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(BACKEND_CONFIG.anonKey ? { apikey: BACKEND_CONFIG.anonKey } : {}),
  }
}

export function authHeaders(accessToken: string): Record<string, string> {
  return { ...anonHeaders(), Authorization: `Bearer ${accessToken}` }
}
