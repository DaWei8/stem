'use client'

import { Layers, Globe, Database, Cpu, Workflow } from 'lucide-react'
import { StackItem } from './StackItem'
import { DocHeader } from './DocHeader'

export function ArchitectureContent() {
  return (
    <>
      <DocHeader
        title={<>Hybrid Architecture</>}
        description="A high-performance infrastructure combining Next.js orchestration with a Rust-powered logic core."
      />

      <div className="space-y-20 pb-32 max-w-3xl">
        <section id="the-stack" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Layers className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">The Technical Stack</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StackItem title="Frontend" desc="Next.js 14 App Router with Tailwind CSS for rapid UI orchestration." icon={<Globe className="size-4" />} />
            <StackItem title="Backend" desc="Supabase for identity, real-time database, and RLS orchestration." icon={<Database className="size-4" />} />
            <StackItem title="Core Engine" desc="Rust-powered WASM module for deterministic system simulation." icon={<Cpu className="size-4" />} />
            <StackItem title="Visualizer" desc="@xyflow/react for node-based system design and flow mapping." icon={<Workflow className="size-4" />} />
          </div>
        </section>

        <section id="execution-flow" className="space-y-8">
          <h3 className="text-xl font-bold">Execution Flow</h3>
          <div className="p-8 bg-card border border-border rounded-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs">1</div>
              <p className="text-sm text-muted-foreground">Blueprint defined in the visual canvas.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-full bg-muted text-foreground flex items-center justify-center font-bold text-xs">2</div>
              <p className="text-sm text-muted-foreground">Logic compiled to WASM and shipped to the Edge.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-full bg-muted text-foreground flex items-center justify-center font-bold text-xs">3</div>
              <p className="text-sm text-muted-foreground">Logic Bot simulates every permutation of the flow.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
