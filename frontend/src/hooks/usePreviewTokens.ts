'use client'

interface ParsedFont {
  family: string
  size: string
  weight: string
}

interface PreviewTokens {
  primary: string
  secondary: string
  tertiary: string
  accent: string
  bg: string
  text: string
  heading: ParsedFont
  body: ParsedFont
  spaceSm: string
  spaceMd: string
  spaceLg: string
  shadowSm: string
  shadowMd: string
  radiusSm: string
  radiusMd: string
  radiusLg: string
}

export function usePreviewTokens(tokens: any[], isDark: boolean): PreviewTokens {
  const get = (name: string, fallback: string) => {
    return tokens.find(t => t.name === name || t.name.startsWith(name + '|'))?.value || fallback
  }

  const parseFont = (name: string, fallbackFamily: string, fallbackSize: string): ParsedFont => {
    const val = tokens.find(t => t.name === name || t.name.startsWith(name + '|'))?.value
    if (!val) return { family: fallbackFamily, size: fallbackSize, weight: 'normal' }
    const parts = val.split(' | ')
    return { family: parts[2] || fallbackFamily, size: parts[1] || fallbackSize, weight: parts[3] || 'normal' }
  }

  const getRadius = (keys: string[], fallback: string) => {
    for (const key of keys) {
      const val = tokens.find(t => t.name === key || t.name.startsWith(key + '|'))?.value
      if (val) return val
    }
    return fallback
  }

  const getShadow = (keys: string[], fallback: string) => {
    for (const key of keys) {
      const val = tokens.find(t => t.name === key || t.name.startsWith(key + '|'))?.value
      if (val) return val
    }
    return fallback
  }

  const primaryRaw = get('color-primary', '#1a1a2e')
  const accentRaw = get('color-accent', primaryRaw !== '#1a1a2e' ? primaryRaw : '#6366f1')

  const spaceSm = get('space-sm', '8px')
  const spaceMd = get('space-md', '16px')
  const spaceLg = get('space-lg', '32px')

  const shadowSm = getShadow(['shadow-sm', 'shadow'], isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)')
  const shadowMd = getShadow(['shadow-md', 'shadow-lg', 'shadow'], isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.08)')

  const radiusSm = getRadius(['radius-sm', 'radius'], '6px')
  const radiusMd = getRadius(['radius-md', 'radius-lg', 'radius'], '10px')
  const radiusLg = getRadius(['radius-xl', 'radius-2xl', 'radius-3xl', 'radius-lg'], '16px')

  if (isDark) {
    return {
      primary: primaryRaw,
      secondary: get('color-secondary', '#1e1e2e'),
      tertiary: get('color-tertiary', '#2a2a3e'),
      accent: accentRaw,
      bg: get('color-text', '#0f0f17'),
      text: get('color-background', '#f0f0f5'),
      heading: parseFont('font-heading', 'system-ui', '32px'),
      body: parseFont('font-body', 'system-ui', '15px'),
      spaceSm,
      spaceMd,
      spaceLg,
      shadowSm,
      shadowMd,
      radiusSm,
      radiusMd,
      radiusLg,
    }
  }

  return {
    primary: primaryRaw,
    secondary: get('color-secondary', '#f4f4f8'),
    tertiary: get('color-tertiary', '#e8e8ee'),
    accent: accentRaw,
    bg: get('color-background', '#ffffff'),
    text: get('color-text', '#111827'),
    heading: parseFont('font-heading', 'system-ui', '32px'),
    body: parseFont('font-body', 'system-ui', '15px'),
    spaceSm,
    spaceMd,
    spaceLg,
    shadowSm,
    shadowMd,
    radiusSm,
    radiusMd,
    radiusLg,
  }
}
