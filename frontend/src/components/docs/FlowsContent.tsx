'use client'

import { Workflow, PlayCircle, GitMerge, Activity, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

import { DocHeader } from './DocHeader'
import { StackItem } from './StackItem'

export function FlowsContent() {
  return (
    <>
      <DocHeader
        title={<>System Flows</>}
        description="The visual orchestration layer. Map user journeys, state transitions, and asynchronous side effects."
      />

      <div className="space-y-20 pb-32 max-w-3xl">
        <section id="pathway-orchestration" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Workflow className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Pathway Orchestration</h2>
          </div>
          <div className="space-y-6 text-muted-foreground leading-relaxed text-md">
            <p>
              Flows are the glue that binds the other four pillars together. They define how an <span className="text-foreground font-semibold">Actor</span> interacts with <span className="text-foreground font-semibold">UI Components</span> to mutate <span className="text-foreground font-semibold">Schema Data</span> through <span className="text-foreground font-semibold">Logic Functions</span>.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StackItem title="Visual Mapping" desc="Node-based editor for screen transitions and data flows." icon={<GitMerge className="size-4" />} />
            <StackItem title="Live Simulation" desc="Test user paths in real-time within the canvas." icon={<PlayCircle className="size-4" />} />
          </div>
        </section>

        <section id="side-effects" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Activity className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Side Effects</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Manage asynchronous operations like API calls, webhooks, and complex state synchronization. STEM ensures every side effect is tracked and audited by the Logic Bot.
          </p>
        </section>
      </div>
    </>
  )
}
