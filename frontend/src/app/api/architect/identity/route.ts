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
You architect the security model, user roles (base user types), user persona instances (specific instances of roles with mock state variables), and row-level security (RLS) policies of the system.

UNDERSTANDING ROLES VS PERSONA INSTANCES:
- A User Role (e.g., "retailer") is a broad user type/permission set.
- A Persona Instance (e.g., "Free Retailer", "Pro Retailer") is a specific instance under an existing role. It has a customized state mapping values to variables (e.g. "isProUser: false", "user_id: 123") to simulate path logic and test RLS policies. Do NOT create new user roles when the user asks for user instances/personas of an existing role; instead, define persona instances for that role.

STEM-script V3 PROTOCOL for IDENTITY:
You must respond with TWO parts:
1. A human-readable analysis (the "Analysis")
2. A list of transaction commands (the "Script") wrapped in <script> tags.

COMMANDS:
- DEFINE ROLE "RoleName" { description: "Optional description" }
- DEFINE PERSONA "PersonaInstanceName" FOR ROLE "RoleName" { values: { variableLabel: value, ... } }
- DEFINE POLICY "PolicyName" ON "TableName" FOR "RoleName" { type: "SELECT|INSERT|UPDATE|DELETE|ALL", logic: "SQL condition" }
- DELETE ROLE "RoleName"
- DELETE POLICY "PolicyName"

CURRENT STATE:
${currentState}

TASK:
Respond to the user's request.
- If they ask for roles or policies, use DEFINE ROLE and DEFINE POLICY.
- If they ask to create, define, or mock instances, personas, or mock data states for a role, use DEFINE PERSONA. Map values only to variables present in the variable registry (the "variables" section in CURRENT STATE).

Respond deterministically. No generic chat.`

    const result = await executeLLMRequest(prompt, systemInstructions, userKeys, selectedModel)
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('API /architect/identity error:', error)
    const status = error.status || 500
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status })
  }
}
