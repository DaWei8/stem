'use client'

import { motion } from 'framer-motion'

export function UseCasesSection() {
  const useCases = [
    {
      id: '01',
      title: 'Fintech Infrastructure',
      description: 'Model complex multi-party transaction flows and verification gates with absolute certainty.',
    },
    {
      id: '02',
      title: 'Enterprise SaaS',
      description: 'Design multi-tenant architectures and granular permission systems that scale without logic leaks.',
    },
    {
      id: '03',
      title: 'E-commerce Ecosystems',
      description: 'Sync inventory variables across global nodes and simulate checkout flows under peak load conditions.',
    },
    {
      id: '04',
      title: 'Governance Systems',
      description: 'Architect transparent voting or compliance systems where every state change must be deterministic.',
    },
  ]

  return (
    <section id="use-cases" className="py-32 px-12 lg:px-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-8 mb-24">
          <div className="space-y-4">
            <h2 className="text-xs font-bold  text-foreground/40">
              Applications
            </h2>
            <h3 className="text-4xl lg:text-6xl font-black tracking-tighter text-foreground">
              Built for <span className="text-foreground/20">High Stakes.</span>
            </h3>
          </div>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed pb-2">
            STEM is the bedrock for systems that cannot afford to fail. From financial ledgers to critical health infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {useCases.map((useCase) => (
            <div key={useCase.id} className="group cursor-default border-t border-border pt-12">
              <div className="flex gap-8">
                <span className="text-4xl font-black text-muted transition-colors duration-500 group-hover:text-foreground">
                  {useCase.id}
                </span>
                <div className="space-y-4">
                  <h4 className="text-xl font-bold tracking-tight text-foreground">{useCase.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                    {useCase.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
