/**
 * Edge Function: analyze
 * ----------------------------------------------------------------
 * Receives Figma frame screenshots and a text context, sends them to
 * OpenAI for UX heuristic analysis, and returns structured results.
 *
 * POST /functions/v1/analyze
 * {
 *   frames: [{ name: string, imageBase64: string }],
 *   context: string   // description of the product/feature being analyzed
 * }
 *
 * Response (200):
 * {
 *   sections: [{
 *     title: string,
 *     items: [{ description: string, score: number, suggestion?: string }]
 *   }],
 *   overallScore: number,
 *   summary: string
 * }
 */
import OpenAI from 'https://esm.sh/openai@4'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

// ---- Types ----

interface FrameInput {
  name: string
  imageBase64: string
}

interface AnalysisItem {
  description: string
  score: number
  suggestion?: string
}

interface AnalysisSection {
  title: string
  items: AnalysisItem[]
}

interface AnalysisResult {
  sections: AnalysisSection[]
  overallScore: number
  summary: string
}

// ---- Handler ----

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResp = handleCors(req)
  if (corsResp) return corsResp

  try {
    // 1. Parse and validate request body
    const body = await req.json()
    const { frames, context } = body

    if (!context || typeof context !== 'string') {
      return jsonResponse({ error: 'context is required (string)' }, 400)
    }
    if (!Array.isArray(frames) || frames.length === 0) {
      return jsonResponse({ error: 'frames is required (non-empty array)' }, 400)
    }
    for (const f of frames as FrameInput[]) {
      if (!f.name || !f.imageBase64) {
        return jsonResponse({ error: `Invalid frame: ${f.name || 'missing name'}` }, 400)
      }
    }

    const typedFrames = frames as FrameInput[]

    // 2. Initialize OpenAI client (key from env)
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return jsonResponse({ error: 'OPENAI_API_KEY not configured' }, 500)
    }
    const openai = new OpenAI({ apiKey })

    // 3. Build the prompt with images
    const systemPrompt = `You are a senior UX analyst. Evaluate the provided UI screenshots against these heuristics:
1. Visibility of system status
2. Match between system and real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognize, diagnose, and recover from errors
10. Help and documentation

Return a JSON object with this exact structure:
{
  "sections": [
    {
      "title": "Heuristic name",
      "items": [
        { "description": "What was observed", "score": 1-10, "suggestion": "How to improve (optional)" }
      ]
    }
  ],
  "overallScore": 1-10,
  "summary": "Brief overall assessment"
}

Only return valid JSON, no markdown fences.`

    // Build content: text + images
    const userContent: Array<Record<string, unknown>> = [
      {
        type: 'text',
        text: `Context: ${context}\n\nFrames: ${typedFrames.map(f => f.name).join(', ')}\n\nAnalyze the following UI screenshots:`,
      },
    ]

    for (const frame of typedFrames) {
      userContent.push({ type: 'text', text: `[${frame.name}]` })
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${frame.imageBase64}`,
          detail: 'high',
        },
      })
    }

    // 4. Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent as never },
      ],
    })

    const rawContent = completion.choices?.[0]?.message?.content
    if (!rawContent) {
      throw new Error('Empty response from OpenAI')
    }

    // 5. Parse and validate response
    const cleaned = rawContent
      .replace(/^```json?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const parsed = JSON.parse(cleaned) as AnalysisResult

    if (typeof parsed.overallScore !== 'number' || typeof parsed.summary !== 'string') {
      throw new Error('LLM response does not match expected schema')
    }

    return jsonResponse(parsed)
  } catch (err) {
    console.error('analyze error:', err)
    return jsonResponse({ error: (err as Error).message }, 500)
  }
})

// ---- Helpers ----

/** Returns a JSON Response with CORS headers. */
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
