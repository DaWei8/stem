'use client'

import { Zap, Cpu, Globe } from 'lucide-react'
import { DocHeader } from './DocHeader'

export function WasmRuntimeContent() {
  return (
    <>
      <DocHeader
        title={<>WASM Runtime</>}
        description="Executing formally verified logic at the Edge with near-native performance."
      />

      <div className="space-y-20 pb-32 max-w-3xl">
        <section id="isolation-and-safety" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Zap className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Isolation & Safety</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            WebAssembly provides a sandboxed execution environment. STEM's WASM runtime ensures that your system logic cannot access unauthorized memory or perform illegal side effects, maintaining the "Deterministic" guarantee across distributed systems.
          </p>
        </section>

        <section id="edge-orchestration" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Globe className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Edge Orchestration</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Logic compiled to WASM is deployed to global edge locations. This reduces latency to under 10ms for state evaluation, allowing your system to remain responsive while performing complex architectural verification.
          </p>
        </section>

        <section id="binary-optimization" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Cpu className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Binary Optimization</h2>
          </div>
          <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>STEM automatically optimizes WASM binaries for size and speed. Through dead-code elimination and profile-guided optimization, we ensure that even complex logic remains lightweight and efficient.</p>
          </div>
        </section>
      </div>
    </>
  )
}
