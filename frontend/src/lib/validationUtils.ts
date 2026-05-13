import { Screen, Transition, ScreenInput, ScreenAction, ScreenOutput } from '@/types'

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  pageId?: string
  targetId?: string
}

export function validateArchitecture(
  pages: Screen[],
  transitions: Transition[],
  inputs: ScreenInput[],
  actions: ScreenAction[],
  outputs: ScreenOutput[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // 1. Orphaned Screens (No incoming or outgoing flows)
  pages.forEach(page => {
    const hasIncoming = transitions.some(t => t.to_page_id === page.id)
    const hasOutgoing = transitions.some(t => t.from_page_id === page.id)
    
    if (!hasIncoming && !hasOutgoing && pages.length > 1) {
      issues.push({
        type: 'warning',
        message: `Orphaned Screen: '${page.title}' has no connections.`,
        pageId: page.id
      })
    } else if (!hasOutgoing && pages.length > 1) {
       // Check if it's intended to be a terminal screen
       // For now, just a warning if it's not the only screen
       // Actually, terminal screens are fine.
    }
  })

  // 2. Dead Ends (Inputs/Actions but no transitions out)
  pages.forEach(page => {
    const hasInputs = inputs.some(i => i.page_id === page.id)
    const hasActions = actions.some(a => a.page_id === page.id)
    const hasOutgoing = transitions.some(t => t.from_page_id === page.id)

    if ((hasInputs || hasActions) && !hasOutgoing) {
      issues.push({
        type: 'info',
        message: `Terminal Logic: '${page.title}' processes data but has no exit path.`,
        pageId: page.id
      })
    }
  })

  // 3. Logic Gaps (Transitions out but no actions/triggers)
  pages.forEach(page => {
    const hasOutgoing = transitions.some(t => t.from_page_id === page.id)
    const hasActions = actions.some(a => a.page_id === page.id)
    
    if (hasOutgoing && !hasActions) {
      issues.push({
        type: 'warning',
        message: `Implicit Transition: '${page.title}' leads to other screens but has no triggers defined.`,
        pageId: page.id
      })
    }
  })

  // 4. Circular Loops (Simple check for now)
  transitions.forEach(t => {
    if (t.from_page_id === t.to_page_id) {
      issues.push({
        type: 'error',
        message: `Self-Loop: '${pages.find(p => p.id === t.from_page_id)?.title}' links to itself.`,
        pageId: t.from_page_id
      })
    }
  })

  return issues
}
