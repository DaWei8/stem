'use client'

import { Zap } from 'lucide-react'
import { CodeBlock } from './CodeBlock'

interface LogicContentProps {
  handleCopy: (t: string) => void
  copied: boolean
}

import { DocHeader } from './DocHeader'

export function LogicContent({ handleCopy, copied }: LogicContentProps) {
  return (
    <>
      <DocHeader
        title={<>Deterministic Logic Engine</>}
        description="The heart of STEM. Learn how to write immutable system logic in Rust."
      />

      <div className="space-y-20 pb-32 max-w-3xl">
        <section id="wasm-compilation" className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-muted/50 border border-border rounded-xl flex items-center justify-center">
              <Zap className="size-5 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold">WASM Compilation</h2>
          </div>
          <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>Every piece of logic you write in STEM is compiled to WebAssembly. This ensures that the code running in your simulation is identical to the code running in production.</p>
          </div>

          <CodeBlock
            title="logic_engine.rs"
            code={`pub fn evaluate_state(context: &SystemContext) -> Result<SystemState, Error> {
  let params = context.get_params();
  match params.validate() {
    Ok(_) => Ok(SystemState::Stable),
    Err(e) => Err(Error::from(e)),
  }
}`}
            handleCopy={handleCopy}
            copied={copied}
          />
        </section>
      </div>
    </>
  )
}
