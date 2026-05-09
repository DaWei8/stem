'use client'

import { LayoutTemplate, Database, Cpu, ShieldCheck, Zap, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'

export function FeaturesSection() {
  const features = [
    {
      title: 'Visual Logic Engine',
      description: 'Model complex state machines and user flows with a deterministic visual canvas.',
      icon: LayoutTemplate,
    },
    {
      title: 'Unified Variable Registry',
      description: 'Define your data once. Sync variables across UI, database, and logic layers automatically.',
      icon: Database,
    },
    {
      title: 'Rust-Powered Simulation',
      description: 'Execute high-fidelity simulations of your system logic using our WASM-compiled Rust engine.',
      icon: Cpu,
    },
    {
      title: 'Deterministic Validation',
      description: 'The Logic Bot automatically audits every path to ensure zero dead-ends or security leaks.',
      icon: ShieldCheck,
    },
    {
      title: 'Instant Exports',
      description: 'Export your system as a complete .stem manifest or boilerplate code for Next.js and Supabase.',
      icon: Zap,
    },
    {
      title: 'Collaborative Architecting',
      description: 'Work together on system design with real-time feedback and versioned variable tracking.',
      icon: Share2,
    },
  ]

  return (
    <section id="features" className="py-32 px-12 lg:px-24 bg-muted/30 dark:bg-black/50">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4 mb-24">
          <h2 className="text-xs font-medium  text-foreground/40">
            Platform Capabilities
          </h2>
          <h3 className="text-4xl lg:text-6xl font-black tracking-tighter max-w-2xl text-foreground">
            Engineered for <span className="text-foreground/20">Total System Control.</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-background p-12 space-y-6 hover:bg-muted/50 transition-colors group cursor-default"
            >
              <div className="size-12 bg-muted flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                <feature.icon className="size-5" />
              </div>
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-foreground">{feature.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
