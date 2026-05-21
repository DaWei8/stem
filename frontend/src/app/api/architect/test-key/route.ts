import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/encryption'

function isMaskedKey(key: string): boolean {
  if (!key) return false
  return key.includes('...') || key.includes('••••')
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { provider, key } = await req.json()

    if (!provider || !key) {
      return NextResponse.json({ ok: false, error: 'Missing provider or key' }, { status: 400 })
    }

    const trimmedKey = key.trim()
    let actualKey = trimmedKey

    if (isMaskedKey(trimmedKey)) {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('openai_key, anthropic_key, google_key')
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        return NextResponse.json({ ok: false, error: 'API key not configured in database' })
      }

      let encryptedKey = ''
      if (provider === 'openai') encryptedKey = data.openai_key || ''
      else if (provider === 'anthropic') encryptedKey = data.anthropic_key || ''
      else if (provider === 'google') encryptedKey = data.google_key || ''

      if (!encryptedKey) {
        return NextResponse.json({ ok: false, error: `No stored key found for provider: ${provider}` })
      }

      const decrypted = decrypt(encryptedKey)
      if (!decrypted) {
        return NextResponse.json({ ok: false, error: 'Failed to decrypt the stored key' })
      }
      actualKey = decrypted
    }

    const testPrompt = 'Say ok'

    if (provider === 'google') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${actualKey}`,
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
          Authorization: `Bearer ${actualKey}`
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
          'x-api-key': actualKey,
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
