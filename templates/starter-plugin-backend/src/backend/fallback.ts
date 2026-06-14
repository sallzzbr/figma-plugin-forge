// Resilience helper: try the remote call, fall back to a local computation when
// it fails (backend down, offline, not configured yet). Keeps the plugin useful
// without a backend and degrades gracefully when one exists but is unreachable.

export type FallbackResult<T> = {
  data: T
  source: 'remote' | 'local'
}

export async function withFallback<T>(
  remote: () => Promise<T>,
  local: () => T | Promise<T>,
  onError?: (error: unknown) => void,
): Promise<FallbackResult<T>> {
  try {
    return { data: await remote(), source: 'remote' }
  } catch (error) {
    onError?.(error)
    return { data: await local(), source: 'local' }
  }
}
