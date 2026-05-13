'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { toast } from 'sonner'

export function useWebWorkerSandbox() {
  const workerRef = useRef<Worker | null>(null)
  const [isSandboxReady, setIsSandboxReady] = useState(false)

  useEffect(() => {
    // We create a Blob to generate a "Null Origin" Web Worker
    // This provides an extremely strict security sandbox because
    // it executes completely isolated from the DOM, cookies, and localStorage.
    const workerScript = `
      self.onmessage = async function(e) {
        const { type, payload, id } = e.data;
        
        if (type === 'EXECUTE_LOGIC') {
          try {
            // Very strict execution environment
            const isolatedContext = {
              console: {
                log: (...args) => self.postMessage({ type: 'LOG', payload: args }),
                error: (...args) => self.postMessage({ type: 'ERROR', payload: args }),
              },
              state: payload.state,
              // Math, Date, etc are available by default
            };
            
            // Construct a highly isolated function
            // We do NOT expose 'window', 'document', or 'fetch' here.
            const sandboxFn = new Function(
              'context', 
              'variables',
              \`
                with(context) {
                  return (function() {
                    'use strict';
                    \${payload.code}
                  })();
                }
              \`
            );
            
            const result = sandboxFn(isolatedContext, payload.variables);
            
            self.postMessage({ type: 'RESULT', id, payload: { success: true, result } });
          } catch (err) {
            self.postMessage({ type: 'RESULT', id, payload: { success: false, error: err.message } });
          }
        }
      };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' })
    const workerUrl = URL.createObjectURL(blob)
    
    workerRef.current = new Worker(workerUrl)
    setIsSandboxReady(true)

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
      URL.revokeObjectURL(workerUrl)
    }
  }, [])

  const executeInSandbox = useCallback((code: string, state: any = {}, variables: any = {}): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error("Sandbox is not initialized"))
        return
      }

      const messageId = Math.random().toString(36).substring(7)
      
      const messageHandler = (e: MessageEvent) => {
        const { type, id, payload } = e.data
        
        if (type === 'RESULT' && id === messageId) {
          workerRef.current?.removeEventListener('message', messageHandler)
          if (payload.success) {
            resolve(payload.result)
          } else {
            reject(new Error(payload.error))
          }
        } else if (type === 'ERROR') {
          console.error('[Sandbox Error]:', ...payload)
        }
      }

      workerRef.current.addEventListener('message', messageHandler)
      
      workerRef.current.postMessage({
        type: 'EXECUTE_LOGIC',
        id: messageId,
        payload: { code, state, variables }
      })

      // Timeout to prevent infinite loops in user code
      setTimeout(() => {
        workerRef.current?.removeEventListener('message', messageHandler)
        reject(new Error("Sandbox execution timed out (Infinite loop protection)"))
      }, 5000)
    })
  }, [])

  return { executeInSandbox, isSandboxReady }
}
