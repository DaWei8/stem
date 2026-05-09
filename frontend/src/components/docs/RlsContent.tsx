'use client'

import { Shield, Database, Lock, CheckCircle } from 'lucide-react'
import { DocHeader } from './DocHeader'

export function RlsContent() {
  return (
    <>
      <DocHeader
        title={<>RLS Orchestration</>}
        description="Deterministic database security through Row Level Security (RLS) and identity binding."
      />

      <div className="space-y-20 pb-32 max-w-3xl">
        <section id="policy-generation" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Database className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Policy Generation</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            STEM automatically generates SQL RLS policies based on your Identity and Schema pillars. These policies are injected directly into Supabase, ensuring that your data is protected even outside the application layer.
          </p>
        </section>

        <section id="identity-binding" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Lock className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Identity Binding</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Every database query is automatically bound to the authenticated actor's `user_id`. STEM's orchestration layer ensures that RLS policies have access to the necessary system context for complex permission evaluations.
          </p>
        </section>

        <section id="policy-verification" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Shield className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Policy Verification</h2>
          </div>
          <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="size-4 text-green-500" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase">Audit: PASS</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The Logic Bot performs exhaustive SQL analysis to ensure that your RLS policies contain no vulnerabilities like infinite recursion or bypass conditions.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
