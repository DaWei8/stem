'use client'

import { DesignPreview } from '@/components/design/DesignPreview'
import { TokenSection } from '@/components/design/TokenSection'
import { PillarHeader } from '@/components/layout/PillarHeader'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SlideInModal } from '@/components/ui/SlideInModal'
import { useDesignSystem } from '@/hooks/useDesignSystem'
import { cn } from '@/lib/utils'
import clsx from 'clsx'
import { BoxSelect, Eye, Layers, Move, Palette, Type } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface DesignToken {
  id: string
  name: string
  value: string
  category: 'color' | 'typography' | 'spacing' | 'shadow' | 'border-radius' | 'duration' | 'z-index'
}

const DESIGN_PRESETS = [
  {
    id: 'minimalist',
    name: 'Minimalist Clean',
    color: [
      { name: 'color-primary', value: '#000000' },
      { name: 'color-secondary', value: '#F3F4F6' },
      { name: 'color-accent', value: '#3B82F6' },
      { name: 'color-background', value: '#FFFFFF' },
      { name: 'color-text', value: '#111827' }
    ],
    typography: [
      { name: 'font-heading', value: 'h1 | 48px | Inter | bold | -2.2%' },
      { name: 'font-body', value: 'body | 16px | Inter | regular | -1.4%' }
    ],
    spacing: [
      { name: 'space-sm', value: '4px' },
      { name: 'space-md', value: '16px' },
      { name: 'space-lg', value: '32px' }
    ],
    shadow: [
      { name: 'shadow-sm', value: '0 1px 2px rgba(0,0,0,0.05)' },
      { name: 'shadow-md', value: '0 4px 6px rgba(0,0,0,0.1)' }
    ],
    'border-radius': [
      { name: 'radius-sm', value: '0px' },
      { name: 'radius-md', value: '0px' }
    ]
  },
  {
    id: 'modern-saas',
    name: 'Modern SaaS',
    color: [
      { name: 'color-primary', value: '#2563EB' },
      { name: 'color-secondary', value: '#F8FAFC' },
      { name: 'color-accent', value: '#F59E0B' },
      { name: 'color-background', value: '#FFFFFF' },
      { name: 'color-text', value: '#0F172A' }
    ],
    typography: [
      { name: 'font-heading', value: 'h1 | 48px | Inter | bold | -2.2%' },
      { name: 'font-body', value: 'body | 16px | Roboto | regular | -1.0%' }
    ],
    spacing: [
      { name: 'space-sm', value: '8px' },
      { name: 'space-md', value: '24px' },
      { name: 'space-lg', value: '48px' }
    ],
    shadow: [
      { name: 'shadow-sm', value: '0 2px 4px rgba(0,0,0,0.05)' },
      { name: 'shadow-md', value: '0 10px 15px rgba(0,0,0,0.1)' }
    ],
    'border-radius': [
      { name: 'radius-sm', value: '6px' },
      { name: 'radius-md', value: '12px' }
    ]
  },
  {
    id: 'neo-brutalism',
    name: 'Neo-Brutalism',
    color: [
      { name: 'color-primary', value: '#FF4500' },
      { name: 'color-secondary', value: '#FFF8DC' },
      { name: 'color-accent', value: '#32CD32' },
      { name: 'color-background', value: '#FFFFFF' },
      { name: 'color-text', value: '#000000' }
    ],
    typography: [
      { name: 'font-heading', value: 'h1 | 56px | Space Grotesk | black | -3.0%' },
      { name: 'font-body', value: 'body | 16px | Inter | medium | -1.0%' }
    ],
    spacing: [
      { name: 'space-sm', value: '8px' },
      { name: 'space-md', value: '32px' },
      { name: 'space-lg', value: '64px' }
    ],
    shadow: [
      { name: 'shadow-hard', value: '4px 4px 0px rgba(0,0,0,1)' }
    ],
    'border-radius': [
      { name: 'radius-sm', value: '0px' },
      { name: 'radius-md', value: '0px' }
    ]
  },
  {
    id: 'elegant-dark',
    name: 'Elegant Dark',
    color: [
      { name: 'color-primary', value: '#D4AF37' },
      { name: 'color-secondary', value: '#1A1A1A' },
      { name: 'color-accent', value: '#9370DB' },
      { name: 'color-background', value: '#000000' },
      { name: 'color-text', value: '#F5F5F5' }
    ],
    typography: [
      { name: 'font-heading', value: 'h1 | 48px | Playfair Display | bold | 0%' },
      { name: 'font-body', value: 'body | 16px | Inter | light | 0.5%' }
    ],
    spacing: [
      { name: 'space-sm', value: '12px' },
      { name: 'space-md', value: '40px' },
      { name: 'space-lg', value: '80px' }
    ],
    shadow: [
      { name: 'shadow-glow', value: '0 0 20px rgba(212,175,55,0.2)' }
    ],
    'border-radius': [
      { name: 'radius-sm', value: '2px' },
      { name: 'radius-md', value: '8px' }
    ]
  },
  {
    id: 'playful-consumer',
    name: 'Playful Consumer',
    color: [
      { name: 'color-primary', value: '#FF69B4' },
      { name: 'color-secondary', value: '#FFF0F5' },
      { name: 'color-accent', value: '#00CED1' },
      { name: 'color-background', value: '#FFFFFF' },
      { name: 'color-text', value: '#4A4A4A' }
    ],
    typography: [
      { name: 'font-heading', value: 'h1 | 44px | Poppins | bold | -1.5%' },
      { name: 'font-body', value: 'body | 18px | Poppins | regular | 0%' }
    ],
    spacing: [
      { name: 'space-sm', value: '16px' },
      { name: 'space-md', value: '32px' },
      { name: 'space-lg', value: '48px' }
    ],
    shadow: [
      { name: 'shadow-bouncy', value: '0 8px 24px rgba(255,105,180,0.2)' }
    ],
    'border-radius': [
      { name: 'radius-sm', value: '16px' },
      { name: 'radius-md', value: '9999px' }
    ]
  },
  {
    id: 'industrial',
    name: 'Industrial',
    color: [
      { name: 'color-primary', value: '#4A5568' },
      { name: 'color-secondary', value: '#E2E8F0' },
      { name: 'color-accent', value: '#ED8936' },
      { name: 'color-background', value: '#1A202C' },
      { name: 'color-text', value: '#F7FAFC' }
    ],
    typography: [
      { name: 'font-heading', value: 'h1 | 40px | Roboto Mono | bold | -2.0%' },
      { name: 'font-body', value: 'body | 14px | Roboto Mono | regular | 0%' }
    ],
    spacing: [
      { name: 'space-sm', value: '4px' },
      { name: 'space-md', value: '16px' },
      { name: 'space-lg', value: '32px' }
    ],
    shadow: [
      { name: 'shadow-inset', value: 'inset 0 2px 4px rgba(0,0,0,0.5)' }
    ],
    'border-radius': [
      { name: 'radius-sm', value: '2px' },
      { name: 'radius-md', value: '4px' }
    ]
  },
  {
    id: 'ecommerce-glass',
    name: 'E-commerce Glass',
    color: [
      { name: 'color-primary', value: '#8A2BE2' },
      { name: 'color-secondary', value: '#F0F8FF' },
      { name: 'color-accent', value: '#00FA9A' },
      { name: 'color-background', value: '#FFFFFF' },
      { name: 'color-text', value: '#2F4F4F' }
    ],
    typography: [
      { name: 'font-heading', value: 'h1 | 48px | Outfit | semibold | -1.0%' },
      { name: 'font-body', value: 'body | 16px | Outfit | light | 0.2%' }
    ],
    spacing: [
      { name: 'space-sm', value: '8px' },
      { name: 'space-md', value: '24px' },
      { name: 'space-lg', value: '64px' }
    ],
    shadow: [
      { name: 'shadow-glass', value: '0 8px 32px rgba(31,38,135,0.07)' }
    ],
    'border-radius': [
      { name: 'radius-sm', value: '12px' },
      { name: 'radius-md', value: '24px' }
    ]
  }
]

