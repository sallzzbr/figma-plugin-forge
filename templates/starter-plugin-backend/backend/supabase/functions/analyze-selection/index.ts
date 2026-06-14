// Supabase Edge Function (Deno) — one concrete adapter for the plugin's
// `analyze-selection` call. The plugin only depends on the JSON contract below,
// not on Supabase: swap this for any HTTP backend that honours it.
//
// Deploy: supabase functions deploy analyze-selection --no-verify-jwt
// Local:  supabase functions serve analyze-selection
//
// Note: this file is Deno, not part of the plugin's TypeScript/ESLint project
// (it lives outside src/). Type/lint it with Deno's own tooling.

import { corsHeaders } from '../_shared/cors.ts'

type SelectionItem = { id: string; name: string; type: string }

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { items } = (await req.json()) as { items: SelectionItem[] }
    const list = items ?? []
    const byType: Record<string, number> = {}
    for (const item of list) byType[item.type] = (byType[item.type] ?? 0) + 1
    const kinds = Object.keys(byType).length

    const body = {
      total: list.length,
      byType,
      headline: `${list.length} layer(s) across ${kinds} type(s) — analyzed on the server`,
    }
    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
