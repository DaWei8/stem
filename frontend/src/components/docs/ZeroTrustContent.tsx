'use client'

import { Lock, ShieldCheck, EyeOff } from 'lucide-react'
import { DocHeader } from './DocHeader'

export function ZeroTrustContent() {
  return (
    <>
      <DocHeader
        title={<>Zero-Trust Model</>}
        description="Architectural security where trust is never assumed and verification is continuous."
      />

      <div className="space-y-20 pb-32 max-w-3xl">
        <section id="identity-verification" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Lock className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Identity Verification</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            In a Zero-Trust environment, every request is authenticated and authorized based on a dynamic set of attributes. STEM integrates multi-factor identity verification into the Logic core, ensuring that no mutation occurs without a verified actor.
          </p>
        </section>

        <section id="least-privilege" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <ShieldCheck className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Least Privilege Access</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            By default, all actors have zero permissions. Access is granted only for specific resources and durations. The Logic Bot enforces the Principle of Least Privilege (PoLP) by flagging any broad or overly permissive rules in your blueprint.
          </p>
        </section>

        <section id="micro-segmentation" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <EyeOff className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Micro-Segmentation</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            STEM isolates data schemas and logic functions into discrete security zones. Even if one part of the system is compromised, the blast radius is strictly contained by formal security boundaries.
          </p>
        </section>
      </div>
    </>
  )
}
