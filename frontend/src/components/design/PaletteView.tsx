'use client'

import { cn } from '@/lib/utils';
import { AlertTriangle, Check, Copy, Info, ShieldCheck, Sparkles } from 'lucide-react';
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

// ─── Color Math Utilities ─────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace(/^#/, '')
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('')
  }
  if (c.length !== 6) {
    return [0, 0, 0]
  }
  const num = parseInt(c, 16)
  return [
    (num >> 16) & 255,
    (num >> 8) & 255,
    num & 255
  ]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)
  const l1 = getLuminance(...rgb1)
  const l2 = getLuminance(...rgb2)
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  return Math.round(ratio * 100) / 100
}

function interpolateColor(rgb1: [number, number, number], rgb2: [number, number, number], factor: number): [number, number, number] {
  return [
    Math.round(rgb1[0] + factor * (rgb2[0] - rgb1[0])),
    Math.round(rgb1[1] + factor * (rgb2[1] - rgb1[1])),
    Math.round(rgb1[2] + factor * (rgb2[2] - rgb1[2]))
  ]
}

function generateShades(hex: string): { label: string; value: string }[] {
  const baseRgb = hexToRgb(hex)
  const whiteRgb: [number, number, number] = [255, 255, 255]
  const blackRgb: [number, number, number] = [15, 23, 42] // Slate 900 as deep black baseline

  return [
    { label: '50', value: rgbToHex(...interpolateColor(baseRgb, whiteRgb, 0.92)) },
    { label: '100', value: rgbToHex(...interpolateColor(baseRgb, whiteRgb, 0.82)) },
    { label: '200', value: rgbToHex(...interpolateColor(baseRgb, whiteRgb, 0.62)) },
    { label: '300', value: rgbToHex(...interpolateColor(baseRgb, whiteRgb, 0.42)) },
    { label: '400', value: rgbToHex(...interpolateColor(baseRgb, whiteRgb, 0.20)) },
    { label: '500', value: hex },
    { label: '600', value: rgbToHex(...interpolateColor(baseRgb, blackRgb, 0.20)) },
    { label: '700', value: rgbToHex(...interpolateColor(baseRgb, blackRgb, 0.42)) },
    { label: '800', value: rgbToHex(...interpolateColor(baseRgb, blackRgb, 0.65)) },
    { label: '900', value: rgbToHex(...interpolateColor(baseRgb, blackRgb, 0.82)) },
  ]
}

// ─── Palette View Component ───────────────────────────────────

