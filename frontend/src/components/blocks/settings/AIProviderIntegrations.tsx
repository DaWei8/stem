'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Bot,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Trash2
} from 'lucide-react'

interface AIProviderIntegrationsProps {
  openaiKey: string
  setOpenaiKey: (val: string) => void
  anthropicKey: string
  setAnthropicKey: (val: string) => void
  googleKey: string
  setGoogleKey: (val: string) => void
  
  openaiStatus: 'idle' | 'testing' | 'success' | 'failed'
  setOpenaiStatus: (status: 'idle' | 'testing' | 'success' | 'failed') => void
  anthropicStatus: 'idle' | 'testing' | 'success' | 'failed'
  setAnthropicStatus: (status: 'idle' | 'testing' | 'success' | 'failed') => void
  googleStatus: 'idle' | 'testing' | 'success' | 'failed'
  setGoogleStatus: (status: 'idle' | 'testing' | 'success' | 'failed') => void
  
  openaiError: string
  setOpenaiError: (val: string) => void
  anthropicError: string
  setAnthropicError: (val: string) => void
  googleError: string
  setGoogleError: (val: string) => void
  
  handleTestKey: (provider: 'openai' | 'anthropic' | 'google', key: string) => Promise<void>
  handleClearKey: (provider: 'openai' | 'anthropic' | 'google') => void
}

export const AIProviderIntegrations: React.FC<AIProviderIntegrationsProps> = ({
  openaiKey, setOpenaiKey,
  anthropicKey, setAnthropicKey,
  googleKey, setGoogleKey,
  openaiStatus, setOpenaiStatus,
  anthropicStatus, setAnthropicStatus,
  googleStatus, setGoogleStatus,
  openaiError, setOpenaiError,
  anthropicError, setAnthropicError,
  googleError, setGoogleError,
  handleTestKey,
  handleClearKey
}) => {
  const [showOpenai, setShowOpenai] = useState(false)
  const [showAnthropic, setShowAnthropic] = useState(false)
  const [showGoogle, setShowGoogle] = useState(false)

  const providers = [
    {
      id: 'openai' as const,
      name: 'OpenAI',
      description: 'ChatGPT 4o, GPT-4o-mini',
      placeholder: 'sk-...',
      value: openaiKey,
      status: openaiStatus,
      error: openaiError,
      show: showOpenai,
      setShow: setShowOpenai,
      setValue: setOpenaiKey,
      setStatus: setOpenaiStatus,
      setError: setOpenaiError,
    },
    {
      id: 'anthropic' as const,
      name: 'Anthropic',
      description: 'Claude 3.5 Sonnet / Haiku',
      placeholder: 'sk-ant-...',
      value: anthropicKey,
      status: anthropicStatus,
      error: anthropicError,
      show: showAnthropic,
      setShow: setShowAnthropic,
      setValue: setAnthropicKey,
      setStatus: setAnthropicStatus,
      setError: setAnthropicError,
    },
    {
      id: 'google' as const,
      name: 'Google',
      description: 'Gemini 2.5 Flash / Pro',
      placeholder: 'AIzaSy...',
      value: googleKey,
      status: googleStatus,
      error: googleError,
      show: showGoogle,
      setShow: setShowGoogle,
      setValue: setGoogleKey,
      setStatus: setGoogleStatus,
      setError: setGoogleError,
    }
  ]

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-zinc-900">
        <Bot className="size-5 text-zinc-400" />
        <h2 className="text-lg font-bold">AI Provider Integrations</h2>
      </div>
      <p className="text-[11px] text-zinc-400 font-medium">
        Connect your own AI agents to use your existing subscriptions. Keys are securely stored in the database. Otherwise, you will fallback to using the default STEM AI pool limits.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((p) => (
          <div key={p.id} className="p-6 border border-zinc-900 bg-black/30 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold">{p.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-medium mt-1">{p.description}</p>
                </div>
                {p.value ? (
                  p.status === 'success' ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 border border-emerald-400/20">
                      <CheckCircle2 className="size-2.5" /> VERIFIED
                    </span>
                  ) : p.status === 'failed' ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 border border-red-400/20">
                      <XCircle className="size-2.5" /> FAILED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 bg-zinc-400/10 px-2 py-0.5 border border-zinc-400/20">
                      CONNECTED
                    </span>
                  )
                ) : p.id === 'google' ? (
                  <span className="text-[9px] font-bold text-amber-500/80 bg-amber-500/5 px-2 py-0.5 border border-amber-500/10">
                    DEFAULT POOL FALLBACK
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-zinc-600 bg-zinc-900 px-2 py-0.5 border border-zinc-800">
                    NOT CONFIGURED
                  </span>
                )}
              </div>

              <div className="relative">
                <Input
                  value={p.value}
                  onChange={(e) => {
                    p.setValue(e.target.value)
                    if (p.status !== 'idle') p.setStatus('idle')
                  }}
                  placeholder={p.placeholder}
                  type={p.show ? 'text' : 'password'}
                  className="bg-black border-zinc-800 rounded-md h-10 text-xs pr-10 focus-visible:ring-1 focus-visible:ring-zinc-700 font-mono"
                />
                <button
                  type="button"
                  onClick={() => p.setShow(!p.show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {p.show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {p.error && (
                <p className="text-[9.5px] text-red-500/90 font-medium font-mono leading-relaxed bg-red-500/5 p-2 border border-red-500/10 max-h-24 overflow-y-auto">
                  Error: {p.error}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => handleTestKey(p.id, p.value)}
                disabled={p.status === 'testing' || !p.value}
                variant="outline"
                className="rounded-md border-zinc-800 h-8 text-[9px] font-black uppercase tracking-wider flex-1 hover:bg-white hover:text-black gap-1.5"
              >
                {p.status === 'testing' ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <RefreshCw className="size-2.5" />
                )}
                Test Connection
              </Button>
              {p.value && (
                <Button
                  onClick={() => handleClearKey(p.id)}
                  variant="ghost"
                  className="rounded-md h-8 px-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/5"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
