'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function FAQSection() {
  const faqs = [
    {
      question: 'What makes STEM deterministic?',
      answer: 'STEM uses a strict variable registry where every data point is mapped to a unique, immutable UUID. Our Rust-powered simulation engine validates every possible state transition, ensuring that your system logic is mathematically consistent and free of dead-ends.',
    },
    {
      question: 'How does the Logic Bot simulation work?',
      answer: 'The Logic Bot executes your system design using the compiled WASM binary of our Rust engine. It simulates thousands of user journeys across your pages, checking every constraint, permission gate, and variable dependency to identify potential failures before you write a single line of production code.',
    },
    {
      question: 'Can I export my design to real code?',
      answer: 'Yes. STEM generates a comprehensive .stem manifest that includes your database schema (SQL), TypeScript interfaces, and state-machine logic. You can use this to bootstrap Next.js and Supabase projects instantly.',
    },
    {
      question: 'Is STEM built for collaborative teams?',
      answer: 'Absolutely. STEM supports multi-user collaboration with real-time updates. The centralized variable registry and logic layer ensure that your entire team is working from the same source of truth.',
    },
  ]

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faqs" className="py-32 px-12 lg:px-24 w-full bg-muted/30 dark:bg-black/50">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-4 mb-24 text-center">
          <h2 className="text-[10px] font-bold  text-foreground/40">
            Common Inquiries
          </h2>
          <h3 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground">
            Frequently Asked  <span className="text-foreground/20">Questions.</span>
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border bg-background overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-8 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="text-md font-bold tracking-tight text-foreground">{faq.question}</span>
                {openIndex === index ? (
                  <Minus className="size-4 text-foreground" />
                ) : (
                  <Plus className="size-4 text-muted-foreground" />
                )}
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="p-8 pt-0 text-sm text-muted-foreground leading-relaxed max-w-2xl">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
