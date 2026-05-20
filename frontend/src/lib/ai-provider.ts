export interface AIUsage {
  provider: 'openai' | 'anthropic' | 'google' | 'system-fallback'
  model: string
  inputTokens: number
  outputTokens: number
  costUsd: number
  timestamp: number
}

interface UserKeys {
  openai?: string
  anthropic?: string
  google?: string
}

// Cost Rates in USD per 1,000,000 tokens
const MODEL_RATES: Record<string, { input: number; output: number }> = {
  // Google Gemini
  'gemini-2.5-flash': { input: 0.075, output: 0.30 },
  'gemini-2.5-pro': { input: 1.25, output: 5.00 },
  'gemini-1.5-flash': { input: 0.075, output: 0.30 },
  'gemini-1.5-pro': { input: 1.25, output: 5.00 },
  // OpenAI
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  // Anthropic
  'claude-3-5-sonnet': { input: 3.00, output: 15.00 },
  'claude-3-5-haiku': { input: 0.80, output: 4.00 }
}

export class UpstreamAPIError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'UpstreamAPIError'
    this.status = status
  }
}

export async function executeLLMRequest(
  prompt: string,
  systemInstructions: string,
  userKeys?: UserKeys,
  selectedModel?: string
): Promise<{ content: string; script: string; usage: AIUsage }> {
  
  // 1. Determine Model and Provider
  let activeModel = selectedModel || 'gemini-2.5-flash'
  let provider: AIUsage['provider'] = 'system-fallback'
  let apiKey = ''

  if (activeModel.startsWith('gemini-')) {
    if (userKeys?.google && userKeys.google.trim().startsWith('AIzaSy')) {
      provider = 'google'
      apiKey = userKeys.google.trim()
    } else {
      // Fallback to system key for Gemini if no custom google key
      provider = 'system-fallback'
      apiKey = process.env.GEMINI_API_KEY || ''
      if (!apiKey) {
        throw new Error(`Google API Key is required to run model "${activeModel}". Please add it in settings.`)
      }
    }
  } else if (activeModel.startsWith('gpt-')) {
    provider = 'openai'
    apiKey = userKeys?.openai?.trim() || ''
    if (!apiKey.startsWith('sk-')) {
      throw new Error(`OpenAI API Key is required to run model "${activeModel}". Please configure it in settings.`)
    }
  } else if (activeModel.startsWith('claude-')) {
    provider = 'anthropic'
    apiKey = userKeys?.anthropic?.trim() || ''
    if (!apiKey.startsWith('sk-ant-')) {
      throw new Error(`Anthropic API Key is required to run model "${activeModel}". Please configure it in settings.`)
    }
  } else {
    // Unknown model fallback
    provider = 'system-fallback'
    activeModel = 'gemini-2.5-flash'
    apiKey = process.env.GEMINI_API_KEY || ''
    if (!apiKey) {
      throw new Error('No AI provider key available.')
    }
  }

  let textResult = ''
  let inputTokens = 0
  let outputTokens = 0

  // 2. Dispatch API Call
  if (activeModel.startsWith('gemini-')) {
    // Map internal selection to Gemini API model identifiers
    let geminiModelName = activeModel
    if (activeModel === 'gemini-2.5-flash') geminiModelName = 'gemini-2.5-flash'
    if (activeModel === 'gemini-2.5-pro') geminiModelName = 'gemini-2.5-pro'
    if (activeModel === 'gemini-1.5-flash') geminiModelName = 'gemini-1.5-flash'
    if (activeModel === 'gemini-1.5-pro') geminiModelName = 'gemini-1.5-pro'

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModelName}:generateContent?key=${apiKey}`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemInstructions}\n\nUSER REQUEST: ${prompt}` }] }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.95,
          maxOutputTokens: 8192
        }
      })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new UpstreamAPIError(err.error?.message || `Gemini API call failed for model ${geminiModelName}`, response.status)
    }

    const data = await response.json()
    textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    inputTokens = data.usageMetadata?.promptTokenCount || Math.ceil(prompt.length / 4)
    outputTokens = data.usageMetadata?.candidatesTokenCount || Math.ceil(textResult.length / 4)

  } else if (activeModel.startsWith('gpt-')) {
    // OpenAI Chat Completions call
    const endpoint = 'https://api.openai.com/v1/chat/completions'

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: 'system', content: systemInstructions },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 4096
      })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new UpstreamAPIError(err.error?.message || `OpenAI API call failed for model ${activeModel}`, response.status)
    }

    const data = await response.json()
    textResult = data.choices?.[0]?.message?.content || ''
    inputTokens = data.usage?.prompt_tokens || 0
    outputTokens = data.usage?.completion_tokens || 0

  } else if (activeModel.startsWith('claude-')) {
    // Anthropic Messages call
    const endpoint = 'https://api.anthropic.com/v1/messages'
    
    // Map selection to Anthropic model names
    let anthropicModelName = 'claude-3-5-sonnet-20241022'
    if (activeModel === 'claude-3-5-haiku') anthropicModelName = 'claude-3-5-haiku-20241022'

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-developer-api-keys': 'true'
      } as any,
      body: JSON.stringify({
        model: anthropicModelName,
        system: systemInstructions,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new UpstreamAPIError(err.error?.message || `Anthropic API call failed for model ${activeModel}`, response.status)
    }

    const data = await response.json()
    textResult = data.content?.[0]?.text || ''
    inputTokens = data.usage?.input_tokens || 0
    outputTokens = data.usage?.output_tokens || 0
  }

  // 3. Cost rates computation
  const rates = MODEL_RATES[activeModel] || { input: 0.075, output: 0.30 }
  const costUsd = (inputTokens * (rates.input / 1000000)) + (outputTokens * (rates.output / 1000000))

  // 4. Parse content & scripts
  const scriptMatch = textResult.match(/<script>([\s\S]*?)(?:<\/script>|$)/i) || textResult.match(/```(?:stem-script|script|xml)?\s*\n([\s\S]*?)(?:```|$)/i)
  const script = scriptMatch ? scriptMatch[1].trim() : ''
  const content = textResult
    .replace(/<script>[\s\S]*?(?:<\/script>|$)/i, '')
    .replace(/```(?:stem-script|script|xml)?\s*\n[\s\S]*?(?:```|$)/i, '')
    .trim()

  return {
    content,
    script,
    usage: {
      provider,
      model: activeModel,
      inputTokens,
      outputTokens,
      costUsd,
      timestamp: Date.now()
    }
  }
}
