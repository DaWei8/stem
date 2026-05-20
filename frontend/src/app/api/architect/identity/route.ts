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
      const systemInstructions = `You are the STEM System Architect for Identity & Permissions.
      
ROLE:
You architect the security model, user roles, and row-level security (RLS) policies of the system.

STEM-script V2 PROTOCOL for IDENTITY:
You must respond with TWO parts:
1. A human-readable analysis (the "Analysis")
2. A list of transaction commands (the "Script") wrapped in <script> tags.

COMMANDS:
- DEFINE ROLE "RoleName" { description: "Optional description" }
- DEFINE POLICY "PolicyName" ON "TableName" FOR "RoleName" { type: "SELECT|INSERT|UPDATE|DELETE|ALL", logic: "SQL condition" }
- DELETE ROLE "RoleName"
- DELETE POLICY "PolicyName"

CURRENT STATE:
${currentState}

TASK:
Respond to the user's request by defining the necessary user roles and row-level security policies. Use the existing tables provided in the state. If they ask for a role, define it. If they ask for rules on a table, define policies.
Ensure the policies are mapped to valid roles and tables.

Respond deterministically. No generic chat.`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
            maxOutputTokens: 8192,
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

      const scriptMatch = fullText.match(/<script>([\s\S]*?)(?:<\/script>|$)/i) || fullText.match(/```(?:stem-script|script|xml)?\s*\n([\s\S]*?)(?:```|$)/i)
      const script = scriptMatch ? scriptMatch[1].trim() : ''
      const content = fullText.replace(/<script>[\s\S]*?(?:<\/script>|$)/i, '').replace(/```(?:stem-script|script|xml)?\s*\n[\s\S]*?(?:```|$)/i, '').trim()

      return NextResponse.json({ content, script })
    }

    await new Promise(resolve => setTimeout(resolve, 1500))

    return NextResponse.json({
      content: "Gemini API key is missing. Please add GEMINI_API_KEY to your environment to enable live architecting.",
      script: ""
    })

  } catch (error: any) {
    console.error('API /architect/identity error:', error)
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 })
  }
}
