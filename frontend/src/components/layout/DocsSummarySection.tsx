'use client'

import { Button } from '@/components/ui/button'
import { BookOpen, Terminal, Box, Activity } from 'lucide-react'

export function DocsSummarySection() {
  const docs = [
    {
      title: 'Quickstart Guide',
      icon: BookOpen,
      items: ['System Initialization', 'Workspace Setup', 'First Project'],
    },
    {
      title: 'Logic Engine',
      icon: Terminal,
      items: ['Rust/WASM Core', 'Deterministic Simulation', 'Audit Logs'],
    },
    {
      title: 'Database & Schema',
      icon: Box,
      items: ['ERD Modeling', 'RLS Policies', 'Variable Binding'],
    },
    {
      title: 'The Logic Bot',
      icon: Activity,
      items: ['Path Finding', 'Security Auditing', 'Coverage Reports'],
    },
  ]

  return (
    <section id="docs-summary" className="py-32 px-12 lg:px-24 w-full bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-[10px] font-bold  text-foreground/40">
                Knowledge Base
              </h2>
              <h3 className="text-4xl lg:text-6xl font-black tracking-tighter text-foreground">
                Master the <span className="text-foreground/20">Deterministic Engine.</span>
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Our comprehensive documentation covers everything from basic system modeling to advanced Rust-powered simulation techniques. Start building with absolute confidence.
            </p>
            <div className="pt-4">
              <Button variant="outline" href="/docs" size="lg" className="px-12 border-border hover:bg-muted transition-none">
                Explore The Docs
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {docs.map((doc) => (
              <div key={doc.title} className="p-8 bg-muted/30 border border-border space-y-6 rounded-lg group hover:border-foreground/20 transition-colors">
                <doc.icon className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <div className="space-y-4">
                  <h4 className="text-sm font-bold tracking-tight text-foreground">{doc.title}</h4>
                  <ul className="space-y-2">
                    {doc.items.map((item) => (
                      <li key={item} className="text-[10px] text-muted-foreground/60 font-medium  flex items-center gap-2">
                        <div className="size-1 bg-border rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
