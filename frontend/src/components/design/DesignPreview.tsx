import { useState } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Smartphone, LayoutTemplate, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DesignPreviewProps {
  tokens: any[]
  onClose: () => void
}

export function DesignPreview({ tokens, onClose }: DesignPreviewProps) {
  const [mode, setPreviewMode] = useState<'desktop' | 'mobile' | 'cards'>('desktop')

  // Helper to get token value by name or category fallback
  const getToken = (name: string, fallback: string) => {
    return tokens.find(t => t.name === name || t.name.startsWith(name + '|'))?.value || fallback
  }

  const primaryColor = getToken('color-primary', '#000000')
  const secondaryColor = getToken('color-secondary', '#f3f4f6')
  const accentColor = getToken('color-accent', '#3b82f6')
  const bgColor = getToken('color-background', '#ffffff')
  const textColor = getToken('color-text', '#111827')

  // Typography parsing: "h1 | 48px | Inter | bold | -2.2%"
  const getFont = (name: string, fallbackFamily: string, fallbackSize: string) => {
    const val = tokens.find(t => t.name === name || t.name.startsWith(name + '|'))?.value
    if (!val) return { family: fallbackFamily, size: fallbackSize, weight: 'normal' }
    const parts = val.split(' | ')
    return {
      family: parts[2] || fallbackFamily,
      size: parts[1] || fallbackSize,
      weight: parts[3] || 'normal'
    }
  }

  const headingFont = getFont('font-heading', 'sans-serif', '32px')
  const bodyFont = getFont('font-body', 'sans-serif', '16px')

  const spaceSm = getToken('space-sm', '8px')
  const spaceMd = getToken('space-md', '16px')
  const spaceLg = getToken('space-lg', '32px')

  const shadowSm = getToken('shadow-sm', '0 1px 2px rgba(0,0,0,0.05)')
  const shadowMd = getToken('shadow-md', '0 4px 6px rgba(0,0,0,0.1)')

  const radiusSm = getToken('radius-sm', '4px')
  const radiusMd = getToken('radius-md', '8px')
  const radiusLg = getToken('radius-lg', '16px')

  return (
    <div className="flex flex-col h-full bg-zinc-100 dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <button onClick={() => setPreviewMode('desktop')} className={cn("p-1.5 rounded-md", mode === 'desktop' ? "bg-zinc-200 dark:bg-zinc-800" : "text-zinc-500 hover:text-black dark:hover:text-white")} title="Desktop View"><Monitor className="size-4" /></button>
          <button onClick={() => setPreviewMode('mobile')} className={cn("p-1.5 rounded-md", mode === 'mobile' ? "bg-zinc-200 dark:bg-zinc-800" : "text-zinc-500 hover:text-black dark:hover:text-white")} title="Mobile View"><Smartphone className="size-4" /></button>
          <button onClick={() => setPreviewMode('cards')} className={cn("p-1.5 rounded-md", mode === 'cards' ? "bg-zinc-200 dark:bg-zinc-800" : "text-zinc-500 hover:text-black dark:hover:text-white")} title="Component Cards"><LayoutTemplate className="size-4" /></button>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors"><X className="size-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-start justify-center custom-scrollbar">
        {mode === 'desktop' && (
          <div 
            className="w-full max-w-2xl shadow-2xl overflow-hidden transition-all duration-300 border border-black/10 dark:border-white/10"
            style={{ backgroundColor: bgColor, borderRadius: radiusMd, fontFamily: bodyFont.family, color: textColor }}
          >
            <header className="flex items-center justify-between border-b border-black/5 dark:border-white/5" style={{ padding: spaceMd, backgroundColor: secondaryColor }}>
              <div className="font-bold tracking-tight" style={{ fontFamily: headingFont.family, fontSize: '1.25rem' }}>Brand</div>
              <nav className="flex items-center gap-4 text-sm opacity-80">
                <span>Features</span>
                <span>Pricing</span>
                <button style={{ backgroundColor: primaryColor, color: bgColor, padding: `${spaceSm} ${spaceMd}`, borderRadius: radiusSm, fontWeight: 500 }}>Sign Up</button>
              </nav>
            </header>
            <main style={{ padding: spaceLg }} className="text-center space-y-6 py-16">
              <h1 style={{ fontFamily: headingFont.family, fontSize: headingFont.size, fontWeight: headingFont.weight as any, lineHeight: 1.1 }}>
                Build the future, faster.
              </h1>
              <p style={{ fontSize: bodyFont.size, opacity: 0.7, maxWidth: '80%', margin: '0 auto' }}>
                Leverage our advanced tools to construct robust and scalable applications with unprecedented speed and efficiency.
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <button style={{ backgroundColor: accentColor, color: '#fff', padding: `${spaceMd} ${spaceLg}`, borderRadius: radiusMd, fontWeight: 'bold', boxShadow: shadowMd }}>
                  Get Started
                </button>
                <button style={{ backgroundColor: 'transparent', border: `1px solid ${primaryColor}`, color: primaryColor, padding: `${spaceMd} ${spaceLg}`, borderRadius: radiusMd, fontWeight: 'bold' }}>
                  Documentation
                </button>
              </div>
            </main>
          </div>
        )}

        {mode === 'mobile' && (
          <div 
            className="w-[320px] shadow-2xl overflow-hidden transition-all duration-300 relative border-8 border-zinc-800"
            style={{ backgroundColor: bgColor, borderRadius: '32px', fontFamily: bodyFont.family, color: textColor, minHeight: '600px' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-10" />
            <header className="flex items-center justify-between pt-10 border-b border-black/5 dark:border-white/5" style={{ padding: spaceMd, paddingTop: '2.5rem', backgroundColor: secondaryColor }}>
              <div className="font-bold tracking-tight" style={{ fontFamily: headingFont.family, fontSize: '1.1rem' }}>App</div>
              <div className="size-8 rounded-full shadow-sm" style={{ backgroundColor: primaryColor }} />
            </header>
            <main style={{ padding: spaceMd }} className="space-y-6">
              <h1 style={{ fontFamily: headingFont.family, fontSize: '24px', fontWeight: headingFont.weight as any, lineHeight: 1.2 }}>
                Welcome back
              </h1>
              <div style={{ backgroundColor: primaryColor, color: bgColor, padding: spaceMd, borderRadius: radiusMd, boxShadow: shadowSm }}>
                <p className="text-xs opacity-80 mb-1">Total Balance</p>
                <p style={{ fontFamily: headingFont.family, fontSize: '32px', fontWeight: 'bold' }}>$24,500</p>
              </div>
              <div className="space-y-3">
                <p className="font-bold text-sm">Recent Activity</p>
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center justify-between" style={{ padding: spaceSm, backgroundColor: secondaryColor, borderRadius: radiusSm }}>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full" style={{ backgroundColor: accentColor, opacity: 0.2 }} />
                      <div>
                        <p className="text-sm font-medium">Transaction {i}</p>
                        <p className="text-xs opacity-60">Today</p>
                      </div>
                    </div>
                    <span className="font-bold" style={{ color: primaryColor }}>+$120</span>
                  </div>
                ))}
              </div>
            </main>
          </div>
        )}

        {mode === 'cards' && (
          <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-6" style={{ fontFamily: bodyFont.family, color: textColor }}>
            {/* Standard Card */}
            <div style={{ backgroundColor: bgColor, padding: spaceMd, borderRadius: radiusMd, boxShadow: shadowMd, border: `1px solid ${secondaryColor}` }}>
              <div className="size-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: secondaryColor }}>
                <LayoutTemplate style={{ color: accentColor }} />
              </div>
              <h3 style={{ fontFamily: headingFont.family, fontSize: '1.25rem', marginBottom: spaceSm, fontWeight: 'bold' }}>Component Block</h3>
              <p style={{ fontSize: bodyFont.size, opacity: 0.7, marginBottom: spaceMd }}>Reusable architectural component structured for scalability.</p>
              <button style={{ color: primaryColor, fontWeight: 'bold', fontSize: '14px' }}>Learn more →</button>
            </div>

            {/* Accent Card */}
            <div style={{ backgroundColor: accentColor, color: '#fff', padding: spaceMd, borderRadius: radiusLg || radiusMd, boxShadow: shadowMd }}>
              <h3 style={{ fontFamily: headingFont.family, fontSize: '1.5rem', marginBottom: spaceSm, fontWeight: 'bold' }}>Premium Plan</h3>
              <p style={{ fontSize: bodyFont.size, opacity: 0.9, marginBottom: spaceMd }}>Unlock advanced features and premium support.</p>
              <button style={{ backgroundColor: '#fff', color: accentColor, padding: `${spaceSm} ${spaceMd}`, borderRadius: radiusSm, fontWeight: 'bold', width: '100%', boxShadow: shadowSm }}>Upgrade Now</button>
            </div>

            {/* Profile Card */}
            <div style={{ backgroundColor: bgColor, padding: spaceMd, borderRadius: radiusSm, boxShadow: shadowSm, border: `1px solid ${secondaryColor}` }} className="flex items-center gap-4">
              <div className="size-16 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: primaryColor }} />
              <div>
                <h4 style={{ fontFamily: headingFont.family, fontWeight: 'bold' }}>Jane Doe</h4>
                <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '6px' }}>Senior Architect</p>
                <div className="flex gap-2 mt-1">
                  <span style={{ backgroundColor: secondaryColor, padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 500 }}>Design</span>
                  <span style={{ backgroundColor: secondaryColor, padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 500 }}>Engineering</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
