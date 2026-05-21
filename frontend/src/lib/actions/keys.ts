'use server'

import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt, maskApiKey } from '@/lib/encryption'
import { revalidatePath } from 'next/cache'

interface UserKeysStatus {
  openaiConfigured: boolean
  anthropicConfigured: boolean
  googleConfigured: boolean
  openaiMasked: string
  anthropicMasked: string
  googleMasked: string
  activeModel: string
  deterministicMode: boolean
}

/**
 * Checks if a string is a masked key representation
 */
function isMaskedKey(key: string): boolean {
  if (!key) return false
  return key.includes('...') || key.includes('••••')
}

/**
 * Retrieves the configuration status and masked representations of the user's API keys and preferences.
 * The raw/plain keys are never sent to the client.
 */
export async function getUserKeysStatusAction(): Promise<UserKeysStatus> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      openaiConfigured: false,
      anthropicConfigured: false,
      googleConfigured: false,
      openaiMasked: '',
      anthropicMasked: '',
      googleMasked: '',
      activeModel: 'gemini-2.5-flash',
      deterministicMode: true,
    }
  }

  const { data, error } = await supabase
    .from('user_api_keys')
    .select('openai_key, anthropic_key, google_key, active_model, deterministic_mode')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return {
      openaiConfigured: false,
      anthropicConfigured: false,
      googleConfigured: false,
      openaiMasked: '',
      anthropicMasked: '',
      googleMasked: '',
      activeModel: 'gemini-2.5-flash',
      deterministicMode: true,
    }
  }

  const decOpenai = data.openai_key ? decrypt(data.openai_key) : ''
  const decAnthropic = data.anthropic_key ? decrypt(data.anthropic_key) : ''
  const decGoogle = data.google_key ? decrypt(data.google_key) : ''

  return {
    openaiConfigured: !!decOpenai,
    anthropicConfigured: !!decAnthropic,
    googleConfigured: !!decGoogle,
    openaiMasked: decOpenai ? maskApiKey(decOpenai, 'openai') : '',
    anthropicMasked: decAnthropic ? maskApiKey(decAnthropic, 'anthropic') : '',
    googleMasked: decGoogle ? maskApiKey(decGoogle, 'google') : '',
    activeModel: data.active_model || 'gemini-2.5-flash',
    deterministicMode: data.deterministic_mode !== undefined ? data.deterministic_mode : true,
  }
}

/**
 * Encrypts and saves the user's API keys and preferences in the database.
 * Does not overwrite keys that are submitted as masked (indicating no change).
 */
export async function saveUserKeysAction(updates: {
  openaiKey?: string | null
  anthropicKey?: string | null
  googleKey?: string | null
  activeModel?: string
  deterministicMode?: boolean
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch existing record to check for current encrypted keys
  const { data: existing } = await supabase
    .from('user_api_keys')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const finalUpdates: Record<string, any> = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
  }

  // 1. Process OpenAI key
  if (updates.openaiKey !== undefined) {
    if (updates.openaiKey === null || updates.openaiKey.trim() === '') {
      finalUpdates.openai_key = null
    } else if (isMaskedKey(updates.openaiKey)) {
      // Keep existing key
      finalUpdates.openai_key = existing?.openai_key || null
    } else {
      // Encrypt new key
      finalUpdates.openai_key = encrypt(updates.openaiKey)
    }
  } else {
    finalUpdates.openai_key = existing?.openai_key || null
  }

  // 2. Process Anthropic key
  if (updates.anthropicKey !== undefined) {
    if (updates.anthropicKey === null || updates.anthropicKey.trim() === '') {
      finalUpdates.anthropic_key = null
    } else if (isMaskedKey(updates.anthropicKey)) {
      // Keep existing key
      finalUpdates.anthropic_key = existing?.anthropic_key || null
    } else {
      // Encrypt new key
      finalUpdates.anthropic_key = encrypt(updates.anthropicKey)
    }
  } else {
    finalUpdates.anthropic_key = existing?.anthropic_key || null
  }

  // 3. Process Google key
  if (updates.googleKey !== undefined) {
    if (updates.googleKey === null || updates.googleKey.trim() === '') {
      finalUpdates.google_key = null
    } else if (isMaskedKey(updates.googleKey)) {
      // Keep existing key
      finalUpdates.google_key = existing?.google_key || null
    } else {
      // Encrypt new key
      finalUpdates.google_key = encrypt(updates.googleKey)
    }
  } else {
    finalUpdates.google_key = existing?.google_key || null
  }

  // 4. Process Active Model preference
  if (updates.activeModel !== undefined) {
    finalUpdates.active_model = updates.activeModel
  } else {
    finalUpdates.active_model = existing?.active_model || 'gemini-2.5-flash'
  }

  // 5. Process Deterministic Mode preference
  if (updates.deterministicMode !== undefined) {
    finalUpdates.deterministic_mode = updates.deterministicMode
  } else {
    finalUpdates.deterministic_mode = existing?.deterministic_mode !== undefined ? existing.deterministic_mode : true
  }

  // Upsert the encrypted keys row
  const { error } = await supabase
    .from('user_api_keys')
    .upsert(finalUpdates)

  if (error) {
    console.error('Failed to save API keys:', error)
    throw new Error(`Failed to save API keys: ${error.message}`)
  }

  revalidatePath('/projects/settings')
}

/**
 * Fetches AI usage logs from the database
 */
export async function getAIUsageLogsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('ai_usage_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error || !data) return []

  return data.map((log: any) => ({
    id: log.id,
    provider: log.provider,
    model: log.model,
    inputTokens: log.input_tokens,
    outputTokens: log.output_tokens,
    costUsd: log.cost_usd,
    timestamp: new Date(log.created_at).getTime(),
    promptSummary: log.prompt_summary
  }))
}

/**
 * Creates a new AI usage log in the database
 */
export async function logAIUsageAction(record: {
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  costUsd: number
  promptSummary?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('ai_usage_logs')
    .insert({
      user_id: user.id,
      provider: record.provider,
      model: record.model,
      input_tokens: record.inputTokens,
      output_tokens: record.outputTokens,
      cost_usd: record.costUsd,
      prompt_summary: record.promptSummary
    })

  if (error) {
    console.error('Failed to log AI usage:', error)
    throw new Error(`Failed to log AI usage: ${error.message}`)
  }
}

/**
 * Clears all AI usage logs for the current user
 */
export async function clearAIUsageLogsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('ai_usage_logs')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to clear usage logs:', error)
    throw new Error(`Failed to clear usage logs: ${error.message}`)
  }
}
