'use client'

import { Monitor, Smartphone, LayoutDashboard, LayoutTemplate, Lock, Type, Palette } from 'lucide-react'

interface PreviewTokens {
  primary: string
  secondary: string
  tertiary: string
  accent: string
  bg: string
  text: string
  heading: { family: string; size: string; weight: string }
  body: { family: string; size: string; weight: string }
  spaceSm: string
  spaceMd: string
  spaceLg: string
  shadowSm: string
  shadowMd: string
  radiusSm: string
  radiusMd: string
  radiusLg: string
}

// ─── Desktop Hero ─────────────────────────────────────────────
export function DesktopView({ t }: { t: PreviewTokens }) {
  return (
    <div className="w-full max-w-2xl shadow-2xl overflow-hidden transition-all duration-300" style={{ backgroundColor: t.bg, borderRadius: t.radiusMd, fontFamily: t.body.family, color: t.text }}>
      <header className="flex items-center justify-between" style={{ padding: `${t.spaceSm} ${t.spaceMd}`, backgroundColor: t.secondary, borderBottom: `1px solid ${t.text}10` }}>
        <div className="font-bold tracking-tight" style={{ fontFamily: t.heading.family, fontSize: '1.1rem' }}>Brand</div>
        <nav className="flex items-center gap-4 text-sm" style={{ opacity: 0.75 }}>
          <span>Features</span>
          <span>Pricing</span>
          <button style={{ backgroundColor: t.primary, color: t.bg, padding: `6px ${t.spaceMd}`, borderRadius: t.radiusSm, fontWeight: 600, fontSize: '13px' }}>Sign Up</button>
        </nav>
      </header>
      <main className="text-center space-y-5" style={{ padding: `${t.spaceLg} ${t.spaceMd}` }}>
        <h1 style={{ fontFamily: t.heading.family, fontSize: t.heading.size, fontWeight: t.heading.weight as any, lineHeight: 1.1 }}>
          Build the future, faster.
        </h1>
        <p style={{ fontSize: t.body.size, opacity: 0.6, maxWidth: '85%', margin: '0 auto', lineHeight: 1.6 }}>
          Leverage advanced tools to construct robust and scalable applications with unprecedented speed.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button style={{ backgroundColor: t.accent, color: '#fff', padding: `10px 28px`, borderRadius: t.radiusMd, fontWeight: 700, fontSize: '14px', boxShadow: t.shadowMd }}>
            Get Started
          </button>
          <button style={{ backgroundColor: 'transparent', border: `1.5px solid ${t.primary}`, color: t.primary, padding: `10px 28px`, borderRadius: t.radiusMd, fontWeight: 700, fontSize: '14px' }}>
            Documentation
          </button>
        </div>
      </main>
      <footer style={{ padding: t.spaceSm, backgroundColor: t.secondary, borderTop: `1px solid ${t.text}08`, textAlign: 'center', fontSize: '11px', opacity: 0.4 }}>
        © 2026 Brand Inc. All rights reserved.
      </footer>
    </div>
  )
}

