import { NextResponse } from 'next/server'
import { executeLLMRequest } from '@/lib/ai-provider'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { prompt, currentState, userKeys, selectedModel } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

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

    const result = await executeLLMRequest(prompt, systemInstructions, userKeys, selectedModel)
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('API /architect/identity error:', error)
    const status = error.status || 500
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status })
  }
}
