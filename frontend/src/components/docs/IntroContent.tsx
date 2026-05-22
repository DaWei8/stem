'use client'

import { FileCode, Lock, Database, Cpu, Layout, Workflow, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

import { DocHeader } from './DocHeader'

export function IntroContent() {
  return (
    <>
      <DocHeader
        title={<>The Deterministic <br />System Engine</>}
        description="Master the architectural framework for high-stakes software. STEM provides the mathematical certainty required for mission-critical systems."
      />

      <div className="space-y-20 pb-32 max-w-3xl">
        <section id="foundation" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <FileCode className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Foundation</h2>
          </div>
          <div className="space-y-6 text-muted-foreground leading-relaxed text-md">
            <p>
              STEM (Software Testing & Engineering Manager) is not a design tool. It is a <span className="text-foreground font-semibold">formal verification environment</span> for software architecture. We believe that UI is ephemeral, but logic is foundational.
            </p>
            <p>
              By modeling your system into five distinct pillars, STEM allows you to simulate every possible user path and data mutation before a single line of production code is written.
            </p>
          </div>
        </section>

        <section id="the-five-pillars" className="space-y-10">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">The Five Pillars</h3>
            <p className="text-muted-foreground text-sm">Every STEM blueprint is built on these foundational structures.</p>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Identity', desc: 'Define roles, permissions, and actor behavior.', icon: Lock, color: 'text-blue-500' },
              { title: 'Schema', desc: 'Structured data definitions and validation rules.', icon: Database, color: 'text-green-500' },
              { title: 'Logic', desc: 'The deterministic engine and function registry.', icon: Cpu, color: 'text-purple-500' },
              { title: 'Design System', desc: 'Atomic UI components and theme tokens.', icon: Layout, color: 'text-amber-500' },
              { title: 'System Flows', desc: 'Visual orchestration of screens and data paths.', icon: Workflow, color: 'text-red-500' },
            ].map((pillar) => (
              <div key={pillar.title} className="flex items-center gap-6 p-5 bg-card border border-border rounded-2xl hover:bg-muted/30 transition-all">
                <div className={cn("size-12 rounded-xl bg-background border border-border flex items-center justify-center shadow-inner", pillar.color)}>
                  <pillar.icon className="size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-md leading-tight">{pillar.title}</h4>
                  <p className="text-xs text-muted-foreground font-medium mt-1">{pillar.desc}</p>
                </div>
                <ChevronRight className="size-4 ml-auto text-muted-foreground/50" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
