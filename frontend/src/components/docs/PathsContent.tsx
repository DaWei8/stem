'use client'

import { Workflow, GitMerge, Activity, CheckCircle } from 'lucide-react'
import { DocHeader } from './DocHeader'

export function PathsContent() {
  return (
    <>
      <DocHeader
        title={<>Deterministic Paths</>}
        description="Eliminating uncertainty by modeling every possible state transition in the system."
      />

      <div className="space-y-20 pb-32 max-w-3xl">
        <section id="state-transition-mapping" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Workflow className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">State Transition Mapping</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Every user action is modeled as a transition between defined states. The Logic Bot ensures that for every state, there is a deterministic "Happy Path" and a set of gracefully handled "Error Paths."
          </p>
        </section>

        <section id="branching-logic" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <GitMerge className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Branching Logic</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Model complex conditional flows using node-based branching. STEM visualizes how data decisions impact the user journey, ensuring no "Dead Ends" exist in your architecture.
          </p>
        </section>

        <section id="path-coverage" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <CheckCircle className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Path Coverage</h2>
          </div>
          <div className="p-8 bg-card border border-border rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground ">Bot Status</p>
              <h4 className="text-lg font-bold text-foreground">100% Logic Coverage</h4>
            </div>
            <Activity className="size-8 text-green-500 animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mt-4">
            The Logic Bot provides a real-time "Coverage Metric," representing the percentage of system states that have been formally verified.
          </p>
        </section>
      </div>
    </>
  )
}