// ─── Mobile App ───────────────────────────────────────────────
export function MobileView({ t }: { t: PreviewTokens }) {
  return (
    <div className="w-[300px] shadow-2xl overflow-hidden transition-all relative" style={{ backgroundColor: t.bg, borderRadius: '28px', fontFamily: t.body.family, color: t.text, minHeight: '560px', border: `6px solid ${t.text}20` }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 rounded-b-xl z-10" style={{ backgroundColor: t.text, opacity: 0.15 }} />
      <header className="flex items-center justify-between" style={{ padding: t.spaceMd, paddingTop: '2rem', backgroundColor: t.secondary }}>
        <div className="font-bold" style={{ fontFamily: t.heading.family, fontSize: '1rem' }}>App</div>
        <div className="size-7 rounded-full" style={{ backgroundColor: t.primary }} />
      </header>
      <main style={{ padding: t.spaceMd }} className="space-y-5">
        <h1 style={{ fontFamily: t.heading.family, fontSize: '22px', fontWeight: t.heading.weight as any, lineHeight: 1.2 }}>Welcome back</h1>
        <div style={{ backgroundColor: t.primary, color: t.bg, padding: t.spaceMd, borderRadius: t.radiusMd, boxShadow: t.shadowSm }}>
          <p style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>Total Balance</p>
          <p style={{ fontFamily: t.heading.family, fontSize: '28px', fontWeight: 'bold' }}>$24,500</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold" style={{ fontSize: '13px' }}>Recent Activity</p>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between" style={{ padding: t.spaceSm, backgroundColor: t.secondary, borderRadius: t.radiusSm }}>
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full" style={{ backgroundColor: t.accent, opacity: 0.15 }} />
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 500 }}>Transaction {i}</p>
                  <p style={{ fontSize: '10px', opacity: 0.5 }}>Today</p>
                </div>
              </div>
              <span style={{ color: t.primary, fontWeight: 700, fontSize: '13px' }}>+$120</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────
export function DashboardView({ t }: { t: PreviewTokens }) {
  const metrics = [
    { label: 'Revenue', value: '$12,450' },
    { label: 'Users', value: '3,841' },
    { label: 'Growth', value: '+18.2%' },
  ]
  return (
    <div className="w-full max-w-3xl shadow-2xl overflow-hidden flex" style={{ backgroundColor: t.bg, borderRadius: t.radiusMd, fontFamily: t.body.family, color: t.text, height: '420px' }}>
      <aside className="w-52 flex flex-col shrink-0" style={{ backgroundColor: t.secondary, borderRight: `1px solid ${t.text}08` }}>
        <div className="p-4 font-bold" style={{ fontFamily: t.heading.family, fontSize: '1rem', borderBottom: `1px solid ${t.text}08` }}>Acme Corp</div>
        <div className="flex-1 p-3 space-y-1">
          {['Overview', 'Analytics', 'Users', 'Settings'].map((item, i) => (
            <div key={item} style={{ backgroundColor: i === 0 ? t.primary : 'transparent', color: i === 0 ? t.bg : t.text, opacity: i === 0 ? 1 : 0.6, padding: `6px ${t.spaceSm}`, borderRadius: t.radiusSm, fontWeight: i === 0 ? 600 : 400, fontSize: '13px' }}>{item}</div>
          ))}
        </div>
      </aside>
      <main className="flex-1 p-6 flex flex-col gap-5 overflow-hidden">
        <header className="flex items-center justify-between">
          <h2 style={{ fontFamily: t.heading.family, fontSize: '1.25rem', fontWeight: 'bold' }}>Dashboard</h2>
          <div className="size-7 rounded-full" style={{ backgroundColor: t.accent }} />
        </header>
        <div className="grid grid-cols-3 gap-3">
          {metrics.map(m => (
            <div key={m.label} style={{ backgroundColor: t.secondary, padding: t.spaceMd, borderRadius: t.radiusMd }}>
              <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontFamily: t.heading.family, fontSize: '1.25rem', fontWeight: 'bold' }}>{m.value}</div>
            </div>
          ))}
        </div>
        <div className="flex-1 rounded-lg flex items-center justify-center" style={{ backgroundColor: t.secondary, border: `1px dashed ${t.primary}30` }}>
          <span style={{ fontSize: '12px', opacity: 0.3, fontWeight: 500 }}>Chart Area</span>
        </div>
      </main>
    </div>
  )
}

