'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Loader2, ArrowRight, Mail, CheckCircle2, RotateCcw } from 'lucide-react'
import { StemIllustration } from '@/components/auth/StemIllustration'

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const router = useRouter()
  const supabase = createClient()
  const [resending, setResending] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)

  useEffect(() => {
    // Listen for authentication changes. If they verify email (on another tab or device)
    // and log in, the auth state change will be triggered here.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsConfirmed(true)
        toast.success('Email confirmed successfully!')
        setTimeout(() => {
          router.push('/projects')
          router.refresh()
        }, 1500)
      }
    })

    // Also check initial session just in case they are already verified/logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsConfirmed(true)
        router.push('/projects')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const handleResend = async () => {
    if (!email) {
      toast.error('Email address is missing')
      return
    }
    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      if (error) throw error
      toast.success('Verification email resent! Please check your inbox.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend verification email')
    } finally {
      setResending(false)
    }
  }

  const handleGoToDashboard = () => {
    router.push('/projects')
  }

  return (
    <div className="w-full max-w-[420px] space-y-12">
      <div className="space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-8"
        >
          <h1 className="text-4xl font-black tracking-tighter bg-linear-to-br from-white to-zinc-500 bg-clip-text text-transparent">
            Verify Identity
          </h1>
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-white">
            {isConfirmed ? 'Account Confirmed' : 'Check your inbox'}
          </h2>
          <p className="text-xs font-medium text-zinc-500 tracking-tight leading-relaxed max-w-[340px]">
            {isConfirmed 
              ? 'Your identity has been authenticated. Redirecting you to the dashboard...' 
              : "We've sent a verification link to your email address."}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Visual card showing status */}
        <div className="relative p-6 bg-zinc-950/40 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
          
          {isConfirmed ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="size-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center text-green-400 mb-4 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
            >
              <CheckCircle2 className="size-8 animate-pulse" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="size-16 bg-indigo-500/10 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-400 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
            >
              <Mail className="size-8" />
            </motion.div>
          )}

          <div className="space-y-1 z-10">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Target Identity</span>
            <p className="text-sm font-mono font-bold text-zinc-200 break-all select-all px-3 py-1 rounded bg-zinc-900/50 border border-zinc-900">
              {email || 'identity@stem.tech'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoToDashboard}
            className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Go to Dashboard
            <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
          </Button>

          {!isConfirmed && (
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full h-12 border border-zinc-800 hover:border-zinc-700 bg-black/30 hover:bg-zinc-900/30 text-zinc-400 hover:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {resending ? (
                <>
                  <Loader2 className="size-4 animate-spin text-zinc-500" />
                  Sending link...
                </>
              ) : (
                <>
                  <RotateCcw className="size-3.5" />
                  Resend Verification Email
                </>
              )}
            </button>
          )}

          <p className="text-center text-[11px] font-medium text-zinc-500 pt-2">
            Incorrect email address?{' '}
            <Link href="/auth/signup" className="text-white hover:text-zinc-300 font-bold transition-colors underline underline-offset-4 decoration-zinc-800">
              Change email
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <div className="flex min-h-screen bg-black overflow-hidden selection:bg-white/20">
      <div className="flex flex-col lg:flex-row w-full">
        {/* Left Side: Illustration */}
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

        {/* Right Side: Form/Message Area */}
        <div className="w-full lg:w-[45%] flex items-center justify-center p-8 md:p-16 z-20 relative bg-black">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[420px]"
          >
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="size-8 animate-spin text-white" />
                <span className="text-xs font-mono font-bold text-zinc-500">Initializing verification...</span>
              </div>
            }>
              <ConfirmEmailContent />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
