# Backend - Supabase Edge Functions

> If you are an AI or agent, also read `backend/AGENTS.md`.

Optional Supabase Edge Functions backend for figma-plugin-forge plugins. This backend provides:

- AI-powered analysis (UX heuristic evaluation of UI screenshots)
- AI-powered specification generation from Figma designs
- Library state storage and retrieval (components and tokens)

## Structure

```text
supabase/functions/
|-- _shared/                  # Shared helpers: CORS, auth, Supabase client
|-- analyze/                  # UX heuristic analysis via OpenAI
|-- generate-spec/            # Spec/requirements generation via OpenAI
|-- get-library-state/        # Read stored library components and tokens
`-- update-library-state/     # Upsert library components and tokens
```

## Environment Variables

These must be configured via `supabase secrets set` or your hosting dashboard:

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (bypasses RLS) |
| `SUPABASE_ANON_KEY` | Yes | Anon/public key (used for auth verification) |
| `OPENAI_API_KEY` | For AI functions | OpenAI API key for analyze and generate-spec |

## Database Tables

The library state functions expect a `library_state` table:

```sql
create table library_state (
  id uuid primary key default gen_random_uuid(),
  library_key text unique not null,
  components jsonb default '[]',
  tokens jsonb default '[]',
  updated_at timestamptz default now()
);
```

## Local Development

```bash
cd backend

# Start local Supabase (requires Docker)
supabase start

# Serve all functions locally
supabase functions serve

# Set secrets for local dev
supabase secrets set OPENAI_API_KEY=sk-...
```

Test with curl:

```bash
# Analyze
curl -X POST http://localhost:54321/functions/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"context": "Login page", "frames": [{"name": "Login", "imageBase64": "..."}]}'

# Generate spec
curl -X POST http://localhost:54321/functions/v1/generate-spec \
  -H "Content-Type: application/json" \
  -d '{"context": "User onboarding flow", "frames": [{"name": "Step 1", "imageBase64": "..."}]}'
```

## Deployment

```bash
# Deploy all functions
supabase functions deploy

# Deploy a single function
supabase functions deploy analyze
supabase functions deploy generate-spec
```

## Adding New Functions

1. Create a new directory under `supabase/functions/`
2. Add an `index.ts` with a `Deno.serve()` handler
3. Use `_shared/` helpers for CORS, auth, and Supabase client
4. Update `AGENTS.md` with the new function's contract
