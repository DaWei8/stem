'use client'

import { useState, useEffect } from 'react'
import { Monitor, Laptop, Tablet, Smartphone, AlertCircle, Terminal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function ResponsiveGuard({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      // Threshold for "large tablet/laptop" is usually 1024px
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Avoid flash of content while checking
  if (isMobile === null) return <div className="fixed inset-0 bg-black" />

  return (
    <>
      <AnimatePresence>
        {isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 bg-black flex flex-col items-center justify-center p-8 text-center"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-zinc-800 via-transparent to-transparent" />
              <div className="w-full h-full bg-[url('/grid.svg')] bg-[length:50px_50px]" />
            </div>

            <div className="relative max-w-md w-full space-y-12">
              {/* Visual Icon Group */}
              <div className="flex items-center justify-center gap-6">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
                  <Smartphone className="size-10 text-zinc-600 relative z-10" />
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1"
                  >
                    <AlertCircle className="size-4 text-red-500" />
                  </motion.div>
                </div>

                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Terminal className="size-6 text-zinc-800" />
                </motion.div>

                <div className="relative">
                  <div className="absolute -inset-4 bg-emerald-500/10 rounded-full blur-2xl" />
                  <div className="flex items-center gap-2 relative z-10">
                    <Laptop className="size-12 text-white" />
                    <Monitor className="size-10 text-zinc-400" />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-none mb-4">
                  <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-black  text-zinc-400">Viewport Constraint</span>
                </div>
                <h1 className="text-3xl font-black text-white tracking-tighter leading-none">
                  HIGH-FIDELITY <br /> DISPLAY REQUIRED
                </h1>
                <p className="text-sm font-bold text-zinc-500 leading-relaxed max-w-[280px] mx-auto">
                  STEM's deterministic blueprinting engine requires a larger viewport for technical precision.
                </p>
              </div>

              {/* CTA / Instructions */}
              <div className="pt-8 border-t border-zinc-900">
                <p className="text-[10px] font-black  text-zinc-600 mb-6">
                  Recommended Environments
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 flex flex-col items-center gap-2 group hover:border-zinc-500 transition-colors">
                    <Laptop className="size-4 text-zinc-400 group-hover:text-white transition-colors" />
                    <span className="text-[9px] font-black text-zinc-500  group-hover:text-white">Laptops</span>
                  </div>
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 flex flex-col items-center gap-2 group hover:border-zinc-500 transition-colors">
                    <Monitor className="size-4 text-zinc-400 group-hover:text-white transition-colors" />
                    <span className="text-[9px] font-black text-zinc-500  group-hover:text-white">Desktops</span>
                  </div>
                </div>
              </div>

              <div className="pt-12">
                <p className="text-[9px] font-mono text-zinc-700 italic">
                  STEM Core v1.0.4 | Architectural Integrity Protocol
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "h-full w-full transition-opacity duration-500",
        isMobile ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        {children}
      </div>
    </>
  )
}
