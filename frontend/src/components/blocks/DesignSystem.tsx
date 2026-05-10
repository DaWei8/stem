'use client'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Palette, Type, Move, Layers, BoxSelect, Component } from 'lucide-react'
import { useDesignSystem } from '@/hooks/useDesignSystem'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { PillarHeader } from '@/components/layout/PillarHeader'
import { SlideInModal } from '@/components/ui/SlideInModal'
import { TokenSection } from '@/components/design/TokenSection'
import { ComponentCard } from '@/components/design/ComponentCard'
import clsx from 'clsx'

interface DesignToken {
  id: string
  name: string
  value: string
  category: 'color' | 'typography' | 'spacing' | 'shadow' | 'border-radius' | 'duration' | 'z-index'
}

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
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false)
  const [editingTokenId, setEditingTokenId] = useState<string | null>(null)
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null)

  const [newTokenName, setNewTokenName] = useState('')
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

  const handleSaveToken = async (type: any) => {
    if (!newTokenName) return

    const value = activeModal === 'typography'
      ? `${typographyRole} | ${fontSize} | ${fontFamily} | ${fontWeight} | ${letterSpacing}`
      : newTokenValue
    if (!value) return

    if (editingTokenId) {
      await updateToken(projectId as string, editingTokenId, { name: newTokenName, value, category: type })
    } else {
      const isDuplicate = tokens.some(t => t.name.toLowerCase() === newTokenName.toLowerCase())
      if (isDuplicate) {
        toast.error(`A token with the name "${newTokenName}" already exists.`)
        return
      }
      await addToken(projectId as string, { name: newTokenName, value, category: type })
    }

    resetTokenForm()
  }

  const resetTokenForm = () => {
    setNewTokenName('')
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
    setNewTokenName(token.name)
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
        // Fallback for old tokens
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
    <div className="p-8 space-y-12 bg-black min-h-full overflow-hidden text-white selection:bg-white/20">
      <PillarHeader
        title="Design System"
        description="The visual source of truth. Manage architectural tokens and UI patterns."
      />

      <Tabs defaultValue="tokens" className="flex-1 flex flex-col min-h-0">
        <div className="border-b border-zinc-900 bg-zinc-950/20 backdrop-blur-md sticky top-0 z-10">
          <TabsList className="bg-transparent h-16 p-0 gap-2">
            <TabsTrigger value="tokens" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white rounded-none h-full px-4 border-b-2 border-transparent text-zinc-500 font-bold text-xs  transition-all">
              <div className="flex items-center gap-2">
                <Palette className="size-3" /> Visual Tokens
              </div>
            </TabsTrigger>
            <TabsTrigger value="components" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white rounded-none h-full px-4 border-b-2 border-transparent text-zinc-500 font-bold text-xs transition-all">
              <div className="flex items-center gap-2">
                <Component className="size-3" /> Component Registry
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto py-8 custom-scrollbar">
          <TabsContent value="tokens" className="m-0 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
              <TokenSection
                title="Colors"
                icon={<Palette className="size-4" />}
                tokens={tokens.filter(t => t.category === 'color')}
                onAdd={() => { setActiveModal('color'); setNewTokenValue('#1a88ff'); }}
                onEdit={openEditTokenModal}
                onDelete={(id) => deleteToken(projectId as string, id)}
              />
              <TokenSection
                title="Typography"
                icon={<Type className="size-4" />}
                tokens={tokens.filter(t => t.category === 'typography')}
                onAdd={() => { setActiveModal('typography'); setFontSize('16px'); setFontFamily('Inter'); setFontWeight('regular'); }}
                onEdit={openEditTokenModal}
                onDelete={(id) => deleteToken(projectId as string, id)}
              />
              <TokenSection
                title="Spacing"
                icon={<Move className="size-4" />}
                tokens={tokens.filter(t => t.category === 'spacing')}
                onAdd={() => setActiveModal('spacing')}
                onEdit={openEditTokenModal}
                onDelete={(id) => deleteToken(projectId as string, id)}
              />
              <TokenSection
                title="Shadows"
                icon={<Layers className="size-4" />}
                tokens={tokens.filter(t => t.category === 'shadow')}
                onAdd={() => setActiveModal('shadow')}
                onEdit={openEditTokenModal}
                onDelete={(id) => deleteToken(projectId as string, id)}
              />
              <TokenSection
                title="Radius"
                icon={<BoxSelect className="size-4" />}
                tokens={tokens.filter(t => t.category === 'border-radius')}
                onAdd={() => setActiveModal('border-radius')}
                onEdit={openEditTokenModal}
                onDelete={(id) => deleteToken(projectId as string, id)}
              />
            </div>
          </TabsContent>

          <TabsContent value="components" className="m-0 focus-visible:outline-none">
            <div className="flex flex-col gap-12">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight">System Blocks</h3>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Functional UI components and patterns</p>
                </div>
                <Button
                  onClick={() => setIsComponentModalOpen(true)}
                  className="bg-white text-black hover:bg-zinc-200 rounded-none h-12 px-8 font-black uppercase tracking-widest transition-all"
                >
                  <Plus className="size-4 mr-2" /> Define Component
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {components.map(component => (
                  <ComponentCard
                    key={component.id}
                    component={component}
                    onEdit={openEditComponentModal}
                    onDelete={(id) => deleteComponent(projectId as string, id)}
                  />
                ))}
                <button
                  onClick={() => setIsComponentModalOpen(true)}
                  className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-zinc-900 hover:border-zinc-700 hover:bg-zinc-950/50 transition-all min-h-[200px]"
                >
                  <div className="size-12 rounded-full bg-zinc-900 flex items-center justify-center">
                    <Plus className="size-6 text-zinc-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Register New Pattern</span>
                </button>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Token Slide-In Modal */}
      <SlideInModal
        isOpen={activeModal !== null}
        onClose={resetTokenForm}
        title={editingTokenId ? `Edit ${activeModal}` : `New ${activeModal}`}
        description="Define a reusable visual variable."
        footer={
          <Button
            onClick={() => handleSaveToken(activeModal)}
            className="w-full bg-white text-black hover:bg-zinc-200 rounded-none h-12 text-xs font-black transition-all"
          >
            {editingTokenId ? 'Update Token' : 'Save Token'}
          </Button>
        }
      >
        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Token Identifier</Label>
            <Input
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              placeholder="e.g., brand-primary"
              className="bg-zinc-950 border-zinc-800 rounded-none h-12 font-mono text-xs text-white focus:border-white transition-colors"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                {activeModal === 'typography' ? 'Typography Definition' : 'Value Definition'}
              </Label>
              {activeModal === 'color' && (
                <div className="size-4 border border-zinc-800" style={{ backgroundColor: newTokenValue }} />
              )}
            </div>

            <div className="space-y-6">
              {activeModal === 'typography' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 p-4 bg-zinc-950/50 border border-zinc-900">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-zinc-600">Font Family</Label>
                        <Select value={fontFamily} onValueChange={(v) => setFontFamily(v || 'Inter')}>
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 h-12! w-full! rounded-none text-xs font-mono text-white focus:border-white transition-colors"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-black border-zinc-800 text-white rounded-none">
                            {presetFonts.map(f => <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-zinc-600">Hierarchy Role</Label>
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
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 h-12! w-full! rounded-none text-xs font-mono text-white focus:border-white transition-colors capitalize"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-black border-zinc-800 text-white rounded-none">
                            {Object.keys(rolePresets).map(role => <SelectItem key={role} value={role} className="text-xs capitalize">{role}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-zinc-600">Size</Label>
                        <Input value={fontSize} onChange={(e) => setFontSize(e.target.value)} placeholder="16px" className="bg-zinc-950 border-zinc-800 h-12! w-full! rounded-none text-xs font-mono text-white placeholder:text-zinc-700" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-zinc-600">Weight</Label>
                        <Select value={fontWeight} onValueChange={(v) => setFontWeight(v || 'regular')}>
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 h-12! w-full! rounded-none text-xs font-mono text-white focus:border-white transition-colors"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-black border-zinc-800 text-white rounded-none">
                            {presetWeights.map(w => <SelectItem key={w} value={w} className="text-xs">{w}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-zinc-600">Tracking</Label>
                        <Input value={letterSpacing} onChange={(e) => setLetterSpacing(e.target.value)} placeholder="-1.4%" className="bg-zinc-950 border-zinc-800 h-12! w-full! rounded-none text-xs font-mono text-white placeholder:text-zinc-700" />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-900 mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-bold text-zinc-600">Preview</Label>
                        <span className="text-xs font-mono text-zinc-500">{typographyRole}</span>
                      </div>
                      <div
                        style={{
                          fontSize,
                          fontFamily,
                          fontWeight: fontWeight === 'regular' ? 400 : (fontWeight === 'bold' ? 700 : (fontWeight === 'semibold' ? 600 : 500)),
                          letterSpacing: letterSpacing.includes('%') ? `calc(${fontSize} * ${parseFloat(letterSpacing) / 100})` : letterSpacing
                        }}
                        className="text-white truncate"
                      >
                        {typographyRole.startsWith('h') ? `Heading Level ${typographyRole.slice(1)}` : 'The quick brown fox jumps over the lazy dog'}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-950 border border-zinc-900 space-y-4">
                    <Label className="text-xs font-bold text-zinc-600">Type Scale Engine</Label>
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
                            typographyRole === preset.role ? "bg-white text-black border-white" : "bg-black border-zinc-900 text-zinc-500 hover:border-zinc-700"
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
                <div className="space-y-6">
                  <div className="p-4 bg-zinc-950 border border-zinc-900 space-y-4">
                    <Label className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Dynamic Shade Engine</Label>
                    <div className="flex gap-4">
                      <div className="relative group cursor-pointer size-16">
                        <div
                          className="absolute inset-0 border border-white/20 shadow-2xl transition-transform group-hover:scale-105"
                          style={{ backgroundColor: newTokenValue || '#ffffff' }}
                        />
                        <div className="absolute -bottom-2 -right-2 bg-white text-black text-[8px] font-black px-1.5 py-0.5 uppercase z-20 pointer-events-none">Pick</div>
                        <input
                          type="color"
                          value={newTokenValue || '#ffffff'}
                          onChange={(e) => setNewTokenValue(e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-30"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-[10px] text-zinc-400 font-medium">Select a base hue to generate an architectural scale.</p>
                        <Input
                          value={newTokenValue}
                          onChange={(e) => setNewTokenValue(e.target.value)}
                          className="bg-black border-zinc-800 h-9 rounded-none text-[10px] font-mono text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-950/50 border border-zinc-900">
                    <p className="text-[9px] font-bold text-zinc-600 uppercase mb-4 tracking-wider">Color Palette (50 — 950)</p>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1 h-12">
                        {generateShades(newTokenValue).map((color, idx) => (
                          <button
                            key={color}
                            onClick={() => setNewTokenValue(color)}
                            className={clsx(
                              "flex-1 border border-zinc-900 transition-all hover:scale-y-110",
                              newTokenValue === color && "border-white scale-y-110 z-10 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                            )}
                            style={{ backgroundColor: color }}
                            title={`${(idx === 0 ? 50 : (idx === 10 ? 950 : idx * 100))}: ${color}`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between px-0.5">
                        <span className="text-[8px] font-black text-zinc-700">50</span>
                        <span className="text-[8px] font-black text-zinc-700 uppercase">Shade Spectrum</span>
                        <span className="text-[8px] font-black text-zinc-700">950</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Input
                  value={newTokenValue}
                  onChange={(e) => setNewTokenValue(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 rounded-none h-12 font-mono text-xs text-white focus:border-white transition-colors"
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
            className="w-full bg-white text-black hover:bg-zinc-200 rounded-none h-12 text-xs font-black uppercase tracking-widest transition-all"
          >
            {editingComponentId ? 'Update Blueprint' : 'Create Component'}
          </Button>
        }
      >
        <div className="space-y-8">
          <div className="space-y-3">
            <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Component name</Label>
            <Input value={newCompName} onChange={(e) => setNewCompName(e.target.value)} className="bg-zinc-950 border-zinc-800 rounded-none h-12 font-mono text-xs text-white focus:border-white transition-colors" />
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Classification</Label>
            <Select value={newCompType} onValueChange={(v) => v && setNewCompType(v as any)}>
              <SelectTrigger className="bg-zinc-950 w-full border-zinc-800 rounded-none h-12! text-xs text-white focus:border-white transition-colors font-mono"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-black border-zinc-800 text-white capitalize rounded-none">
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
    </div>
  )
}
