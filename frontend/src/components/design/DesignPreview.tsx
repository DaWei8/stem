'use client'

import { usePreviewTokens } from '@/hooks/usePreviewTokens'
import { cn } from '@/lib/utils'
import { LayoutDashboard, LayoutTemplate, Lock, Monitor, Moon, Palette, Smartphone, Sun, Type, X } from 'lucide-react'
import { useState } from 'react'
import { PaletteView } from './PaletteView'
import { CardsView, DashboardView, DesktopView, FormView, MobileView, TypographyView } from './PreviewViews'

type PreviewMode = 'desktop' | 'mobile' | 'dashboard' | 'cards' | 'form' | 'typography' | 'palette'

const modes: { id: PreviewMode; icon: any; label: string }[] = [
  { id: 'desktop', icon: Monitor, label: 'Landing' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'cards', icon: LayoutTemplate, label: 'Cards' },
  { id: 'form', icon: Lock, label: 'Auth' },
  { id: 'typography', icon: Type, label: 'Type' },
  { id: 'palette', icon: Palette, label: 'Palette' },
]

interface DesignPreviewProps {
  tokens: any[]
  onClose: () => void
}

export function DesignPreview({ tokens, onClose }: DesignPreviewProps) {
  const [mode, setMode] = useState<PreviewMode>('desktop')
  const [isDark, setIsDark] = useState(false)
  const t = usePreviewTokens(tokens, isDark)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 flex flex-col w-[92vw] max-w-5xl h-[88vh] bg-zinc-100 dark:bg-zinc-900 shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
        style={{ borderRadius: '12px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ─── Toolbar ──────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-1">
            {modes.map(m => {
              const Icon = m.icon
              const active = mode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-semibold transition-all",
                    active
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  )}
                  title={m.label}
                >
                  <Icon className="size-3.5" />
                  {active && <span>{m.label}</span>}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsDark(!isDark)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold transition-all",
                isDark
                  ? "bg-zinc-900 dark:bg-zinc-800 text-amber-400"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
              )}
              title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            >
              {isDark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
              <span>{isDark ? 'Dark' : 'Light'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* ─── Canvas ───────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto p-6 flex items-center justify-center custom-scrollbar transition-colors duration-300"
          style={{ backgroundColor: isDark ? '#111118' : '#f0f0f4' }}
        >
          {mode === 'desktop' && <DesktopView t={t} />}
          {mode === 'mobile' && <MobileView t={t} />}
          {mode === 'dashboard' && <DashboardView t={t} />}
          {mode === 'cards' && <CardsView t={t} />}
          {mode === 'form' && <FormView t={t} />}
          {mode === 'typography' && <TypographyView t={t} />}
          {mode === 'palette' && <PaletteView t={t} />}
        </div>

        {/* ─── Status Bar ───────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <span className="text-[9px] font-mono text-zinc-400">{tokens.filter(t => t.category === 'color').length} colors · {tokens.filter(t => t.category === 'typography').length} fonts · {tokens.length} total</span>
          <span className="text-[9px] font-mono text-zinc-400">{isDark ? 'Dark' : 'Light'} · {mode}</span>
        </div>
      </div>
    </div>
  )
}
