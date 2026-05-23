'use client'

import { useState, useEffect } from 'react'
import { Variable } from '@/types'
import { toast } from 'sonner'

export interface PersonaInstance {
  id: string
  name: string
  values: Record<string, any>
}

interface UsePersonaManagerProps {
  userType: any
  availableVariables: Variable[]
  onSave: (id: string, updatedPersona: any) => Promise<void>
  onClose: () => void
}

export function usePersonaManager({
  userType,
  availableVariables,
  onSave,
  onClose
}: UsePersonaManagerProps) {
  const [instances, setInstances] = useState<PersonaInstance[]>([])
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null)
  const [newInstanceName, setNewInstanceName] = useState('')
  const [isAddingInstance, setIsAddingInstance] = useState(false)
  const [editingInstanceNameId, setEditingInstanceNameId] = useState<string | null>(null)
  const [tempInstanceName, setTempInstanceName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Load instances from userType.persona
  useEffect(() => {
    if (userType?.persona?.instances) {
      setInstances(userType.persona.instances)
      if (userType.persona.instances.length > 0) {
        setSelectedInstanceId(userType.persona.instances[0].id)
      } else {
        setSelectedInstanceId(null)
      }
    } else {
      setInstances([])
      setSelectedInstanceId(null)
    }
  }, [userType])

  const selectedInstance = instances.find(inst => inst.id === selectedInstanceId)

  const handleAddInstance = () => {
    const name = newInstanceName.trim()
    if (!name) {
      toast.error('Instance name is required')
      return
    }
    const newId = `inst_${Math.random().toString(36).substring(7)}`
    const newInst: PersonaInstance = {
      id: newId,
      name,
      values: {}
    }
    const updated = [...instances, newInst]
    setInstances(updated)
    setSelectedInstanceId(newId)
    setNewInstanceName('')
    setIsAddingInstance(false)
    toast.success(`Instance "${name}" created`)
  }

  const handleDeleteInstance = (id: string) => {
    const updated = instances.filter(inst => inst.id !== id)
    setInstances(updated)
    if (selectedInstanceId === id) {
      setSelectedInstanceId(updated[0]?.id || null)
    }
    toast.success('Instance removed')
  }

  const handleUpdateInstanceName = (id: string) => {
    const name = tempInstanceName.trim()
    if (!name) return
    const updated = instances.map(inst => inst.id === id ? { ...inst, name } : inst)
    setInstances(updated)
    setEditingInstanceNameId(null)
    toast.success('Instance name updated')
  }

  const handleAddVariableValue = (varId: string) => {
    if (!selectedInstanceId || !selectedInstance) return
    const variable = availableVariables.find(v => v.id === varId)
    if (!variable) return

    if (selectedInstance.values[variable.label] !== undefined) {
      toast.warning('Variable already bound to this instance')
      return
    }

    let defaultVal: any = ''
    if (variable.type === 'boolean') defaultVal = false
    else if (variable.type === 'number') defaultVal = 0
    else if (variable.type === 'object' || variable.type === 'array') defaultVal = {}

    const updatedValues = { ...selectedInstance.values, [variable.label]: defaultVal }
    const updated = instances.map(inst =>
      inst.id === selectedInstanceId ? { ...inst, values: updatedValues } : inst
    )
    setInstances(updated)
  }

  const handleUpdateVariableValue = (varLabel: string, value: any) => {
    if (!selectedInstanceId || !selectedInstance) return
    const updatedValues = { ...selectedInstance.values, [varLabel]: value }
    const updated = instances.map(inst =>
      inst.id === selectedInstanceId ? { ...inst, values: updatedValues } : inst
    )
    setInstances(updated)
  }

  const handleRemoveVariableValue = (varLabel: string) => {
    if (!selectedInstanceId || !selectedInstance) return
    const updatedValues = { ...selectedInstance.values }
    delete updatedValues[varLabel]
    const updated = instances.map(inst =>
      inst.id === selectedInstanceId ? { ...inst, values: updatedValues } : inst
    )
    setInstances(updated)
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      const updatedPersona = {
        ...userType.persona,
        instances
      }
      await onSave(userType.id, { persona: updatedPersona })
      toast.success('Persona config synchronized')
      onClose()
    } catch (e) {
      toast.error('Sync failed')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    instances,
    selectedInstanceId,
    setSelectedInstanceId,
    newInstanceName,
    setNewInstanceName,
    isAddingInstance,
    setIsAddingInstance,
    editingInstanceNameId,
    setEditingInstanceNameId,
    tempInstanceName,
    setTempInstanceName,
    isSaving,
    selectedInstance,
    handleAddInstance,
    handleDeleteInstance,
    handleUpdateInstanceName,
    handleAddVariableValue,
    handleUpdateVariableValue,
    handleRemoveVariableValue,
    handleSaveAll
  }
}
