import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { FileDependencyEdge, SpineFolderUnit, SpineUnit } from '../types/protocol.js';

export type LayoutType = 'source' | 'document' | 'config' | 'folder' | 'project';

interface MermaidGraphConfig {
  title: string;
  direction: 'LR' | 'TD';
  statements: string[];
}

interface RenderOptions {
  rootDir?: string;
  extraSections?: string;
}

interface TemplateData {
  identifier: string;
  title: string;
  role: string;
  responsibilities: string;
  outOfScope: string;
  purpose: string;
  contextAndAudience: string;
  keyTakeaways: string;
  parameterDefinitions: string;
  stabilityAndRisks: string;
  vision: string;
  orchestration: string;
  mermaidBlock: string;
  extraSections: string;
}

const DEFAULT_TEMPLATE_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../assets/templates/atlas',
);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sanitizeMermaidId(value: string): string {
  const normalized = value.replace(/[^A-Za-z0-9_]/g, '_');
  return /^[A-Za-z_]/.test(normalized) ? normalized : `node_${normalized}`;
}

function formatBulletList(
  items: unknown[],
  formatter: (item: string) => string = (item) => `- ${item}`,
): string {
  if (!Array.isArray(items) || items.length === 0) {
    return '- (None)';
  }

  return (
    items
      .map((item) => String(item).trim())
      .filter(Boolean)
      .map(formatter)
      .join('\n') || '- (None)'
  );
}

function formatKeyValueList(entries: Record<string, unknown> | undefined): string {
  if (!entries || typeof entries !== 'object') {
    return '- (None)';
  }

  const lines = Object.entries(entries)
    .map(([key, value]) => `- **${key}**: ${String(value)}`)
    .join('\n');

  return lines || '- (None)';
}

function joinSections(sections: string[]): string {
  return sections.filter(Boolean).join('\n\n');
}

function renderTemplate(template: string, data: TemplateData): string {
  let output = template;
  for (const [key, value] of Object.entries(data)) {
    output = output.replace(new RegExp(`{{\\s*${escapeRegExp(key)}\\s*}}`, 'g'), value);
  }
  return output.replace(/\n{3,}/g, '\n\n').trim();
}

function isChineseLocale(locale?: string): boolean {
  if (!locale) {
    return false;
  }

  const normalized = locale.toLowerCase();
  return normalized.includes('chinese') || normalized.startsWith('zh');
}

function translateLabel(label: string, locale?: string): string {
  if (!isChineseLocale(locale)) {
    return label;
  }

  const translations: Record<string, string> = {
    'Architectural Component': '架构组件',
    Document: '文档',
    Configuration: '配置',
    Directory: '目录',
    'Project Atlas': '项目全景图',
    'Dependency Topology': '依赖拓扑',
    'System Architecture': '系统架构',
    Structure: '结构',
    Role: '角色',
    Responsibilities: '职责',
    'Architectural Role': '架构职责',
    'Invariants & Out-of-Scope': '不变量与范围外',
    Purpose: '目的',
    'Context & Audience': '背景与受众',
    'Key Takeaways': '关键要点',
    'Parameter Definitions': '参数定义',
    'Stability & Risks': '稳定性与风险',
    'System Vision': '系统愿景',
    'Module Orchestration': '模块编排',
  };

  return translations[label] || label;
}

function localizeTemplateHeadings(template: string, locale?: string): string {
  if (!isChineseLocale(locale)) {
    return template;
  }

  const headingTranslations: Array<[string, string]> = [
    ['## Role', '## 角色'],
    ['## Responsibilities', '## 职责'],
    ['## Architectural Role', '## 架构职责'],
    ['## Invariants & Out-of-Scope', '## 不变量与范围外'],
    ['## Purpose', '## 目的'],
    ['## Context & Audience', '## 背景与受众'],
    ['## Key Takeaways', '## 关键要点'],
    ['## Parameter Definitions', '## 参数定义'],
    ['## Stability & Risks', '## 稳定性与风险'],
    ['## System Vision', '## 系统愿景'],
    ['## Module Orchestration', '## 模块编排'],
  ];

  let localized = template;
  for (const [from, to] of headingTranslations) {
    localized = localized.replace(new RegExp(`^${escapeRegExp(from)}$`, 'gm'), to);
  }
  return localized;
}

export class DocumentationRenderer {
  public static render(
    type: LayoutType,
    identifier: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Renderer consumes dynamic JSON structures
    jsonResponse: any,
    languages: string[],
    options: RenderOptions = {},
  ): Record<string, string> {
    const markdownOutputs: Record<string, string> = {};
    const localizedBlock = jsonResponse?.semantic?.localized || jsonResponse?.localized || {};

    for (const lang of languages) {
      const data = localizedBlock[lang] || localizedBlock.English || {};
      const template = localizeTemplateHeadings(this.loadTemplate(type, options.rootDir), lang);
      const mermaidBlock =
        type === 'source'
          ? this.renderSourceDependencyMermaid(identifier, jsonResponse?.graph, lang)
          : '';
      const templateData: TemplateData = {
        identifier,
        title: this.resolveTitle(type, identifier, lang),
        role: data.role || '(No role provided)',
        responsibilities:
          type === 'folder'
            ? String(data.responsibility || '(No responsibility provided)')
            : formatBulletList(data.responsibilities),
        outOfScope: formatBulletList(data.outOfScope, (item) => `- **Negative Scope**: ${item}`),
        purpose: data.purpose || '(No purpose provided)',
        contextAndAudience: data.context_and_audience || '(No context provided)',
        keyTakeaways: formatBulletList(data.key_takeaways),
        parameterDefinitions: formatKeyValueList(data.parameter_definitions),
        stabilityAndRisks: data.stability_and_risks || '(No stability information provided)',
        vision: data.vision || '(No vision provided)',
        orchestration: data.orchestration || '(No orchestration provided)',
        mermaidBlock,
        extraSections: options.extraSections || '',
      };

      markdownOutputs[lang] = renderTemplate(template, templateData);
    }

    return markdownOutputs;
  }

