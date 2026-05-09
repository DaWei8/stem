'use client'

import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/Navbar'
import { HeroVisual } from '@/components/layout/HeroVisual'
import { FeaturesSection } from '@/components/layout/FeaturesSection'
import { UseCasesSection } from '@/components/layout/UseCasesSection'
import { DocsSummarySection } from '@/components/layout/DocsSummarySection'
import { FAQSection } from '@/components/layout/FAQSection'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { ChevronRight, ShieldCheck, Cpu, Terminal } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-x-hidden bg-background selection:bg-white/20">
      <Navbar />

      {/* Hero Section */}
      <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center justify-center  relative pt-20 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.03)_0%,transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.02)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="flex-1 flex flex-col justify-center p-8 lg:px-24 xl:pl-32 z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10 max-w-2xl w-full"
          >
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-8xl xl:text-9xl font-black leading-[0.75] tracking-tighter text-foreground">
                Stem<span className="text-zinc-800">.</span>
              </h1>

              <div className="flex items-center gap-4">
                <div className="h-px w-8 bg-zinc-800" />
                <p className="text-xs font-mono font-bold text-zinc-500 tracking-widest uppercase">
                  Systemic Technical Engine Manager
                </p>
              </div>
            </div>

            <p className="text-md lg:text-lg text-zinc-400 leading-relaxed max-w-lg font-medium">
              The formal verification environment for mission-critical software.
              Architect, simulate, and deploy with <span className="text-white">mathematical certainty</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
              <Button
                size="lg"
                variant="primary"
                href="/auth/login"
                className="w-full sm:w-auto px-10 h-14 bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 group"
              >
                Get Started
                <ChevronRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                href="/docs"
                className="w-full sm:w-auto px-10 h-14 border-zinc-800 hover:bg-black/50 backdrop-blur-sm transition-all active:scale-95 text-zinc-400 hover:text-white"
              >
                View Docs
              </Button>
            </div>
          </motion.div>
        </div>
        <HeroVisual />
      </main>

      {/* Secondary Sections */}
      <FeaturesSection />
      <UseCasesSection />
      <DocsSummarySection />
      <FAQSection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
