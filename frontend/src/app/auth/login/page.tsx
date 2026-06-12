'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ArrowRight, Loader2, Cpu, Globe, Database, Zap, Activity } from 'lucide-react'

import { StemIllustration } from '@/components/auth/StemIllustration'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      toast.success('Successfully authenticated')
      router.push('/projects')
      router.refresh()
    } catch (err: any) {
      const errMsg = err.message || 'An error occurred during login'
      setError(errMsg)
      toast.error('Authentication failed')
      
      if (errMsg.toLowerCase().includes('email not confirmed')) {
        toast.info('Redirecting to verification page...')
        setTimeout(() => {
          router.push(`/auth/confirm-email?email=${encodeURIComponent(email)}`)
        }, 1500)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-black overflow-hidden selection:bg-white/20">
      {/* Split Layout Container */}
      <div className="grid grid-cols-2 w-full">

        {/* Right Side: Dashboard Animation */}
        <div className="hidden lg:flex w-full relative items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <StemIllustration />
          </motion.div>
        </div>

        {/* Left Side: Auth Form */}
        <div className="w-full flex items-center justify-center p-8 md:p-16 z-20 relative bg-black">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[420px] space-y-12"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-8"
              >
                <h1 className="text-4xl font-black tracking-tighter bg-linear-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                  Welcome to Stem
                </h1>
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-white">Login</h2>
                <p className="text-xs font-medium text-zinc-500 tracking-tight leading-relaxed max-w-[300px]">
                  Enter your credentials to enter the dashboard
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[11px] font-bold text-zinc-400 ">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black/30 border-zinc-800 text-white rounded-xl h-12 px-4 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-800"
                    placeholder="identity@stem.tech"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ">
                    <Label htmlFor="password" className="text-[11px] font-bold text-zinc-400">
                      Password
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/30 border-zinc-800 text-white rounded-xl h-12 px-4 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-[10px] font-bold text-red-400 border border-red-500/20 bg-red-500/5 p-4 rounded-xl flex items-center gap-3"
                >
                  <div className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-6">
                <Button
                  type="submit"
                  className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <p className="text-center text-[11px] font-medium text-zinc-500">
                  New to the system?{' '}
                  <Link href="/auth/signup" className="text-white hover:text-zinc-300 font-bold transition-colors underline underline-offset-4 decoration-zinc-800">
                    Create Account
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
