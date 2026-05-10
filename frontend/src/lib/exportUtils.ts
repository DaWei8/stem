/**
 * STEM Project Documentation Generator
 * Parses project JSON and generates a professional HTML document for Word export
 */

export function generateProjectDocumentation(projectData: any) {
  if (!projectData || typeof projectData !== 'object') {
    throw new Error('Invalid input: projectData must be a valid object');
  }

  const { project, architecture, designSystem, logic } = projectData;

  if (!project || !architecture) {
    throw new Error('Invalid input: Missing required project or architecture data');
  }

  let doc = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${project.name || 'Project Documentation'}</title>
      <style>
        body { 
          font-family: 'Segoe UI', Arial, Helvetica, sans-serif; 
          font-size: 11pt; 
          line-height: 1.6; 
          color: #333; 
          max-width: 800px;
          margin: 0 auto;
        }
        h1 { color: #111; font-size: 24pt; border-bottom: 2px solid #000; padding-bottom: 10px; margin-top: 0; }
        h2 { color: #222; font-size: 16pt; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px; }
        h3 { color: #444; font-size: 13pt; margin-top: 20px; }
        p { margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; vertical-align: top; }
        th { background-color: #f5f5f5; font-weight: bold; }
        ul { margin-bottom: 15px; }
        li { margin-bottom: 5px; }
        .meta-table th { width: 30%; }
        .success { color: #00c20d; font-weight: bold; }
        .pending { color: #ffa200; font-weight: bold; }
      </style>
    </head>
    <body>
  `;

  doc += generateProjectHeader(project);
  doc += generateProjectOverview(project);
  doc += generateUserJourneys(architecture);
  doc += generatePageInventory(architecture.pages);
  doc += generateTransitionMap(architecture);
  doc += generateInputInventory(architecture.inputs, architecture.pages);
  doc += generateActionInventory(architecture.actions, architecture.pages);
  doc += generateStateManagement(logic);
  doc += generateDesignSystem(designSystem);
  doc += generateImplementationChecklist(architecture, projectData);
  doc += generateMetadata(projectData.meta);

  doc += `</body></html>`;

  return doc;
}

function generateProjectHeader(project: any) {
  const createdDate = project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Unknown';
  const updatedDate = project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'Unknown';
  const simDate = project.last_simulation_at ? new Date(project.last_simulation_at).toLocaleDateString() : 'Never';

  return `
    <h1>${project.name ? project.name.toUpperCase() : 'UNTITLED PROJECT'}</h1>
    <h2>Project Metadata</h2>
    <table class="meta-table">
      <tr><th>Project ID</th><td>${project.id || 'N/A'}</td></tr>
      <tr><th>Status</th><td>${(project.status || 'DRAFT').toUpperCase()}</td></tr>
      <tr><th>Visibility</th><td>${(project.visibility || 'PRIVATE').toUpperCase()}</td></tr>
      <tr><th>Version</th><td>${project.version_number || 1}</td></tr>
      <tr><th>Created</th><td>${createdDate}</td></tr>
      <tr><th>Last Updated</th><td>${updatedDate}</td></tr>
      <tr><th>Last Simulated</th><td>${simDate}</td></tr>
    </table>
  `;
}

function generateProjectOverview(project: any) {
  if (!project.description) return '';
  return `
    <h2>Project Description</h2>
    <p>${project.description.replace(/\\n/g, '<br/>')}</p>
  `;
}

function generateUserJourneys(architecture: any) {
  const pages = architecture.pages || [];
  const transitions = architecture.transitions || [];

  const pageMap: any = {};
  pages.forEach((page: any) => {
    pageMap[page.id] = page.title || page.name || 'Unnamed Page';
  });

  const hasIncoming = new Set();
  transitions.forEach((t: any) => {
    hasIncoming.add(t.to_page_id);
  });

  const entryPoints = pages.filter((p: any) => !hasIncoming.has(p.id));

  let doc = `<h2>Primary User Journeys</h2>`;

  if (entryPoints.length === 0 && pages.length > 0) {
     doc += `<p>No distinct entry points found (circular navigation).</p>`;
  } else if (pages.length === 0) {
     doc += `<p>No pages defined yet.</p>`;
  }

  entryPoints.forEach((entry: any, index: number) => {
    doc += `<h3>Journey #${index + 1}: Starting at ${entry.title || entry.name || 'Unnamed Page'}</h3>`;
    
    const outgoing = transitions.filter((t: any) => t.from_page_id === entry.id);
    if (outgoing.length > 0) {
      doc += `<p><strong>Flows to:</strong></p><ul>`;
      outgoing.forEach((t: any) => {
        doc += `<li>${pageMap[t.to_page_id] || 'Unknown Page'}</li>`;
      });
      doc += `</ul>`;
    } else {
      doc += `<p><em>No defined navigation away from this page.</em></p>`;
    }
  });

  return doc;
}

function generatePageInventory(pages: any[]) {
  if (!pages || pages.length === 0) return '';
  
  const sortedPages = [...pages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  let doc = `
    <h2>Page Inventory (Total: ${pages.length})</h2>
    <table>
      <thead>
        <tr>
          <th>Page Name</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
  `;

  sortedPages.forEach((page: any) => {
    doc += `
      <tr>
        <td><strong>${page.title || page.name || 'Unnamed Page'}</strong></td>
        <td>${page.page_type || 'screen'}</td>
        <td>${page.description || '<em>None</em>'}</td>
      </tr>
    `;
  });

  doc += `</tbody></table>`;
  return doc;
}

function generateTransitionMap(architecture: any) {
  const pages = architecture.pages || [];
  const transitions = architecture.transitions || [];

  if (transitions.length === 0) return '';

  const pageMap: any = {};
  pages.forEach((page: any) => {
    pageMap[page.id] = page.title || page.name || 'Unnamed Page';
  });

  const transitionsBySource: any = {};
  transitions.forEach((t: any) => {
    if (!transitionsBySource[t.from_page_id]) {
      transitionsBySource[t.from_page_id] = [];
    }
    transitionsBySource[t.from_page_id].push(t);
  });

  let doc = `<h2>State Transitions & Navigation Map</h2>`;

  const sourcePages = Object.keys(transitionsBySource).sort();

  sourcePages.forEach(sourceId => {
    const sourceName = pageMap[sourceId] || 'Unknown Page';
    const outgoing = transitionsBySource[sourceId];

    doc += `<h3>${sourceName}</h3><ul>`;

    const destinations = new Set(outgoing.map((t: any) => t.to_page_id));

    destinations.forEach((destId: any) => {
      const destName = pageMap[destId] || 'Unknown Page';
      const count = outgoing.filter((t: any) => t.to_page_id === destId).length;
      let countText = count > 1 ? ` (x${count})` : '';
      doc += `<li>Navigate to: <strong>${destName}</strong>${countText}</li>`;
    });
    doc += `</ul>`;
  });

  const uniqueTransitions = new Set(
    transitions.map((t: any) => t.from_page_id + '-' + t.to_page_id)
  );

  doc += `
    <h3>Transition Statistics</h3>
    <ul>
      <li>Total Transition Rules: <strong>${transitions.length}</strong></li>
      <li>Unique Paths: <strong>${uniqueTransitions.size}</strong></li>
    </ul>
  `;

  return doc;
}

function generateInputInventory(inputs: any[], pages: any[]) {
  if (!inputs || inputs.length === 0) {
    return `<h2>Form Inputs & Validation</h2><p>No form inputs defined yet.</p>`;
  }

  const pageMap: any = {};
  pages.forEach((page: any) => {
    pageMap[page.id] = page.title || page.name || 'Unnamed Page';
  });

  const inputsByPage: any = {};
  inputs.forEach((input: any) => {
    if (!inputsByPage[input.page_id]) {
      inputsByPage[input.page_id] = [];
    }
    inputsByPage[input.page_id].push(input);
  });

  let doc = `<h2>Form Inputs & Validation (Total: ${inputs.length})</h2>`;

  Object.keys(inputsByPage).forEach(pageId => {
    const pageName = pageMap[pageId] || 'Unknown Page';
    const pageInputs = inputsByPage[pageId];

    doc += `<h3>${pageName}</h3><table>
      <thead>
        <tr><th>Input Name</th><th>Type</th><th>Required</th><th>Validation</th></tr>
      </thead>
      <tbody>`;

    pageInputs.forEach((input: any) => {
      doc += `
        <tr>
          <td>${input.name || 'Unnamed Input'}</td>
          <td>${input.input_type || 'Unknown'}</td>
          <td>${input.is_required ? 'Yes' : 'No'}</td>
          <td>${input.validation_schema ? 'Yes' : 'None defined'}</td>
        </tr>
      `;
    });
    doc += `</tbody></table>`;
  });

  return doc;
}

function generateActionInventory(actions: any[], pages: any[]) {
  if (!actions || actions.length === 0) {
    return `<h2>Actions & Integrations</h2><p>No actions defined yet.</p>`;
  }

  const pageMap: any = {};
  pages.forEach((page: any) => {
    pageMap[page.id] = page.title || page.name || 'Unnamed Page';
  });

  const actionsByPage: any = {};
  actions.forEach((action: any) => {
    if (!actionsByPage[action.page_id]) {
      actionsByPage[action.page_id] = [];
    }
    actionsByPage[action.page_id].push(action);
  });

  let doc = `<h2>Actions & Integrations (Total: ${actions.length})</h2>`;

  Object.keys(actionsByPage).forEach(pageId => {
    const pageName = pageMap[pageId] || 'Unknown Page';
    const pageActions = actionsByPage[pageId];

    doc += `<h3>${pageName}</h3><table>
      <thead>
        <tr><th>Action Name</th><th>Type</th><th>Configured</th><th>API Endpoint</th></tr>
      </thead>
      <tbody>`;

    pageActions.forEach((action: any) => {
      doc += `
        <tr>
          <td>${action.name || 'Unnamed Action'}</td>
          <td>${action.action_type || 'Unknown'}</td>
          <td>${action.function_id ? 'Yes' : 'No'}</td>
          <td>${action.api_endpoint || 'None'}</td>
        </tr>
      `;
    });
    doc += `</tbody></table>`;
  });

  return doc;
}

function generateStateManagement(logic: any) {
  if (!logic || !logic.variables || logic.variables.length === 0) {
    return `<h2>State Management</h2><p>No state variables defined.</p>`;
  }

  let doc = `
    <h2>State Management & Variables (Total: ${logic.variables.length})</h2>
    <table>
      <thead>
        <tr><th>Variable Label</th><th>Type</th><th>Scope</th><th>Description</th></tr>
      </thead>
      <tbody>
  `;

  logic.variables.forEach((v: any) => {
    doc += `
      <tr>
        <td><strong>${v.label || 'UNNAMED_VAR'}</strong> ${v.is_deprecated ? '(Deprecated)' : ''}</td>
        <td>${v.type || 'Unknown'}</td>
        <td>${v.scope || 'Unknown'}</td>
        <td>${v.description || '<em>None</em>'}</td>
      </tr>
    `;
  });

  doc += `</tbody></table>`;
  return doc;
}

function generateDesignSystem(designSystem: any) {
  if (!designSystem || (!designSystem.tokens?.length && !designSystem.components?.length)) {
    return `<h2>Design System</h2><p>No design tokens or components defined.</p>`;
  }

  const colors = (designSystem.tokens || []).filter((t: any) => t.category === 'color');
  const typography = (designSystem.tokens || []).filter((t: any) => t.category === 'typography');

  let doc = `<h2>Design System</h2>`;

  if (colors.length > 0) {
    doc += `<h3>Color Palette</h3><ul>`;
    colors.forEach((color: any) => {
      doc += `<li><strong>${(color.name || 'UNNAMED').toUpperCase()}:</strong> ${color.value}</li>`;
    });
    doc += `</ul>`;
  }

  if (typography.length > 0) {
    doc += `<h3>Typography</h3><ul>`;
    typography.forEach((type: any) => {
      doc += `<li><strong>${(type.name || 'UNNAMED').toUpperCase()}:</strong> ${type.value}</li>`;
    });
    doc += `</ul>`;
  }

  const components = (designSystem.components || []);
  doc += `<h3>Components</h3>`;
  if (components.length > 0) {
    doc += `<p>${components.length} component(s) defined.</p>`;
  } else {
    doc += `<p>No components defined yet.</p>`;
  }

  return doc;
}

function generateImplementationChecklist(architecture: any, projectData: any) {
  const pages = (architecture.pages || []).length;
  const inputs = (architecture.inputs || []).length;
  const actions = (architecture.actions || []).length;
  const transitions = (architecture.transitions || []).length;
  const variables = (projectData.logic?.variables || []).length;
  const colors = (projectData.designSystem?.tokens || []).filter((t: any) => t.category === 'color').length;

  const getCheck = (count: number) => count > 0 ? '<span class="success">✓ Completed</span>' : '<span class="pending">○ Pending</span>';

  return `
    <h2>Implementation Checklist</h2>
    <table>
      <thead>
        <tr><th>Category</th><th>Status</th><th>Details</th></tr>
      </thead>
      <tbody>
        <tr><td>Pages</td><td>${getCheck(pages)}</td><td>${pages} defined</td></tr>
        <tr><td>Transitions</td><td>${getCheck(transitions)}</td><td>${transitions} defined</td></tr>
        <tr><td>Form Inputs</td><td>${getCheck(inputs)}</td><td>${inputs} defined</td></tr>
        <tr><td>Actions</td><td>${getCheck(actions)}</td><td>${actions} defined</td></tr>
        <tr><td>State Variables</td><td>${getCheck(variables)}</td><td>${variables} defined</td></tr>
        <tr><td>Design Tokens</td><td>${getCheck(colors)}</td><td>${colors} defined</td></tr>
      </tbody>
    </table>
  `;
}

function generateMetadata(meta: any) {
  if (!meta) return '';
  return `
    <h2>System Metadata</h2>
    <p>
      <strong>Engine Version:</strong> ${meta.version || 'Unknown'}<br/>
      <strong>Exported At:</strong> ${meta.exportedAt ? new Date(meta.exportedAt).toLocaleString() : 'Unknown'}<br/>
      <strong>Engine:</strong> ${meta.engine || 'STEM-CORE'}
    </p>
  `;
}
