import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { provider, key } = await req.json()

    if (!provider || !key) {
      return NextResponse.json({ ok: false, error: 'Missing provider or key' }, { status: 400 })
    }

    const testPrompt = 'Say ok'
    const trimmedKey = key.trim()

    if (provider === 'google') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${trimmedKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: testPrompt }] }],
            generationConfig: { maxOutputTokens: 2 }
          })
        }
      )

      if (!response.ok) {
        const err = await response.json()
        return NextResponse.json({ ok: false, error: err.error?.message || 'API connection failed' })
      }

      return NextResponse.json({ ok: true })

    } else if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${trimmedKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 2
        })
      })

      if (!response.ok) {
        const err = await response.json()
        return NextResponse.json({ ok: false, error: err.error?.message || 'API connection failed' })
      }

      return NextResponse.json({ ok: true })

    } else if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': trimmedKey,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-developer-api-keys': 'true'
        } as any,
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 2
        })
      })

      if (!response.ok) {
        const err = await response.json()
        return NextResponse.json({ ok: false, error: err.error?.message || 'API connection failed' })
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: false, error: 'Unsupported provider' }, { status: 400 })

  } catch (error: any) {
    console.error('Test Key Error:', error)
    return NextResponse.json({ ok: false, error: error.message || 'Verification execution failed' })
  }
}
