'use client'

import { Key, Users, Lock } from 'lucide-react'
import { DocHeader } from './DocHeader'

export function RbacContent() {
  return (
    <>
      <DocHeader
        title={<>Access Control</>}
        description="Fine-grained management of system resources through advanced RBAC and ABAC patterns."
      />

      <div className="space-y-20 pb-32 max-w-3xl">
        <section id="resource-isolation" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Lock className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Resource Isolation</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            In STEM, every resource is classified into a security domain. Access control rules are formally defined to ensure that actors can only interact with resources within their authorized domains, preventing cross-tenant data leakage.
          </p>
        </section>

        <section id="dynamic-authorizers" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Key className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Dynamic Authorizers</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Access decisions can be delegated to "Dynamic Authorizers"—small Rust functions that evaluate permissions in real-time based on the current system state, actor attributes, and environmental variables.
          </p>
        </section>

        <section id="role-hierarchy" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Users className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Role Hierarchy</h2>
          </div>
          <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>STEM supports complex role hierarchies where permissions can be inherited or explicitly overridden. The visual identity editor allows you to map these relationships and simulate the resulting permission matrix.</p>
          </div>
        </section>
      </div>
    </>
  )
}
