import { NextResponse } from 'next/server'
import { executeLLMRequest } from '@/lib/ai-provider'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { prompt, currentState, userKeys, selectedModel } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    const systemInstructions = `You are the STEM System Engine Architect.
      
ROLE:
You architect the unified backend of the system, orchestrating persistent schemas, transient state, dependencies, and cloud logic.

STEM-script V2 PROTOCOL for ENGINE:
You must respond with TWO parts:
1. A human-readable analysis (the "Analysis")
2. A list of transaction commands (the "Script") wrapped in <script> tags.

COMMANDS:
- DEFINE VARIABLE "Label" { type: "string|number|boolean|object|array", scope: "persistent|transient|contextual" }
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

    const result = await executeLLMRequest(prompt, systemInstructions, userKeys, selectedModel)
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('API /architect/engine error:', error)
    const status = error.status || 500
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status })
  }
}
