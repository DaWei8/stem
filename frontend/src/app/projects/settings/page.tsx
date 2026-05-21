'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ChevronLeft,
  User,
  Shield,
  Zap,
  Save,
  Building,
  CreditCard,
  Loader2,
  Bot,
  Cpu,
  Trash2,
  Lock,
  Activity,
  Unlock,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { useProjects } from '@/hooks/useProjects'
import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { StandardModal } from '@/components/ui/StandardModal'
import { useAIUsage } from '@/hooks/useAIUsage'
import { getUserKeysStatusAction, saveUserKeysAction } from '@/lib/actions/keys'
import { AIProviderIntegrations } from '@/components/blocks/settings/AIProviderIntegrations'
import { ActiveModelSelector } from '@/components/blocks/settings/ActiveModelSelector'

interface ModelOption {
  id: string
  name: string
  provider: 'google' | 'openai' | 'anthropic'
  desc: string
  inputRate: string
  outputRate: string
  requiresKey: boolean
}

export default function SettingsPage() {
  const { profile, isLoading, fetchProfile, updateProfile } = useUser()
  const { projects, fetchProjects } = useProjects()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [deterministicMode, setDeterministicMode] = useState(true)

  const [openAiKey, setOpenAiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [googleKey, setGoogleKey] = useState('')

  // Show/hide key state
  const [showOpenai, setShowOpenai] = useState(false)
  const [showAnthropic, setShowAnthropic] = useState(false)
  const [showGoogle, setShowGoogle] = useState(false)

  // Testing statuses
  const [openaiStatus, setOpenaiStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle')
  const [anthropicStatus, setAnthropicStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle')
  const [googleStatus, setGoogleStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle')

  const [openaiError, setOpenaiError] = useState('')
  const [anthropicError, setAnthropicError] = useState('')
  const [googleError, setGoogleError] = useState('')

  const [activeModel, setActiveModel] = useState('gemini-2.5-flash')

  const [isApiModalOpen, setIsApiModalOpen] = useState(false)
  const [generatedKey, setGeneratedKey] = useState('')

  const { logs, clearLogs, getTotals } = useAIUsage()

  const totals = useMemo(() => getTotals(), [logs, getTotals])

  const models: ModelOption[] = [
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'google',
      desc: 'High speed, lowest latency. Ideal for rapid iteration.',
      inputRate: '$0.075 / 1M',
      outputRate: '$0.30 / 1M',
      requiresKey: false
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      provider: 'google',
      desc: 'Complex reasoning, advanced planning, high accuracy.',
      inputRate: '$1.25 / 1M',
      outputRate: '$5.00 / 1M',
      requiresKey: false
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'google',
      desc: 'Legacy speed model, stable execution metrics.',
      inputRate: '$0.075 / 1M',
      outputRate: '$0.30 / 1M',
      requiresKey: false
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'google',
      desc: 'Legacy reasoning model, rich token context retention.',
      inputRate: '$1.25 / 1M',
      outputRate: '$5.00 / 1M',
      requiresKey: false
    },
    {
      id: 'gpt-4o',
      name: 'OpenAI GPT-4o',
      provider: 'openai',
      desc: 'Universal flagship model, high logical precision.',
      inputRate: '$2.50 / 1M',
      outputRate: '$10.00 / 1M',
      requiresKey: true
    },
    {
      id: 'gpt-4o-mini',
      name: 'OpenAI GPT-4o-mini',
      provider: 'openai',
      desc: 'Extremely cost-effective, standard logical queries.',
      inputRate: '$0.150 / 1M',
      outputRate: '$0.600 / 1M',
      requiresKey: true
    },
    {
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'anthropic',
      desc: 'State-of-the-art coding and system architecting.',
      inputRate: '$3.00 / 1M',
      outputRate: '$15.00 / 1M',
      requiresKey: true
    },
    {
      id: 'claude-3-5-haiku',
      name: 'Claude 3.5 Haiku',
      provider: 'anthropic',
      desc: 'Ultra-fast logical reasoning, moderate billing footprints.',
      inputRate: '$0.80 / 1M',
      outputRate: '$4.00 / 1M',
      requiresKey: true
    }
  ]

  useEffect(() => {
    fetchProfile()
    fetchProjects()
    setOpenAiKey(localStorage.getItem('openai_key') || '')
    setAnthropicKey(localStorage.getItem('anthropic_key') || '')
    setGoogleKey(localStorage.getItem('google_key') || '')
    setActiveModel(localStorage.getItem('active_architect_model') || 'gemini-2.5-flash')
  }, [fetchProfile, fetchProjects])

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setEmail(profile.email || '')
      setOrganization(profile.organization || '')
    }
  }, [profile])

  const handleSave = async () => {
    await updateProfile({
      full_name: fullName,
      organization: organization
    })

    localStorage.setItem('openai_key', openAiKey)
    localStorage.setItem('anthropic_key', anthropicKey)
    localStorage.setItem('google_key', googleKey)
    localStorage.setItem('active_architect_model', activeModel)
    toast.success('Preferences saved successfully')
  }

  const handleTestKey = async (provider: 'openai' | 'anthropic' | 'google', key: string) => {
    if (!key.trim()) {
      toast.error(`Please enter an API Key for ${provider === 'google' ? 'Google Gemini' : provider} first.`)
      return
    }

    const setStatus = provider === 'openai' ? setOpenaiStatus : provider === 'anthropic' ? setAnthropicStatus : setGoogleStatus
    const setError = provider === 'openai' ? setOpenaiError : provider === 'anthropic' ? setAnthropicError : setGoogleError

    setStatus('testing')
    setError('')

    try {
      const response = await fetch('/api/architect/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key })
      })

      const data = await response.json()
      if (data.ok) {
        setStatus('success')
        toast.success(`${provider.toUpperCase()} Key verified successfully!`)
        localStorage.setItem(`${provider}_key`, key)
      } else {
        setStatus('failed')
        setError(data.error || 'Connection verification failed')
        toast.error(`${provider.toUpperCase()} Key verification failed: ${data.error || 'Invalid credentials'}`)
      }
    } catch (err: any) {
      setStatus('failed')
      setError(err.message || 'Verification request failed')
      toast.error(`Verification request failed: ${err.message}`)
    }
  }

  const handleClearKey = (provider: 'openai' | 'anthropic' | 'google') => {
    if (provider === 'openai') {
      setOpenAiKey('')
      setOpenaiStatus('idle')
      setOpenaiError('')
      localStorage.removeItem('openai_key')
    } else if (provider === 'anthropic') {
      setAnthropicKey('')
      setAnthropicStatus('idle')
      setAnthropicError('')
      localStorage.removeItem('anthropic_key')
    } else if (provider === 'google') {
      setGoogleKey('')
      setGoogleStatus('idle')
      setGoogleError('')
      localStorage.removeItem('google_key')
    }
    toast.success(`${provider.toUpperCase()} key cleared`)
  }

  const handleUpgrade = async () => {
    await updateProfile({
      subscription_tier: 'Pro',
      max_projects: 50,
      max_collaborators: 10
    })
    toast.success('Successfully upgraded to Pro tier')
  }

  const selectModel = (modelId: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      toast.error('Provider API key is required to activate this model.')
      return
    }
    setActiveModel(modelId)
    localStorage.setItem('active_architect_model', modelId)
    toast.success(`Active Architect set to: ${modelId}`)
  }

  const isModelUnlocked = (model: ModelOption) => {
    if (!model.requiresKey) return true
    if (model.provider === 'openai') {
      return openAiKey.trim().startsWith('sk-')
    }
    if (model.provider === 'anthropic') {
      return anthropicKey.trim().startsWith('sk-ant-')
    }
    return false
  }

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="size-8 animate-spin text-zinc-500" />
      </div>
    )
  }

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'openai':
        return <span className="px-2 py-0.5 border border-sky-500/20 bg-sky-500/10 text-sky-400 font-mono text-[9px] font-bold uppercase">OpenAI</span>
      case 'anthropic':
        return <span className="px-2 py-0.5 border border-amber-500/20 bg-amber-500/10 text-amber-400 font-mono text-[9px] font-bold uppercase">Anthropic</span>
      case 'google':
        return <span className="px-2 py-0.5 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold uppercase">Gemini Client</span>
      default:
        return <span className="px-2 py-0.5 border border-zinc-700 bg-zinc-800/50 text-zinc-400 font-mono text-[9px] font-bold uppercase">STEM API</span>
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-heading">
      <header className="flex items-center justify-between px-8 py-6 border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button size="icon" className="bg-white/10 border border-zinc-800 hover:bg-zinc-800 rounded-none size-8">
              <ChevronLeft className="size-4 text-white" />
            </Button>
          </Link>
          <h1 className="text-sm font-bold text-zinc-500 ">Global / Settings</h1>
        </div>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-white text-black hover:bg-zinc-200 rounded-none h-10 px-6 text-xs font-bold gap-2"
        >
          {isLoading ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
          Save Preferences
        </Button>
      </header>

      <main className="max-w-6xl mx-auto w-full p-8 space-y-12 pb-20">
        {/* Profile Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-900">
            <User className="size-5 text-zinc-400" />
            <h2 className="text-lg font-bold">Profile Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 ">Display Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="bg-black border-zinc-800 rounded-none h-11 text-xs focus-visible:ring-1 focus-visible:ring-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 ">Email Address</Label>
              <Input
                value={email}
                disabled
                className="bg-black/50 border-zinc-900 rounded-none h-11 text-xs text-zinc-600 cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* Organization Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-900">
            <Building className="size-5 text-zinc-400" />
            <h2 className="text-lg font-bold">Organization</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 ">Company Name</Label>
              <Input
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Organization / Company"
                className="bg-black border-zinc-800 rounded-none h-11 text-xs focus-visible:ring-1 focus-visible:ring-zinc-700 max-w-md"
              />
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-900">
            <Shield className="size-5 text-zinc-400" />
            <h2 className="text-lg font-bold">Security & Auth</h2>
          </div>
          <div className="p-6 border border-zinc-900 bg-black/30 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold">Two-Factor Authentication</h4>
                <p className="text-[10px] text-zinc-500 font-medium mt-1">Secure your account with multi-factor auth.</p>
              </div>
              <Button variant="outline" className="rounded-none border-zinc-800 h-9 px-4 text-[10px] font-bold hover:bg-white hover:text-black transition-all">Enable 2FA</Button>
            </div>
            <div className="h-px bg-black" />
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold">API Access Tokens</h4>
                <p className="text-[10px] text-zinc-500 font-medium mt-1">Manage keys for programmatic system access.</p>
              </div>
              <Button onClick={() => setIsApiModalOpen(true)} variant="outline" className="rounded-none border-zinc-800 h-9 px-4 text-[10px] font-bold hover:bg-white hover:text-black transition-all">Manage Keys</Button>
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-900">
            <CreditCard className="size-5 text-zinc-400" />
            <h2 className="text-lg font-bold">Billing & Usage</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 border border-zinc-900 bg-black/30 space-y-4">
              <p className="text-[10px] font-black text-zinc-600 ">Current Plan</p>
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase ">{profile?.subscription_tier || 'Free'}</h3>
                <p className="text-[10px] text-zinc-500 font-medium mt-1">Standard deterministic engine</p>
              </div>
              {profile?.subscription_tier?.toLowerCase() !== 'pro' && (
                <Button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  variant="ghost"
                  className="text-white p-0 h-auto text-[10px] font-bold hover:text-emerald-400 transition-colors"
                >
                  Upgrade to Pro
                </Button>
              )}
            </div>
            <div className="p-6 border border-zinc-900 bg-black/30 space-y-4">
              <p className="text-[10px] font-black text-zinc-600 ">Projects Used</p>
              <div className="space-y-1">
                <h3 className="text-xl font-black">{projects.length} / {profile?.max_projects || 10}</h3>
                <div className="w-full h-1 bg-black rounded-full overflow-hidden">
                  <div className="bg-white h-full" style={{ width: `${Math.min((projects.length / (profile?.max_projects || 10)) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
            <div className="p-6 border border-zinc-900 bg-black/30 space-y-4">
              <p className="text-[10px] font-black text-zinc-600 ">Collaborators</p>
              <div className="space-y-1">
                <h3 className="text-xl font-black">0 / {profile?.max_collaborators || 3}</h3>
                <div className="w-full h-1 bg-black rounded-full overflow-hidden">
                  <div className="bg-white h-full" style={{ width: '0%' }} />
                </div>
              </div>
            </div>
            <div className="p-6 border border-zinc-900 bg-black/30 space-y-4">
              <p className="text-[10px] font-black text-zinc-600 ">AI Tokens (STEM Default)</p>
              <div className="space-y-1">
                <h3 className="text-xl font-black">12.5k / 50k</h3>
                <div className="w-full h-1 bg-black rounded-full overflow-hidden">
                  <div className="w-[25%] h-full bg-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Provider Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-900">
            <Bot className="size-5 text-zinc-400" />
            <h2 className="text-lg font-bold">AI Provider Integrations</h2>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">
            Connect your own AI agents to use your existing subscriptions. Keys are securely stored locally in your browser. Otherwise, you will fallback to using the default STEM AI pool limits measured in your Billing section.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* OpenAI Card */}
            <div className="p-6 border border-zinc-900 bg-black/30 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold">OpenAI</h4>
                    <p className="text-[10px] text-zinc-500 font-medium mt-1">ChatGPT 4o, GPT-4o-mini</p>
                  </div>
                  {/* Status Badge */}
                  {openAiKey ? (
                    openaiStatus === 'success' ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 border border-emerald-400/20">
                        <CheckCircle2 className="size-2.5" /> VERIFIED
                      </span>
                    ) : openaiStatus === 'failed' ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 border border-red-400/20">
                        <XCircle className="size-2.5" /> FAILED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 bg-zinc-400/10 px-2 py-0.5 border border-zinc-400/20">
                        CONNECTED
                      </span>
                    )
                  ) : (
                    <span className="text-[9px] font-bold text-zinc-650 bg-zinc-900 px-2 py-0.5 border border-zinc-800">
                      NOT CONFIGURED
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Input
                    value={openAiKey}
                    onChange={(e) => {
                      setOpenAiKey(e.target.value)
                      if (openaiStatus !== 'idle') setOpenaiStatus('idle')
                    }}
                    placeholder="sk-..."
                    type={showOpenai ? 'text' : 'password'}
                    className="bg-black border-zinc-800 rounded-none h-10 text-xs pr-10 focus-visible:ring-1 focus-visible:ring-zinc-700 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenai(!showOpenai)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showOpenai ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {openaiError && (
                  <p className="text-[9.5px] text-red-500/90 font-medium font-mono leading-relaxed bg-red-500/5 p-2 border border-red-500/10">
                    Error: {openaiError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleTestKey('openai', openAiKey)}
                  disabled={openaiStatus === 'testing' || !openAiKey}
                  variant="outline"
                  className="rounded-none border-zinc-800 h-8 text-[9px] font-black uppercase tracking-wider flex-1 hover:bg-white hover:text-black gap-1.5"
                >
                  {openaiStatus === 'testing' ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <RefreshCw className="size-2.5" />
                  )}
                  Test Connection
                </Button>
                {openAiKey && (
                  <Button
                    onClick={() => handleClearKey('openai')}
                    variant="ghost"
                    className="rounded-none h-8 px-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/5"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Anthropic Card */}
            <div className="p-6 border border-zinc-900 bg-black/30 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold">Anthropic</h4>
                    <p className="text-[10px] text-zinc-500 font-medium mt-1">Claude 3.5 Sonnet / Haiku</p>
                  </div>
                  {/* Status Badge */}
                  {anthropicKey ? (
                    anthropicStatus === 'success' ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 border border-emerald-400/20">
                        <CheckCircle2 className="size-2.5" /> VERIFIED
                      </span>
                    ) : anthropicStatus === 'failed' ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 border border-red-400/20">
                        <XCircle className="size-2.5" /> FAILED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 bg-zinc-400/10 px-2 py-0.5 border border-zinc-400/20">
                        CONNECTED
                      </span>
                    )
                  ) : (
                    <span className="text-[9px] font-bold text-zinc-650 bg-zinc-900 px-2 py-0.5 border border-zinc-800">
                      NOT CONFIGURED
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Input
                    value={anthropicKey}
                    onChange={(e) => {
                      setAnthropicKey(e.target.value)
                      if (anthropicStatus !== 'idle') setAnthropicStatus('idle')
                    }}
                    placeholder="sk-ant-..."
                    type={showAnthropic ? 'text' : 'password'}
                    className="bg-black border-zinc-800 rounded-none h-10 text-xs pr-10 focus-visible:ring-1 focus-visible:ring-zinc-700 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnthropic(!showAnthropic)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showAnthropic ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {anthropicError && (
                  <p className="text-[9.5px] text-red-500/90 font-medium font-mono leading-relaxed bg-red-500/5 p-2 border border-red-500/10">
                    Error: {anthropicError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleTestKey('anthropic', anthropicKey)}
                  disabled={anthropicStatus === 'testing' || !anthropicKey}
                  variant="outline"
                  className="rounded-none border-zinc-800 h-8 text-[9px] font-black uppercase tracking-wider flex-1 hover:bg-white hover:text-black gap-1.5"
                >
                  {anthropicStatus === 'testing' ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <RefreshCw className="size-2.5" />
                  )}
                  Test Connection
                </Button>
                {anthropicKey && (
                  <Button
                    onClick={() => handleClearKey('anthropic')}
                    variant="ghost"
                    className="rounded-none h-8 px-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/5"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Google Gemini Card */}
            <div className="p-6 border border-zinc-900 bg-black/30 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold">Google</h4>
                    <p className="text-[10px] text-zinc-500 font-medium mt-1">Gemini 2.5 Flash / Pro</p>
                  </div>
                  {/* Status Badge */}
                  {googleKey ? (
                    googleStatus === 'success' ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 border border-emerald-400/20">
                        <CheckCircle2 className="size-2.5" /> VERIFIED
                      </span>
                    ) : googleStatus === 'failed' ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 border border-red-400/20">
                        <XCircle className="size-2.5" /> FAILED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 bg-zinc-400/10 px-2 py-0.5 border border-zinc-400/20">
                        CONNECTED
                      </span>
                    )
                  ) : (
                    <span className="text-[9px] font-bold text-amber-500/80 bg-amber-500/5 px-2 py-0.5 border border-amber-500/10">
                      DEFAULT POOL FALLBACK
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Input
                    value={googleKey}
                    onChange={(e) => {
                      setGoogleKey(e.target.value)
                      if (googleStatus !== 'idle') setGoogleStatus('idle')
                    }}
                    placeholder="AIzaSy..."
                    type={showGoogle ? 'text' : 'password'}
                    className="bg-black border-zinc-800 rounded-none h-10 text-xs pr-10 focus-visible:ring-1 focus-visible:ring-zinc-700 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGoogle(!showGoogle)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showGoogle ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {googleError && (
                  <p className="text-[9.5px] text-red-500/90 font-medium font-mono leading-relaxed bg-red-500/5 p-2 border border-red-500/10">
                    Error: {googleError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleTestKey('google', googleKey)}
                  disabled={googleStatus === 'testing' || !googleKey}
                  variant="outline"
                  className="rounded-none border-zinc-800 h-8 text-[9px] font-black uppercase tracking-wider flex-1 hover:bg-white hover:text-black gap-1.5"
                >
                  {googleStatus === 'testing' ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <RefreshCw className="size-2.5" />
                  )}
                  Test Connection
                </Button>
                {googleKey && (
                  <Button
                    onClick={() => handleClearKey('google')}
                    variant="ghost"
                    className="rounded-none h-8 px-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/5"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ACTIVE MODEL SELECTOR GRID */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-900">
            <Cpu className="size-5 text-zinc-400" />
            <h2 className="text-lg font-bold">Active System Architect Model</h2>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">
            Select the active model to orchestrate your application logic. Models require their respective API Key above to unlock.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {models.map((model) => {
              const unlocked = isModelUnlocked(model)
              const selected = activeModel === model.id

              return (
                <button
                  key={model.id}
                  onClick={() => selectModel(model.id, unlocked)}
                  className={cn(
                    "p-5 text-left border flex flex-col justify-between min-h-[160px] transition-all relative group",
                    selected
                      ? "border-white bg-white/5 ring-1 ring-white"
                      : unlocked
                        ? "border-zinc-800 hover:border-zinc-500 bg-zinc-950/20"
                        : "border-zinc-900 bg-zinc-950/10 opacity-40 cursor-not-allowed"
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black tracking-tight text-white">{model.name}</span>
                      {selected ? (
                        <span className="size-2 bg-emerald-500 rounded-full" />
                      ) : !unlocked ? (
                        <Lock className="size-3 text-zinc-600" />
                      ) : (
                        <Unlock className="size-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <p className="text-[9.5px] text-zinc-500 font-medium leading-relaxed mt-1.5">{model.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-900 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[8px] font-mono font-black uppercase text-zinc-600">
                      <span>Input toll</span>
                      <span className="text-zinc-400">{model.inputRate}</span>
                    </div>
                    <div className="flex items-center justify-between text-[8px] font-mono font-black uppercase text-zinc-600">
                      <span>Output toll</span>
                      <span className="text-zinc-400">{model.outputRate}</span>
                    </div>
                    {!model.requiresKey && !googleKey && (
                      <div className="flex items-center gap-1 mt-1 text-[8px] text-amber-500/80 font-bold font-mono">
                        <AlertTriangle className="size-2" /> Fallback pool
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* TOKEN TRACKING DASHBOARD */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <Activity className="size-5 text-zinc-400" />
              <h2 className="text-lg font-bold">Token Audit & Cost Tracking</h2>
            </div>
            {logs.length > 0 && (
              <Button
                onClick={clearLogs}
                variant="ghost"
                className="h-8 text-[10px] font-black text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-none border border-red-500/20 px-3 uppercase tracking-wider"
              >
                <Trash2 className="size-3 mr-1.5" /> Clear Audit Log
              </Button>
            )}
          </div>

          <p className="text-[11px] text-zinc-400 font-medium">
            Monitor prompt tokens, output completion metrics, and calculated session costs across your custom keys and standard blueprints.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cards */}
            <div className="p-6 border border-zinc-800 bg-zinc-950/20 space-y-2">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Accumulated Cost</span>
              <p className="text-2xl font-black text-white font-mono">${totals.totalCost.toFixed(5)}</p>
              <p className="text-[10px] text-zinc-400 font-medium font-mono">Calculated LLM invoice charges.</p>
            </div>
            <div className="p-6 border border-zinc-800 bg-zinc-950/20 space-y-2">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Total Tokens Audited</span>
              <p className="text-2xl font-black text-white font-mono">{totals.totalTokens.toLocaleString()}</p>
              <p className="text-[10px] text-zinc-400 font-medium font-mono">Prompt + completion tokens.</p>
            </div>
            <div className="p-6 border border-zinc-800 bg-zinc-950/20 space-y-2">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">System API Runs</span>
              <p className="text-2xl font-black text-white font-mono">{totals.totalQueries}</p>
              <p className="text-[10px] text-zinc-400 font-medium font-mono">Completed architectural queries.</p>
            </div>
          </div>

          {/* Detailed logs table */}
          {logs.length === 0 ? (
            <div className="border border-zinc-900 p-12 text-center text-nowrap flex flex-col items-center justify-center gap-2">
              <Cpu className="size-8 text-zinc-850" />
              <p className="text-xs font-black text-zinc-500 uppercase tracking-wider">No tokens recorded yet</p>
              <p className="text-[10px] text-zinc-600 font-medium">Invoke the AI Architect or sync blueprints to audit credits.</p>
            </div>
          ) : (
            <div className="border border-zinc-900 bg-black/40 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950 text-zinc-500 font-mono text-[9px] font-black uppercase tracking-wider select-none">
                    <th className="p-4">Time</th>
                    <th className="p-4">Provider</th>
                    <th className="p-4">Model</th>
                    <th className="p-4">Prompt</th>
                    <th className="p-4 text-right">Tokens</th>
                    <th className="p-4 text-right">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-medium text-[11px]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-950/40 transition-colors">
                      <td className="p-4 font-mono text-zinc-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-4">
                        {getProviderBadge(log.provider)}
                      </td>
                      <td className="p-4 font-mono text-zinc-400">
                        {log.model}
                      </td>
                      <td className="p-4 text-zinc-300 font-mono max-w-[200px] truncate" title={log.promptSummary}>
                        {log.promptSummary || 'Architect Request'}
                      </td>
                      <td className="p-4 text-right font-mono text-zinc-400">
                        {(log.inputTokens + log.outputTokens).toLocaleString()} <span className="text-[9px] text-zinc-600">({log.inputTokens} / {log.outputTokens})</span>
                      </td>
                      <td className="p-4 text-right font-mono text-emerald-400 font-bold">
                        ${log.costUsd.toFixed(5)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* System Preferences */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-900">
            <Zap className="size-5 text-zinc-400" />
            <h2 className="text-lg font-bold">System Preferences</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center justify-between p-6 border border-zinc-900 bg-black/30">
              <div className="space-y-1">
                <h4 className="text-xs font-bold ">Deterministic Mode</h4>
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">Strict validation for all flow logic and state transitions.</p>
              </div>
              <button
                onClick={() => setDeterministicMode(!deterministicMode)}
                className={cn(
                  "w-11 h-6 rounded-none relative transition-colors duration-200",
                  deterministicMode ? "bg-white" : "bg-black"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 transition-all duration-200",
                  deterministicMode ? "right-1 bg-black" : "left-1 bg-zinc-600"
                )} />
              </button>
            </div>

            <div className="p-6 border border-zinc-900 bg-black/30 flex items-center justify-between opacity-50 cursor-not-allowed">
              <div className="space-y-1">
                <h4 className="text-xs font-bold ">Edge Computing</h4>
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">Deploy system logic to globally distributed nodes.</p>
              </div>
              <div className="w-11 h-6 bg-black relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-zinc-800" />
              </div>
            </div>
          </div>
        </section>

        <footer className="pt-12 border-t border-zinc-900 text-center">
          <p className="text-[10px] text-zinc-700 font-mono tracking-tighter">
            STEM ENGINE VERSION: 0.2.0-ALPHA-NOIR
            <br />
            BUILD DATE: {new Date().toISOString().split('T')[0]}
          </p>
        </footer>
      </main>

      <StandardModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        title="API Access Tokens"
        description="Manage keys for programmatic system access."
      >
        <div className="space-y-6 py-4">
          <div className="bg-black/50 border border-zinc-800 p-4">
            {generatedKey ? (
              <div className="space-y-4">
                <p className="text-xs text-zinc-400">Your new API key. Please copy it now, you will not be able to see it again.</p>
                <div className="flex items-center gap-2">
                  <Input value={generatedKey} readOnly className="bg-black border-zinc-700 text-emerald-400 font-mono text-xs h-10" />
                  <Button onClick={() => { navigator.clipboard.writeText(generatedKey); toast.success('Key copied to clipboard!') }} className="bg-white text-black h-10 px-4 text-xs font-bold rounded-none hover:bg-zinc-200">Copy</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <Shield className="size-8 text-zinc-600 mb-4" />
                <p className="text-xs text-zinc-500 mb-6 text-center">You currently have no active API keys.</p>
                <Button onClick={() => setGeneratedKey(`stm_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`)} className="bg-white text-black hover:bg-zinc-200 rounded-none h-10 px-6 text-xs font-bold">Generate New Key</Button>
              </div>
            )}
          </div>
        </div>
      </StandardModal>
    </div>
  )
}
