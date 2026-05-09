'use client'

import { Lock, Shield, UserCheck, Key, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

import { DocHeader } from './DocHeader'
import { StackItem } from './StackItem'

export function IdentityContent() {
  return (
    <>
      <DocHeader
        title={<>Identity Registry</>}
        description="Define the actors, roles, and permissions that govern your system's security boundaries."
      />

      <div className="space-y-20 pb-32 max-w-3xl">
        <section id="actors-and-roles" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <UserCheck className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Actors & Roles</h2>
          </div>
          <div className="space-y-6 text-muted-foreground leading-relaxed text-md">
            <p>
              In STEM, every interaction is attributed to an <span className="text-foreground font-semibold">Actor</span>. Actors are grouped into <span className="text-foreground font-semibold">Roles</span>, which serve as the primary unit for permission modeling.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StackItem title="Super Admin" desc="Full system override and architectural management." icon={<Shield className="size-4" />} />
            <StackItem title="Editor" desc="Project-level modifications and flow orchestration." icon={<Key className="size-4" />} />
          </div>
        </section>

        <section id="permission-modeling" className="space-y-10">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Permission Modeling</h3>
            <p className="text-muted-foreground text-sm">Fine-grained control over system resources.</p>
          </div>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Permissions are modeled as deterministic rules that evaluate against the system state. Unlike traditional RBAC, STEM allows for attribute-based access control (ABAC) that can be formally verified.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