export function DesignSystem() {
  const { id: projectId } = useParams()
  const {
    tokens,
    components,
    fetchTokens,
    fetchComponents,
    addToken,
    updateToken,
    deleteToken,
    addComponent,
    updateComponent,
    deleteComponent
  } = useDesignSystem()

  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [presetModal, setPresetModal] = useState<'all' | 'color' | 'typography' | 'spacing' | 'shadow' | 'border-radius' | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false)
  const [editingTokenId, setEditingTokenId] = useState<string | null>(null)
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null)

  const [newTokenName, setNewTokenName] = useState('')
  const [newTokenRole, setNewTokenRole] = useState('none')
  const [newTokenValue, setNewTokenValue] = useState('')
  const [newCompName, setNewCompName] = useState('')
  const [newCompType, setNewCompType] = useState<'button' | 'input' | 'form' | 'custom' | 'container'>('container')

  // Typography context state
  const [fontSize, setFontSize] = useState('16px')
  const [fontFamily, setFontFamily] = useState('Inter')
  const [fontWeight, setFontWeight] = useState('regular')
  const [typographyRole, setTypographyRole] = useState('body')
  const [letterSpacing, setLetterSpacing] = useState('-1.4%')

  const rolePresets: Record<string, { size: string, weight: string, spacing: string }> = {
    h1: { size: '40px', weight: 'bold', spacing: '-2.2%' },
    h2: { size: '32px', weight: 'bold', spacing: '-2.2%' },
    h3: { size: '24px', weight: 'medium', spacing: '-1.9%' },
    h4: { size: '20px', weight: 'medium', spacing: '-1.7%' },
    h5: { size: '18px', weight: 'medium', spacing: '-1.6%' },
    h6: { size: '16px', weight: 'semibold', spacing: '-1.5%' },
    subtitle: { size: '16px', weight: 'medium', spacing: '-1.6%' },
    body: { size: '14px', weight: 'regular', spacing: '-1.4%' },
    body2: { size: '13px', weight: 'regular', spacing: '-1.2%' },
    button: { size: '12px', weight: 'regular', spacing: '-1.1%' },
    caption: { size: '10px', weight: 'regular', spacing: '0%' },
  }

  const typeScalePresets = [
    { label: 'H1', size: '60px', weight: 'bold', role: 'h1' },
    { label: 'H2', size: '48px', weight: 'bold', role: 'h2' },
    { label: 'H3', size: '36px', weight: 'medium', role: 'h3' },
    { label: 'H4', size: '24px', weight: 'medium', role: 'h4' },
    { label: 'H5', size: '18px', weight: 'medium', role: 'h5' },
    { label: 'H6', size: '15px', weight: 'semibold', role: 'h6' },
    { label: 'Body L', size: '16px', weight: 'regular', role: 'subtitle' },
    { label: 'Body M', size: '14px', weight: 'regular', role: 'body' },
    { label: 'Body S', size: '12px', weight: 'regular', role: 'button' },
    { label: 'Body XS', size: '10px', weight: 'regular', role: 'caption' },
  ]

  const presetFonts = ['Inter', 'Roboto Mono', 'Outfit', 'Plus Jakarta Sans', 'System']
  const presetWeights = ['light', 'regular', 'medium', 'semibold', 'bold', 'black']

  useEffect(() => {
    if (projectId) {
      fetchTokens(projectId as string)
      fetchComponents(projectId as string)
    }
  }, [projectId, fetchTokens, fetchComponents])

  const handleApplyPreset = async (presetId: string, category: 'all' | 'color' | 'typography' | 'spacing' | 'shadow' | 'border-radius') => {
    const preset = DESIGN_PRESETS.find(p => p.id === presetId)
    if (!preset) return

    toast.loading('Applying preset...')
    try {
      const categoriesToApply = category === 'all'
        ? ['color', 'typography', 'spacing', 'shadow', 'border-radius'] as const
        : [category]

      for (const cat of categoriesToApply) {
        const tokensToApply = preset[cat]
        if (tokensToApply) {
          for (const t of tokensToApply) {
            const existing = useDesignSystem.getState().tokens.find(tok => tok.name === t.name && tok.category === cat)
            if (existing) {
              await updateToken(projectId as string, existing.id, { name: t.name, value: t.value, category: cat })
            } else {
              await addToken(projectId as string, { name: t.name, value: t.value, category: cat })
            }
          }
        }
      }
      toast.dismiss()
      toast.success('Preset applied successfully!')
      setPresetModal(null)
    } catch (e) {
      toast.dismiss()
      toast.error('Failed to apply preset')
    }
  }

  const handleSaveToken = async (type: any) => {
    if (!newTokenName) return

    const value = activeModal === 'typography'
      ? `${typographyRole} | ${fontSize} | ${fontFamily} | ${fontWeight} | ${letterSpacing}`
      : newTokenValue
    if (!value) return

    const finalName = newTokenRole !== 'none' ? `${newTokenRole}|${newTokenName}` : newTokenName;

    if (editingTokenId) {
      await updateToken(projectId as string, editingTokenId, { name: finalName, value, category: type })
    } else {
      const isDuplicate = tokens.some(t => t.name.toLowerCase() === finalName.toLowerCase())
      if (isDuplicate) {
        toast.error(`A token with the name "${newTokenName}" already exists.`)
        return
      }
      await addToken(projectId as string, { name: finalName, value, category: type })
    }

    resetTokenForm()
  }

  const resetTokenForm = () => {
    setNewTokenName('')
    setNewTokenRole('none')
    setNewTokenValue('')
    setEditingTokenId(null)
    setActiveModal(null)
    // Reset typo defaults
    setFontSize('16px')
    setFontFamily('Inter')
    setFontWeight('regular')
  }

  const handleSaveComponent = async () => {
    if (!newCompName) return

    if (editingComponentId) {
      await updateComponent(projectId as string, editingComponentId, { name: newCompName, type: newCompType })
    } else {
      const isDuplicate = components.some(c => c.name.toLowerCase() === newCompName.toLowerCase())
      if (isDuplicate) {
        toast.error(`A component with the name "${newCompName}" already exists.`)
        return
      }
      await addComponent(projectId as string, {
        name: newCompName,
        type: newCompType,
        layout_config: {},
        children_ids: [],
        variable_mappings: {}
      })
    }

    resetComponentForm()
  }

  const resetComponentForm = () => {
    setNewCompName('')
    setEditingComponentId(null)
    setIsComponentModalOpen(false)
  }

  const openEditTokenModal = (token: DesignToken) => {
    setEditingTokenId(token.id)
    if (token.name.includes('|')) {
      const [role, name] = token.name.split('|')
      setNewTokenRole(role)
      setNewTokenName(name)
    } else {
      setNewTokenRole('none')
      setNewTokenName(token.name)
    }
    setActiveModal(token.category)

    if (token.category === 'typography') {
      const parts = token.value.split(' | ')
      if (parts.length >= 5) {
        setTypographyRole(parts[0])
        setFontSize(parts[1])
        setFontFamily(parts[2])
        setFontWeight(parts[3])
        setLetterSpacing(parts[4])
      } else {
        const oldParts = token.value.split(' ')
        if (oldParts.length >= 3) {
          setFontSize(oldParts[0])
          setFontFamily(oldParts[1])
          setFontWeight(oldParts[2])
        }
      }
    } else {
      setNewTokenValue(token.value)
    }
  }

  const openEditComponentModal = (component: any) => {
    setEditingComponentId(component.id)
    setNewCompName(component.name)
    setNewCompType(component.type)
    setIsComponentModalOpen(true)
  }

  // Color manipulation utilities
  const hexToHsl = (hex: string) => {
    let r = 0, g = 0, b = 0
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16)
      g = parseInt(hex[2] + hex[2], 16)
      b = parseInt(hex[3] + hex[3], 16)
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16)
      g = parseInt(hex.substring(3, 5), 16)
      b = parseInt(hex.substring(5, 7), 16)
    }
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2
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
    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  const generateShades = (baseColor: string) => {
    const validHex = /^#[0-9A-F]{3,6}$/i.test(baseColor) ? baseColor : '#3f3f46'
    const { h, s } = hexToHsl(validHex)
    const lightnesses = [97, 91, 82, 72, 61, 50, 41, 32, 23, 14, 8]
    return lightnesses.map(l => hslToHex(h, s, l))
  }

  return (
    <div className="p-8 space-y-12 bg-white dark:bg-black min-h-full overflow-hidden text-black dark:text-white selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-300">
      <PillarHeader
        title="Design System"
        description="The visual source of truth. Manage architectural tokens and UI patterns."
      >
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className={cn("border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-none h-10 text-xs font-bold gap-2", isPreviewOpen ? "bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white" : "bg-white dark:bg-black text-black dark:text-white")}
          >
            <Eye className="size-3.5" /> {isPreviewOpen ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            onClick={() => setPresetModal('all')}
            className="bg-black dark:bg-white text-white dark:text-black border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-10 text-xs font-bold gap-2"
          >
            <Layers className="size-3.5" /> Use Preset Pack
          </Button>
        </div>
      </PillarHeader>

      <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar">
        <div className="grid grid-cols-1 gap-16">
          <TokenSection
            title="Colors"
            icon={<Palette className="size-4" />}
            tokens={tokens.filter(t => t.category === 'color')}
            onAdd={() => { setActiveModal('color'); setNewTokenValue('#1a88ff'); }}
            onPreset={() => setPresetModal('color')}
            onEdit={openEditTokenModal}
            onDelete={(id) => deleteToken(projectId as string, id)}
          />
          <TokenSection
            title="Typography"
            icon={<Type className="size-4" />}
            tokens={tokens.filter(t => t.category === 'typography')}
            onAdd={() => { setActiveModal('typography'); setFontSize('16px'); setFontFamily('Inter'); setFontWeight('regular'); }}
            onPreset={() => setPresetModal('typography')}
            onEdit={openEditTokenModal}
            onDelete={(id) => deleteToken(projectId as string, id)}
          />
          <TokenSection
            title="Spacing"
            icon={<Move className="size-4" />}
            tokens={tokens.filter(t => t.category === 'spacing')}
            onAdd={() => setActiveModal('spacing')}
            onPreset={() => setPresetModal('spacing')}
            onEdit={openEditTokenModal}
            onDelete={(id) => deleteToken(projectId as string, id)}
          />
          <TokenSection
            title="Shadows"
            icon={<Layers className="size-4" />}
            tokens={tokens.filter(t => t.category === 'shadow')}
            onAdd={() => setActiveModal('shadow')}
            onPreset={() => setPresetModal('shadow')}
            onEdit={openEditTokenModal}
            onDelete={(id) => deleteToken(projectId as string, id)}
          />
          <TokenSection
            title="Radius"
            icon={<BoxSelect className="size-4" />}
            tokens={tokens.filter(t => t.category === 'border-radius')}
            onAdd={() => setActiveModal('border-radius')}
            onPreset={() => setPresetModal('border-radius')}
            onEdit={openEditTokenModal}
            onDelete={(id) => deleteToken(projectId as string, id)}
          />
        </div>

        {/* Token Slide-In Modal */}
        <SlideInModal
          isOpen={activeModal !== null}
          onClose={resetTokenForm}
          title={editingTokenId ? `Edit ${activeModal}` : `New ${activeModal}`}
          description="Define a reusable visual variable."
          footer={
            <Button
              onClick={() => handleSaveToken(activeModal)}
              className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-12 text-xs font-black transition-all"
            >
              {editingTokenId ? 'Update Token' : 'Save Token'}
            </Button>
          }
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 ">Token Identifier</Label>
              <Input
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                placeholder="e.g., brand-primary"
                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-none h-12 font-mono text-xs text-black dark:text-white focus:border-black dark:focus:border-white transition-colors"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 ">
                  {activeModal === 'typography' ? 'Typography Definition' : 'Value Definition'}
                </Label>
                {activeModal === 'color' && (
                  <div className="size-4 border border-zinc-200 dark:border-zinc-800" style={{ backgroundColor: newTokenValue }} />
                )}
              </div>

              <div className="space-y-6">
                {activeModal === 'typography' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 p-4 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-900 transition-colors">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-zinc-400 dark:text-zinc-600">Font Family</Label>
                          <Select value={fontFamily} onValueChange={(v) => setFontFamily(v || 'Inter')}>
                            <SelectTrigger className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 h-12! w-full! rounded-none text-xs font-mono text-black dark:text-white focus:border-black dark:focus:border-white transition-colors"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none">
                              {presetFonts.map(f => <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-zinc-400 dark:text-zinc-600">Hierarchy Role</Label>
                          <Select value={typographyRole} onValueChange={(v) => {
                            if (v) {
                              setTypographyRole(v)
                              const preset = rolePresets[v]
                              if (preset) {
                                setFontSize(preset.size)
                                setFontWeight(preset.weight)
                                setLetterSpacing(preset.spacing)
                              }
                            }
                          }}>
                            <SelectTrigger className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 h-12! w-full! rounded-none text-xs font-mono text-black dark:text-white focus:border-black dark:focus:border-white transition-colors capitalize"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none">
                              {Object.keys(rolePresets).map(role => <SelectItem key={role} value={role} className="text-xs capitalize">{role}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>

                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-zinc-400 dark:text-zinc-600">Size</Label>
                          <Input value={fontSize} onChange={(e) => setFontSize(e.target.value)} placeholder="16px" className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 h-12! w-full! rounded-none text-xs font-mono text-black dark:text-white focus:border-black dark:focus:border-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-zinc-400 dark:text-zinc-600">Weight</Label>
                          <Select value={fontWeight} onValueChange={(v) => setFontWeight(v || 'regular')}>
                            <SelectTrigger className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 h-12! w-full! rounded-none text-xs font-mono text-black dark:text-white focus:border-black dark:focus:border-white transition-colors"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-black dark:text-white rounded-none">
                              {presetWeights.map(w => <SelectItem key={w} value={w} className="text-xs">{w}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-zinc-400 dark:text-zinc-600">Tracking</Label>
                          <Input value={letterSpacing} onChange={(e) => setLetterSpacing(e.target.value)} placeholder="-1.4%" className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 h-12! w-full! rounded-none text-xs font-mono text-black dark:text-white focus:border-black dark:focus:border-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700" />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-900 mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs font-bold text-zinc-400 dark:text-zinc-600">Preview</Label>
                          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">{typographyRole}</span>
                        </div>
                        <div
                          style={{
                            fontSize,
                            fontFamily,
                            fontWeight: fontWeight === 'regular' ? 400 : (fontWeight === 'bold' ? 700 : (fontWeight === 'semibold' ? 600 : 500)),
                            letterSpacing: letterSpacing.includes('%') ? `calc(${fontSize} * ${parseFloat(letterSpacing) / 100})` : letterSpacing
                          }}
                          className="text-black dark:text-white truncate"
                        >
                          {typographyRole.startsWith('h') ? `Heading Level ${typographyRole.slice(1)}` : 'The quick brown fox jumps over the lazy dog'}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 space-y-4">
                      <Label className="text-xs font-bold text-zinc-400 dark:text-zinc-600">Type Scale Engine</Label>
                      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {typeScalePresets.map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => {
                              setTypographyRole(preset.role)
                              setFontSize(preset.size)
                              setFontWeight(preset.weight)
                              setLetterSpacing(rolePresets[preset.role]?.spacing || '0%')
                            }}
                            className={clsx(
                              "flex items-center justify-between p-1 border transition-all text-left",
                              typographyRole === preset.role
                                ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                                : "bg-white dark:bg-black border-zinc-200 dark:border-zinc-900 text-zinc-400 dark:text-zinc-500 hover:border-black dark:hover:border-zinc-700"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-mono w-12 shrink-0">{preset.label}</span>
                              <span style={{ fontSize: `min(24px, ${preset.size})`, fontFamily, fontWeight: preset.weight === 'bold' ? 700 : (preset.weight === 'medium' ? 500 : 400) }} className="truncate">
                                Typography
                              </span>
                            </div>
                            <div className="text-[9px] font-mono opacity-50">
                              {preset.size} / {preset.weight}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : activeModal === 'color' ? (
                  <div className="space-y-6 w-full">
                    <div className="space-y-2 w-full">
                      <Label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600">Color Classification</Label>
                      <Select value={newTokenRole} onValueChange={(v) => { if (v) setNewTokenRole(v) }}>
                        <SelectTrigger className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none h-10 text-[10px] font-bold">
                          <SelectValue placeholder="Select a role..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none">
                          <SelectItem value="none" className="text-[10px]">None (Custom)</SelectItem>
                          <SelectItem value="color-primary" className="text-[10px]">Primary</SelectItem>
                          <SelectItem value="color-secondary" className="text-[10px]">Secondary</SelectItem>
                          <SelectItem value="color-tertiary" className="text-[10px]">Tertiary</SelectItem>
                          <SelectItem value="color-accent" className="text-[10px]">Accent</SelectItem>
                          <SelectItem value="color-background" className="text-[10px]">Background</SelectItem>
                          <SelectItem value="color-text" className="text-[10px]">Foreground / Text</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[9px] text-zinc-500 mt-1">Bind this color to a specific architectural function for the preview engine.</p>
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 space-y-4">
                      <Label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600 ">Dynamic Shade Engine</Label>
                      <div className="flex gap-4">
                        <div className="relative group cursor-pointer size-16">
                          <div
                            className="absolute inset-0 border border-black/10 dark:border-white/20 shadow-2xl transition-transform group-hover:scale-105"
                            style={{ backgroundColor: newTokenValue || '#ffffff' }}
                          />
                          <div className="absolute -bottom-2 -right-2 bg-black dark:bg-white text-white dark:text-black text-[8px] font-black px-1.5 py-0.5  z-20 pointer-events-none shadow-sm">Pick</div>
                          <input
                            type="color"
                            value={newTokenValue || '#ffffff'}
                            onChange={(e) => setNewTokenValue(e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-30"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Select a base color to generate an hue scale.</p>
                          <Input
                            value={newTokenValue}
                            onChange={(e) => setNewTokenValue(e.target.value)}
                            className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 h-9 rounded-none text-[10px] font-mono text-black dark:text-white transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-900">
                      <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600  mb-4 tracking-wider">Color Palette (50 — 950)</p>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex gap-1 h-12">
                          {generateShades(newTokenValue).map((color, idx) => (
                            <button
                              key={color}
                              onClick={() => setNewTokenValue(color)}
                              className={clsx(
                                "flex-1 border border-black/5 dark:border-zinc-900 transition-all hover:scale-y-110",
                                newTokenValue === color && "border-black dark:border-white scale-y-110 z-10 shadow-xl"
                              )}
                              style={{ backgroundColor: color }}
                              title={`${(idx === 0 ? 50 : (idx === 10 ? 950 : idx * 100))}: ${color}`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between px-0.5">
                          <span className="text-[8px] font-black text-zinc-300 dark:text-zinc-700">50</span>
                          <span className="text-[8px] font-black text-zinc-300 dark:text-zinc-700 ">Shade Spectrum</span>
                          <span className="text-[8px] font-black text-zinc-300 dark:text-zinc-700">950</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Input
                    value={newTokenValue}
                    onChange={(e) => setNewTokenValue(e.target.value)}
                    className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-none h-12 font-mono text-xs text-black dark:text-white focus:border-black dark:focus:border-white transition-colors"
                  />
                )}
              </div>
            </div>
          </div>
        </SlideInModal>

        {/* Component Slide-In Modal */}
        <SlideInModal
          isOpen={isComponentModalOpen}
          onClose={resetComponentForm}
          title={editingComponentId ? "Edit Component" : "New Component"}
          description="Define a new architectural block."
          footer={
            <Button
              onClick={handleSaveComponent}
              className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-12 text-xs font-black  transition-all"
            >
              {editingComponentId ? 'Update Blueprint' : 'Create Component'}
            </Button>
          }
        >
          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 ">Component name</Label>
              <Input value={newCompName} onChange={(e) => setNewCompName(e.target.value)} className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-none h-12 font-mono text-xs text-black dark:text-white focus:border-black dark:focus:border-white transition-colors" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 ">Classification</Label>
              <Select value={newCompType} onValueChange={(v) => v && setNewCompType(v as any)}>
                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-950 w-full border-zinc-200 dark:border-zinc-800 rounded-none h-12! text-xs text-black dark:text-white focus:border-black dark:focus:border-white transition-colors font-mono"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-black dark:text-white capitalize rounded-none">
                  <SelectItem value="button" className="text-xs">Button</SelectItem>
                  <SelectItem value="input" className="text-xs">Input</SelectItem>
                  <SelectItem value="form" className="text-xs">Form</SelectItem>
                  <SelectItem value="container" className="text-xs">Layout</SelectItem>
                  <SelectItem value="custom" className="text-xs">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SlideInModal>

        {/* Presets Modal */}
        <SlideInModal
          isOpen={presetModal !== null}
          onClose={() => setPresetModal(null)}
          title={presetModal === 'all' ? "Apply Preset Pack" : `Apply ${presetModal} Presets`}
          description="Select a professionally curated design preset to apply to your project."
        >
          <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {DESIGN_PRESETS.map(preset => (
              <div key={preset.id} className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 hover:border-black dark:hover:border-zinc-600 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold">{preset.name}</h4>
                  <Button
                    onClick={() => handleApplyPreset(preset.id, presetModal!)}
                    className="bg-black dark:bg-white text-white dark:text-black h-8 text-[10px] font-bold rounded-none hover:bg-zinc-800 dark:hover:bg-zinc-200"
                  >
                    Apply
                  </Button>
                </div>
                {(presetModal === 'all' || presetModal === 'color') && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 w-16">Colors</span>
                    {preset.color.map(c => (
                      <div key={c.name} className="size-4 border border-zinc-200 dark:border-zinc-800" style={{ backgroundColor: c.value }} title={c.name} />
                    ))}
                  </div>
                )}
                {(presetModal === 'all' || presetModal === 'typography') && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 w-16">Typography</span>
                    <span className="text-[10px] font-mono text-black dark:text-white truncate">{preset.typography[0].value.split(' | ')[2]}</span>
                  </div>
                )}
                {(presetModal === 'all' || presetModal === 'spacing') && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 w-16">Spacing</span>
                    <span className="text-[10px] font-mono text-black dark:text-white truncate">{preset.spacing.map(s => s.value).join(', ')}</span>
                  </div>
                )}
                {(presetModal === 'all' || presetModal === 'shadow') && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 w-16">Shadows</span>
                    <span className="text-[10px] font-mono text-black dark:text-white truncate">{preset.shadow.length} variants</span>
                  </div>
                )}
                {(presetModal === 'all' || presetModal === 'border-radius') && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 w-16">Radius</span>
                    <span className="text-[10px] font-mono text-black dark:text-white truncate">{preset['border-radius'].map(r => r.value).join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SlideInModal>

        {isPreviewOpen && (
          <DesignPreview tokens={tokens} onClose={() => setIsPreviewOpen(false)} />
        )}
      </div>

    </div>
  )
}
