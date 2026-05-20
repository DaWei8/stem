import { NextResponse } from 'next/server'
import { executeLLMRequest } from '@/lib/ai-provider'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { prompt, currentState, userKeys, selectedModel } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

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

    const result = await executeLLMRequest(prompt, systemInstructions, userKeys, selectedModel)
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('API /architect error:', error)
    const status = error.status || 500
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status })
  }
}
