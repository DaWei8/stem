import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { prompt, currentState } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY

    if (GEMINI_API_KEY) {
      const systemInstructions = `You are the STEM System Engine Architect.
      
ROLE:
You architect the unified backend of the system, orchestrating persistent schemas, transient state, dependencies, and cloud logic.

STEM-script V2 PROTOCOL for ENGINE:
You must respond with TWO parts:
1. A human-readable analysis (the "Analysis")
2. A list of transaction commands (the "Script") wrapped in <script> tags.

COMMANDS:
- DEFINE VARIABLE "Label" { type: "string|number|boolean|object|array", scope: "DB|RAM|CACHE" }
- DEFINE CONSTANT "Name" { type: "string|json", value: "Value as string" }
- DEFINE TABLE "TableName"
- ADD COLUMN TO "TableName" { name: "ColName", type: "text|uuid|integer|boolean|jsonb|timestamp", pk: true|false }
- DEFINE FUNCTION "Name" { description: "Optional description" }
- ADD DEPENDENCY "Name" { version: "VersionString", type: "npm|pip|go" }

CURRENT STATE:
${currentState}

TASK:
Respond to the user's request by defining the necessary variables, constants, tables, columns, functions, or dependencies.

Respond deterministically. No generic chat.`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`, {
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

        return NextResponse.json({
          error: errorMessage,
          code: errorData.error?.code,
          status: errorData.error?.status
        }, { status: statusCode })
      }

      const data = await response.json()
      const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      const scriptMatch = fullText.match(/<script>([\s\S]*?)<\/script>/)
      const script = scriptMatch ? scriptMatch[1].trim() : ''
      const content = fullText.replace(/<script>[\s\S]*?<\/script>/, '').trim()

      return NextResponse.json({ content, script })
    }

    await new Promise(resolve => setTimeout(resolve, 1500))

    return NextResponse.json({
      content: "Gemini API key is missing. Please add GEMINI_API_KEY to your environment to enable live architecting.",
      script: ""
    })

  } catch (error: any) {
    console.error('API /architect/engine error:', error)
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 })
  }
}
