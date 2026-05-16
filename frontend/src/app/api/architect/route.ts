import { NextResponse } from 'next/server'

// Use edge runtime for faster responses if deployed, otherwise node is fine
export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { prompt, currentState } = await req.json()

    // Ensure we have a prompt
    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY

    // If an API key is provided, we do a real LLM call
    if (GEMINI_API_KEY) {
      const systemInstructions = `You are the STEM System Architect, a powerful AI co-author for mission-critical software logic.
      
ROLE:
You do NOT design UI, wireframes, or aesthetics. You architect the "Behavioral Engine" (the logic, data flow, and state transitions) of an application.

SCOPE GUARDRAILS:
- If the user asks for wireframes, UI designs, colors, or visual layout: REFUSE.
- Explain: "I focus exclusively on the mechanical and logical integrity of your system. I cannot generate wireframes or decorative designs, but I can architect the underlying flow, data interfaces, and state mutations."
- Instead, suggest architecting the logic flow for that feature.

STEM-script V2 PROTOCOL:
You must respond with TWO parts:
1. A human-readable analysis (the "Analysis")
2. A list of transaction commands (the "Script") wrapped in <script> tags.

COMMANDS:
- DEFINE SCREEN "Name"
- ADD INPUT TO "Screen" { name: "Label", type: "form_field|query_param", var: "Variable" }
- ADD TRIGGER TO "Screen" { name: "Label", type: "function_call|navigation" }
- ADD MUTATION TO "Screen" { name: "Label", type: "state_update|webhook", var: "Variable" }
- CONNECT "Screen A" -> "Screen B"
- CONNECT "Screen A" -> "Screen B" [FAILURE] (For error states)

CURRENT STATE:
${currentState}

TASK:
If the user describes an entire app, architect the FULL flow including all screens, connections, and logic gates.
If a node is selected (see 'selectedNodeId' in context), prioritize modifications to that node.

Respond deterministically. No generic chat.`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemInstructions}\n\nUSER REQUEST: ${prompt}` }]
          }],
          generationConfig: {
            temperature: 0.1,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error?.message || 'Gemini API request failed'
        const statusCode = response.status === 503 ? 503 : 500
        
        console.error('Gemini error:', errorData)
        return NextResponse.json({ 
          error: errorMessage,
          code: errorData.error?.code,
          status: errorData.error?.status
        }, { status: statusCode })
      }

      const data = await response.json()
      const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      // Parse content and script
      const scriptMatch = fullText.match(/<script>([\s\S]*?)<\/script>/)
      const script = scriptMatch ? scriptMatch[1].trim() : ''
      const content = fullText.replace(/<script>[\s\S]*?<\/script>/, '').trim()

      return NextResponse.json({ content, script })
    }

    // ==========================================
    // FALLBACK MOCK (If no API key is present)
    // ==========================================
    console.warn("No GEMINI_API_KEY found. Using local simulated responses.")
    await new Promise(resolve => setTimeout(resolve, 1500))

    return NextResponse.json({
      content: "Gemini API key is missing. Please add GEMINI_API_KEY to your environment to enable live architecting.",
      script: ""
    })

  } catch (error: any) {
    console.error('API /architect error:', error)
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 })
  }
}
