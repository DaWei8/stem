import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'

// Get secure encryption key source from environment, falling back to Service Role Key
const ENCRYPTION_KEY_SOURCE =
  process.env.API_KEYS_ENCRYPTION_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'stem-default-fallback-keys-encryption-passphrase-32ch'

/**
 * Derives a consistent 32-byte key from the environment source string.
 */
function getEncryptionKey(): Buffer {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY_SOURCE).digest()
}

/**
 * Encrypts a string using AES-256-CBC.
 * Returns the format `iv_hex:ciphertext_hex`
 */
export function encrypt(text: string): string {
  if (!text || !text.trim()) return ''
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(text.trim(), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return `${iv.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('Failed to encrypt key')
  }
}

/**
 * Decrypts a string using AES-256-CBC.
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText || !encryptedText.trim()) return ''
  try {
    const key = getEncryptionKey()
    const [ivHex, encryptedHex] = encryptedText.split(':')
    if (!ivHex || !encryptedHex) {
      // Return as-is if it's not encrypted in the expected format (e.g. legacy/plain fallback)
      return encryptedText
    }
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('Decryption failed:', error)
    return ''
  }
}

/**
 * Returns a masked representation of the API key for display in the UI.
 */
export function maskApiKey(key: string, provider: 'openai' | 'anthropic' | 'google'): string {
  if (!key || !key.trim()) return ''
  const trimmed = key.trim()
  
  if (provider === 'openai') {
    if (trimmed.startsWith('sk-proj-')) {
      return `sk-proj-...${trimmed.slice(-4)}`
    }
    return `sk-...${trimmed.slice(-4)}`
  }
  
  if (provider === 'anthropic') {
    return `sk-ant-...${trimmed.slice(-4)}`
  }
  
  if (provider === 'google') {
    return `AIzaSy...${trimmed.slice(-4)}`
  }
  
  return `key-...${trimmed.slice(-4)}`
}
