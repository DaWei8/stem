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
}

/**
 * Checks if a string is a masked key representation
 */
function isMaskedKey(key: string): boolean {
  if (!key) return false
  return key.includes('...') || key.includes('••••')
}

/**
 * Retrieves the configuration status and masked representations of the user's API keys.
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
    }
  }

  const { data, error } = await supabase
    .from('user_api_keys')
    .select('openai_key, anthropic_key, google_key')
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
  }
}

/**
 * Encrypts and saves the user's API keys in the database.
 * Does not overwrite keys that are submitted as masked (indicating no change).
 */
export async function saveUserKeysAction(updates: {
  openaiKey?: string | null
  anthropicKey?: string | null
  googleKey?: string | null
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

  const finalUpdates: Record<string, string | null> = {
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
