# Snippet: Optional Backend Request

Use a backend when the plugin needs AI, auth, storage, or a protected external API. Cross the network boundary with explicit request, response, and error types.

```ts
// ---------- request/response contract ----------

type FrameContext = {
  pageName: string
  selectionCount: number
}

type AnalyzeRequest = {
  context: FrameContext
  frames: Array<{
    id: string
    name: string
    width: number
    height: number
  }>
}

type AnalyzeResponse = {
  summary: string
  findings: Array<{
    frameId: string
    severity: 'info' | 'warning' | 'error'
    message: string
  }>
}

type AnalyzeError = {
  code: 'unauthorized' | 'rate_limited' | 'bad_request' | 'server_error' | 'network_error'
  message: string
  retryAfterSeconds?: number
}

export type AnalyzeResult =
  | { ok: true; data: AnalyzeResponse }
  | { ok: false; error: AnalyzeError }

// ---------- boundary ----------

/**
 * Return the auth token the UI should send with a backend call.
 * Replace this with the auth source your plugin actually uses
 * (session cookie, Supabase client, Figma client storage, etc).
 */
type GetAuthToken = () => Promise<string | null>

export async function analyzeFrames(
  request: AnalyzeRequest,
  deps: { endpoint: string; getAuthToken: GetAuthToken }
): Promise<AnalyzeResult> {
  const { endpoint, getAuthToken } = deps

  let response: Response
  try {
    const token = await getAuthToken()
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
    })
  } catch (cause) {
    return {
      ok: false,
      error: {
        code: 'network_error',
        message: cause instanceof Error ? cause.message : 'network error',
      },
    }
  }

  if (!response.ok) {
    return { ok: false, error: await readErrorPayload(response) }
  }

  const data = (await response.json()) as AnalyzeResponse
  return { ok: true, data }
}

async function readErrorPayload(response: Response): Promise<AnalyzeError> {
  const retryAfterHeader = response.headers.get('retry-after')
  const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : undefined

  const code: AnalyzeError['code'] =
    response.status === 401 ? 'unauthorized' :
    response.status === 429 ? 'rate_limited' :
    response.status >= 400 && response.status < 500 ? 'bad_request' :
    'server_error'

  let message = `Request failed: ${response.status}`
  try {
    const body = (await response.json()) as { message?: string }
    if (typeof body.message === 'string') message = body.message
  } catch {
    // response body was not JSON; keep the default message
  }

  return { code, message, retryAfterSeconds }
}
```

## Document alongside the snippet

- required auth, if any (document what `getAuthToken` returns and where the token comes from)
- stable request shape
- stable response shape
- user-visible error behavior for each `AnalyzeError.code`

## Rules this snippet follows

- The function never throws. It returns a typed `AnalyzeResult` so the caller handles success and failure with a single branch.
- `getAuthToken` is injected, not imported from a magic global. The auth source is a boundary, and the boundary is documented.
- The error shape is explicit: code, message, and optional retry hint. Consumers can render each case without string-matching.
- Request and response types are declared once and can be shared with the backend if it also runs TypeScript.

## Related

- [optional-backend pattern](../patterns/optional-backend.md) — when to add a backend at all
- [messaging-bridge pattern](../patterns/messaging-bridge.md) — how to document contracts
- [llm-analysis pattern](../patterns/llm-analysis.md) — archetype that uses this snippet
