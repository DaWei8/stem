'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  Book, Terminal, Cpu, Shield, Database, Layout,
  Search, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// Modular Content Components
import { IntroContent } from '@/components/docs/IntroContent'
import { ArchitectureContent } from '@/components/docs/ArchitectureContent'
import { LogicContent } from '@/components/docs/LogicContent'
import { PlaceholderContent } from '@/components/docs/PlaceholderContent'
import { IdentityContent } from '@/components/docs/IdentityContent'
import { SchemaContent } from '@/components/docs/SchemaContent'
import { DesignContent } from '@/components/docs/DesignContent'
import { FlowsContent } from '@/components/docs/FlowsContent'
import { ConceptsContent } from '@/components/docs/ConceptsContent'
import { InstallContent } from '@/components/docs/InstallContent'
import { AuditContent } from '@/components/docs/AuditContent'
import { WasmRuntimeContent } from '@/components/docs/WasmRuntimeContent'
import { PathsContent } from '@/components/docs/PathsContent'
import { ZeroTrustContent } from '@/components/docs/ZeroTrustContent'
import { RlsContent } from '@/components/docs/RlsContent'
import { RbacContent } from '@/components/docs/RbacContent'

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSlug, setActiveSlug] = useState('intro')
  const [copied, setCopied] = useState(false)

  const categories = [
    {
      title: 'Getting Started',
      icon: Book,
      items: [
        { name: 'Introduction', slug: 'intro' },
        { name: 'Architecture', slug: 'architecture' },
        { name: 'Core Concepts', slug: 'concepts' },
        { name: 'Installation', slug: 'install' },
      ],
    },
    {
      title: 'Modeling Pillars',
      icon: Layout,
      items: [
        { name: 'Identity Registry', slug: 'identity' },
        { name: 'Data Schemas', slug: 'schema' },
        { name: 'Logic Engine', slug: 'logic' },
        { name: 'Design System', slug: 'design' },
        { name: 'System Flows', slug: 'flows' },
      ],
    },
    {
      title: 'Logic Bot',
      icon: Terminal,
      items: [
        { name: 'Audit Protocols', slug: 'audits' },
        { name: 'WASM Runtime', slug: 'wasm' },
        { name: 'Deterministic Paths', slug: 'paths' },
      ],
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { name: 'Zero-Trust Model', slug: 'zero-trust' },
        { name: 'RLS Orchestration', slug: 'rls' },
        { name: 'Access Control', slug: 'rbac' },
      ],
    },
  ]

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeItem = categories.flatMap(c => c.items).find(i => i.slug === activeSlug) || categories[0].items[0]
  const activeCategory = categories.find(c => c.items.some(i => i.slug === activeSlug)) || categories[0]

  return (
    <div className="min-h-screen bg-background font-heading text-foreground flex flex-col selection:bg-foreground/10">
      <Navbar />

      <div className="flex-1 flex max-w-[1600px] mx-auto w-full pt-20">
        {/* Sidebar */}
        <aside className="w-80 hidden lg:flex flex-col border-r border-border h-[calc(100vh-5rem)] sticky top-20 overflow-y-auto px-8 py-10 scrollbar-hide">
          <div className="relative mb-10 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/30 border border-border rounded-lg py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-primary/20 focus:ring-1 focus:ring-primary/10 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-border bg-muted text-[9px] font-bold text-muted-foreground">
              ⌘K
            </div>
          </div>

          <nav className="space-y-10">
            {categories.map((cat) => {
              const filteredItems = cat.items.filter(i =>
                i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cat.title.toLowerCase().includes(searchQuery.toLowerCase())
              )

              if (filteredItems.length === 0 && searchQuery) return null

              return (
                <div key={cat.title} className="space-y-4">
                  <div className="flex items-center gap-2.5 text-zinc-400">
                    <cat.icon className="size-3.5" />
                    <h3 className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-600">
                      {cat.title}
                    </h3>
                  </div>
                  <ul className="space-y-1 border-l border-border ml-1.5">
                    {filteredItems.map((item) => (
                      <li key={item.slug}>
                        <button
                          onClick={() => setActiveSlug(item.slug)}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm transition-all relative flex items-center group",
                            activeSlug === item.slug
                              ? "text-foreground font-semibold"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {activeSlug === item.slug && (
                            <motion.div
                              layoutId="active-indicator"
                              className="absolute left-0 w-px h-full bg-primary shadow-[0_0_8px_var(--primary)]"
                            />
                          )}
                          {item.name}
                          {activeSlug === item.slug && <ChevronRight className="size-3 ml-auto opacity-40" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </nav>

          <div className="mt-auto pt-10 border-t border-border">
            <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-muted-foreground">SYSTEM STATUS</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">All engines operating within deterministic parameters.</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-8 lg:px-20 py-10 lg:py-16 max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-16"
            >
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                <span>Docs</span>
                <ChevronRight className="size-3" />
                <span>{activeCategory.title}</span>
                <ChevronRight className="size-3 text-muted-foreground/60" />
                <span className="text-muted-foreground/80">{activeItem.name}</span>
              </div>

              {/* Page Content Mapper */}
              <DocContent slug={activeSlug} handleCopy={handleCopy} copied={copied} />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Table of Contents */}
        <aside className="w-64 hidden xl:flex flex-col h-[calc(100vh-5rem)] sticky top-20 py-16 px-6 border-l border-border/50">
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">On this page</h4>
            <nav className="space-y-4">
              <TOCLinks slug={activeSlug} />
            </nav>
          </div>

          <div className="mt-auto space-y-6">
            <div className="p-5 bg-foreground text-background rounded-2xl space-y-4">
              <h4 className="font-bold text-sm leading-tight">Need custom architecture?</h4>
              <p className="text-[10px] font-medium leading-relaxed opacity-70">Our engineering team can help you build mission-critical blueprints.</p>
              <button className="w-full bg-background text-foreground text-[10px] font-black py-2.5 rounded-lg hover:opacity-90 transition-all uppercase tracking-widest border border-border/20">
                Contact Sales
              </button>
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  )
}

/* ── Content Router ── */

function DocContent({ slug, handleCopy, copied }: { slug: string; handleCopy: (t: string) => void; copied: boolean }) {
  switch (slug) {
    case 'intro':
      return <IntroContent />
    case 'architecture':
      return <ArchitectureContent />
    case 'concepts':
      return <ConceptsContent />
    case 'install':
      return <InstallContent />
    case 'identity':
      return <IdentityContent />
    case 'schema':
      return <SchemaContent />
    case 'logic':
      return <LogicContent handleCopy={handleCopy} copied={copied} />
    case 'design':
      return <DesignContent />
    case 'flows':
      return <FlowsContent />
    case 'audits':
      return <AuditContent />
    case 'wasm':
      return <WasmRuntimeContent />
    case 'paths':
      return <PathsContent />
    case 'zero-trust':
      return <ZeroTrustContent />
    case 'rls':
      return <RlsContent />
    case 'rbac':
      return <RbacContent />
    default:
      return <PlaceholderContent />
  }
}

function TOCLinks({ slug }: { slug: string }) {
  const links: Record<string, string[]> = {
    intro: ['Foundation', 'The Five Pillars'],
    architecture: ['The Stack', 'Execution Flow'],
    concepts: ['Determinism', 'Formal Verification', 'The Blueprint Model'],
    install: ['Prerequisites', 'CLI Setup', 'Initialization'],
    identity: ['Actors and Roles', 'Permission Modeling'],
    schema: ['Entity Modeling', 'Schema Visualization'],
    logic: ['WASM Compilation'],
    design: ['Theme Tokens', 'Atomic Components'],
    flows: ['Pathway Orchestration', 'Side Effects'],
    audits: ['Verification Pipelines', 'Audit Logs', 'Error Classification'],
    wasm: ['Isolation and Safety', 'Edge Orchestration', 'Binary Optimization'],
    paths: ['State Transition Mapping', 'Branching Logic', 'Path Coverage'],
    'zero-trust': ['Identity Verification', 'Least Privilege Access', 'Micro-Segmentation'],
    rls: ['Policy Generation', 'Identity Binding', 'Policy Verification'],
    rbac: ['Resource Isolation', 'Dynamic Authorizers', 'Role Hierarchy'],
  }

  const activeLinks = links[slug] || []

  return (
    <>
      {activeLinks.map(item => (
        <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="block text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          {item}
        </a>
      ))}
    </>
  )
}
