/**
 * Edge Function: generate-spec
 * ----------------------------------------------------------------
 * Receives Figma frame screenshots and a text context, sends them to
 * OpenAI for specification generation, and returns structured output.
 *
 * POST /functions/v1/generate-spec
 * {
 *   frames: [{ name: string, imageBase64: string }],
 *   context: string   // description of the product/feature
 * }
 *
 * Response (200):
 * {
 *   summary: string,
 *   requirements: [{ id: string, title: string, description: string, priority: "high"|"medium"|"low" }],
 *   acceptanceCriteria: string[],
 *   testScenarios: [{ name: string, steps: string[], expected: string }]
 * }
 */
import OpenAI from 'https://esm.sh/openai@4'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

// ---- Types ----

interface FrameInput {
  name: string
  imageBase64: string
}

interface Requirement {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

interface TestScenario {
  name: string
  steps: string[]
  expected: string
}

interface SpecResult {
  summary: string
  requirements: Requirement[]
  acceptanceCriteria: string[]
  testScenarios: TestScenario[]
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
    const systemPrompt = `You are a senior product analyst and technical writer. Given UI screenshots from a Figma design and a context description, generate a comprehensive product specification.

Return a JSON object with this exact structure:
{
  "summary": "Brief overview of the feature/product (1-3 sentences)",
  "requirements": [
    {
      "id": "REQ-001",
      "title": "Requirement title",
      "description": "Detailed requirement description",
      "priority": "high" | "medium" | "low"
    }
  ],
  "acceptanceCriteria": [
    "Given X, when Y, then Z"
  ],
  "testScenarios": [
    {
      "name": "Scenario name",
      "steps": ["Step 1", "Step 2"],
      "expected": "Expected outcome"
    }
  ]
}

Guidelines:
- Generate 5-15 requirements depending on complexity
- Use Given/When/Then format for acceptance criteria
- Include both happy-path and edge-case test scenarios
- Prioritize based on user impact and technical dependency
- Only return valid JSON, no markdown fences.`

    // Build content: text + images
    const userContent: Array<Record<string, unknown>> = [
      {
        type: 'text',
        text: `Context: ${context}\n\nFrames: ${typedFrames.map(f => f.name).join(', ')}\n\nGenerate a specification based on the following UI screenshots:`,
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

    const parsed = JSON.parse(cleaned) as SpecResult

    // Validate minimal shape
    if (typeof parsed.summary !== 'string') {
      throw new Error('LLM response missing required field: summary')
    }
    if (!Array.isArray(parsed.requirements)) {
      throw new Error('LLM response missing required field: requirements')
    }
    if (!Array.isArray(parsed.acceptanceCriteria)) {
      throw new Error('LLM response missing required field: acceptanceCriteria')
    }
    if (!Array.isArray(parsed.testScenarios)) {
      throw new Error('LLM response missing required field: testScenarios')
    }

    return jsonResponse(parsed)
  } catch (err) {
    console.error('generate-spec error:', err)
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
