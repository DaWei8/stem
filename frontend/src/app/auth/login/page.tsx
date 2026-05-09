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

const SystemVisualization = () => {
  const [logs, setLogs] = useState([
    { id: 1, text: 'Engine created', status: 'ok' },
    { id: 2, text: 'Deterministic state synced', status: 'synced' },
    { id: 3, text: 'Identity layer secured', status: 'active' },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = {
        id: Date.now(),
        text: `Trace: 0x${Math.random().toString(16).slice(2, 8)} -> Verified`,
        status: 'ok'
      }
      setLogs(prev => [newLog, ...prev.slice(0, 4)])
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-full flex touch-none items-center justify-center p-8 bg-black">
      {/* Background Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Dashboard Layout */}
      <div className="relative w-full h-full grid grid-cols-12 grid-rows-12 gap-4 z-10 max-w-3xl max-h-[600px]">

        {/* Top Header/Status Bar */}
        <div className="col-span-12 row-span-1 bg-black/30 border border-zinc-800 flex items-center justify-between px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <div className="size-2 rounded-full bg-zinc-800" />
              <div className="size-2 rounded-full bg-zinc-800" />
            </div>
            <span className="text-[10px] font-black  text-zinc-500">System Monitoring Gateway</span>
          </div>
          <div className="flex items-center gap-6 text-[9px] font-mono text-zinc-600">
            <span>Uptime: 99.999%</span>
            <span>Cluster: STEM-01</span>
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="col-span-8 row-span-6 bg-black/10 border border-zinc-800 p-6 flex flex-col gap-6 backdrop-blur-sm">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xs font-black tracking-wider text-white mb-1">Compute throughput</h3>
              <p className="text-[9px] text-zinc-600">Deterministic load balancing active</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-white tracking-tighter">1,248 TPS</span>
            </div>
          </div>

          {/* Simulated Chart */}
          <div className="flex-1 flex items-end gap-1.5 h-32 pt-4">
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: '20%' }}
                animate={{ height: `${30 + Math.random() * 60}%` }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                className="flex-1 bg-zinc-800 hover:bg-white transition-colors"
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800/50">
            {[
              { label: 'Latency', value: '0.42ms', trend: '-2%' },
              { label: 'Integrity', value: 'Verified', trend: '100%' },
              { label: 'Nodes', value: '14 Active', trend: 'Stable' },
            ].map((m, i) => (
              <div key={i}>
                <p className="text-[9px] font-black text-zinc-600 mb-1">{m.label}</p>
                <p className="text-xs font-bold text-white font-mono">{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Module Status Sidebar */}
        <div className="col-span-4 row-span-8 flex flex-col gap-4">
          {[
            { icon: Globe, label: "Identity Layer", status: "Secured" },
            { icon: Database, label: "Schema Engine", status: "Synced" },
            { icon: Shield, label: "Security Mesh", status: "Active" },
            { icon: Zap, label: "Flow Logic", status: "Running" },
          ].map((item, i) => (
            <div key={i} className="flex-1 bg-black/40 border border-zinc-800 p-4 flex items-center justify-between hover:border-zinc-500 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="size-10 bg-black border border-zinc-800 flex items-center justify-center group-hover:border-zinc-600 transition-colors">
                  <item.icon className="size-4 text-zinc-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-[11px] font-black tracking-tight text-white">{item.label}</p>
                  <p className="text-[9px] font-medium text-zinc-500">{item.status}</p>
                </div>
              </div>
              <Activity className="size-3 text-zinc-800 group-hover:text-green-500 transition-colors" />
            </div>
          ))}
        </div>

        {/* Activity Feed */}
        <div className="col-span-8 row-span-5 bg-black border border-zinc-800 p-6 overflow-hidden relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-black tracking-[0.2em] text-zinc-500">Deterministic Activity logs</span>
            <div className="flex gap-2">
              <div className="size-1.5 bg-zinc-800" />
              <div className="size-1.5 bg-white" />
            </div>
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between font-mono text-[10px] text-zinc-400 border-b border-zinc-900 pb-2"
                >
                  <div className="flex items-center gap-3 truncate pr-4">
                    <span className="text-zinc-700">[{new Date(log.id).toLocaleTimeString()}]</span>
                    <span className="truncate tracking-tighter">{log.text}</span>
                  </div>
                  <span className="text-zinc-600 shrink-0 font-bold ">{log.status}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {/* Subtle Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-black to-transparent pointer-events-none" />
        </div>

        {/* System Summary Bottom */}
        <div className="col-span-4 row-span-3 bg-black/50 border border-zinc-800 p-5 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="size-4 text-zinc-400" />
            <span className="text-[10px] font-black text-white">Neural core active</span>
          </div>
          <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="h-full w-1/3 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            />
          </div>
          <p className="text-[8px] text-zinc-600 leading-tight">
            Deterministic engine is operating at peak efficiency. No deviations detected in 4.2 million cycles.
          </p>
        </div>
      </div>
    </div>
  )
}

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
      setError(err.message || 'An error occurred during login')
      toast.error('Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-black overflow-hidden selection:bg-white/20">
      {/* Split Layout Container */}
      <div className="flex flex-col lg:flex-row w-full">

        {/* Right Side: Dashboard Animation */}
        <div className="hidden lg:flex w-full lg:w-[55%] bg-black relative items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(255,255,255,0.03),transparent_60%)]" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <SystemVisualization />
          </motion.div>
        </div>

        {/* Left Side: Auth Form */}
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
