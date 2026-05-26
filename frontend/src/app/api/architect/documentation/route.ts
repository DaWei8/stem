import { NextResponse } from 'next/server'
import { executeLLMRequest } from '@/lib/ai-provider'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/encryption'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, format, selectedModel } = await req.json()

    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }

    // Load and decrypt keys from database for user-provided models
    const { data: keysData } = await supabase
      .from('user_api_keys')
      .select('openai_key, anthropic_key, google_key')
      .eq('user_id', user.id)
      .single()

    const userKeys = {
      openai: keysData?.openai_key ? decrypt(keysData.openai_key) : '',
      anthropic: keysData?.anthropic_key ? decrypt(keysData.anthropic_key) : '',
      google: keysData?.google_key ? decrypt(keysData.google_key) : ''
    }

    const systemInstructions = `You are the STEM Documentation Architect, a world-class technical writer and systems engineer.

ROLE:
Your task is to refine, organize, and format the provided raw project summary and technical schema details into a highly readable, premium, and structured document matching the requested format: "${format.toUpperCase()}".

FORMAT SPECIFICS:
- **PRD (Product Requirement Document)**: Focus on features, user journeys, constraints, success metrics, and page transitions. Use clear tables for inputs and outputs.
- **MVP Spec**: Focus only on the core features, simplified user types, minimal data model required, and the primary paths. Emphasize phase 1 scope.
- **Technical Architecture Spec**: Focus on database schema, relations, security (RLS) policies, variables, logic transitions, and API designs.

STYLE & PRESENTATION:
- Use clean, premium markdown structure with a single H1 header.
- Use dividers (---), bullet points, and code blocks for visual clarity.
- Utilize GitHub Alerts (> [!NOTE], > [!IMPORTANT], etc.) to draw attention to critical system constraints or business logic.
- Do NOT output any <script> tags or code scripts. Return ONLY the formatted markdown document itself.
- Do NOT change the functional logic or screen connections described in the raw summary; only elevate its clarity, terminology, and presentation.

Refine the document now.`

    const result = await executeLLMRequest(
      `Please refine the following raw specification into a polished ${format} format:\n\n${content}`,
      systemInstructions,
      userKeys,
      selectedModel
    )

    return NextResponse.json({ content: result.content })

  } catch (error: any) {
    console.error('API /architect/documentation error:', error)
    const status = error.status || 500
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status })
  }
}
