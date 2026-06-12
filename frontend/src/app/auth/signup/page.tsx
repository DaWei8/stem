'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Loader2, ArrowRight } from 'lucide-react'
import { StemIllustration } from '@/components/auth/StemIllustration'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (authError) throw authError

      toast.success('Check your email to confirm your account')
      router.push(`/auth/confirm-email?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up')
      toast.error('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-black overflow-hidden selection:bg-white/20">
      {/* Split Layout Container */}
      <div className="flex flex-col lg:flex-row w-full">

        {/* Right Side: Dashboard Animation (On Left) */}
        <div className="hidden lg:flex w-full lg:w-[55%] bg-black relative items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(255,255,255,0.03),transparent_60%)]" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <StemIllustration />
          </motion.div>
        </div>

        {/* Left Side: Auth Form (On Right) */}
        <div className="w-full lg:w-[45%] flex items-center justify-center p-8 md:p-16 z-20 relative bg-black">

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
                  Create Identity
                </h1>
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-white">Sign Up</h2>
                <p className="text-xs font-medium text-zinc-500 tracking-tight leading-relaxed max-w-[300px]">
                  Initialize your access to the Stem architecture
                </p>
              </div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[11px] font-bold text-zinc-400">
                    Email Address
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
                  <Label htmlFor="password" className="text-[11px] font-bold text-zinc-400">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/30 border-zinc-800 text-white rounded-xl h-12 px-4 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[11px] font-bold text-zinc-400">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Create account
                      <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <p className="text-center text-[11px] font-medium text-zinc-500">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-white hover:text-zinc-300 font-bold transition-colors underline underline-offset-4 decoration-zinc-800">
                    Sign In
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

