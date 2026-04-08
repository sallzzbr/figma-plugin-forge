# backend -- Context for AI Agents

## Responsibility

Supabase Edge Functions (Deno runtime) that provide backend services for
figma-plugin-forge plugins. Functions handle AI-powered analysis, spec
generation, and library state persistence.

Functions fall into two groups:

- **AI / generation**: analyze, generate-spec
- **Library state**: get-library-state, update-library-state

## Function Table

| Path | Consumer Plugin | Purpose |
|------|----------------|---------|
| `_shared/cors.ts` | all | CORS headers and OPTIONS preflight handler |
| `_shared/auth.ts` | protected endpoints | JWT verification via Supabase auth |
| `_shared/supabase.ts` | all | Supabase client factories (service role + anon) |
| `analyze/` | UI reviewer plugins | UX heuristic analysis of frame screenshots via OpenAI |
| `generate-spec/` | Spec/requirements plugins | Generates structured specs from frame screenshots via OpenAI |
| `get-library-state/` | Library sync plugins | Reads stored components and tokens for a library |
| `update-library-state/` | Library sync plugins | Upserts components and tokens for a library |

## Shared Utilities (`_shared/`)

- **cors.ts**: `corsHeaders` object and `handleCors(req)` for preflight.
- **auth.ts**: `verifyAuth(req)` returns `AuthResult`; `requireAuth(req)` returns error Response or null.
- **supabase.ts**: `createServiceClient()` (bypasses RLS), `createAnonClient()` (respects RLS).

## Runtime Notes

- All functions run on **Deno** (not Node.js).
- Use `https://esm.sh/` for npm package imports (e.g., `import OpenAI from 'https://esm.sh/openai@4'`).
- Use `Deno.env.get('KEY')` for environment variables -- never hardcode secrets.
- Each function is independent; no direct calls between functions.

## Payload Contracts

### analyze

**Request** (POST):
```json
{
  "frames": [{ "name": "string", "imageBase64": "base64-string" }],
  "context": "string"
}
```

**Response** (200):
```json
{
  "sections": [
    {
      "title": "string",
      "items": [{ "description": "string", "score": 1-10, "suggestion": "string?" }]
    }
  ],
  "overallScore": 1-10,
  "summary": "string"
}
```

### generate-spec

**Request** (POST):
```json
{
  "frames": [{ "name": "string", "imageBase64": "base64-string" }],
  "context": "string"
}
```

**Response** (200):
```json
{
  "summary": "string",
  "requirements": [{ "id": "REQ-001", "title": "string", "description": "string", "priority": "high|medium|low" }],
  "acceptanceCriteria": ["Given X, when Y, then Z"],
  "testScenarios": [{ "name": "string", "steps": ["string"], "expected": "string" }]
}
```

### get-library-state

**Request** (GET with query param or POST):
```json
{ "libraryKey": "string" }
```

**Response** (200):
```json
{
  "libraryKey": "string",
  "components": [{ "key": "string", "name": "string", "description": "string" }],
  "tokens": [{ "key": "string", "name": "string", "type": "string", "value": "string" }],
  "updatedAt": "ISO-string | null"
}
```

### update-library-state

**Request** (POST, auth required):
```json
{
  "libraryKey": "string",
  "components": [{ "key": "string", "name": "string", "description": "string" }],
  "tokens": [{ "key": "string", "name": "string", "type": "string", "value": "string" }]
}
```

**Response** (200):
```json
{ "success": true, "libraryKey": "string", "updatedAt": "ISO-string" }
```

## Sensitive Areas

- **auth.ts**: Changes here affect all protected endpoints. Test thoroughly.
- **supabase.ts**: Client initialization -- env var names must match deployment config.
- **OpenAI prompts**: Changing system prompts in analyze/ or generate-spec/ alters output schema; update consumer plugins accordingly.
- **Table schema**: Functions reference `library_state` table. Column name changes require updates in both get and update functions.

## How to Work Here

1. Identify which plugin consumes the function being modified
2. Confirm the actual payload in the corresponding plugin controller/frontend
3. Review helpers in `_shared/` before duplicating logic
4. Update this file (AGENTS.md) if any contract changes

Reading order:
1. `backend/README.md`
2. The function being modified
3. The consumer plugin's relevant controller/service
