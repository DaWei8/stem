'use client'

import { Shield, Activity, FileText, AlertCircle } from 'lucide-react'
import { DocHeader } from './DocHeader'

export function AuditContent() {
  return (
    <>
      <DocHeader
        title={<>Audit Protocols</>}
        description="The Logic Bot's primary directive: continuous formal verification of system integrity."
      />

      <div className="space-y-20 pb-32 max-w-3xl">
        <section id="verification-pipelines" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Shield className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Verification Pipelines</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Every commit to your STEM blueprint triggers an automated audit. The Logic Bot analyzes your flows against your schema and identity models to identify "Unreachable States" or "Security Leaks."
          </p>
        </section>

        <section id="audit-logs" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <FileText className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Immutable Audit Logs</h2>
          </div>
          <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>STEM maintains an immutable record of every logic evaluation. These logs are stored as hashed blocks, providing an unalterable trail for regulatory compliance and debugging.</p>
          </div>
        </section>

        <section id="error-classification" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <AlertCircle className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Error Classification</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-card border border-border rounded-2xl">
              <h4 className="font-bold text-red-500 text-xs uppercase tracking-widest">Type A: Violation</h4>
              <p className="text-[11px] text-muted-foreground mt-2">A direct breach of security or logic invariants. System deployment is blocked.</p>
            </div>
            <div className="p-6 bg-card border border-border rounded-2xl">
              <h4 className="font-bold text-amber-500 text-xs uppercase tracking-widest">Type B: Warning</h4>
              <p className="text-[11px] text-muted-foreground mt-2">A non-critical optimization or "edge case" identified by the Bot.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
