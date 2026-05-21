import { Cpu, Database, Layout, LucideIcon, Shield, Workflow } from 'lucide-react'

export interface Pillar {
  id: string
  label: string
  icon: LucideIcon
  x: number
  y: number
  delay: number
  tooltip: string
  glowColor: string
  iconColor: string
  borderColor: string
}

export const PILLARS: Pillar[] = [
  {
    id: 'identity',
    label: 'Identity Layer',
    icon: Shield,
    x: 50,
    y: 15,
    delay: 1.5,
    tooltip: 'OAuth2/JWT • RLS Rules Enabled',
    glowColor: 'rgba(99,102,241,0.25)', // Indigo
    iconColor: 'text-indigo-400',
    borderColor: 'hover:border-indigo-500/80'
  },
  {
    id: 'schema',
    label: 'Schema Engine',
    icon: Database,
    x: 20,
    y: 50,
    delay: 2.0,
    tooltip: 'Supabase • Zod Validation • Strict Typecheck',
    glowColor: 'rgba(6,182,212,0.25)', // Cyan
    iconColor: 'text-cyan-400',
    borderColor: 'hover:border-cyan-500/80'
  },
  {
    id: 'logic',
    label: 'Core Logic',
    icon: Cpu,
    x: 50,
    y: 50,
    delay: 1.0,
    tooltip: 'LLM Context Orchestrator • Graph Traversal',
    glowColor: 'rgba(217,70,239,0.3)', // Fuchsia
    iconColor: 'text-fuchsia-400',
    borderColor: 'hover:border-fuchsia-500/80'
  },
  {
    id: 'flows',
    label: 'Flow Nodes',
    icon: Workflow,
    x: 80,
    y: 50,
    delay: 2.5,
    tooltip: 'Async Runners • Queue: 0 • Workers: 16',
    glowColor: 'rgba(245,158,11,0.25)', // Amber
    iconColor: 'text-amber-400',
    borderColor: 'hover:border-amber-500/80'
  },
  {
    id: 'design',
    label: 'Design System',
    icon: Layout,
    x: 50,
    y: 85,
    delay: 3.0,
    tooltip: 'Tailwind CSS v4 • OKLCH Variables',
    glowColor: 'rgba(244,63,94,0.25)', // Rose
    iconColor: 'text-rose-400',
    borderColor: 'hover:border-rose-500/80'
  }
]

export const CONNECTIONS = [
  { id: 'c1', from: 'logic', to: 'identity', delay: 1.2 },
  { id: 'c2', from: 'logic', to: 'schema', delay: 1.7 },
  { id: 'c3', from: 'logic', to: 'flows', delay: 2.2 },
  { id: 'c4', from: 'logic', to: 'design', delay: 2.7 },
  { id: 'c5', from: 'schema', to: 'design', delay: 3.0 }
]

export interface CodeToken {
  text: string
  type: 'keyword' | 'variable' | 'class' | 'function' | 'string' | 'comment' | 'text'
}

export const CODE_LINES: CodeToken[][] = [
  [
    { text: '// Initialize Stem Architecture boot sequence', type: 'comment' }
  ],
  [
    { text: 'async ', type: 'keyword' },
    { text: 'function ', type: 'keyword' },
    { text: 'bootStemEngine', type: 'function' },
    { text: '() {', type: 'text' }
  ],
  [
    { text: '  const ', type: 'keyword' },
    { text: 'identity ', type: 'variable' },
    { text: '= ', type: 'text' },
    { text: 'await ', type: 'keyword' },
    { text: 'Auth', type: 'class' },
    { text: '.', type: 'text' },
    { text: 'verifyIdentity', type: 'function' },
    { text: '();', type: 'text' }
  ],
  [
    { text: '  const ', type: 'keyword' },
    { text: 'schema ', type: 'variable' },
    { text: '= ', type: 'text' },
    { text: 'new ', type: 'keyword' },
    { text: 'Database', type: 'class' },
    { text: '({ strict: ', type: 'text' },
    { text: 'true', type: 'keyword' },
    { text: ' });', type: 'text' }
  ],
  [
    { text: '  const ', type: 'keyword' },
    { text: 'core ', type: 'variable' },
    { text: '= ', type: 'text' },
    { text: 'new ', type: 'keyword' },
    { text: 'CoreLogic', type: 'class' },
    { text: '({ identity, schema });', type: 'text' }
  ],
  [
    { text: '  ', type: 'text' }
  ],
  [
    { text: '  core', type: 'variable' },
    { text: '.', type: 'text' },
    { text: 'stream', type: 'function' },
    { text: '(async (', type: 'text' },
    { text: 'packet', type: 'variable' },
    { text: ') => {', type: 'text' }
  ],
  [
    { text: '    if ', type: 'keyword' },
    { text: '(', type: 'text' },
    { text: 'packet', type: 'variable' },
    { text: '.', type: 'text' },
    { text: 'verified', type: 'variable' },
    { text: ') {', type: 'text' }
  ],
  [
    { text: '      ', type: 'text' },
    { text: 'await ', type: 'keyword' },
    { text: 'Router', type: 'class' },
    { text: '.', type: 'text' },
    { text: 'push', type: 'function' },
    { text: '(', type: 'text' },
    { text: 'packet', type: 'variable' },
    { text: '.', type: 'text' },
    { text: 'destination', type: 'variable' },
    { text: ');', type: 'text' }
  ],
  [
    { text: '    }', type: 'text' }
  ],
  [
    { text: '  });', type: 'text' }
  ],
  [
    { text: '  ', type: 'text' }
  ],
  [
    { text: '  return ', type: 'keyword' },
    { text: 'core', type: 'variable' },
    { text: '.', type: 'text' },
    { text: 'status ', type: 'variable' },
    { text: '=== ', type: 'text' },
    { text: '"OK"', type: 'string' },
    { text: ';', type: 'text' }
  ],
  [
    { text: '}', type: 'text' }
  ]
]

// Pre-generated random floating particles configuration
export const PARTICLES = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.8,
  duration: Math.random() * 12 + 10,
  delay: Math.random() * -10 // start immediately at random animation frame
}))
