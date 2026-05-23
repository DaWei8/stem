'use client'

import { SlideInModal } from '@/components/ui/SlideInModal'
import { Button } from '@/components/ui/button'
import { Variable } from '@/types'
import { usePersonaManager } from '@/hooks/usePersonaManager'
import { PersonaList } from './PersonaList'
import { PersonaDetails } from './PersonaDetails'

interface Props {
  isOpen: boolean
  onClose: () => void
  userType: any
  availableVariables: Variable[]
  onSave: (id: string, updatedPersona: any) => Promise<void>
}

export function PersonaManagerModal({ isOpen, onClose, userType, availableVariables, onSave }: Props) {
  const {
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
  } = usePersonaManager({ userType, availableVariables, onSave, onClose })

  return (
    <SlideInModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Define Personas: ${userType?.name}`}
      description="Create different instances of this user type with customized variable state to simulate granular path rules."
      size="3xl"
      footer={
        <Button 
          onClick={handleSaveAll} 
          disabled={isSaving} 
          className="w-full bg-white text-black hover:bg-zinc-200 rounded-xl h-11 text-xs font-bold transition-all shadow-md active:scale-95"
        >
          {isSaving ? 'Synchronizing...' : 'Save Persona Model'}
        </Button>
      }
    >
      <div className="grid grid-cols-3 gap-8 h-[540px] overflow-hidden">
        {/* Left column: Instances list */}
        <div className="col-span-1 border-r border-zinc-900 pr-6 h-full">
          <PersonaList
            instances={instances}
            selectedInstanceId={selectedInstanceId}
            setSelectedInstanceId={setSelectedInstanceId}
            isAddingInstance={isAddingInstance}
            setIsAddingInstance={setIsAddingInstance}
            newInstanceName={newInstanceName}
            setNewInstanceName={setNewInstanceName}
            handleAddInstance={handleAddInstance}
            editingInstanceNameId={editingInstanceNameId}
            setEditingInstanceNameId={setEditingInstanceNameId}
            tempInstanceName={tempInstanceName}
            setTempInstanceName={setTempInstanceName}
            handleUpdateInstanceName={handleUpdateInstanceName}
            handleDeleteInstance={handleDeleteInstance}
            roleColor={userType?.color}
          />
        </div>

        {/* Right column: Values configuration */}
        <div className="col-span-2 h-full pl-2">
          <PersonaDetails
            selectedInstance={selectedInstance || null}
            availableVariables={availableVariables}
            handleAddVariableValue={handleAddVariableValue}
            handleUpdateVariableValue={handleUpdateVariableValue}
            handleRemoveVariableValue={handleRemoveVariableValue}
          />
        </div>
      </div>
    </SlideInModal>
  )
}
