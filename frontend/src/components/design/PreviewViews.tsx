'use client'

import { ArrowRight, BarChart3, Bell, Check, CheckCircle, CreditCard, Eye, EyeOff, Globe, Heart, Package, Play, Plus, RotateCcw, Search, Settings, ShoppingBag, Sparkles, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { useState } from 'react';

interface T {
  primary: string; secondary: string; tertiary: string; accent: string
  bg: string; text: string
  heading: { family: string; size: string; weight: string }
  body: { family: string; size: string; weight: string }
  spaceSm: string; spaceMd: string; spaceLg: string
  shadowSm: string; shadowMd: string
  radiusSm: string; radiusMd: string; radiusLg: string
}

// ─── Desktop Landing Hero ─────────────────────────────────────
export function DesktopView({ t }: { t: T }) {
  return (
    <div className="w-full max-w-3xl h-[500px] overflow-hidden" style={{ backgroundColor: t.bg, borderRadius: t.radiusLg, fontFamily: t.body.family, color: t.text, boxShadow: `0 25px 60px -12px ${t.text}15, 0 0 0 1px ${t.text}06` }}>

      {/* ── Navbar ── */}
      <header className="flex items-center justify-between" style={{ padding: `12px ${t.spaceLg}`, borderBottom: `1px solid ${t.text}08` }}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center" style={{ width: '26px', height: '26px', borderRadius: t.radiusSm, background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }}>
              <Sparkles className="size-3.5" style={{ color: '#fff' }} />
            </div>
            <span style={{ fontFamily: t.heading.family, fontSize: '15px', fontWeight: 800, letterSpacing: '-0.5px' }}>Acme</span>
          </div>
          <div style={{ width: '1px', height: '16px', backgroundColor: `${t.text}12` }} />
          <nav className="flex items-center gap-4" style={{ fontSize: '12px', opacity: 0.5, fontWeight: 500 }}>
            <span>Product</span><span>Pricing</span><span>About</span><span>Resources</span>
          </nav>
        </div>
        <div className="flex items-center gap-2.5">
          <button style={{ fontSize: '12px', fontWeight: 600, opacity: 0.6, padding: '6px 14px' }}>Login</button>
          <button style={{ fontSize: '12px', fontWeight: 700, backgroundColor: t.primary, color: t.bg, padding: '7px 18px', borderRadius: t.radiusSm }}>Register</button>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <div className="flex" style={{ padding: `${t.spaceLg} ${t.spaceLg}`, gap: '32px', minHeight: '340px' }}>

        {/* Left Column: Headline */}
        <div className="flex-1 flex flex-col justify-center" style={{ paddingRight: '12px' }}>
          {/* Badge */}
          <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
            <div style={{ padding: '4px 12px', borderRadius: '99px', backgroundColor: `${t.accent}12`, border: `1px solid ${t.accent}20`, fontSize: '10px', fontWeight: 700, color: t.accent, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap className="size-2.5" /> New Feature
            </div>
          </div>

          <h1 style={{ fontFamily: t.heading.family, fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-1.5px', marginBottom: '14px' }}>
            Simplify Your<br />Product<br />Management.
          </h1>
          <p style={{ fontSize: '13px', opacity: 0.45, lineHeight: 1.7, marginBottom: '24px', maxWidth: '340px' }}>
            Easily track your inventory, create workflows, and make smart decisions with our powerful platform.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2" style={{ backgroundColor: t.primary, color: t.bg, padding: '11px 24px', borderRadius: t.radiusMd, fontWeight: 700, fontSize: '13px' }}>
              Get Started <ArrowRight className="size-3.5" />
            </button>
            <button className="flex items-center gap-2" style={{ border: `1.5px solid ${t.text}15`, color: t.text, padding: '10px 20px', borderRadius: t.radiusMd, fontWeight: 600, fontSize: '13px', opacity: 0.65 }}>
              <Play className="size-3" style={{ fill: t.text, opacity: 0.5 }} /> Watch Demo
            </button>
          </div>
        </div>

        {/* Right Column: Bento Grid */}
        <div className="flex-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto auto', gap: '10px' }}>

          {/* Revenue Card – spans 2 cols */}
          <div style={{ gridColumn: '1 / -1', padding: '14px 16px', backgroundColor: t.secondary, borderRadius: t.radiusMd, border: `1px solid ${t.text}06`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '9px', fontWeight: 600, opacity: 0.35, letterSpacing: '1px', marginBottom: '4px' }}>MONTHLY REVENUE</p>
              <p style={{ fontFamily: t.heading.family, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>$48,250</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '36px' }}>
              {[40, 55, 35, 65, 50, 75, 60, 85, 70, 90].map((h, i) => (
                <div key={i} style={{ width: '6px', height: `${h}%`, borderRadius: '2px', backgroundColor: i >= 7 ? t.accent : t.primary, opacity: i >= 7 ? 0.9 : 0.2 + i * 0.06 }} />
              ))}
            </div>
          </div>

          {/* Users Card */}
          <div style={{ padding: '14px 16px', backgroundColor: t.secondary, borderRadius: t.radiusMd, border: `1px solid ${t.text}06` }}>
            <div className="flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
              <Users className="size-3" style={{ color: t.accent, opacity: 0.7 }} />
              <span style={{ fontSize: '9px', fontWeight: 600, opacity: 0.35, letterSpacing: '0.5px' }}>ACTIVE USERS</span>
            </div>
            <p style={{ fontFamily: t.heading.family, fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px' }}>3,841</p>
            {/* Stacked Avatars */}
            <div className="flex items-center">
              {[t.primary, t.accent, `${t.primary}90`, `${t.accent}80`].map((c, i) => (
                <div key={i} style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: c, border: `2px solid ${t.bg}`, marginLeft: i > 0 ? '-6px' : '0', zIndex: 4 - i, opacity: 0.8 }} />
              ))}
              <span style={{ fontSize: '9px', fontWeight: 700, opacity: 0.35, marginLeft: '6px' }}>+2.4k</span>
            </div>
          </div>

          {/* Conversion Card */}
          <div style={{ padding: '14px 16px', backgroundColor: t.secondary, borderRadius: t.radiusMd, border: `1px solid ${t.text}06` }}>
            <div className="flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
              <BarChart3 className="size-3" style={{ color: t.accent, opacity: 0.7 }} />
              <span style={{ fontSize: '9px', fontWeight: 600, opacity: 0.35, letterSpacing: '0.5px' }}>CONVERSION</span>
            </div>
            {/* Progress Ring */}
            <div className="flex items-center gap-3">
              <svg width="44" height="44" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" fill="none" stroke={`${t.text}10`} strokeWidth="4" />
                <circle cx="22" cy="22" r="18" fill="none" stroke={t.accent} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${0.75 * 113} ${0.25 * 113}`} transform="rotate(-90 22 22)" />
                <text x="22" y="22" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '11px', fontWeight: 800, fill: t.text, fontFamily: t.heading.family }}>75%</text>
              </svg>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 600, opacity: 0.5 }}>Target Met</p>
                <p style={{ fontSize: '9px', fontWeight: 600, color: '#22c55e' }}>↑ +12.5%</p>
              </div>
            </div>
          </div>

          {/* Growth Badge Card – spans 2 cols */}
          <div style={{ gridColumn: '1 / -1', padding: '12px 16px', background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`, borderRadius: t.radiusMd, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '2px' }}>Growth on track</p>
              <p style={{ fontSize: '10px', opacity: 0.7 }}>All KPIs ahead of schedule this quarter</p>
            </div>
            <div className="flex items-center gap-2">
              {[CheckCircle, Globe, TrendingUp].map((Icon, i) => (
                <div key={i} className="flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  <Icon className="size-3.5" style={{ color: '#fff', opacity: 0.9 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust Bar ── */}
      <div className="flex items-center justify-around" style={{ padding: `14px ${t.spaceLg}`, borderTop: `1px solid ${t.text}06` }}>
        {['amazon', 'ATLASSIAN', 'Dropbox', 'Medium', 'Notion', 'Stripe'].map(brand => (
          <span key={brand} style={{ fontSize: '11px', fontWeight: 700, opacity: 0.18, letterSpacing: brand === 'ATLASSIAN' ? '1.5px' : '-0.3px', fontFamily: t.heading.family }}>{brand}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Mobile Store App ─────────────────────────────────────────
export function MobileView({ t }: { t: T }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dates = [7, 8, 9, 10, 11, 12, 13]
  const todayIdx = 3

  const items = [
    { name: 'Running Shoes', price: '$145', rating: 4.8, streak: '3 days', time: '5 min' },
    { name: 'Canvas Backpack', price: '$89', rating: 4.6, streak: '6 days', time: '15 min' },
    { name: 'Sunglasses', price: '$52', rating: 4.9, streak: '5 days', time: '10 min' },
  ]

  return (
    <div className="relative" style={{ width: '360px' }}>
      {/* ── Phone Bezel Frame ── */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: '44px',
          border: `8px solid ${t.text}18`,
          boxShadow: `0 25px 80px -15px ${t.text}30, 0 0 0 1px ${t.text}08, inset 0 0 0 1px ${t.text}06`,
          backgroundColor: t.bg,
          fontFamily: t.body.family,
          color: t.text,
        }}
      >
        {/* ── Dynamic Island ── */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
          <div
            className="flex items-center justify-center"
            style={{
              width: '100px',
              height: '26px',
              borderRadius: '20px',
              backgroundColor: '#000',
            }}
          >
            <div className="size-3 rounded-full bg-zinc-700" style={{ marginRight: '6px' }} />
            <div className="size-3 rounded-full bg-zinc-700" style={{ marginRight: '6px' }} />
          </div>
        </div>

        {/* ── Status Bar ── */}
        <div
          className="relative z-20 flex items-center justify-between"
          style={{ padding: '14px 24px 0', height: '48px' }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '-0.3px' }}>9:41</span>
          <div className="flex items-center gap-1">
            {/* Signal bars */}
            <div className="flex items-end gap-[2px]">
              {[4, 6, 8, 10].map((h, i) => (
                <div key={i} style={{ width: '3px', height: `${h}px`, borderRadius: '1px', backgroundColor: t.text, opacity: i < 3 ? 0.8 : 0.2 }} />
              ))}
            </div>
            {/* WiFi */}
            <svg width="13" height="10" viewBox="0 0 13 10" style={{ opacity: 0.7, marginLeft: '2px' }}>
              <path d="M6.5 9.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill={t.text} />
              <path d="M3.8 6.8a3.8 3.8 0 0 1 5.4 0" stroke={t.text} strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M1.5 4.3a7 7 0 0 1 10 0" stroke={t.text} strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </svg>
            {/* Battery */}
            <div className="flex items-center" style={{ marginLeft: '2px' }}>
              <div style={{ width: '22px', height: '11px', borderRadius: '3px', border: `1.5px solid ${t.text}50`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: '1.5px', borderRadius: '1.5px', width: '65%', backgroundColor: t.text, opacity: 0.8 }} />
              </div>
              <div style={{ width: '2px', height: '5px', borderRadius: '0 1px 1px 0', backgroundColor: t.text, opacity: 0.3, marginLeft: '1px' }} />
            </div>
          </div>
        </div>

        {/* ── App Content ── */}
        <div style={{ padding: '12px 20px 0' }}>
          {/* Greeting Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', opacity: 0.45, marginBottom: '2px' }}>Good morning 👋</p>
              <p style={{ fontFamily: t.heading.family, fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>Discover</p>
            </div>
            <div
              className="flex items-center justify-center"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${t.accent}40, ${t.primary}30)`,
                border: `2px solid ${t.accent}30`,
              }}
            >
              <span style={{ fontSize: '14px' }}>🧑</span>
            </div>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2.5"
            style={{
              backgroundColor: t.secondary,
              padding: '10px 14px',
              borderRadius: t.radiusMd,
              marginBottom: '16px',
              border: `1px solid ${t.text}06`,
            }}
          >
            <Search className="size-3.5" style={{ opacity: 0.25 }} />
            <span style={{ fontSize: '12px', opacity: 0.3 }}>Search products...</span>
          </div>

          {/* Calendar Day Strip */}
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            {days.map((day, i) => {
              const isToday = i === todayIdx
              return (
                <div key={day} className="flex flex-col items-center" style={{ gap: '5px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 500, opacity: isToday ? 1 : 0.35, color: isToday ? t.primary : t.text }}>{day}</span>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '10px',
                      backgroundColor: isToday ? t.primary : 'transparent',
                      color: isToday ? t.bg : t.text,
                      fontWeight: isToday ? 700 : 400,
                      fontSize: '12px',
                      opacity: isToday ? 1 : 0.4,
                      border: isToday ? 'none' : `1px solid ${t.text}10`,
                    }}
                  >
                    {dates[i]}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Promotional Banner */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: t.radiusMd,
              background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`,
              color: '#fff',
              marginBottom: '18px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: '-8px',
                top: '-8px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: '10px',
                bottom: '-15px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
              }}
            />
            <p style={{ fontSize: '9px', fontWeight: 700, opacity: 0.75, letterSpacing: '1.5px', marginBottom: '4px' }}>LIMITED OFFER</p>
            <p style={{ fontFamily: t.heading.family, fontSize: '22px', fontWeight: 'bold', lineHeight: 1.1, marginBottom: '3px' }}>30% Off</p>
            <p style={{ fontSize: '11px', opacity: 0.75 }}>Summer essentials</p>
          </div>

          {/* Trending Section */}
          <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, fontFamily: t.heading.family }}>Trending Now</p>
            <span style={{ fontSize: '10px', color: t.accent, fontWeight: 600, opacity: 0.8 }}>See All</span>
          </div>

          {/* Product List */}
          <div className="space-y-2.5" style={{ paddingBottom: '80px' }}>
            {items.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center gap-3"
                style={{
                  padding: '10px 12px',
                  backgroundColor: t.secondary,
                  borderRadius: t.radiusMd,
                  border: `1px solid ${t.text}06`,
                }}
              >
                {/* Product Swatch */}
                <div
                  className="shrink-0"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: t.radiusSm,
                    background: idx === 0
                      ? `linear-gradient(135deg, ${t.primary}40, ${t.accent}60)`
                      : idx === 1
                        ? `linear-gradient(135deg, ${t.accent}50, ${t.primary}30)`
                        : `linear-gradient(135deg, ${t.accent}70, ${t.primary}20)`,
                  }}
                />
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>{item.name}</p>
                  <div className="flex items-center gap-1.5">
                    <Star className="size-2.5" style={{ color: t.accent, fill: t.accent }} />
                    <span style={{ fontSize: '10px', opacity: 0.4 }}>{item.rating}</span>
                    <span style={{ fontSize: '9px', opacity: 0.25, margin: '0 2px' }}>·</span>
                    <span style={{ fontSize: '9px', opacity: 0.3 }}>{item.streak}</span>
                  </div>
                </div>
                {/* Price */}
                <p style={{ fontSize: '14px', fontWeight: 700, color: t.primary, fontFamily: t.heading.family }}>{item.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom Tab Bar ── */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            backgroundColor: t.bg,
            borderTop: `1px solid ${t.text}08`,
            paddingTop: '8px',
            paddingBottom: '20px',
          }}
        >
          <div className="flex items-center justify-around" style={{ padding: '0 16px' }}>
            {[
              { icon: ShoppingBag, label: 'Shop', active: true },
              { icon: Search, label: 'Search', active: false },
              { icon: Heart, label: 'Saved', active: false },
              { icon: Users, label: 'Profile', active: false },
            ].map((tab, i) => (
              <div key={i} className="flex flex-col items-center" style={{ gap: '3px' }}>
                <tab.icon
                  className="size-[18px]"
                  style={{
                    color: tab.active ? t.primary : t.text,
                    opacity: tab.active ? 1 : 0.25,
                    strokeWidth: tab.active ? 2.2 : 1.5,
                  }}
                />
                <span
                  style={{
                    fontSize: '8px',
                    fontWeight: tab.active ? 700 : 500,
                    color: tab.active ? t.primary : t.text,
                    opacity: tab.active ? 1 : 0.25,
                  }}
                >
                  {tab.label}
                </span>
              </div>
            ))}
          </div>

          {/* Home Indicator */}
          <div className="flex justify-center" style={{ marginTop: '8px' }}>
            <div style={{ width: '100px', height: '4px', borderRadius: '99px', backgroundColor: t.text, opacity: 0.12 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Admin Dashboard ──────────────────────────────────────────
export function DashboardView({ t }: { t: T }) {
  const activities = [
    { id: 'INV_000076', icon: '📱', activity: 'Mobile App Purchase', price: '$25,500', status: 'Completed', date: '17 Apr, 2026' },
    { id: 'INV_000075', icon: '🏨', activity: 'Hotel Booking', price: '$32,750', status: 'Pending', date: '15 Apr, 2026' },
    { id: 'INV_000074', icon: '✈️', activity: 'Flight Ticket', price: '$40,200', status: 'Completed', date: '15 Apr, 2026' },
    { id: 'INV_000073', icon: '🛒', activity: 'Grocery Purchase', price: '$50,200', status: 'In Progress', date: '14 Apr, 2026' },
    { id: 'INV_000072', icon: '💻', activity: 'Software License', price: '$15,900', status: 'Completed', date: '10 Apr, 2026' },
  ]
  const chartMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
  const profitData = [35, 50, 30, 65, 45, 60, 40, 70]
  const lossData = [20, 30, 40, 25, 35, 20, 30, 25]

  const sidebarItems = [
    { icon: TrendingUp, label: 'Overview', active: true },
    { icon: BarChart3, label: 'Activity' },
    { icon: Package, label: 'Manage' },
    { icon: Globe, label: 'Program' },
    { icon: Users, label: 'Account' },
    { icon: RotateCcw, label: 'Reports' },
  ]

  return (
    <div className="w-full max-w-4xl overflow-hidden flex" style={{ backgroundColor: t.bg, borderRadius: t.radiusLg, fontFamily: t.body.family, color: t.text, height: '590px', boxShadow: `0 25px 60px -12px ${t.text}15, 0 0 0 1px ${t.text}06` }}>

      {/* ── Sidebar ── */}
      <aside className="flex flex-col shrink-0" style={{ width: '56px', backgroundColor: t.secondary, borderRight: `1px solid ${t.text}06` }}>
        {/* Logo */}
        <div className="flex items-center justify-center" style={{ height: '52px', borderBottom: `1px solid ${t.text}06` }}>
          <div className="flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: t.radiusSm, background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }}>
            <Sparkles className="size-3.5" style={{ color: '#fff' }} />
          </div>
        </div>
        {/* Nav Icons */}
        <div className="flex-1 flex flex-col items-center gap-1 py-3">
          {sidebarItems.map((item, i) => (
            <div
              key={item.label}
              className="flex items-center justify-center"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: t.radiusSm,
                backgroundColor: item.active ? t.primary : 'transparent',
                color: item.active ? t.bg : t.text,
                opacity: item.active ? 1 : 0.35,
                cursor: 'pointer',
              }}
              title={item.label}
            >
              <item.icon className="size-4" />
            </div>
          ))}
        </div>
        {/* Bottom Settings */}
        <div className="flex items-center justify-center pb-3">
          <div className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: t.radiusSm, opacity: 0.3 }}>
            <RotateCcw className="size-4" style={{ color: t.text }} />
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Nav Bar */}
        <header className="flex items-center justify-between shrink-0" style={{ padding: '14px 24px', borderBottom: `1px solid ${t.text}06` }}>
          <nav className="flex items-center gap-1">
            {['Overview', 'Activity', 'Manage', 'Program', 'Account', 'Reports'].map((tab, i) => (
              <span key={tab} style={{
                fontSize: '11px',
                fontWeight: i === 0 ? 700 : 500,
                padding: '5px 12px',
                borderRadius: '99px',
                backgroundColor: i === 0 ? t.primary : 'transparent',
                color: i === 0 ? t.bg : t.text,
                opacity: i === 0 ? 1 : 0.4,
              }}>
                {tab}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Search className="size-3.5" style={{ opacity: 0.3 }} />
            <div className="flex items-center gap-2">
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `linear-gradient(135deg, ${t.accent}40, ${t.primary}30)`, border: `2px solid ${t.accent}20` }} />
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700 }}>Alex Morgan</p>
                <p style={{ fontSize: '8px', opacity: 0.4 }}>alex@acme.io</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '20px 24px' }}>
          {/* Greeting */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontFamily: t.heading.family, fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px' }}>Good morning, Alex</h2>
            <p style={{ fontSize: '11px', opacity: 0.4 }}>Stay on top of your tasks, monitor progress, and track status.</p>
          </div>

          {/* ── Stat Cards Row ── */}
          <div className="grid grid-cols-4 gap-3" style={{ marginBottom: '20px' }}>
            {/* Total Balance */}
            <div style={{ padding: '14px', backgroundColor: t.secondary, borderRadius: t.radiusMd, border: `1px solid ${t.text}06` }}>
              <p style={{ fontSize: '9px', fontWeight: 600, opacity: 0.35, letterSpacing: '0.5px', marginBottom: '8px' }}>TOTAL BALANCE</p>
              <p style={{ fontFamily: t.heading.family, fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '4px' }}>$689,372</p>
              <div className="flex items-center gap-1">
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#22c55e' }}>↑ 7.5%</span>
                <span style={{ fontSize: '8px', opacity: 0.35 }}>vs last month</span>
              </div>
            </div>
            {/* Total Earnings */}
            <div style={{ padding: '14px', background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`, borderRadius: t.radiusMd, color: '#fff' }}>
              <p style={{ fontSize: '9px', fontWeight: 600, opacity: 0.7, letterSpacing: '0.5px', marginBottom: '8px' }}>TOTAL EARNINGS</p>
              <p style={{ fontFamily: t.heading.family, fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '4px' }}>$950</p>
              <div className="flex items-center gap-1">
                <span style={{ fontSize: '9px', fontWeight: 700, opacity: 0.8 }}>↑ 7%</span>
                <span style={{ fontSize: '8px', opacity: 0.6 }}>This month</span>
              </div>
            </div>
            {/* Total Spending */}
            <div style={{ padding: '14px', background: `linear-gradient(135deg, ${t.accent}, ${t.primary}90)`, borderRadius: t.radiusMd, color: '#fff' }}>
              <p style={{ fontSize: '9px', fontWeight: 600, opacity: 0.7, letterSpacing: '0.5px', marginBottom: '8px' }}>TOTAL SPENDING</p>
              <p style={{ fontFamily: t.heading.family, fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '4px' }}>$700</p>
              <div className="flex items-center gap-1">
                <span style={{ fontSize: '9px', fontWeight: 700, opacity: 0.8 }}>↓ 5%</span>
                <span style={{ fontSize: '8px', opacity: 0.6 }}>This month</span>
              </div>
            </div>
            {/* Total Income */}
            <div style={{ padding: '14px', backgroundColor: t.secondary, borderRadius: t.radiusMd, border: `1px solid ${t.text}06` }}>
              <p style={{ fontSize: '9px', fontWeight: 600, opacity: 0.35, letterSpacing: '0.5px', marginBottom: '8px' }}>TOTAL INCOME</p>
              <p style={{ fontFamily: t.heading.family, fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '4px' }}>$1,050</p>
              <div className="flex items-center gap-1">
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#22c55e' }}>↑ 8%</span>
                <span style={{ fontSize: '8px', opacity: 0.35 }}>This month</span>
              </div>
            </div>
          </div>

          {/* ── Middle Row: Chart + Spending ── */}
          <div className="grid grid-cols-5 gap-3" style={{ marginBottom: '20px' }}>
            {/* Profit & Loss Chart */}
            <div className="col-span-3 h-full" style={{ padding: '16px', backgroundColor: t.secondary, borderRadius: t.radiusMd, border: `1px solid ${t.text}06` }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, fontFamily: t.heading.family }}>Profit and Loss</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1"><div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: t.primary }} /><span style={{ fontSize: '8px', opacity: 0.4, fontWeight: 600 }}>Profit</span></div>
                  <div className="flex items-center gap-1"><div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: `${t.text}20` }} /><span style={{ fontSize: '8px', opacity: 0.4, fontWeight: 600 }}>Loss</span></div>
                </div>
              </div>
              {/* Bar Chart */}
              <div className="flex items-end justify-between" style={{ height: '250px', gap: '6px' }}>
                {chartMonths.map((month, i) => (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end gap-[2px]" style={{ height: '80px' }}>
                      <div className="flex-1" style={{ height: `${profitData[i]}%`, backgroundColor: t.primary, borderRadius: '2px 2px 0 0', opacity: 0.85 }} />
                      <div className="flex-1" style={{ height: `${lossData[i]}%`, backgroundColor: `${t.text}15`, borderRadius: '2px 2px 0 0' }} />
                    </div>
                    <span style={{ fontSize: '7px', opacity: 0.3, fontWeight: 600 }}>{month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spending Limit + Wallets */}
            <div className="col-span-2 flex flex-col gap-3">
              {/* Spending Limit */}
              <div style={{ padding: '14px', backgroundColor: t.secondary, borderRadius: t.radiusMd, border: `1px solid ${t.text}06` }}>
                <p style={{ fontSize: '11px', fontWeight: 700, marginBottom: '10px' }}>Monthly Spending Limit</p>
                <div style={{ width: '100%', height: '6px', borderRadius: '99px', backgroundColor: `${t.text}08`, marginBottom: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '25%', height: '100%', borderRadius: '99px', background: `linear-gradient(90deg, ${t.primary}, ${t.accent})` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '9px', opacity: 0.4 }}><b style={{ color: t.text, opacity: 1 }}>$1,400</b> spent out of</span>
                  <span style={{ fontSize: '9px', fontWeight: 700 }}>$5,500</span>
                </div>
              </div>
              {/* Wallets */}
              <div style={{ padding: '14px', backgroundColor: t.secondary, borderRadius: t.radiusMd, border: `1px solid ${t.text}06`, flex: 1 }}>
                <p style={{ fontSize: '11px', fontWeight: 700, marginBottom: '10px' }}>Wallets</p>
                <div className="space-y-2">
                  {[
                    { currency: 'USD', symbol: '🇺🇸', amount: '$22,676', status: 'Active' },
                    { currency: 'EUR', symbol: '🇪🇺', amount: '€18,345', status: 'Active' },
                    { currency: 'GBP', symbol: '🇬🇧', amount: '£15,000', status: 'Inactive' },
                  ].map(w => (
                    <div key={w.currency} className="flex items-center justify-between" style={{ padding: '6px 8px', borderRadius: t.radiusSm, backgroundColor: t.bg, border: `1px solid ${t.text}06` }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '12px' }}>{w.symbol}</span>
                        <div>
                          <p style={{ fontSize: '10px', fontWeight: 700 }}>{w.currency}</p>
                          <p style={{ fontSize: '9px', fontWeight: 600, opacity: 0.5 }}>{w.amount}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '8px', fontWeight: 700, padding: '2px 6px', borderRadius: '99px', backgroundColor: w.status === 'Active' ? '#22c55e18' : `${t.text}08`, color: w.status === 'Active' ? '#22c55e' : t.text, opacity: w.status === 'Active' ? 1 : 0.35 }}>{w.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Recent Activities ── */}
          <div style={{ backgroundColor: t.secondary, borderRadius: t.radiusMd, border: `1px solid ${t.text}06`, padding: '16px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, fontFamily: t.heading.family }}>Recent Activities</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5" style={{ padding: '4px 10px', borderRadius: t.radiusSm, border: `1px solid ${t.text}08`, backgroundColor: t.bg }}>
                  <Search className="size-2.5" style={{ opacity: 0.3 }} />
                  <span style={{ fontSize: '9px', opacity: 0.3 }}>Search</span>
                </div>
                <span style={{ fontSize: '9px', fontWeight: 600, opacity: 0.4, padding: '4px 10px', border: `1px solid ${t.text}08`, borderRadius: t.radiusSm, backgroundColor: t.bg }}>Filter</span>
              </div>
            </div>
            {/* Table Header */}
            <div className="flex items-center" style={{ padding: '6px 8px', marginBottom: '4px' }}>
              <span style={{ flex: 0.5, fontSize: '8px', fontWeight: 700, opacity: 0.3, letterSpacing: '0.5px' }}></span>
              <span style={{ flex: 1.2, fontSize: '8px', fontWeight: 700, opacity: 0.3, letterSpacing: '0.5px' }}>ORDER ID</span>
              <span style={{ flex: 2, fontSize: '8px', fontWeight: 700, opacity: 0.3, letterSpacing: '0.5px' }}>ACTIVITY</span>
              <span style={{ flex: 1, fontSize: '8px', fontWeight: 700, opacity: 0.3, letterSpacing: '0.5px' }}>PRICE</span>
              <span style={{ flex: 1, fontSize: '8px', fontWeight: 700, opacity: 0.3, letterSpacing: '0.5px' }}>STATUS</span>
              <span style={{ flex: 1.3, fontSize: '8px', fontWeight: 700, opacity: 0.3, letterSpacing: '0.5px' }}>DATE</span>
            </div>
            {/* Table Rows */}
            <div className="space-y-1">
              {activities.map(a => (
                <div key={a.id} className="flex items-center" style={{ padding: '7px 8px', borderRadius: t.radiusSm, backgroundColor: t.bg, border: `1px solid ${t.text}04` }}>
                  <span style={{ flex: 0.5 }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '3px', border: `1.5px solid ${t.text}15` }} />
                  </span>
                  <span style={{ flex: 1.2, fontSize: '9px', fontFamily: 'monospace', opacity: 0.45, fontWeight: 500 }}>{a.id}</span>
                  <span className="flex items-center gap-1.5" style={{ flex: 2, fontSize: '10px', fontWeight: 600 }}>
                    <span style={{ fontSize: '11px' }}>{a.icon}</span>
                    {a.activity}
                  </span>
                  <span style={{ flex: 1, fontSize: '10px', fontWeight: 700 }}>{a.price}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{
                      fontSize: '8px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '99px',
                      backgroundColor: a.status === 'Completed' ? '#22c55e15' : a.status === 'Pending' ? `${t.accent}15` : `${t.primary}12`,
                      color: a.status === 'Completed' ? '#22c55e' : a.status === 'Pending' ? t.accent : t.primary,
                    }}>
                      {a.status}
                    </span>
                  </span>
                  <span style={{ flex: 1.3, fontSize: '9px', opacity: 0.4 }}>{a.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Product & Pricing Cards ──────────────────────────────────
// ─── Product & Pricing Cards ──────────────────────────────────
export function CardsView({ t }: { t: T }) {
  return (
    <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" style={{ fontFamily: t.body.family, color: t.text }}>
      {/* ── Card 1: Premium Glassmorphic Credit Card ── */}
      <div style={{
        background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`,
        borderRadius: t.radiusMd,
        padding: '20px',
        color: '#fff',
        boxShadow: t.shadowMd,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '180px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Glass reflection shine */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />
        <div className="flex justify-between items-start z-10">
          <div>
            <p style={{ fontSize: '8px', fontWeight: 700, opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase' }}>Platinum Balance</p>
            <p style={{ fontSize: '18px', fontWeight: 800, fontFamily: t.heading.family, marginTop: '2px' }}>$14,892.45</p>
          </div>
          <div style={{ width: '32px', height: '22px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard className="size-3.5 text-white" />
          </div>
        </div>

        <div className="z-10">
          <p style={{ fontSize: '13px', fontFamily: 'monospace', letterSpacing: '2px', opacity: 0.9 }}>•••• •••• •••• 4821</p>
          <div className="flex justify-between items-end mt-4">
            <div>
              <p style={{ fontSize: '7px', opacity: 0.5, textTransform: 'uppercase' }}>Card Holder</p>
              <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px' }}>ALEX MORGAN</p>
            </div>
            <div className="text-right">
              <p style={{ fontSize: '7px', opacity: 0.5, textTransform: 'uppercase' }}>Expires</p>
              <p style={{ fontSize: '10px', fontWeight: 600 }}>12/28</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Card 2: Stats Sparkline Card (Analytics) ── */}
      <div style={{
        backgroundColor: t.secondary,
        borderRadius: t.radiusMd,
        padding: '16px',
        border: `1px solid ${t.text}08`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '180px',
        boxShadow: t.shadowSm
      }}>
        <div>
          <div className="flex justify-between items-start">
            <span style={{ fontSize: '9px', fontWeight: 700, opacity: 0.4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Conversion Rate</span>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#22c55e', backgroundColor: '#22c55e15', padding: '2px 8px', borderRadius: '99px' }}>+12.4%</span>
          </div>
          <p style={{ fontFamily: t.heading.family, fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>3.82%</p>
        </div>
        {/* SVG Sparkline */}
        <div className="w-full h-14 mt-2">
          <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={t.primary} stopOpacity="0.25" />
                <stop offset="100%" stopColor={t.primary} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 35 Q 15 20, 25 28 T 50 15 T 75 10 T 100 2"
              fill="none"
              stroke={t.primary}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 0 35 Q 15 20, 25 28 T 50 15 T 75 10 T 100 2 L 100 40 L 0 40 Z"
              fill="url(#sparklineGrad)"
            />
          </svg>
        </div>
      </div>

      {/* ── Card 3: Booking & Meet Card (Schedule) ── */}
      <div style={{
        backgroundColor: t.secondary,
        borderRadius: t.radiusMd,
        padding: '16px',
        border: `1px solid ${t.text}08`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '180px',
        boxShadow: t.shadowSm
      }}>
        <div className="flex gap-3">
          {/* Calendar Badge */}
          <div style={{
            width: '36px',
            height: '38px',
            borderRadius: t.radiusSm,
            backgroundColor: `${t.accent}12`,
            border: `1px solid ${t.accent}20`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '7px', fontWeight: 800, color: t.accent, textTransform: 'uppercase' }}>May</span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: t.accent, lineHeight: 1 }}>25</span>
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1.2 }}>UX Sync & Jam Session</p>
            <p style={{ fontSize: '9px', opacity: 0.5, marginTop: '2px' }}>10:00 AM - 11:30 AM</p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          {/* Attendees Avatar Stack */}
          <div className="flex items-center">
            {[t.primary, t.accent, `${t.primary}aa`].map((c, i) => (
              <div key={i} style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: c,
                border: `2px solid ${t.bg}`,
                marginLeft: i > 0 ? '-6px' : '0',
                zIndex: 3 - i
              }} />
            ))}
            <span style={{ fontSize: '8px', fontWeight: 700, opacity: 0.4, marginLeft: '4px' }}>+3</span>
          </div>
          <button style={{
            backgroundColor: t.primary,
            color: t.bg,
            border: 'none',
            borderRadius: t.radiusSm,
            padding: '4px 10px',
            fontSize: '9px',
            fontWeight: 700,
            cursor: 'pointer'
          }}>Join Meet</button>
        </div>
      </div>

      {/* ── Card 4: Recent Notifications (Activity) ── */}
      <div style={{
        backgroundColor: t.bg,
        borderRadius: t.radiusMd,
        padding: '16px',
        border: `1px solid ${t.text}08`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '180px',
        boxShadow: t.shadowSm
      }}>
        <div>
          <div className="flex justify-between items-center mb-3">
            <span style={{ fontSize: '9px', fontWeight: 700, opacity: 0.4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Recent Activity</span>
            <Bell className="size-3" style={{ opacity: 0.4 }} />
          </div>
          <div className="space-y-2">
            {[
              { icon: '✨', title: 'Workspace upgraded', desc: 'Enterprise plan active', time: '5m' },
              { icon: '🔑', title: 'New API key generated', desc: 'By Admin account', time: '1h' },
              { icon: '👤', title: 'New member invited', desc: 'kate@acme.com', time: '2h' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start" style={{ fontSize: '10px' }}>
                <span style={{ fontSize: '11px' }}>{item.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <p style={{ fontWeight: 600 }}>{item.title}</p>
                    <span style={{ fontSize: '8px', opacity: 0.4 }}>{item.time}</span>
                  </div>
                  <p style={{ fontSize: '9px', opacity: 0.4, marginTop: '1px' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Card 5: Interactive Settings (Preferences) ── */}
      <div style={{
        backgroundColor: t.bg,
        borderRadius: t.radiusMd,
        padding: '16px',
        border: `1px solid ${t.text}08`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '180px',
        boxShadow: t.shadowSm
      }}>
        <div>
          <div className="flex justify-between items-center mb-3">
            <span style={{ fontSize: '9px', fontWeight: 700, opacity: 0.4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Settings</span>
            <Settings className="size-3.5" style={{ opacity: 0.4 }} />
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Real-time Alerts', active: true },
              { label: 'Weekly Summary', active: false },
              { label: 'Push Notifications', active: true }
            ].map((opt, i) => (
              <div key={i} className="flex items-center justify-between">
                <span style={{ fontSize: '10px', fontWeight: 600 }}>{opt.label}</span>
                {/* Switch Toggle */}
                <div style={{
                  width: '26px',
                  height: '14px',
                  borderRadius: '99px',
                  backgroundColor: opt.active ? t.accent : `${t.text}15`,
                  padding: '2px',
                  display: 'flex',
                  justifyContent: opt.active ? 'flex-end' : 'flex-start',
                  alignItems: 'center',
                  transition: 'background-color 0.2s',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Card 6: User Profile (Social) ── */}
      <div style={{
        backgroundColor: t.secondary,
        borderRadius: t.radiusMd,
        overflow: 'hidden',
        border: `1px solid ${t.text}08`,
        display: 'flex',
        flexDirection: 'column',
        height: '180px',
        boxShadow: t.shadowSm
      }}>
        {/* Cover Header */}
        <div style={{
          height: '42px',
          background: `linear-gradient(90deg, ${t.primary}99, ${t.accent}99)`
        }} />
        {/* Profile Details */}
        <div style={{ padding: '0 16px 14px 16px', marginTop: '-20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
          <div className="flex justify-between items-end">
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: t.accent,
              border: `2.5px solid ${t.secondary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '12px',
              color: '#fff'
            }}>
              ER
            </div>
            <button style={{
              border: `1px solid ${t.text}20`,
              borderRadius: t.radiusSm,
              padding: '3px 10px',
              fontSize: '9px',
              fontWeight: 700,
              backgroundColor: t.bg,
              color: t.text
            }}>Edit</button>
          </div>

          <div style={{ marginTop: '4px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1.1 }}>Elena Rostova</p>
            <p style={{ fontSize: '9px', opacity: 0.4 }}>Lead Frontend Architect</p>
          </div>

          <div className="flex justify-between border-t" style={{ borderColor: `${t.text}06`, paddingTop: '6px', fontSize: '9px' }}>
            <div>
              <span style={{ fontWeight: 800 }}>84</span>
              <span style={{ opacity: 0.5, marginLeft: '2px' }}>repos</span>
            </div>
            <div>
              <span style={{ fontWeight: 800 }}>12.4k</span>
              <span style={{ opacity: 0.5, marginLeft: '2px' }}>followers</span>
            </div>
            <div>
              <span style={{ fontWeight: 800 }}>982</span>
              <span style={{ opacity: 0.5, marginLeft: '2px' }}>following</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Card 7: Minimalist Product (E-Commerce) ── */}
      <div style={{
        backgroundColor: t.bg,
        borderRadius: t.radiusMd,
        overflow: 'hidden',
        border: `1px solid ${t.text}08`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '180px',
        boxShadow: t.shadowSm
      }}>
        <div className="relative" style={{ height: '76px', backgroundColor: t.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="absolute top-2 left-2" style={{ backgroundColor: t.accent, color: '#fff', fontSize: '7px', fontWeight: 800, padding: '2px 6px', borderRadius: t.radiusSm }}>NEW</span>
          <button className="absolute top-2 right-2 size-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${t.bg}cc` }}><Heart className="size-2.5" style={{ color: t.text, opacity: 0.5 }} /></button>
          <ShoppingBag className="size-7" style={{ color: t.primary, opacity: 0.8 }} />
        </div>
        <div style={{ padding: '10px 12px' }}>
          <div className="flex justify-between items-start">
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700 }}>Nova Earbuds Pro</p>
              <p style={{ fontSize: '9px', opacity: 0.4 }}>Spatial audio & ANC</p>
            </div>
            <p style={{ fontSize: '12px', fontWeight: 800, color: t.primary }}>$199</p>
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="size-2" style={{ fill: t.accent, stroke: t.accent }} />)}
              <span style={{ fontSize: '8px', opacity: 0.4, marginLeft: '2px' }}>(48)</span>
            </div>
            <button style={{
              backgroundColor: t.primary,
              color: t.bg,
              padding: '3px 8px',
              borderRadius: t.radiusSm,
              fontSize: '8px',
              fontWeight: 800
            }}>Buy Now</button>
          </div>
        </div>
      </div>

      {/* ── Card 8: High-converting Plan Tier Card (SaaS Pricing) ── */}
      <div style={{
        backgroundColor: t.bg,
        borderRadius: t.radiusMd,
        padding: '16px',
        border: `2px solid ${t.primary}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '180px',
        boxShadow: t.shadowSm
      }}>
        <span className="absolute top-0 right-4 translate-y-[-50%]" style={{ backgroundColor: t.primary, color: t.bg, fontSize: '8px', fontWeight: 800, padding: '2px 8px', borderRadius: '99px' }}>POPULAR</span>
        <div>
          <div className="flex justify-between items-baseline">
            <span style={{ fontSize: '10px', fontWeight: 800, color: t.primary }}>Scale Plan</span>
            <div>
              <span style={{ fontSize: '16px', fontWeight: 800 }}>$49</span>
              <span style={{ fontSize: '8px', opacity: 0.5 }}>/mo</span>
            </div>
          </div>
          <div className="space-y-1 mt-2.5">
            {[
              'Unlimited active projects',
              'Custom domains & SSL',
              'Priority 24/7 support'
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5" style={{ fontSize: '9px' }}>
                <Check className="size-2.5" style={{ color: t.primary }} />
                <span style={{ opacity: 0.7 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <button style={{
          backgroundColor: t.primary,
          color: t.bg,
          width: '100%',
          padding: '6px',
          borderRadius: t.radiusSm,
          fontSize: '10px',
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer'
        }}>Choose Scale</button>
      </div>
    </div>
  )
}

// ─── Auth / Login ─────────────────────────────────────────────
export function FormView({ t }: { t: T }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full max-w-4xl flex flex-col md:flex-row overflow-hidden shadow-2xl h-auto md:h-[700px] transition-all duration-300" style={{
      borderRadius: t.radiusLg,
      fontFamily: t.body.family,
      border: `1px solid ${t.text}08`,
      backgroundColor: t.bg
    }}>
      {/* Left Promo side */}
      <div className="w-full md:w-[45%] flex flex-col justify-between p-8 text-white relative overflow-hidden h-[480px] md:h-full" style={{
        background: `linear-gradient(135deg, ${t.primary}, ${t.primary}ee)`
      }}>
        {/* Top-right line pattern decoration */}
        <div className="absolute top-8 right-8 flex gap-1 opacity-20">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-1.5 h-6 bg-white rounded-full" />
          ))}
        </div>

        {/* Bottom-left dot pattern decoration */}
        <div className="absolute bottom-8 left-8 grid grid-cols-5 gap-2 opacity-25">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="size-1 bg-white rounded-full" />
          ))}
        </div>

        {/* Logo */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="relative size-6 shrink-0">
            <div className="absolute inset-0 rounded-full border-[3px] border-white opacity-90" />
            <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-white -rotate-45 -translate-y-1/2 opacity-90" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">Stem.</span>
        </div>

        {/* Interactive Dashboard Mockup Illustration */}
        <div className="relative w-full flex items-center justify-center my-6 scale-90 md:scale-100 select-none">
          {/* Left Success Card */}
          <div className="absolute -left-6 bottom-4 z-20 bg-white rounded-xl shadow-xl p-3.5 w-[140px] text-center border border-slate-100/50 transition-all duration-300 hover:scale-105">
            <div className="size-7 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-600 shadow-sm">
              <Check className="size-4" strokeWidth={3.5} />
            </div>
            <p className="text-[9px] font-bold text-slate-400 leading-tight mb-1">Transfer was successful!</p>
            <p className="text-xs font-extrabold text-slate-800">$35,798.00</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-[280px] border border-slate-100/50 text-left relative z-10 transition-all duration-300 hover:shadow-indigo-500/5">
            {/* Income & Expenses */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Income</p>
                <p className="text-sm font-extrabold text-slate-800">$24,908.00</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Expenses</p>
                <p className="text-sm font-extrabold text-slate-800">$1,028.00</p>
              </div>
            </div>

            {/* SVG Chart with absolute popover */}
            <div className="relative mt-4 h-24">
              {/* Popover */}
              <div className="absolute left-[45%] top-[12px] -translate-x-1/2 -translate-y-full bg-slate-900 text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow-lg z-30 flex items-center justify-center">
                $5,052
                <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-1.5 h-1.5 bg-slate-900 rotate-45" />
              </div>
              {/* SVG Chart Line */}
              <svg className="w-full h-16 overflow-visible" viewBox="0 0 100 50">
                <line x1="0" y1="45" x2="100" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="5" x2="100" y2="5" stroke="#f1f5f9" strokeWidth="1" />
                <path
                  d="M0,42 C15,40 30,48 45,28 C60,8 75,38 90,24 C95,20 98,22 100,22"
                  fill="none"
                  stroke={t.primary}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="45" cy="28" r="3.5" fill={t.primary} stroke="white" strokeWidth="1.5" />
              </svg>
              {/* Dates */}
              <div className="flex justify-between text-[8px] text-slate-400 font-bold mt-2 px-1">
                <span>Jan 12</span>
                <span>Jan 13</span>
                <span>Jan 14</span>
                <span>Jan 15</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 my-3" />

            {/* Transactions */}
            <div className="space-y-2">
              {/* Stripe */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-extrabold shadow-sm">S</div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-700 leading-none">Stripe</p>
                    <p className="text-[8px] text-slate-400 mt-0.5">Deposit</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-extrabold text-emerald-500 leading-none">+523.10</p>
                  <p className="text-[8px] text-slate-400 mt-0.5">Today at 7:18 AM</p>
                </div>
              </div>

              {/* Facebook */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-[10px] font-extrabold shadow-sm">f</div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-700 leading-none">Facebook charge</p>
                    <p className="text-[8px] text-slate-400 mt-0.5">Advertising</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-extrabold text-slate-700 leading-none">-600.00</p>
                  <p className="text-[8px] text-slate-400 mt-0.5">Today at 5:24 AM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Payment Received Card */}
          <div className="absolute -right-6 top-8 z-20 bg-white rounded-xl shadow-xl p-2.5 w-[160px] flex items-center gap-2.5 border border-slate-100/50 transition-all duration-300 hover:scale-105">
            <div className="size-6 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 shrink-0 shadow-sm">
              <Plus className="size-3.5" strokeWidth={3} />
            </div>
            <div className="text-left">
              <p className="text-[9px] font-bold text-slate-400 leading-none">Payment Received</p>
              <p className="text-[10px] font-extrabold text-blue-600 mt-1">+$34,908.00</p>
            </div>
          </div>
        </div>

        {/* Promo text */}
        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight mb-2" style={{ fontFamily: t.heading.family }}>
            Simple, Fast and Secure
          </h1>
          <p className="text-xs text-white/80 leading-relaxed max-w-sm mx-auto md:mx-0 font-medium">
            Stem helps you customize themes, manage design tokens, and build stunning user interfaces. Join our growing developer and designer ecosystem to streamline your workflows.
          </p>
          {/* Slider Dots */}
          <div className="flex gap-1.5 justify-center md:justify-start mt-6">
            <div className="w-5 h-1.5 rounded-full bg-white transition-all duration-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 transition-all duration-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 transition-all duration-300" />
          </div>
        </div>
      </div>

      {/* Right Form side */}
      <div className="w-full md:w-[55%] p-8 md:p-12 flex flex-col justify-between items-center relative overflow-y-auto h-auto md:h-full" style={{ backgroundColor: t.bg }}>
        <div className="w-full max-w-[340px] flex-1 flex flex-col justify-center py-4">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: t.heading.family, color: t.text }}>
              Sign up for an account
            </h2>
            <p className="text-xs mt-1" style={{ color: `${t.text}60` }}>
              Get started with your design workspace
            </p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button className="flex items-center justify-center gap-2 py-2 px-3 border rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors text-xs font-semibold text-slate-700 shadow-sm" style={{ borderColor: `${t.text}15` }}>
              <svg className="size-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.1A12.94 12.94 0 0012.24 0C5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-2 px-3 border rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors text-xs font-semibold text-slate-700 shadow-sm" style={{ borderColor: `${t.text}15` }}>
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-1.01 2.95 1.07.08 2.18-.53 2.84-1.34" />
              </svg>
              Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ backgroundColor: `${t.text}10` }} />
            <span className="text-[10px] uppercase font-extrabold tracking-wider" style={{ color: `${t.text}40` }}>Or with email</span>
            <div className="flex-1 h-px" style={{ backgroundColor: `${t.text}10` }} />
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            {/* Inline Names */}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                readOnly
                value="Alesia"
                className="w-full py-2.5 px-4 border rounded-xl text-xs outline-none bg-white font-medium"
                style={{
                  borderColor: `${t.text}12`,
                  color: t.text
                }}
              />
              <input
                type="text"
                readOnly
                value="Karapova"
                className="w-full py-2.5 px-4 border rounded-xl text-xs outline-none bg-white font-medium"
                style={{
                  borderColor: `${t.text}12`,
                  color: t.text
                }}
              />
            </div>

            {/* Email Field with Focused Blue Outline & Cursor */}
            <div className="relative">
              <input
                type="text"
                readOnly
                value="alesiakarapo"
                className="w-full py-2.5 px-4 border rounded-xl text-xs outline-none bg-white font-semibold transition-all"
                style={{
                  borderColor: t.primary,
                  boxShadow: `0 0 0 1px ${t.primary}`,
                  color: t.text
                }}
              />
              <div className="absolute left-[92px] top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-blue-600 animate-pulse" />
            </div>

            {/* Password Field with Hide/Show Toggle */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                readOnly
                value="mypassword123"
                className="w-full py-2.5 px-4 pr-10 border rounded-xl text-xs outline-none bg-white font-medium"
                style={{
                  borderColor: `${t.text}12`,
                  color: t.text
                }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Policy Notice */}
          <p className="text-[10px] text-slate-400 mt-4 mb-5 text-left leading-relaxed">
            By creating an account, you agree to our <span className="font-bold text-slate-600 hover:text-slate-800 cursor-pointer transition-colors">Privacy Policy</span> and <span className="font-bold text-slate-600 hover:text-slate-800 cursor-pointer transition-colors">Terms of Service</span>.
          </p>

          {/* Submit Button */}
          <button
            className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-lg hover:opacity-95 transition-opacity"
            style={{
              backgroundColor: t.primary,
              boxShadow: `0 4px 12px ${t.primary}25`
            }}
          >
            Sign Up
          </button>

          {/* Already have an account */}
          <p className="text-center text-[11px] mt-4" style={{ color: `${t.text}60` }}>
            Already have an account? <span className="font-bold cursor-pointer hover:underline transition-all" style={{ color: t.primary }}>Sign In</span>
          </p>
        </div>

        {/* Footer */}
        <div className="w-full max-w-[340px] flex justify-between items-center text-[10px] text-slate-400 mt-auto pt-6 border-t border-slate-100/50">
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Privacy Policy</span>
          <span>© 2026 Stem</span>
        </div>
      </div>
    </div>
  )
}


// ─── Typography Scale ─────────────────────────────────────────
export function TypographyView({ t }: { t: T }) {
  const scales = [
    { name: 'H1 headline', weightName: 'Bold', weightValue: '700', sizePx: 56, lineHt: 72, isHeading: true },
    { name: 'H2 headline', weightName: 'Bold', weightValue: '700', sizePx: 40, lineHt: 56, isHeading: true },
    { name: 'H3 headline', weightName: 'Medium', weightValue: '500', sizePx: 28, lineHt: 40, isHeading: true },
    { name: 'H4 headline', weightName: 'Regular', weightValue: '400', sizePx: 26, lineHt: 32, isHeading: true },
    { name: 'H5 headline', weightName: 'Regular', weightValue: '400', sizePx: 22, lineHt: 32, isHeading: true },
    { name: 'H6 headline', weightName: 'Regular', weightValue: '400', sizePx: 20, lineHt: 28, isHeading: true },
    { name: 'Body Large', weightName: 'Medium', weightValue: '500', sizePx: 16, lineHt: 27, isHeading: false },
    { name: 'Body Medium', weightName: 'Medium', weightValue: '500', sizePx: 14, lineHt: 20, isHeading: false },
    { name: 'Body Small', weightName: 'Regular', weightValue: '400', sizePx: 12, lineHt: 16, isHeading: false },
    { name: 'Button', weightName: 'Semibold', weightValue: '600', sizePx: 14, lineHt: 21, isHeading: false },
  ]

  return (
    <div className="w-full max-w-5xl overflow-y-scroll p-8 md:p-14 shadow-2xl transition-all duration-300" style={{
      backgroundColor: t.bg,
      borderRadius: t.radiusLg,
      color: t.text,
      border: `1px solid ${t.text}08`,
      boxShadow: `0 25px 60px -15px ${t.text}10, 0 0 0 1px ${t.text}05`
    }}>
      {/* Header section split */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-8" style={{ borderColor: `${t.text}08` }}>
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center mt-1 select-none font-mono text-[11px] leading-none tracking-tight shrink-0" style={{ color: `${t.text}40` }}>
            <span>03</span>
            <div className="flex flex-col gap-[2px] mt-1.5 w-3.5">
              <div className="h-[1.2px] w-full" style={{ backgroundColor: `${t.text}40` }} />
              <div className="h-[1.2px] w-full" style={{ backgroundColor: `${t.text}40` }} />
            </div>
          </div>
          <h2 className="text-[32px] font-bold tracking-tight leading-none" style={{ fontFamily: t.heading.family, color: t.text }}>
            Typography
          </h2>
        </div>
        <p className="text-[13px] leading-relaxed max-w-lg font-normal text-zinc-500 dark:text-zinc-400" style={{ fontFamily: t.body.family, color: `${t.text}70` }}>
          Typographic scale determines which typefaces will become a standard, but also how we organise a consistent hierarchy, which is going to build a predictable information architecture across the product. We've used the versatile and scalable <span className="font-semibold" style={{ color: t.primary }}>'{t.body.family}'</span> font family.
        </p>
      </div>

      {/* Typography Table */}
      <div className="w-full overflow-x-auto mt-8 custom-scrollbar">
        <div className="w-full">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 items-center pb-4 border-b text-[11px] tracking-wider font-semibold uppercase" style={{ borderColor: `${t.text}12`, color: `${t.text}40` }}>
            <div className="col-span-6">Hierarchy</div>
            <div className="col-span-2">Weight</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2 text-right">Line Height</div>
          </div>

          {/* Table Rows */}
          <div className="flex flex-col">
            {scales.map((s) => (
              <div
                key={s.name}
                className="grid grid-cols-12 gap-4 items-center py-5 transition-all hover:bg-zinc-500/2"
                style={{ borderBottom: `1px solid ${t.text}08` }}
              >
                {/* Sample */}
                <div className="col-span-6 pr-4">
                  <span
                    style={{
                      fontFamily: s.isHeading ? t.heading.family : t.body.family,
                      fontSize: `${s.sizePx}px`,
                      fontWeight: s.weightValue,
                      lineHeight: `${s.lineHt}px`,
                      color: t.text
                    }}
                    className="block truncate"
                  >
                    {s.name}
                  </span>
                </div>

                {/* Weight */}
                <div className="col-span-2 text-[13px] font-normal" style={{ fontFamily: t.body.family, color: `${t.text}60` }}>
                  {s.weightName}
                </div>

                {/* Size */}
                <div className="col-span-2 text-[13px] font-normal" style={{ fontFamily: t.body.family, color: `${t.text}60` }}>
                  {s.sizePx}
                </div>

                {/* Line Height */}
                <div className="col-span-2 text-[13px] font-normal text-right" style={{ fontFamily: t.body.family, color: `${t.text}60` }}>
                  {s.lineHt}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

