'use client'

import { LayoutTemplate, Lock, ShoppingBag, Star, Package, TrendingUp, Users, DollarSign, Search, Heart, ShoppingCart, ArrowRight, Truck, Shield, RotateCcw } from 'lucide-react'

interface T {
  primary: string; secondary: string; tertiary: string; accent: string
  bg: string; text: string
  heading: { family: string; size: string; weight: string }
  body: { family: string; size: string; weight: string }
  spaceSm: string; spaceMd: string; spaceLg: string
  shadowSm: string; shadowMd: string
  radiusSm: string; radiusMd: string; radiusLg: string
}

// ─── Desktop Store ────────────────────────────────────────────
export function DesktopView({ t }: { t: T }) {
  const products = [
    { name: 'Minimalist Watch', price: '$189', tag: 'New' },
    { name: 'Leather Tote Bag', price: '$124', tag: 'Best Seller' },
    { name: 'Ceramic Vase Set', price: '$67', tag: null },
  ]
  return (
    <div className="w-full max-w-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: t.bg, borderRadius: t.radiusMd, fontFamily: t.body.family, color: t.text }}>
      {/* Nav */}
      <header className="flex items-center justify-between" style={{ padding: `10px ${t.spaceMd}`, borderBottom: `1px solid ${t.text}0a` }}>
        <div className="flex items-center gap-5">
          <div className="font-bold tracking-tight" style={{ fontFamily: t.heading.family, fontSize: '1.1rem' }}>
            <ShoppingBag className="size-4 inline-block mr-1.5" style={{ color: t.accent }} />Store
          </div>
          <nav className="flex items-center gap-4" style={{ fontSize: '12px', opacity: 0.6 }}>
            <span>New Arrivals</span><span>Collections</span><span>Sale</span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Search className="size-3.5" style={{ opacity: 0.4 }} />
          <Heart className="size-3.5" style={{ opacity: 0.4 }} />
          <div className="relative">
            <ShoppingCart className="size-3.5" style={{ opacity: 0.5 }} />
            <div className="absolute -top-1.5 -right-1.5 size-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: t.accent, color: '#fff', fontSize: '8px', fontWeight: 700 }}>3</div>
          </div>
        </div>
      </header>
      {/* Hero */}
      <div className="text-center" style={{ padding: `${t.spaceLg} ${t.spaceMd}`, background: `linear-gradient(135deg, ${t.primary}15 0%, ${t.accent}10 100%)` }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: t.accent, letterSpacing: '2px', marginBottom: '8px' }}>SUMMER COLLECTION 2026</p>
        <h1 style={{ fontFamily: t.heading.family, fontSize: t.heading.size, fontWeight: t.heading.weight as any, lineHeight: 1.1, marginBottom: '12px' }}>Curated for you.</h1>
        <p style={{ fontSize: t.body.size, opacity: 0.55, maxWidth: '80%', margin: '0 auto 16px', lineHeight: 1.6 }}>Discover handpicked essentials designed for everyday elegance.</p>
        <div className="flex items-center justify-center gap-3">
          <button style={{ backgroundColor: t.primary, color: t.bg, padding: '10px 28px', borderRadius: t.radiusMd, fontWeight: 700, fontSize: '13px' }}>Shop Now</button>
          <button style={{ border: `1.5px solid ${t.text}20`, color: t.text, padding: '10px 28px', borderRadius: t.radiusMd, fontWeight: 600, fontSize: '13px', opacity: 0.7 }}>View Lookbook</button>
        </div>
      </div>
      {/* Products */}
      <div style={{ padding: t.spaceMd }}>
        <div className="flex items-center justify-between" style={{ marginBottom: t.spaceMd }}>
          <h2 style={{ fontFamily: t.heading.family, fontSize: '1rem', fontWeight: 'bold' }}>Featured Products</h2>
          <span style={{ fontSize: '11px', color: t.accent, fontWeight: 600 }}>View All <ArrowRight className="size-3 inline" /></span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {products.map(p => (
            <div key={p.name} style={{ borderRadius: t.radiusSm, overflow: 'hidden', border: `1px solid ${t.text}08` }}>
              <div className="relative" style={{ height: '100px', backgroundColor: t.secondary }}>
                {p.tag && <span className="absolute top-2 left-2" style={{ backgroundColor: t.accent, color: '#fff', fontSize: '8px', fontWeight: 700, padding: '2px 6px', borderRadius: t.radiusSm }}>{p.tag}</span>}
                <button className="absolute top-2 right-2"><Heart className="size-3.5" style={{ color: t.text, opacity: 0.3 }} /></button>
              </div>
              <div style={{ padding: t.spaceSm }}>
                <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>{p.name}</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: t.primary }}>{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Trust */}
      <div className="flex items-center justify-around" style={{ padding: t.spaceMd, borderTop: `1px solid ${t.text}08` }}>
        {[{ icon: Truck, text: 'Free Shipping' }, { icon: Shield, text: 'Secure Payment' }, { icon: RotateCcw, text: '30-Day Returns' }].map(b => (
          <div key={b.text} className="flex items-center gap-1.5" style={{ fontSize: '10px', opacity: 0.45, fontWeight: 500 }}>
            <b.icon className="size-3" />{b.text}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Mobile Store App ─────────────────────────────────────────
export function MobileView({ t }: { t: T }) {
  const items = [
    { name: 'Running Shoes', price: '$145', rating: 4.8 },
    { name: 'Canvas Backpack', price: '$89', rating: 4.6 },
    { name: 'Sunglasses', price: '$52', rating: 4.9 },
  ]
  return (
    <div className="w-[300px] shadow-2xl overflow-hidden relative" style={{ backgroundColor: t.bg, borderRadius: '28px', fontFamily: t.body.family, color: t.text, minHeight: '560px', border: `6px solid ${t.text}20` }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 rounded-b-xl z-10" style={{ backgroundColor: t.text, opacity: 0.12 }} />
      {/* Header */}
      <div style={{ padding: `2rem ${t.spaceMd} ${t.spaceSm}` }}>
        <div className="flex items-center justify-between mb-4">
          <div><p style={{ fontSize: '11px', opacity: 0.5 }}>Good morning 👋</p><p style={{ fontFamily: t.heading.family, fontSize: '18px', fontWeight: 'bold' }}>Discover</p></div>
          <div className="size-8 rounded-full" style={{ backgroundColor: t.accent, opacity: 0.15 }} />
        </div>
        <div className="flex items-center gap-2" style={{ backgroundColor: t.secondary, padding: `8px ${t.spaceSm}`, borderRadius: t.radiusMd }}>
          <Search className="size-3.5" style={{ opacity: 0.3 }} />
          <span style={{ fontSize: '12px', opacity: 0.35 }}>Search products...</span>
        </div>
      </div>
      {/* Promo */}
      <div style={{ margin: `0 ${t.spaceMd}`, padding: t.spaceMd, borderRadius: t.radiusMd, background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`, color: '#fff', marginBottom: t.spaceMd }}>
        <p style={{ fontSize: '10px', fontWeight: 700, opacity: 0.8, letterSpacing: '1px' }}>LIMITED OFFER</p>
        <p style={{ fontFamily: t.heading.family, fontSize: '20px', fontWeight: 'bold', margin: '4px 0' }}>30% Off</p>
        <p style={{ fontSize: '11px', opacity: 0.8 }}>Summer essentials</p>
      </div>
      {/* Items */}
      <div style={{ padding: `0 ${t.spaceMd}` }} className="space-y-2">
        <p style={{ fontSize: '13px', fontWeight: 700 }}>Trending Now</p>
        {items.map(item => (
          <div key={item.name} className="flex items-center gap-3" style={{ padding: t.spaceSm, backgroundColor: t.secondary, borderRadius: t.radiusSm }}>
            <div className="size-12 rounded-lg shrink-0" style={{ backgroundColor: t.tertiary || t.secondary }} />
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: '12px', fontWeight: 600 }}>{item.name}</p>
              <div className="flex items-center gap-1"><Star className="size-2.5" style={{ color: t.accent }} /><span style={{ fontSize: '10px', opacity: 0.5 }}>{item.rating}</span></div>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: t.primary }}>{item.price}</p>
          </div>
        ))}
      </div>
      {/* Bottom Nav */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around" style={{ padding: '12px 0', borderTop: `1px solid ${t.text}08`, backgroundColor: t.bg }}>
        {[ShoppingBag, Search, Heart, Users].map((Icon, i) => (
          <Icon key={i} className="size-4" style={{ color: i === 0 ? t.primary : t.text, opacity: i === 0 ? 1 : 0.3 }} />
        ))}
      </div>
    </div>
  )
}

// ─── Admin Dashboard ──────────────────────────────────────────
export function DashboardView({ t }: { t: T }) {
  const stats = [
    { icon: DollarSign, label: 'Revenue', value: '$48,250', change: '+12.5%' },
    { icon: Package, label: 'Orders', value: '1,284', change: '+8.2%' },
    { icon: Users, label: 'Customers', value: '3,841', change: '+15.1%' },
  ]
  const orders = [
    { id: '#4012', customer: 'Sarah M.', total: '$245', status: 'Shipped' },
    { id: '#4011', customer: 'James K.', total: '$89', status: 'Processing' },
    { id: '#4010', customer: 'Emily R.', total: '$312', status: 'Delivered' },
    { id: '#4009', customer: 'David L.', total: '$156', status: 'Processing' },
  ]
  return (
    <div className="w-full max-w-3xl shadow-2xl overflow-hidden flex" style={{ backgroundColor: t.bg, borderRadius: t.radiusMd, fontFamily: t.body.family, color: t.text, height: '460px' }}>
      <aside className="w-48 flex flex-col shrink-0" style={{ backgroundColor: t.secondary, borderRight: `1px solid ${t.text}08` }}>
        <div className="p-3.5 font-bold flex items-center gap-2" style={{ fontFamily: t.heading.family, fontSize: '14px', borderBottom: `1px solid ${t.text}06` }}>
          <ShoppingBag className="size-4" style={{ color: t.accent }} />Store Admin
        </div>
        <div className="flex-1 p-2.5 space-y-0.5">
          {['Overview', 'Orders', 'Products', 'Customers', 'Analytics', 'Settings'].map((item, i) => (
            <div key={item} className="flex items-center gap-2" style={{ backgroundColor: i === 0 ? t.primary : 'transparent', color: i === 0 ? t.bg : t.text, opacity: i === 0 ? 1 : 0.5, padding: `6px 10px`, borderRadius: t.radiusSm, fontWeight: i === 0 ? 600 : 400, fontSize: '12px' }}>
              {[TrendingUp, Package, ShoppingBag, Users, TrendingUp, RotateCcw][i] && (() => { const I = [TrendingUp, Package, ShoppingBag, Users, TrendingUp, RotateCcw][i]; return <I className="size-3.5" /> })()}
              {item}
            </div>
          ))}
        </div>
      </aside>
      <main className="flex-1 p-5 flex flex-col gap-4 overflow-hidden">
        <header className="flex items-center justify-between">
          <div>
            <h2 style={{ fontFamily: t.heading.family, fontSize: '1.15rem', fontWeight: 'bold' }}>Overview</h2>
            <p style={{ fontSize: '11px', opacity: 0.4 }}>Welcome back, here&apos;s your store today.</p>
          </div>
          <button style={{ backgroundColor: t.primary, color: t.bg, padding: '6px 16px', borderRadius: t.radiusSm, fontSize: '11px', fontWeight: 700 }}>+ Add Product</button>
        </header>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(s => (
            <div key={s.label} style={{ backgroundColor: t.secondary, padding: '12px', borderRadius: t.radiusMd }}>
              <div className="flex items-center justify-between mb-2">
                <s.icon className="size-3.5" style={{ color: t.accent, opacity: 0.7 }} />
                <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 600 }}>{s.change}</span>
              </div>
              <div style={{ fontFamily: t.heading.family, fontSize: '1.15rem', fontWeight: 'bold', marginBottom: '2px' }}>{s.value}</div>
              <div style={{ fontSize: '10px', opacity: 0.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Orders Table */}
        <div className="flex-1 overflow-hidden" style={{ backgroundColor: t.secondary, borderRadius: t.radiusMd, padding: '12px' }}>
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: '12px', fontWeight: 700 }}>Recent Orders</p>
            <span style={{ fontSize: '10px', color: t.accent, fontWeight: 600 }}>View All</span>
          </div>
          <div className="space-y-2">
            {orders.map(o => (
              <div key={o.id} className="flex items-center justify-between" style={{ padding: '6px 8px', borderRadius: t.radiusSm, backgroundColor: t.bg }}>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', opacity: 0.5 }}>{o.id}</span>
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>{o.customer}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{o.total}</span>
                  <span style={{ fontSize: '9px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px', backgroundColor: o.status === 'Shipped' ? `${t.accent}20` : o.status === 'Delivered' ? '#22c55e20' : `${t.primary}15`, color: o.status === 'Shipped' ? t.accent : o.status === 'Delivered' ? '#22c55e' : t.primary }}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Product & Pricing Cards ──────────────────────────────────
export function CardsView({ t }: { t: T }) {
  return (
    <div className="w-full max-w-2xl grid grid-cols-2 gap-3" style={{ fontFamily: t.body.family, color: t.text }}>
      {/* Product Card */}
      <div style={{ backgroundColor: t.bg, borderRadius: t.radiusMd, overflow: 'hidden', boxShadow: t.shadowMd, border: `1px solid ${t.text}06` }}>
        <div className="relative" style={{ height: '110px', backgroundColor: t.secondary }}>
          <span className="absolute top-2 left-2" style={{ backgroundColor: t.accent, color: '#fff', fontSize: '8px', fontWeight: 700, padding: '2px 6px', borderRadius: t.radiusSm }}>New</span>
          <button className="absolute top-2 right-2 size-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${t.bg}cc` }}><Heart className="size-3" style={{ color: t.text, opacity: 0.5 }} /></button>
        </div>
        <div style={{ padding: t.spaceSm }}>
          <p style={{ fontSize: '10px', opacity: 0.4, marginBottom: '2px' }}>Accessories</p>
          <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Minimalist Watch</p>
          <div className="flex items-center gap-1 mb-2">{[1,2,3,4,5].map(i => <Star key={i} className="size-2.5" style={{ color: i <= 4 ? t.accent : t.text, opacity: i <= 4 ? 1 : 0.15 }} />)}<span style={{ fontSize: '10px', opacity: 0.4, marginLeft: '2px' }}>4.8</span></div>
          <div className="flex items-center justify-between">
            <p style={{ fontSize: '14px', fontWeight: 700, color: t.primary }}>$189</p>
            <button style={{ backgroundColor: t.primary, color: t.bg, padding: '4px 10px', borderRadius: t.radiusSm, fontSize: '10px', fontWeight: 700 }}>Add to Cart</button>
          </div>
        </div>
      </div>
      {/* Pricing Card */}
      <div style={{ background: `linear-gradient(145deg, ${t.primary}, ${t.accent})`, color: '#fff', padding: t.spaceMd, borderRadius: t.radiusLg, boxShadow: t.shadowMd }}>
        <p style={{ fontSize: '10px', fontWeight: 700, opacity: 0.7, letterSpacing: '1px', marginBottom: '4px' }}>PRO MEMBERSHIP</p>
        <p style={{ fontFamily: t.heading.family, fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px' }}>$29<span style={{ fontSize: '13px', fontWeight: 400, opacity: 0.7 }}>/mo</span></p>
        <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: t.spaceMd, lineHeight: 1.4 }}>Free shipping, early access, exclusive deals.</p>
        <button style={{ backgroundColor: '#fff', color: t.primary, padding: '8px', borderRadius: t.radiusSm, fontWeight: 700, width: '100%', fontSize: '12px' }}>Subscribe Now</button>
      </div>
      {/* Review Card */}
      <div className="col-span-2" style={{ backgroundColor: t.bg, padding: t.spaceMd, borderRadius: t.radiusSm, boxShadow: t.shadowSm, border: `1px solid ${t.text}06` }}>
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full shrink-0" style={{ backgroundColor: t.accent, opacity: 0.15 }} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p style={{ fontSize: '13px', fontWeight: 600 }}>Maria Chen</p>
              <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="size-2.5" style={{ color: t.accent }} />)}</div>
            </div>
            <p style={{ fontSize: '12px', opacity: 0.55, lineHeight: 1.5 }}>&quot;Absolutely love the quality. Fast shipping and the packaging was beautiful. Will definitely order again!&quot;</p>
            <p style={{ fontSize: '10px', opacity: 0.3, marginTop: '6px' }}>Verified Purchase · 2 days ago</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Auth / Login ─────────────────────────────────────────────
export function FormView({ t }: { t: T }) {
  return (
    <div className="w-full max-w-sm shadow-2xl overflow-hidden" style={{ backgroundColor: t.bg, borderRadius: t.radiusLg, fontFamily: t.body.family, color: t.text, padding: t.spaceLg }}>
      <div className="text-center mb-6">
        <div className="size-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }}>
          <ShoppingBag className="size-5" style={{ color: '#fff' }} />
        </div>
        <h2 style={{ fontFamily: t.heading.family, fontSize: '1.35rem', fontWeight: 'bold', marginBottom: '4px' }}>Welcome back</h2>
        <p style={{ fontSize: '13px', opacity: 0.5 }}>Sign in to your store account</p>
      </div>
      <div className="space-y-3 mb-4">
        {['Email address', 'Password'].map(label => (
          <div key={label} className="space-y-1">
            <label style={{ fontSize: '11px', fontWeight: 600, opacity: 0.6 }}>{label}</label>
            <input type="text" readOnly placeholder={label === 'Email address' ? 'you@example.com' : '••••••••'} className="w-full outline-none" style={{ backgroundColor: t.secondary, padding: `9px ${t.spaceMd}`, borderRadius: t.radiusSm, border: `1px solid ${t.text}08`, color: t.text, fontSize: '13px' }} />
          </div>
        ))}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5"><div className="size-3.5 rounded" style={{ border: `1.5px solid ${t.text}25` }} /><span style={{ fontSize: '11px', opacity: 0.5 }}>Remember me</span></label>
          <span style={{ fontSize: '11px', color: t.accent, fontWeight: 600 }}>Forgot password?</span>
        </div>
        <button style={{ backgroundColor: t.primary, color: t.bg, padding: '10px', borderRadius: t.radiusSm, fontWeight: 700, width: '100%', fontSize: '13px' }}>Sign In</button>
      </div>
      <div className="flex items-center gap-3 mb-4"><div className="flex-1 h-px" style={{ backgroundColor: `${t.text}10` }} /><span style={{ fontSize: '10px', opacity: 0.3 }}>or continue with</span><div className="flex-1 h-px" style={{ backgroundColor: `${t.text}10` }} /></div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {['Google', 'Apple'].map(p => (
          <button key={p} style={{ border: `1px solid ${t.text}12`, borderRadius: t.radiusSm, padding: '8px', fontSize: '12px', fontWeight: 600, opacity: 0.6 }}>{p}</button>
        ))}
      </div>
      <p className="text-center" style={{ fontSize: '12px', opacity: 0.45 }}>New here? <span style={{ color: t.accent, fontWeight: 700 }}>Create account</span></p>
    </div>
  )
}

// ─── Typography Scale ─────────────────────────────────────────
export function TypographyView({ t }: { t: T }) {
  const scales = [
    { label: 'Display', size: t.heading.size, weight: t.heading.weight, family: t.heading.family, sample: 'Summer Collection' },
    { label: 'H2', size: '24px', weight: 'bold', family: t.heading.family, sample: 'New Arrivals' },
    { label: 'H3', size: '20px', weight: '600', family: t.heading.family, sample: 'Featured Products' },
    { label: 'Body', size: t.body.size, weight: t.body.weight, family: t.body.family, sample: 'Premium quality goods curated for modern living.' },
    { label: 'Small', size: '13px', weight: 'normal', family: t.body.family, sample: 'Free shipping on orders over $50.' },
    { label: 'Caption', size: '11px', weight: 'normal', family: t.body.family, sample: 'SKU: WCH-2026-BLK · In stock' },
  ]
  return (
    <div className="w-full max-w-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: t.bg, borderRadius: t.radiusMd, color: t.text }}>
      {scales.map((s, i) => (
        <div key={s.label} className="flex items-baseline gap-4" style={{ padding: `14px ${t.spaceLg}`, borderBottom: i < scales.length - 1 ? `1px solid ${t.text}06` : 'none' }}>
          <span style={{ fontSize: '9px', fontFamily: 'monospace', opacity: 0.3, width: '48px', flexShrink: 0 }}>{s.label}</span>
          <span style={{ fontFamily: s.family, fontSize: s.size, fontWeight: s.weight as any, lineHeight: 1.3 }}>{s.sample}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Color Palette ────────────────────────────────────────────
export function PaletteView({ t }: { t: T }) {
  const swatches = [
    { label: 'Primary', value: t.primary },
    { label: 'Secondary', value: t.secondary },
    { label: 'Accent', value: t.accent },
    { label: 'Background', value: t.bg },
    { label: 'Text', value: t.text },
  ]
  return (
    <div className="w-full max-w-2xl space-y-4" style={{ fontFamily: t.body.family }}>
      <div className="grid grid-cols-5 gap-3">
        {swatches.map(s => (
          <div key={s.label} className="space-y-2">
            <div className="aspect-square shadow-inner" style={{ backgroundColor: s.value, border: `1px solid ${t.text}12`, borderRadius: t.radiusMd }} />
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: t.text }}>{s.label}</p>
              <p style={{ fontSize: '10px', fontFamily: 'monospace', opacity: 0.4, color: t.text }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="h-14 overflow-hidden flex" style={{ borderRadius: t.radiusMd, boxShadow: t.shadowMd }}>
        {swatches.map(s => <div key={s.label} className="flex-1" style={{ backgroundColor: s.value }} />)}
      </div>
    </div>
  )
}
