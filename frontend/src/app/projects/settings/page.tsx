'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft, User, Shield, Globe, Zap, Save, Building, CreditCard, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { profile, isLoading, fetchProfile, updateProfile } = useUser()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [deterministicMode, setDeterministicMode] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

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
            <Button size="icon" className="bg-black border border-zinc-800 hover:bg-zinc-800 rounded-none size-8">
              <ChevronLeft className="size-4" />
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

      <main className="max-w-4xl mx-auto w-full p-8 space-y-12 pb-20">
        {/* Profile Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-900">
            <User className="size-5 text-zinc-400" />
            <h2 className="text-lg font-bold">Profile Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Display Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="bg-black border-zinc-800 rounded-none h-11 text-xs focus-visible:ring-1 focus-visible:ring-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email Address</Label>
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
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Company Name</Label>
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
              <Button variant="outline" className="rounded-none border-zinc-800 h-9 px-4 text-[10px] font-bold hover:bg-white hover:text-black transition-all">Manage Keys</Button>
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-900">
            <CreditCard className="size-5 text-zinc-400" />
            <h2 className="text-lg font-bold">Billing & Usage</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-zinc-900 bg-black/30 space-y-4">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Current Plan</p>
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase">{profile?.subscription_tier || 'Free'}</h3>
                <p className="text-[10px] text-zinc-500 font-medium">Standard deterministic engine</p>
              </div>
              <Button variant="ghost" className="text-white p-0 h-auto text-[10px] font-bold uppercase tracking-widest">Upgrade to Pro</Button>
            </div>
            <div className="p-6 border border-zinc-900 bg-black/30 space-y-4">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Projects Used</p>
              <div className="space-y-1">
                <h3 className="text-xl font-black">0 / {profile?.max_projects || 5}</h3>
                <div className="w-full h-1 bg-black rounded-full overflow-hidden">
                  <div className="w-[10%] h-full bg-white" />
                </div>
              </div>
            </div>
            <div className="p-6 border border-zinc-900 bg-black/30 space-y-4">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Collaborators</p>
              <div className="space-y-1">
                <h3 className="text-xl font-black">0 / {profile?.max_collaborators || 3}</h3>
                <div className="w-full h-1 bg-black rounded-full overflow-hidden">
                  <div className="w-[5%] h-full bg-white" />
                </div>
              </div>
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
                <h4 className="text-xs font-bold uppercase tracking-widest">Deterministic Mode</h4>
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
                <h4 className="text-xs font-bold uppercase tracking-widest">Edge Computing</h4>
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
    </div>
  )
}
