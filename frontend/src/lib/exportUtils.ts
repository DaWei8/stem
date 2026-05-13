import { Screen, Transition, ScreenInput, ScreenAction, ScreenOutput, UserType, RLSPolicy, Variable, Project, ProjectState } from '@/types'

export function generateProjectDocumentation(state: ProjectState): string {

  const { project, architecture, schema, identity, logic, designSystem } = state
  const { pages, transitions, inputs, actions, outputs } = architecture

  let doc = `# Technical Specification: ${project?.name || 'Untitled Project'}\n\n`
  doc += `**Exported At:** ${new Date().toLocaleString()}\n`
  doc += `**Engine Version:** STEM-CORE-V1 (Deterministic)\n\n`

  doc += `## Executive Summary\n`
  doc += `${project?.description || 'No description provided for this architectural blueprint.'}\n\n`

  doc += `## I. UI Flows & User Journeys\n`
  doc += `This project contains ${pages.length} screens and ${transitions.length} architectural transitions.\n\n`

  pages.forEach(page => {
    doc += `### Screen: ${page.title}\n`
    if (page.description) doc += `> ${page.description}\n\n`

    const pageInputs = inputs.filter(i => i.page_id === page.id)
    if (pageInputs.length > 0) {
      doc += `**Incoming Data (Inputs):**\n`
      pageInputs.forEach(i => {
        const variable = logic.variables.find(v => v.id === i.variable_id)
        doc += `- \`${i.name}\`: Type \`${i.input_type}\`. Bound to variable \`${variable?.label || 'unknown'}\`.\n`
      })
      doc += `\n`
    }

    const pageActions = actions.filter(a => a.page_id === page.id)
    if (pageActions.length > 0) {
      doc += `**Logic & Triggers:**\n`
      pageActions.forEach(a => {
        doc += `- \`${a.name}\`: Action of type \`${a.action_type}\`.\n`
      })
      doc += `\n`
    }

    const pageOutputs = outputs.filter(o => o.page_id === page.id)
    if (pageOutputs.length > 0) {
      doc += `**State Mutations (Outputs):**\n`
      pageOutputs.forEach(o => {
        doc += `- \`${o.name}\`: Mutation type \`${o.output_type}\`.\n`
      })
      doc += `\n`
    }

    const outgoing = transitions.filter(t => t.from_page_id === page.id)
    if (outgoing.length > 0) {
      doc += `**Transitions Out:**\n`
      outgoing.forEach(t => {
        const target = pages.find(p => p.id === t.to_page_id)
        doc += `- → Leads to **${target?.title}** via \`${t.trigger_type}\` trigger.\n`
      })
      doc += `\n`
    }
  })

  doc += `## II. Database Schema & Persistence\n`
  if (schema.tables.length === 0) {
    doc += `No persistent database tables defined.\n\n`
  } else {
    schema.tables.forEach(table => {
      doc += `### Table: ${table.name}\n`
      const tableColumns = schema.columns.filter(c => c.table_id === table.id)
      doc += `| Field | Type | Constraint |\n`
      doc += `| :--- | :--- | :--- |\n`
      tableColumns.forEach(col => {
        const variable = logic.variables.find(v => v.id === col.variable_id)
        doc += `| ${col.name} | ${variable?.type || 'string'} | ${col.is_primary_key ? 'PK' : (col.is_nullable ? '' : 'NOT NULL')} |\n`
      })
      doc += `\n`
    })
  }

  doc += `## III. Identity & Security Model (RLS)\n`
  doc += `### User Archetypes\n`
  identity.userTypes.forEach(ut => {
    doc += `- **${ut.name}**: ${ut.description || 'Standard project role.'}\n`
  })
  doc += `\n`

  doc += `### Row Level Security (RLS) Policies\n`
  if (identity.policies.length === 0) {
    doc += `No security policies defined. System assumes default RLS rejection.\n\n`
  } else {
    identity.policies.forEach(p => {
      const table = schema.tables.find(t => t.id === p.table_id)
      const userType = identity.userTypes.find(ut => ut.id === p.user_type_id)
      doc += `- **${p.name}**: Allows \`${p.policy_type?.toUpperCase()}\` on \`${table?.name}\` for \`${userType?.name || 'Everyone'}\`.\n`
      doc += `  - *Condition:* \`${p.policy_logic}\`\n`
    })

    doc += `\n`
  }

  doc += `## IV. Variable Registry (Logic Layer)\n`
  doc += `| Variable | Scope | Type | Default |\n`
  doc += `| :--- | :--- | :--- | :--- |\n`
  logic.variables.forEach(v => {
    doc += `| ${v.label} | ${v.scope} | ${v.type} | \`${v.default_value || 'null'}\` |\n`
  })
  doc += `\n`

  doc += `## V. Visual Tokens (Design System)\n`
  doc += `Total Design Tokens: ${designSystem.tokens.length}\n`
  doc += `Total Component Patterns: ${designSystem.components.length}\n\n`

  doc += `---\n`
  doc += `*Generated automatically by STEM Project Engine.*`

  return doc
}

export function generateDocFile(docContent: string, projectName: string) {
  // Shorthand for browser download
  const blob = new Blob([docContent], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_specification.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
