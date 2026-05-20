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

  const primaryRaw = get('color-primary', '#1a1a2e')
  const accentRaw = get('color-accent', primaryRaw !== '#1a1a2e' ? primaryRaw : '#6366f1')

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
      spaceSm: get('space-sm', '8px'),
      spaceMd: get('space-md', '16px'),
      spaceLg: get('space-lg', '32px'),
      shadowSm: '0 1px 3px rgba(0,0,0,0.4)',
      shadowMd: '0 4px 12px rgba(0,0,0,0.5)',
      radiusSm: get('radius-sm', '6px'),
      radiusMd: get('radius-md', '10px'),
      radiusLg: get('radius-lg', '16px'),
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
    spaceSm: get('space-sm', '8px'),
    spaceMd: get('space-md', '16px'),
    spaceLg: get('space-lg', '32px'),
    shadowSm: get('shadow-sm', '0 1px 3px rgba(0,0,0,0.06)'),
    shadowMd: get('shadow-md', '0 4px 12px rgba(0,0,0,0.08)'),
    radiusSm: get('radius-sm', '6px'),
    radiusMd: get('radius-md', '10px'),
    radiusLg: get('radius-lg', '16px'),
  }
}
