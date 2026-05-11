import { renderContextBlock, renderInstructionsBlock, renderJSONSchemaBlock } from './index.js';
import type { SpineFolderUnit, SpineProjectUnit } from '../../../types/protocol.js';

const archDiagramSchema = `{
  "title": "Project or system name",
  "subtitle": "One-sentence architecture summary grounded in the provided project and folder summaries",
  "nodes": [
    {
      "id": "api-gateway",
      "label": "API Gateway",
      "sublabel": "Optional technology or runtime label",
      "type": "backend"
    }
  ],
  "edges": [
    {
      "from": "web-app",
      "to": "api-gateway",
      "label": "HTTP",
      "style": "solid"
    }
  ],
  "summaryCards": [
    {
      "heading": "Core Modules",
      "points": ["Three short bullets max"]
    },
    {
      "heading": "Key Dependencies",
      "points": ["Three short bullets max"]
    },
    {
      "heading": "System Boundaries",
      "points": ["Three short bullets max"]
    }
  ]
}`;

function renderProjectContext(project: SpineProjectUnit): string {
  return [
    `Project Name: ${project.projectName}`,
    `Project Role: ${project.role}`,
    `Project Responsibility: ${project.responsibility}`,
    'Project Modules:',
    ...(project.modules.length > 0
      ? project.modules.map(
          (module) =>
            `- ${module.directory || 'root'}: ${module.role} (children: ${module.childCount})`,
        )
      : ['- (none)']),
  ].join('\n');
}

function renderFolderContext(folders: SpineFolderUnit[]): string {
  return folders
    .map((folder) =>
      [
        `- Directory: ${folder.directory || 'root'}`,
        `  Role: ${folder.role}`,
        `  Responsibility: ${folder.responsibility}`,
        `  Children: ${folder.children.length}`,
      ].join('\n'),
    )
    .join('\n');
}

export function generateArchitectureDiagramPrompt(
  project: SpineProjectUnit,
  folders: SpineFolderUnit[],
): string {
  return [
    '### Task: Architecture Diagram View',
    'Generate an architecture diagram specification for the repository using ONLY the provided project and folder summaries.',
    renderInstructionsBlock([
      'Return STRICT JSON only. Do not include Markdown, HTML, SVG, Mermaid, comments, or code fences.',
      'Use only the node types: frontend, backend, database, cloud, security, messagebus, external.',
      'Create between 5 and 20 nodes. Do not invent technologies or subsystems not grounded in the provided summaries.',
      'Every edge `from` and `to` value must reference an existing node `id`.',
      'Produce exactly 3 summaryCards with these headings: Core Modules, Key Dependencies, System Boundaries.',
      'Keep labels concise and readable for human-facing architecture diagrams.',
    ]),
    renderContextBlock('Project Summary', renderProjectContext(project)),
    renderContextBlock('Folder Summaries', renderFolderContext(folders)),
    renderJSONSchemaBlock(archDiagramSchema),
  ]
    .filter(Boolean)
    .join('\n\n');
}
