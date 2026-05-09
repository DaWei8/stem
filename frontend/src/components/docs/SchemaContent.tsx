'use client'

import { Table, Box, Link } from 'lucide-react'
import { DocHeader } from './DocHeader'

export function SchemaContent() {
  return (
    <>
      <DocHeader
        title={<>Data Schemas</>}
        description="Architect your system's data structure with rigid typing and validated relationships."
      />

      <div className="space-y-20 pb-32 max-w-3xl">
        <section id="entity-modeling" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Table className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Entity Modeling</h2>
          </div>
          <div className="space-y-6 text-muted-foreground leading-relaxed text-md">
            <p>
              The Schema pillar allows you to define <span className="text-foreground font-semibold">Entities</span> and their attributes. Unlike loose JSON blobs, STEM schemas are enforced at the database level using Supabase and verified by the Logic Engine.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-6 bg-card border border-border rounded-2xl flex items-start gap-6">
              <div className="size-10 bg-background border border-border rounded-lg flex items-center justify-center text-muted-foreground shrink-0">
                <Box className="size-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Strong Typing</h4>
                <p className="text-xs text-muted-foreground mt-1">Every field must have a defined primitive type or a reference to another entity.</p>
              </div>
            </div>
            <div className="p-6 bg-card border border-border rounded-2xl flex items-start gap-6">
              <div className="size-10 bg-background border border-border rounded-lg flex items-center justify-center text-muted-foreground shrink-0">
                <Link className="size-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Validated Relationships</h4>
                <p className="text-xs text-muted-foreground mt-1">Enforce referential integrity with one-to-one, one-to-many, and many-to-many bindings.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="schema-visualization" className="space-y-10">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">ERD Visualization</h3>
            <p className="text-muted-foreground text-sm">Visualize your system's data dependencies in real-time.</p>
          </div>
          <div className="aspect-video bg-muted/20 border border-border rounded-2xl flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--foreground)_0.5px,transparent_0.5px)] opacity-[0.03] bg-size-[20px_20px]" />
            <div className="p-4 bg-background border border-border rounded-lg text-[10px] font-mono text-muted-foreground group-hover:border-primary/20 transition-colors">
              [ ERD CANVAS PLACEHOLDER ]
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
