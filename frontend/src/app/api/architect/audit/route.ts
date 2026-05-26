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

    const { projectState, selectedModel } = await req.json()

    if (!projectState) {
      return NextResponse.json({ error: 'Missing project state' }, { status: 400 })
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

    const systemInstructions = `You are the STEM AI Security Auditor, a world-class cybersecurity expert, database administrator, and senior systems architect.

ROLE:
Your task is to analyze the provided project configuration state (which contains screens, transitions, variables, database tables/columns, user types, and RLS policies) to detect potential security lapses, logical vulnerabilities, access control flaws, and inefficiencies.

INSPECT FOR:
1. **Supabase Database Row-Level Security (RLS)**:
   - Identify database tables that do not have RLS policies or have wildcard bypasses (e.g. ALL permissions granted to public/anon roles).
   - Check if foreign-key relations are bypassed or could lead to unauthorized row leakage.
2. **Access Control Lapses**:
   - Compare screen paths (e.g., admin or settings views) against user type page access permissions.
   - Detect if sensitive inputs/actions are exposed on screens accessible by unauthorized/anonymous user roles.
3. **Deterministic Flow Gaps & Inefficiencies**:
   - Analyze user flow transitions for circular deadlocks or dead ends.
   - Check for pathways where state transitions are triggered without matching validation actions or condition gates.
4. **Input Sanitization & Data Integrity Risks**:
   - Spot variables mapped to persistent DB columns that lack validation rules (no regex/min/max constraints) in screen inputs.
5. **Tauri Native App Vulnerability (if desktop wrapper is in play)**:
   - Check if front-end state interactions with logic nodes could lead to local file system access risks or unsanitized shell commands execution.

STYLE & PRESENTATION:
- Return a premium, comprehensive security report written in structured, clean Markdown.
- Use a single H1 header.
- Group the audit into logical sections:
  1. Executive Summary & Threat Score (0-100 rating)
  2. Identified Flaws & Vulnerabilities (categorized by severity: CRITICAL, WARNING, OPTIMIZATION)
  3. Affected Setups (explain which component/architecture layer is impacted: Supabase DB, Next.js Middleware, Tauri Desktop, Web Router)
  4. Step-by-Step Mitigation & Remediation (provide code snippets, SQL statements, or routing modifications to resolve the issues)
- Use divider rules (---) and GitHub Alerts (> [!IMPORTANT], > [!WARNING], > [!NOTE]) for emphasis.
- Return ONLY the formatted markdown document itself. No prefix or conversational intro.`

    const prompt = `Please run a security audit on the following system configuration:

${JSON.stringify(projectState, null, 2)}`

    const result = await executeLLMRequest(
      prompt,
      systemInstructions,
      userKeys,
      selectedModel
    )

    return NextResponse.json({ content: result.content })

  } catch (error: any) {
    console.error('API /architect/audit error:', error)
    const status = error.status || 500
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status })
  }
}