// ─── Cards ────────────────────────────────────────────────────
export function CardsView({ t }: { t: PreviewTokens }) {
  return (
    <div className="w-full max-w-2xl grid grid-cols-2 gap-4" style={{ fontFamily: t.body.family, color: t.text }}>
      <div style={{ backgroundColor: t.bg, padding: t.spaceMd, borderRadius: t.radiusMd, boxShadow: t.shadowMd, border: `1px solid ${t.text}08` }}>
        <div className="size-10 rounded-lg mb-3 flex items-center justify-center" style={{ backgroundColor: t.secondary }}>
          <LayoutTemplate className="size-5" style={{ color: t.accent }} />
        </div>
        <h3 style={{ fontFamily: t.heading.family, fontSize: '1.1rem', marginBottom: '6px', fontWeight: 'bold' }}>Component</h3>
        <p style={{ fontSize: '13px', opacity: 0.6, marginBottom: t.spaceMd, lineHeight: 1.5 }}>Reusable block structured for scalability.</p>
        <button style={{ color: t.primary, fontWeight: 700, fontSize: '13px' }}>Learn more →</button>
      </div>
      <div style={{ backgroundColor: t.accent, color: '#fff', padding: t.spaceMd, borderRadius: t.radiusLg, boxShadow: t.shadowMd }}>
        <h3 style={{ fontFamily: t.heading.family, fontSize: '1.25rem', marginBottom: '6px', fontWeight: 'bold' }}>Premium</h3>
        <p style={{ fontSize: '13px', opacity: 0.85, marginBottom: t.spaceMd, lineHeight: 1.5 }}>Unlock advanced features and support.</p>
        <button style={{ backgroundColor: '#fff', color: t.accent, padding: `6px ${t.spaceMd}`, borderRadius: t.radiusSm, fontWeight: 700, width: '100%', fontSize: '13px' }}>Upgrade</button>
      </div>
      <div style={{ backgroundColor: t.bg, padding: t.spaceMd, borderRadius: t.radiusSm, boxShadow: t.shadowSm, border: `1px solid ${t.text}08` }} className="flex items-center gap-3 col-span-2">
        <div className="size-14 rounded-full shrink-0" style={{ backgroundColor: t.primary }} />
        <div>
          <h4 style={{ fontFamily: t.heading.family, fontWeight: 'bold', fontSize: '15px' }}>Jane Doe</h4>
          <p style={{ fontSize: '11px', opacity: 0.5, marginBottom: '4px' }}>Senior Architect</p>
          <div className="flex gap-1.5">
            {['Design', 'Engineering'].map(tag => (
              <span key={tag} style={{ backgroundColor: t.secondary, padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 500 }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Form / Auth ──────────────────────────────────────────────
export function FormView({ t }: { t: PreviewTokens }) {
  return (
    <div className="w-full max-w-sm shadow-2xl overflow-hidden space-y-5" style={{ backgroundColor: t.bg, borderRadius: t.radiusLg, fontFamily: t.body.family, color: t.text, padding: `${t.spaceLg} ${t.spaceMd}` }}>
      <div className="text-center space-y-1.5">
        <div className="size-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: t.primary }}>
          <Lock className="size-5" style={{ color: t.bg }} />
        </div>
        <h2 style={{ fontFamily: t.heading.family, fontSize: '1.35rem', fontWeight: 'bold' }}>Welcome back</h2>
        <p style={{ fontSize: '13px', opacity: 0.55 }}>Sign in to your account</p>
      </div>
      <div className="space-y-3">
        {['Email address', 'Password'].map(label => (
          <div key={label} className="space-y-1">
            <label style={{ fontSize: '12px', fontWeight: 600, opacity: 0.7 }}>{label}</label>
            <input type="text" placeholder={label === 'Email address' ? 'name@company.com' : '••••••••'} readOnly className="w-full outline-none" style={{ backgroundColor: t.secondary, padding: `8px ${t.spaceMd}`, borderRadius: t.radiusSm, border: `1px solid ${t.text}10`, color: t.text, fontSize: '13px' }} />
          </div>
        ))}
        <button style={{ backgroundColor: t.primary, color: t.bg, padding: '10px', borderRadius: t.radiusSm, fontWeight: 700, width: '100%', fontSize: '14px', marginTop: '4px' }}>Sign In</button>
      </div>
      <p className="text-center" style={{ fontSize: '12px', opacity: 0.5 }}>No account? <span style={{ color: t.accent, fontWeight: 700 }}>Sign up</span></p>
    </div>
  )
}

// ─── Typography Scale ─────────────────────────────────────────
export function TypographyView({ t }: { t: PreviewTokens }) {
  const scales = [
    { label: 'Display', size: t.heading.size, weight: t.heading.weight, family: t.heading.family },
    { label: 'H2', size: '24px', weight: 'bold', family: t.heading.family },
    { label: 'H3', size: '20px', weight: '600', family: t.heading.family },
    { label: 'Body', size: t.body.size, weight: t.body.weight, family: t.body.family },
    { label: 'Small', size: '13px', weight: 'normal', family: t.body.family },
    { label: 'Caption', size: '11px', weight: 'normal', family: t.body.family },
  ]
  return (
    <div className="w-full max-w-2xl shadow-2xl overflow-hidden space-y-1" style={{ backgroundColor: t.bg, borderRadius: t.radiusMd, color: t.text }}>
      {scales.map((s, i) => (
        <div key={s.label} className="flex items-baseline gap-4" style={{ padding: `${t.spaceMd} ${t.spaceLg}`, borderBottom: i < scales.length - 1 ? `1px solid ${t.text}08` : 'none' }}>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', opacity: 0.35, width: '52px', flexShrink: 0 }}>{s.label}</span>
          <span style={{ fontFamily: s.family, fontSize: s.size, fontWeight: s.weight as any, lineHeight: 1.3 }}>
            The quick brown fox
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Color Palette Swatch ─────────────────────────────────────
export function PaletteView({ t }: { t: PreviewTokens }) {
  const swatches = [
    { label: 'Primary', value: t.primary },
    { label: 'Secondary', value: t.secondary },
    { label: 'Accent', value: t.accent },
    { label: 'Background', value: t.bg },
    { label: 'Text', value: t.text },
  ]
  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="grid grid-cols-5 gap-3">
        {swatches.map(s => (
          <div key={s.label} className="space-y-2">
            <div className="aspect-square rounded-lg shadow-inner" style={{ backgroundColor: s.value, border: `1px solid ${t.text}15`, borderRadius: t.radiusMd }} />
            <div style={{ fontFamily: t.body.family }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: t.text }}>{s.label}</p>
              <p style={{ fontSize: '10px', fontFamily: 'monospace', opacity: 0.45, color: t.text }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="h-16 rounded-lg overflow-hidden flex" style={{ boxShadow: t.shadowMd }}>
        {swatches.map(s => (
          <div key={s.label} className="flex-1" style={{ backgroundColor: s.value }} />
        ))}
      </div>
    </div>
  )
}
