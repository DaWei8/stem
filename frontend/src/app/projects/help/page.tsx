'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, Book, MessageSquare, Terminal, HelpCircle, ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function HelpPage() {
  const categories = [
    {
      title: 'Getting Started',
      icon: Book,
      items: [
        'Introduction to Stem',
        'Your First Deterministic Flow',
        'Understanding the 6 Pillars',
        'Workspace Configuration'
      ]
    },
    {
      title: 'Logic Engine (WASM)',
      icon: Terminal,
      items: [
        'Rust to Wasm Bridge',
        'Writing Custom Logic',
        'The evaluate() Method',
        'Debugging Wasm Modules'
      ]
    },
    {
      title: 'Architecture & Pillars',
      icon: HelpCircle,
      items: [
        'Variable Registry Guide',
        'Schema Design Patterns',
        'Identity & Permissions',
        'Canvas Interaction API'
      ]
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-heading">
      <header className="flex items-center justify-between px-8 py-6 border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button size="icon" className="bg-black border border-zinc-800 hover:bg-zinc-800 rounded-md size-8">
              <ChevronLeft className="size-4" />
            </Button>
          </Link>
          <h1 className="text-sm font-bold text-zinc-500 ">Global / Help & Docs</h1>
        </div>
        <Button variant="outline" className="rounded-md border-zinc-800 h-10 px-6 text-xs font-bold gap-2 hover:bg-black transition-none">
          <MessageSquare className="size-3" />
          Contact Support
        </Button>
      </header>

      <main className="max-w-6xl mx-auto w-full p-8 space-y-16">
        {/* Hero Section */}
        <section className="text-center py-12 space-y-4">
          <h2 className="text-4xl font-black tracking-tighter italic">Stem Knowledge Base</h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-sm leading-relaxed">
            The comprehensive guide for building high-integrity systems with the STEM deterministic engine.
          </p>
        </section>

        {/* Documentation Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                <cat.icon className="size-5 text-white" />
                <h3 className="text-sm font-black">{cat.title}</h3>
              </div>
              <ul className="space-y-4">
                {cat.items.map((item, i) => (
                  <li key={i}>
                    <button className="flex items-center justify-between w-full text-zinc-400 hover:text-white group transition-none">
                      <span className="text-xs font-medium">{item}</span>
                      <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition-none" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Community & External Links */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
          <div className="p-8 border border-zinc-800 bg-black/20 space-y-4 hover:border-zinc-500 transition-none cursor-pointer">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <ExternalLink className="size-4" />
              Developer API Reference
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Deep dive into the STEM engine protocols and how to integrate your own tools via our CLI.
            </p>
          </div>
          <div className="p-8 border border-zinc-800 bg-black/20 space-y-4 hover:border-zinc-500 transition-none cursor-pointer">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <ExternalLink className="size-4" />
              Community Blueprint Repo
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Explore and import deterministic blueprints shared by the elite engineer community.
            </p>
          </div>
        </section>

        <section className="text-center pt-24 pb-12">
          <p className="text-[10px] text-zinc-700 font-bold tracking-[0.2em]">
            Empowering deterministic systems since 2026
          </p>
        </section>
      </main>
    </div>
  )
}
