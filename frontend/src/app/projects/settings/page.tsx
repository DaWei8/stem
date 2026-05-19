'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft, User, Shield, Globe, Zap, Save, Building, CreditCard, Loader2, Bot } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { useProjects } from '@/hooks/useProjects'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { StandardModal } from '@/components/ui/StandardModal'

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

  const [isApiModalOpen, setIsApiModalOpen] = useState(false)
  const [generatedKey, setGeneratedKey] = useState('')

  useEffect(() => {
    fetchProfile()
    fetchProjects()
    setOpenAiKey(localStorage.getItem('openai_key') || '')
    setAnthropicKey(localStorage.getItem('anthropic_key') || '')
    setGoogleKey(localStorage.getItem('google_key') || '')
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
    toast.success('Preferences saved successfully')
  }

  const handleUpgrade = async () => {
    await updateProfile({
      subscription_tier: 'Pro',
      max_projects: 50,
      max_collaborators: 10
    })
    toast.success('Successfully upgraded to Pro tier')
  }

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="size-8 animate-spin text-zinc-500" />
      </div>
    )
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
                <p className="text-[10px] text-zinc-500 font-medium">Secure your account with multi-factor auth.</p>
              </div>
              <Button variant="outline" className="rounded-none border-zinc-800 h-9 px-4 text-[10px] font-bold hover:bg-white hover:text-black transition-all">Enable 2FA</Button>
            </div>
            <div className="h-px bg-black" />
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold">API Access Tokens</h4>
                <p className="text-[10px] text-zinc-500 font-medium">Manage keys for programmatic system access.</p>
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
                <p className="text-[10px] text-zinc-500 font-medium">Standard deterministic engine</p>
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
            Connect your own AI agents to use your existing subscriptions. Keys are securely stored locally. Otherwise, you will fallback to using the default STEM AI pool limits measured in your Billing section.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-zinc-900 bg-black/30 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold">OpenAI</h4>
                  <p className="text-[10px] text-zinc-500 font-medium mt-1">ChatGPT 4o, 3.5 Turbo</p>
                </div>
              </div>
              <Input value={openAiKey} onChange={(e) => setOpenAiKey(e.target.value)} placeholder="sk-..." type="password" className="bg-black border-zinc-800 rounded-none h-10 text-xs focus-visible:ring-1 focus-visible:ring-zinc-700" />
            </div>

            <div className="p-6 border border-zinc-900 bg-black/30 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold">Anthropic</h4>
                  <p className="text-[10px] text-zinc-500 font-medium mt-1">Claude 3.5 Sonnet</p>
                </div>
              </div>
              <Input value={anthropicKey} onChange={(e) => setAnthropicKey(e.target.value)} placeholder="sk-ant-..." type="password" className="bg-black border-zinc-800 rounded-none h-10 text-xs focus-visible:ring-1 focus-visible:ring-zinc-700" />
            </div>

            <div className="p-6 border border-zinc-900 bg-black/30 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold">Google</h4>
                  <p className="text-[10px] text-zinc-500 font-medium mt-1">Gemini 1.5 Pro</p>
                </div>
              </div>
              <Input value={googleKey} onChange={(e) => setGoogleKey(e.target.value)} placeholder="AIzaSy..." type="password" className="bg-black border-zinc-800 rounded-none h-10 text-xs focus-visible:ring-1 focus-visible:ring-zinc-700" />
            </div>
          </div>
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
            STEM ENGINE VERSION: 0.1.0-ALPHA-NOIR
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
