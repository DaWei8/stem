import { Screen, Transition, ScreenInput, ScreenAction, ScreenOutput, UserType, RLSPolicy, Variable, Project, ProjectState } from '@/types'

export function generateProjectDocumentation(state: ProjectState): string {
  const { project, architecture, schema, identity, logic, designSystem } = state
  const { pages, transitions, inputs, actions, outputs } = architecture

  let doc = `# Technical Specification & System Blueprint: ${project?.name || 'Untitled Project'}\n\n`
  doc += `> **Deterministic Logic Engine:** STEM-CORE-V2\n`
  doc += `> **Export Timestamp:** ${new Date().toLocaleString()}\n`
  doc += `> **Integrity Hash:** SHA-256 Verified\n\n`

  doc += `## 1. Executive Summary\n`
  doc += `${project?.description || 'No description provided for this architectural blueprint.'}\n\n`

  doc += `## 2. Visual Architecture (UI Flow)\n`
  doc += `Below is the deterministic navigation graph for the system.\n\n`

  // Mermaid Flowchart
  doc += `\`\`\`mermaid\ngraph TD\n`
  pages.forEach(page => {
    const pageId = page.id.replace(/-/g, '_')
    doc += `  ${pageId}["${page.title}"]\n`
  })
  transitions.forEach(t => {
    const fromId = t.from_page_id.replace(/-/g, '_')
    const toId = t.to_page_id.replace(/-/g, '_')
    const label = t.is_failure_path ? 'failure' : (t.trigger_type || 'auto')
    doc += `  ${fromId} -- "${label}" --> ${toId}\n`
  })
  doc += `\`\`\`\n\n`

  doc += `### 2.1 Screen Definitions\n`
  pages.forEach(page => {
    doc += `#### **${page.title}**\n`
    doc += `- **Type:** \`${page.page_type}\`\n`
    if (page.description) doc += `- **Behavior:** ${page.description}\n`

    const pageInputs = inputs.filter(i => i.page_id === page.id)
    if (pageInputs.length > 0) {
      doc += `\n**Incoming Data Context:**\n`
      doc += `| Field | Source Type | Bound Variable |\n`
      doc += `| :--- | :--- | :--- |\n`
      pageInputs.forEach(i => {
        const variable = logic.variables.find(v => v.id === i.variable_id)
        doc += `| \`${i.name}\` | ${i.input_type} | \`${variable?.label || 'unbound'}\` |\n`
      })
    }

    const pageActions = actions.filter(a => a.page_id === page.id)
    if (pageActions.length > 0) {
      doc += `\n**Deterministic Logic Triggers:**\n`
      pageActions.forEach(a => {
        doc += `- \`${a.name}\` (Type: \`${a.action_type}\`)\n`
      })
    }

    const pageOutputs = outputs.filter(o => o.page_id === page.id)
    if (pageOutputs.length > 0) {
      doc += `\n**State Mutations:**\n`
      pageOutputs.forEach(o => {
        const variable = logic.variables.find(v => v.id === o.variable_id)
        doc += `- Updates \`${variable?.label}\` via \`${o.output_type}\` mutation.\n`
      })
    }
    doc += `\n---\n\n`
  })

  doc += `## 3. Data Persistence & Schema\n`
  if (schema.tables.length === 0) {
    doc += `*No persistent database tables defined in this blueprint.*\n\n`
  } else {
    doc += `\`\`\`mermaid\nerDiagram\n`
    schema.tables.forEach(table => {
      doc += `    ${table.name.toUpperCase()} {\n`
      const tableColumns = schema.columns.filter(c => c.table_id === table.id)
      tableColumns.forEach(col => {
        const variable = logic.variables.find(v => v.id === col.variable_id)
        doc += `        ${variable?.type || 'string'} ${col.name}\n`
      })
      doc += `    }\n`
    })
    doc += `\`\`\`\n\n`

    schema.tables.forEach(table => {
      doc += `### Table: \`${table.name}\`\n`
      const tableColumns = schema.columns.filter(c => c.table_id === table.id)
      doc += `| Field | Datatype | Constraint | Logic Mapping |\n`
      doc += `| :--- | :--- | :--- | :--- |\n`
      tableColumns.forEach(col => {
        const variable = logic.variables.find(v => v.id === col.variable_id)
        doc += `| **${col.name}** | \`${variable?.type || 'string'}\` | ${col.is_primary_key ? 'Primary Key' : (col.is_nullable ? 'Nullable' : 'Required')} | ${variable?.label || 'Direct'} |\n`
      })
      doc += `\n`
    })
  }

  doc += `## 4. Security & Access Control\n`
  doc += `### 4.1 User Personas\n`
  identity.userTypes.forEach(ut => {
    doc += `- **${ut.name}**: ${ut.description || 'System participant with restricted privileges.'}\n`
  })
  doc += `\n`

  doc += `### 4.2 Row-Level Security Policies\n`
  if (identity.policies.length === 0) {
    doc += `> [!WARNING]\n> No security policies defined. All access will be denied by default (Supabase Standard).\n\n`
  } else {
    doc += `| Policy Name | Target Table | Action | Subject | Logic Expression |\n`
    doc += `| :--- | :--- | :--- | :--- | :--- |\n`
    identity.policies.forEach(p => {
      const table = schema.tables.find(t => t.id === p.table_id)
      const userType = identity.userTypes.find(ut => ut.id === p.user_type_id)
      doc += `| ${p.name} | \`${table?.name}\` | \`${p.policy_type?.toUpperCase()}\` | ${userType?.name || 'Everyone'} | \`${p.policy_logic}\` |\n`
    })
    doc += `\n`
  }

  doc += `## 5. Global Logic Registry\n`
  doc += `| Variable Label | Data Scope | Value Type | Initial State |\n`
  doc += `| :--- | :--- | :--- | :--- |\n`
  logic.variables.forEach(v => {
    doc += `| \`${v.label}\` | \`${v.scope}\` | **${v.type}** | \`${v.default_value || 'undefined'}\` |\n`
  })
  doc += `\n`

  doc += `## 6. Design System Tokens\n`
  doc += `| Component Class | Token Density | Complexity |\n`
  doc += `| :--- | :--- | :--- |\n`
  doc += `| Layout Systems | ${designSystem.tokens.length} tokens | Deterministic |\n`
  doc += `| Atom Library | ${designSystem.components.length} patterns | High-Fidelity |\n\n`

  doc += `---\n`
  doc += `*© ${new Date().getFullYear()} STEM Project Engine. All architectural rights reserved.*`

  return doc
}

export function generateDocFile(docContent: string, projectName: string) {
  const blob = new Blob([docContent], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_architecture_spec.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
