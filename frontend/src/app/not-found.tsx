'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center p-8 selection:bg-white/20">

      {/* Animated Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="relative flex flex-col items-center text-center max-w-md"
      >
        {/* Error Code */}
        <div className="relative mb-10">
          <span
            className="text-[160px] font-black leading-none tracking-tighter select-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            404
          </span>
        </div>

        {/* Message */}
        <div className="space-y-3 mb-12">
          <h1 className="text-6xl font-black tracking-tight mb-2">Page not found</h1>
          <p className="text-md text-zinc-500 font-medium leading-relaxed max-w-lg">
            The page you are looking for does not exist in this registry.
            It may have been removed, relocated, or never created.
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-3 mb-12 px-4 py-2 border border-zinc-800/50 bg-black/30">
          <div className="size-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <span className="text-[10px] font-mono text-zinc-500">
            RESOLUTION_FAILED · PATH_NOT_FOUND · CODE_404
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => router.back()}
            className="flex-1 flex items-center justify-center gap-2.5 h-12 border border-zinc-800 bg-black/50 text-sm font-bold text-zinc-400 hover:text-white hover:bg-black hover:border-zinc-600 transition-all group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            Go back
          </button>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2.5 h-12 bg-white text-black text-sm font-black hover:bg-zinc-200 transition-all group"
          >
            <Home className="size-4 group-hover:scale-110 transition-transform" />
            Go home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
