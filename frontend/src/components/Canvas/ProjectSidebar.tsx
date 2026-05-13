'use client'

import { useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { usePages } from '@/hooks/usePages'
import { useVariables } from '@/hooks/useVariables'
import { useDesignSystem } from '@/hooks/useDesignSystem'
import { useUI } from '@/hooks/useUI'
import { BulkEdit } from '../blocks/canvas/BulkEdit'
import { ScreenDetails } from '../blocks/canvas/ScreenDetails'
import { ProjectOverview } from '../blocks/canvas/ProjectOverview'
import { useEffect } from 'react'

interface ProjectSidebarProps {
  selectedNode: any | null
  selectedNodes?: any[]
  projectId: string
  onSelectScreen?: (pageId: string) => void
  onTriggerDelete?: (pageId: string) => void
}

export function ProjectSidebar({ 
  selectedNode, selectedNodes = [], projectId, onSelectScreen, onTriggerDelete 
}: ProjectSidebarProps) {
  const {
    pages, inputs, actions, outputs, transitions, updatePage, addInput, addAction, addOutput
  } = usePages()
  const { variables } = useVariables()
  const { components, fetchComponents, tokens, fetchTokens } = useDesignSystem()

  useEffect(() => {
    if (projectId) {
      fetchComponents(projectId)
      fetchTokens(projectId)
    }
  }, [projectId, fetchComponents, fetchTokens])

  const selectedPage = useMemo(() => {
    if (!selectedNode) return null
    const page = pages.find(p => p.id === selectedNode.data.page_id)
    if (!page) return null
    return {
      ...page,
      inputs: inputs.filter(i => i.page_id === page.id),
      actions: actions.filter(a => a.page_id === page.id),
      outputs: outputs.filter(o => o.page_id === page.id)
    }
  }, [selectedNode, pages, inputs, actions, outputs])

  return (
    <aside className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex flex-col h-full z-50 shadow-2xl overflow-hidden transition-colors">
      <AnimatePresence mode="wait">
        {selectedNodes && selectedNodes.length > 1 ? (
          <BulkEdit key="bulk" selectedNodes={selectedNodes} updatePage={updatePage} />
        ) : selectedPage ? (
          <ScreenDetails
            key={selectedPage.id}
            page={selectedPage}
            allPages={pages}
            transitions={transitions}
            availableVariables={variables}
            updatePage={updatePage}
            addInput={addInput}
            addAction={addAction}
            addOutput={addOutput}
            onSelectScreen={onSelectScreen}
            onDelete={() => onTriggerDelete?.(selectedPage.id)}
          />
        ) : (
          <ProjectOverview
            key="overview"
            pages={pages}
            variables={variables}
            components={components}
            tokens={tokens}
            inputs={inputs}
            actions={actions}
            outputs={outputs}
            projectId={projectId}
            onSelectScreen={onSelectScreen}
            onDeleteScreen={(id: string) => onTriggerDelete?.(id)}
            selectedNodeId={selectedNode?.id}
          />
        )}
      </AnimatePresence>
    </aside>
  )
}
