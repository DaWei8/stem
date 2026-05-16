'use client'

import { Layout, Palette, Type, Box, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

import { DocHeader } from './DocHeader'
import { StackItem } from './StackItem'

export function DesignContent() {
  return (
    <>
      <DocHeader
        title={<>Design System</>}
        description="Unified UI architecture. Define your brand's DNA through tokens, components, and layout patterns."
      />

      <div className="space-y-20 pb-32 max-w-3xl">
        <section id="theme-tokens" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Palette className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Theme Tokens</h2>
          </div>
          <div className="space-y-6 text-muted-foreground leading-relaxed text-md">
            <p>
              STEM Design System is built on a foundation of <span className="text-foreground font-semibold">Tokens</span>. These are the smallest units of design: colors, spacing, typography, and shadows.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TokenPreview color="bg-background" label="Background" />
            <TokenPreview color="bg-card" label="Surface" />
            <TokenPreview color="bg-foreground" label="Foreground" />
            <TokenPreview color="bg-muted-foreground" label="Muted" />
          </div>
        </section>

        <section id="atomic-components" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Box className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Atomic Components</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Every component in STEM is mapped to its deterministic logic counterpart. This ensures that a "Button" in the UI editor always behaves according to its architectural specification.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StackItem title="Navigation" desc="State-aware headers and sidebars." icon={<Layout className="size-4" />} />
            <StackItem title="Typography" desc="Dynamic scale for all screen sizes." icon={<Type className="size-4" />} />
          </div>
        </section>
      </div>
    </>
  )
}

function TokenPreview({ color, label }: { color: string; label: string }) {
  return (
    <div className="space-y-2">
      <div className={cn("aspect-square rounded-xl border border-border shadow-inner", color)} />
      <p className="text-[10px] font-bold text-muted-foreground  text-center">{label}</p>
    </div>
  )
}
