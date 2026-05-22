'use client'

import { Cpu, Shield, Workflow } from 'lucide-react'
import { DocHeader } from './DocHeader'

export function ConceptsContent() {
  return (
    <>
      <DocHeader
        title={<>Core Concepts</>}
        description="Understand the mental model and theoretical foundation of the Software Testing & Engineering Manager."
      />

      <div className="space-y-20 pb-32 max-w-3xl">
        <section id="determinism" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Cpu className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Determinism</h2>
          </div>
          <div className="space-y-6 text-muted-foreground leading-relaxed text-md">
            <p>
              In STEM, determinism means that for any given input and system state, the output is <span className="text-foreground font-semibold">always identical</span>. We eliminate "ghost logic" and race conditions by isolating state mutations into a formally verified logic core.
            </p>
          </div>
        </section>

        <section id="formal-verification" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Shield className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Formal Verification</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Unlike traditional unit testing, STEM uses formal methods to prove that your system adheres to its architectural specifications. The Logic Bot traverses every possible path in your flow to ensure no security or logic violations can occur.
          </p>
        </section>

        <section id="the-blueprint-model" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Workflow className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">The Blueprint Model</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your system is defined as a blueprint—a collection of five interconnected pillars. This blueprint is the "Single Source of Truth" from which the database schema, security policies, and logic runtime are derived.
          </p>
        </section>
      </div>
    </>
  )
}