export function PaletteView({ t }: { t: T }) {
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const swatches = [
    { label: 'Primary', value: t.primary, desc: 'Brand essence and prominent controls.' },
    { label: 'Secondary', value: t.secondary, desc: 'Supporting containers and structural borders.' },
    { label: 'Accent', value: t.accent, desc: 'Interactive anchors, highlights, and alerts.' },
    { label: 'Background', value: t.bg, desc: 'Canvas base and clean surface backgrounds.' },
    { label: 'Text', value: t.text, desc: 'Primary typography and high contrast details.' },
  ]

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(id)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // Generate contrast details
  const getContrastLabel = (ratio: number) => {
    if (ratio >= 7) return { text: 'AAA Pass', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: ShieldCheck }
    if (ratio >= 4.5) return { text: 'AA Pass', bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400', icon: ShieldCheck }
    if (ratio >= 3) return { text: 'Large Text Only', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: Info }
    return { text: 'Low Contrast', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', icon: AlertTriangle }
  }

  const gradients = [
    { name: 'Vibrant Flow', value: `linear-gradient(135deg, ${t.primary}, ${t.accent})`, css: `background: linear-gradient(135deg, ${t.primary}, ${t.accent});` },
    { name: 'Soft Aurora', value: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`, css: `background: linear-gradient(135deg, ${t.primary}, ${t.secondary});` },
    { name: 'Cyber Sunset', value: `linear-gradient(135deg, ${t.accent}, ${t.text})`, css: `background: linear-gradient(135deg, ${t.accent}, ${t.text});` },
    { name: 'Ambient Shade', value: `linear-gradient(180deg, ${t.bg}, ${t.secondary})`, css: `background: linear-gradient(180deg, ${t.bg}, ${t.secondary});` }
  ]

  return (
    <div className="w-full max-w-4xl transition-all duration-300" style={{
      backgroundColor: t.bg,
      borderRadius: t.radiusLg,
      padding: t.spaceLg,
      color: t.text,
      border: `1px solid ${t.text}08`,
      boxShadow: t.shadowMd
    }}>

      {/* ─── Header Section ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-8" style={{ borderColor: `${t.text}08` }}>
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center mt-1 select-none font-mono text-[11px] leading-none tracking-tight shrink-0" style={{ color: `${t.text}40` }}>
            <span>04</span>
            <div className="flex flex-col gap-[2px] mt-1.5 w-3.5">
              <div className="h-[1.2px] w-full" style={{ backgroundColor: `${t.text}40` }} />
              <div className="h-[1.2px] w-full" style={{ backgroundColor: `${t.text}40` }} />
            </div>
          </div>
          <h2 className="text-[32px] font-bold tracking-tight leading-none" style={{ fontFamily: t.heading.family, color: t.text }}>
            Color System
          </h2>
        </div>
        <p className="text-[13px] leading-relaxed max-w-lg font-normal text-zinc-500 dark:text-zinc-400" style={{ fontFamily: t.body.family, color: `${t.text}70` }}>
          A robust color system built to support visual hierarchy, accessibility guidelines, and expressive themes. Adjusting semantic colors will dynamically compile contrast ratios, custom scales, and gradients across the interface.
        </p>
      </div>

      {/* ─── Swatches Section ─────────────────────────────────── */}
      <div className="mt-10">
        <h3 className="text-sm font-bold tracking-wider uppercase mb-6" style={{ color: `${t.text}40` }}>Core Swatches</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5" style={{ gap: t.spaceMd }}>
          {swatches.map((s, idx) => {
            const rgb = hexToRgb(s.value)
            const hsl = rgbToHsl(...rgb)
            // Contrast ratio against background color (or text against background for background color itself)
            const contrastRef = s.label === 'Background' ? t.text : t.bg
            const contrast = getContrastRatio(s.value, contrastRef)
            const badge = getContrastLabel(contrast)
            const BadgeIcon = badge.icon

            const isLightSwatch = getLuminance(...rgb) > 0.45

            return (
              <div
                key={s.label}
                className="flex flex-col bg-zinc-500/2 border group transition-all duration-300 animate-in fade-in zoom-in-95"
                style={{
                  borderColor: `${t.text}08`,
                  padding: t.spaceMd,
                  borderRadius: t.radiusMd
                }}
              >
                {/* Large Swatch Block */}
                <div
                  className="aspect-square w-full relative overflow-hidden flex flex-col justify-between"
                  style={{
                    backgroundColor: s.value,
                    border: `1px solid ${t.text}10`,
                    padding: t.spaceSm,
                    borderRadius: t.radiusSm,
                    boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)'
                  }}
                >
                  {/* Subtle contrast ratio display on swatch */}
                  <div className="flex justify-between items-start w-full">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full select-none"
                      style={{
                        backgroundColor: isLightSwatch ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.15)',
                        color: isLightSwatch ? '#000' : '#fff'
                      }}
                    >
                      {contrast}:1 ratio
                    </span>
                    <button
                      onClick={() => handleCopy(s.value, `swatch-${idx}`)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                      style={{ color: isLightSwatch ? '#000' : '#fff' }}
                      aria-label={`Copy hex code for ${s.label}`}
                    >
                      {copiedText === `swatch-${idx}` ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>

                  {/* Semantic Label */}
                  <div className="text-left">
                    <p className="text-[10px] font-bold tracking-widest uppercase opacity-40" style={{ color: isLightSwatch ? '#000' : '#fff' }}>Semantic</p>
                    <p className="text-[16px] font-extrabold" style={{ color: isLightSwatch ? '#000' : '#fff' }}>{s.label}</p>
                  </div>
                </div>

                {/* Metadata Details */}
                <div
                  className="space-y-2.5 flex-1 flex flex-col justify-between text-left"
                  style={{ marginTop: t.spaceMd }}
                >
                  <p className="text-[11px] leading-normal opacity-85" style={{ color: `${t.text}` }}>{s.desc}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span style={{ color: `${t.text}40` }}>HEX</span>
                      <span className="font-bold select-all">{s.value.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono">
                      <span style={{ color: `${t.text}40` }}>RGB</span>
                      <span className="font-semibold select-all">{rgb.join(', ')}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono">
                      <span style={{ color: `${t.text}40` }}>HSL</span>
                      <span className="font-semibold select-all">{`${hsl[0]}°, ${hsl[1]}%, ${hsl[2]}%`}</span>
                    </div>
                  </div>

                  {/* Accessibility Badge */}
                  <div
                    className={cn("flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold mt-2", badge.bg)}
                    style={{ borderRadius: t.radiusSm }}
                  >
                    <BadgeIcon className="size-3 shrink-0" />
                    <span>{badge.text}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Shades Grid Section ─────────────────────────────── */}
      <div className="mt-12">
        <div className="flex justify-between items-baseline mb-6">
          <h3 className="text-sm font-bold tracking-wider uppercase" style={{ color: `${t.text}40` }}>Scale & Shades</h3>
          <p className="text-[11px] opacity-40" style={{ fontFamily: t.body.family }}>Hover blocks to see compiled hex code</p>
        </div>

        <div className="space-y-4">
          {swatches.map((s, idx) => {
            const shades = generateShades(s.value)
            return (
              <div
                key={`shade-row-${s.label}`}
                className="flex flex-col md:flex-row md:items-center bg-zinc-500/1 border"
                style={{
                  borderColor: `${t.text}04`,
                  padding: t.spaceSm,
                  borderRadius: t.radiusSm,
                  gap: t.spaceMd
                }}
              >
                {/* Row Label */}
                <div className="w-24 shrink-0 text-left">
                  <span className="text-xs font-bold" style={{ fontFamily: t.body.family }}>{s.label}</span>
                </div>

                {/* Horizontal Shades Strip */}
                <div
                  className="flex-1 grid grid-cols-10 h-10 overflow-hidden border border-zinc-200/10"
                  style={{ borderRadius: t.radiusSm, boxShadow: t.shadowSm }}
                >
                  {shades.map((shade) => {
                    const shadeRgb = hexToRgb(shade.value)
                    const isLightShade = getLuminance(...shadeRgb) > 0.45
                    return (
                      <div
                        key={shade.label}
                        className="group/shade relative flex flex-col justify-end p-1 select-all cursor-pointer transition-all hover:scale-105 hover:z-10 hover:shadow-lg"
                        style={{ backgroundColor: shade.value }}
                        onClick={() => handleCopy(shade.value, `shade-${s.label}-${shade.label}`)}
                      >
                        {/* Shade weight name */}
                        <span className="text-[8px] font-bold uppercase select-none opacity-40 group-hover/shade:opacity-0" style={{ color: isLightShade ? '#000' : '#fff' }}>
                          {shade.label}
                        </span>

                        {/* Hover Tooltip (Hex code) */}
                        <div
                          className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold opacity-0 group-hover/shade:opacity-100 transition-opacity"
                          style={{ color: isLightShade ? '#000' : '#fff' }}
                        >
                          {copiedText === `shade-${s.label}-${shade.label}` ? 'COPY!' : shade.value.toUpperCase()}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Theme Gradients Section ─────────────────────────── */}
      <div className="mt-12">
        <h3 className="text-sm font-bold tracking-wider uppercase mb-6" style={{ color: `${t.text}40` }}>Possible Gradients</h3>
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: t.spaceMd }}>
          {gradients.map((g, idx) => {
            return (
              <div
                key={g.name}
                className="flex flex-col bg-zinc-500/2 border group transition-all duration-300"
                style={{
                  borderColor: `${t.text}08`,
                  padding: t.spaceMd,
                  borderRadius: t.radiusMd
                }}
              >
                {/* Gradient Box */}
                <div
                  className="w-full h-24 flex items-end relative overflow-hidden"
                  style={{
                    background: g.value,
                    border: `1px solid ${t.text}10`,
                    padding: t.spaceSm,
                    borderRadius: t.radiusSm,
                    boxShadow: t.shadowSm
                  }}
                >
                  <button
                    onClick={() => handleCopy(g.css, `gradient-${idx}`)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-black/15 hover:bg-black/25 text-white"
                    aria-label={`Copy CSS gradient code for ${g.name}`}
                  >
                    {copiedText === `gradient-${idx}` ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  </button>
                  <span className="text-xs font-bold text-white tracking-wide drop-shadow-sm">{g.name}</span>
                </div>

                {/* CSS snippet */}
                <div className="mt-3 flex items-center justify-between">
                  <code className="text-[10px] font-mono opacity-50 truncate max-w-[80%]" style={{ color: t.text }}>{g.css}</code>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-25" style={{ color: t.text }}>CSS</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Artistic Artwork Panels ────────────────────────── */}
      <div className="mt-12 border-t pt-10" style={{ borderColor: `${t.text}08` }}>
        <h3 className="text-sm font-bold tracking-wider uppercase mb-6" style={{ color: `${t.text}40` }}>Artwork & Theme Previews</h3>

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: t.spaceLg }}>
          {/* Panel 1: Light Geometric Artwork */}
          <div
            className="w-full h-72 relative overflow-hidden flex flex-col justify-between border transition-all duration-500 hover:shadow-xl"
            style={{
              backgroundColor: '#f8fafc',
              borderColor: `${t.text}10`,
              borderRadius: t.radiusLg,
              padding: t.spaceLg,
              boxShadow: t.shadowMd
            }}
          >
            {/* Ambient dynamic background artwork element */}
            <div className="absolute top-0 right-0 w-[55%] h-full bg-slate-100 flex items-center justify-center">
              {/* Blur gradient blob */}
              <div
                className="absolute right-0 top-10 w-44 h-44 rounded-full opacity-40 blur-xl"
                style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }}
              />

              {/* Overlapping offset panels */}
              <div
                className="absolute w-28 h-40 transform rotate-6 hover:rotate-12 transition-transform duration-500 flex flex-col justify-between text-white"
                style={{
                  background: `linear-gradient(135deg, ${t.primary}, ${t.primary}cc)`,
                  top: '15%',
                  borderRadius: t.radiusSm,
                  padding: t.spaceSm,
                  boxShadow: t.shadowSm
                }}
              >
                <Sparkles className="size-4 opacity-70" />
                <div>
                  <p className="text-[8px] font-bold tracking-widest opacity-50">COMPOSITION</p>
                  <p className="text-[14px] font-black leading-tight">Light Aurora</p>
                </div>
              </div>
            </div>

            {/* Left Column Copy & Branding */}
            <div className="relative z-10 flex flex-col justify-between h-full max-w-[45%] text-slate-800 text-left">
              <div>
                <p className="text-[9px] font-bold tracking-widest text-slate-400">ART DIRECTORY</p>
                <h4 className="text-xl font-bold tracking-tight text-slate-900 mt-1" style={{ fontFamily: t.heading.family }}>Magical Moonlight</h4>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Clean light mode rendering with neutral tones and pastel curves.
                </p>
              </div>

              {/* Dynamic Theme Color Codes Row */}
              <div className="flex gap-2">
                <div className="size-5 rounded-full border border-slate-200" style={{ backgroundColor: t.primary, borderRadius: t.radiusSm }} title="Primary" />
                <div className="size-5 rounded-full border border-slate-200" style={{ backgroundColor: t.accent, borderRadius: t.radiusSm }} title="Accent" />
                <div className="size-5 rounded-full border border-slate-200" style={{ backgroundColor: t.secondary, borderRadius: t.radiusSm }} title="Secondary" />
              </div>
            </div>

            {/* Design Grid lines overlay */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200/50" />
            <div className="absolute right-[55%] top-0 bottom-0 w-px bg-slate-200/50" />
          </div>

          {/* Panel 2: Dark Cyberpunk Glow Artwork */}
          <div
            className="w-full h-72 relative overflow-hidden flex flex-col justify-between border transition-all duration-500 hover:shadow-xl"
            style={{
              backgroundColor: '#0f172a',
              borderColor: `${t.text}10`,
              borderRadius: t.radiusLg,
              padding: t.spaceLg,
              boxShadow: t.shadowMd
            }}
          >
            {/* Ambient dynamic background artwork element */}
            <div className="absolute top-0 right-0 w-[55%] h-full bg-slate-950/70 flex items-center justify-center border-l border-white/5">
              {/* Blur gradient blob */}
              <div
                className="absolute right-0 bottom-4 w-48 h-48 rounded-full opacity-35 blur-2xl animate-pulse"
                style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.primary})` }}
              />

              {/* Overlapping glassmorphic panel */}
              <div
                className="absolute w-28 h-40 border border-white/10 flex flex-col justify-between backdrop-blur-md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  top: '20%',
                  right: '25%',
                  borderRadius: t.radiusSm,
                  padding: t.spaceSm,
                  boxShadow: t.shadowSm
                }}
              >
                <div className="size-6 rounded-full bg-white/5 flex items-center justify-center">
                  <div className="size-2 rounded-full" style={{ backgroundColor: t.accent }} />
                </div>
                <div className="text-white text-left">
                  <p className="text-[8px] font-bold tracking-widest text-slate-500">SPECIFICATION</p>
                  <p className="text-[14px] font-extrabold leading-tight">Dark Cyber</p>
                </div>
              </div>
            </div>

            {/* Left Column Copy & Branding */}
            <div className="relative z-10 flex flex-col justify-between h-full max-w-[45%] text-slate-300 text-left">
              <div>
                <p className="text-[9px] font-bold tracking-widest text-slate-500">ART DIRECTORY</p>
                <h4 className="text-xl font-bold tracking-tight text-white mt-1" style={{ fontFamily: t.heading.family }}>Midnight Obsidian</h4>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Cyberpunk style dashboard accents utilizing high opacity glowing rings.
                </p>
              </div>

              {/* Dynamic Theme Color Codes Row */}
              <div className="flex gap-2">
                <div className="size-5 rounded-full border border-white/10" style={{ backgroundColor: t.primary, borderRadius: t.radiusSm }} title="Primary" />
                <div className="size-5 rounded-full border border-white/10" style={{ backgroundColor: t.accent, borderRadius: t.radiusSm }} title="Accent" />
                <div className="size-5 rounded-full border border-white/10" style={{ backgroundColor: t.secondary, borderRadius: t.radiusSm }} title="Secondary" />
              </div>
            </div>

            {/* Design Grid lines overlay */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-white/5" />
            <div className="absolute right-[55%] top-0 bottom-0 w-px bg-white/5" />
          </div>
        </div>
      </div>

    </div>
  )
}