  public static renderSection(title: string, body: string, locale?: string): string {
    const trimmedBody = body.trim();
    if (!trimmedBody) {
      return '';
    }

    return `## ${translateLabel(title, locale)}\n${trimmedBody}`;
  }

  public static renderMermaidGraph(config: MermaidGraphConfig, locale?: string): string {
    if (config.statements.length === 0) {
      return '';
    }

    const body = `\`\`\`mermaid\ngraph ${config.direction}\n${config.statements.join('\n')}\n\`\`\``;
    return this.renderSection(config.title, body, locale);
  }

  public static renderSourceDependencyMermaid(
    identifier: string,
    graph: { dependsOn?: FileDependencyEdge[]; dependedBy?: FileDependencyEdge[] } | undefined,
    locale?: string,
  ): string {
    if (!graph) {
      return '';
    }

    const statements = new Set<string>();
    const sourceNodeId = sanitizeMermaidId(identifier);
    statements.add(`  ${sourceNodeId}["${identifier}"]`);

    for (const edge of graph.dependsOn || []) {
      const targetNodeId = sanitizeMermaidId(edge.targetPath);
      statements.add(`  ${targetNodeId}["${edge.targetPath}"]`);
      statements.add(`  ${sourceNodeId} --> ${targetNodeId}`);
    }

    for (const edge of graph.dependedBy || []) {
      const sourcePath = edge.targetPath;
      const upstreamNodeId = sanitizeMermaidId(sourcePath);
      statements.add(`  ${upstreamNodeId}["${sourcePath}"]`);
      statements.add(`  ${upstreamNodeId} --> ${sourceNodeId}`);
    }

    if (statements.size <= 1) {
      return '';
    }

    return this.renderMermaidGraph(
      {
        title: 'Dependency Topology',
        direction: 'LR',
        statements: Array.from(statements),
      },
      locale,
    );
  }

  public static renderFolderDependencyMermaid(
    dirPath: string,
    childUnits: Array<SpineUnit | SpineFolderUnit>,
    locale?: string,
  ): string {
    const statements = new Set<string>();

    for (const unit of childUnits) {
      if ('directory' in unit) {
        continue;
      }

      const sourcePath = unit.identity.filePath;
      const sourceBase = path.basename(sourcePath);
      const sourceId = sanitizeMermaidId(sourcePath);
      statements.add(`  ${sourceId}["${sourceBase}"]`);

      for (const edge of unit.graph?.dependsOn || []) {
        if (path.dirname(edge.targetPath) !== dirPath) {
          continue;
        }

        const targetBase = path.basename(edge.targetPath);
        const targetId = sanitizeMermaidId(edge.targetPath);
        statements.add(`  ${targetId}["${targetBase}"]`);
        statements.add(`  ${sourceId} --> ${targetId}`);
      }
    }

    return this.renderMermaidGraph(
      {
        title: 'Dependency Topology',
        direction: 'LR',
        statements: Array.from(statements),
      },
      locale,
    );
  }

  public static renderProjectDependencyMermaid(units: SpineUnit[], locale?: string): string {
    const statements = new Set<string>();

    for (const unit of units) {
      const sourceDir = path.dirname(unit.identity.filePath);
      if (!sourceDir || sourceDir === '.') {
        continue;
      }

      const sourceId = sanitizeMermaidId(sourceDir);
      for (const edge of unit.graph?.dependsOn || []) {
        const targetDir = path.dirname(edge.targetPath);
        if (!targetDir || targetDir === '.' || sourceDir === targetDir) {
          continue;
        }

        const targetId = sanitizeMermaidId(targetDir);
        statements.add(`  ${sourceId}["${sourceDir}"]`);
        statements.add(`  ${targetId}["${targetDir}"]`);
        statements.add(`  ${sourceId} --> ${targetId}`);
      }
    }

    return this.renderMermaidGraph(
      {
        title: 'System Architecture',
        direction: 'TD',
        statements: Array.from(statements),
      },
      locale,
    );
  }

  private static resolveTitle(type: LayoutType, identifier: string, locale?: string): string {
    switch (type) {
      case 'source':
        return `${translateLabel('Architectural Component', locale)}: ${identifier}`;
      case 'document':
        return `${translateLabel('Document', locale)}: ${identifier}`;
      case 'config':
        return `${translateLabel('Configuration', locale)}: ${identifier}`;
      case 'folder':
        return `${translateLabel('Directory', locale)}: ${identifier || '/'}`;
      case 'project':
      default:
        return `${translateLabel('Project Atlas', locale)}: ${identifier}`;
    }
  }

  private static loadTemplate(type: LayoutType, rootDir?: string): string {
    const candidatePaths = [
      rootDir ? path.join(rootDir, '.spine', 'templates', 'atlas', `${type}.md`) : '',
      path.join(process.cwd(), '.spine', 'templates', 'atlas', `${type}.md`),
      path.join(DEFAULT_TEMPLATE_DIR, `${type}.md`),
    ].filter(Boolean);

    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        return fs.readFileSync(candidate, 'utf-8');
      }
    }

    throw new Error(`Missing Atlas template for ${type}`);
  }
}

export function renderStructureList(items: string[]): string {
  return items.join('\n');
}

export function renderExtraSections(sections: string[]): string {
  return joinSections(sections);
}
