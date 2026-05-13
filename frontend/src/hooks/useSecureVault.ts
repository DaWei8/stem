'use client'

import { useState, useCallback } from 'react'

export function useSecureVault() {
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null)

  // Initialize a session-only key
  const initializeVault = useCallback(async () => {
    if (encryptionKey) return encryptionKey

    const key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    )
    setEncryptionKey(key)
    return key
  }, [encryptionKey])

  // Save to IndexedDB (Encrypted)
  const saveSecureSnapshot = useCallback(async (storeName: string, data: any) => {
    try {
      const key = await initializeVault()
      
      const iv = window.crypto.getRandomValues(new Uint8Array(12))
      const encodedData = new TextEncoder().encode(JSON.stringify(data))
      
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encodedData
      )

      // Store in IndexedDB
      const db = await openDB()
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(['snapshots'], 'readwrite')
        const store = transaction.objectStore('snapshots')
        
        const request = store.put({
          id: storeName,
          iv: Array.from(iv),
          data: encryptedBuffer,
          timestamp: Date.now()
        })
        
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

    } catch (err) {
      console.error('Failed to secure snapshot', err)
      throw err
    }
  }, [initializeVault])

  // Retrieve from IndexedDB (Decrypted)
  const loadSecureSnapshot = useCallback(async (storeName: string) => {
    if (!encryptionKey) {
      console.warn('Cannot decrypt: No active session key found.')
      return null
    }

    try {
      const db = await openDB()
      
      const record = await new Promise<any>((resolve, reject) => {
        const transaction = db.transaction(['snapshots'], 'readonly')
        const store = transaction.objectStore('snapshots')
        const request = store.get(storeName)
        
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })

      if (!record) return null

      const iv = new Uint8Array(record.iv)
      
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        encryptionKey,
        record.data
      )

      const decodedString = new TextDecoder().decode(decryptedBuffer)
      return JSON.parse(decodedString)

    } catch (err) {
      console.error('Failed to load secure snapshot', err)
      return null
    }
  }, [encryptionKey])

  return { saveSecureSnapshot, loadSecureSnapshot, isVaultReady: !!encryptionKey }
}

// Simple IndexedDB helper
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('STEM_Secure_Vault', 1)
    
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('snapshots')) {
        db.createObjectStore('snapshots', { keyPath: 'id' })
      }
    }
    
    request.onsuccess = (e: any) => resolve(e.target.result)
    request.onerror = (e: any) => reject(e.target.error)
  })
}
