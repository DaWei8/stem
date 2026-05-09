'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
      router.push('/auth/login')
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up')
      toast.error('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8 border border-border bg-card p-10">
        <div className="text-center">
          <h2 className="text-4xl font-black text-foreground font-heading">Stem</h2>
          <p className="mt-2 text-[10px] font-bold text-muted-foreground">Create New Identity</p>
        </div>

        <form onSubmit={handleSignUp} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-[10px] font-bold text-muted-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border text-foreground rounded-none focus:ring-1 focus:ring-foreground transition-none"
                placeholder="identity@stem.tech"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-[10px] font-bold text-muted-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border text-foreground rounded-none focus:ring-1 focus:ring-foreground transition-none"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-[10px] font-bold text-muted-foreground">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background border-border text-foreground rounded-none focus:ring-1 focus:ring-foreground transition-none"
              />
            </div>
          </div>

          {error && (
            <div className="text-[10px] font-bold text-destructive border border-destructive/50 bg-destructive/10 p-3">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full h-12 font-bold text-xs"
              disabled={loading}
              variant="primary"
            >
              {loading ? 'Initializing...' : 'Create Account'}
            </Button>

            <p className="text-center text-[10px] font-bold text-muted-foreground">
              Already have an identity?{' '}
              <Link href="/auth/login" className="text-foreground hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
