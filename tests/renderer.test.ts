import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  DocumentationRenderer,
  renderExtraSections,
  renderStructureList,
} from '../src/infra/renderer.js';

describe('DocumentationRenderer', () => {
  let tempDir: string;
  let previousCwd: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-renderer-'));
    previousCwd = process.cwd();
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(previousCwd);
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('renders built-in templates with source dependency mermaid blocks', () => {
    const rendered = DocumentationRenderer.render(
      'source',
      'src/infra/renderer.ts',
      {
        semantic: {
          localized: {
            English: {
              role: 'Render Atlas markdown from semantic JSON.',
              responsibilities: ['Load templates', 'Emit dependency diagrams'],
              outOfScope: ['Write files directly'],
            },
          },
        },
        graph: {
          dependsOn: [{ targetPath: 'src/utils/fs.ts' }],
          dependedBy: [{ targetPath: 'src/infra/llm/providers/openai.ts' }],
        },
      },
      ['English'],
    );

    expect(rendered.English).toContain('# Architectural Component: src/infra/renderer.ts');
    expect(rendered.English).toContain('## Dependency Topology');
    expect(rendered.English).toContain('src/infra/llm/providers/openai.ts');
    expect(rendered.English).toContain('src/utils/fs.ts');
  });

  it('prefers workspace override templates when present', () => {
    const overrideDir = path.join(tempDir, '.spine', 'templates', 'atlas');
    fs.mkdirSync(overrideDir, { recursive: true });
    fs.writeFileSync(path.join(overrideDir, 'source.md'), '# Custom {{identifier}}\n\n{{role}}\n');

    const rendered = DocumentationRenderer.render(
      'source',
      'src/example.ts',
      {
        semantic: {
          localized: {
            English: {
              role: 'Custom role',
              responsibilities: [],
              outOfScope: [],
            },
          },
        },
      },
      ['English'],
    );

    expect(rendered.English).toBe('# Custom src/example.ts\n\nCustom role');
  });

  it('renders shared extra sections for aggregate docs', () => {
    const sections = renderExtraSections([
      DocumentationRenderer.renderFolderDependencyMermaid('src/infra', [
        {
          identity: { filePath: 'src/infra/renderer.ts' },
          graph: {
            dependsOn: [{ targetPath: 'src/infra/output.ts' }],
          },
        } as any,
      ]),
      DocumentationRenderer.renderSection(
        'Structure',
        renderStructureList(['- **renderer.ts**: Render Atlas markdown']),
      ),
    ]);

    const rendered = DocumentationRenderer.render(
      'folder',
      'src/infra',
      {
        localized: {
          English: {
            role: 'Infrastructure layer',
            responsibility: 'Support Atlas generation',
          },
        },
      },
      ['English'],
      { extraSections: sections },
    );

    expect(rendered.English).toContain('## Dependency Topology');
    expect(rendered.English).toContain('## Structure');
    expect(rendered.English).toContain('renderer.ts');
  });

  it('localizes headings for Simplified Chinese output', () => {
    const sections = renderExtraSections([
      DocumentationRenderer.renderFolderDependencyMermaid('src/infra', [], 'Simplified Chinese'),
      DocumentationRenderer.renderSection(
        'Structure',
        renderStructureList(['- **renderer.ts**: Render Atlas markdown']),
        'Simplified Chinese',
      ),
    ]);

    const rendered = DocumentationRenderer.render(
      'folder',
      'src/infra',
      {
        localized: {
          'Simplified Chinese': {
            role: '基础设施层',
            responsibility: '支持 Atlas 生成',
          },
        },
      },
      ['Simplified Chinese'],
      { extraSections: sections },
    );

    expect(rendered['Simplified Chinese']).toContain('# 目录: src/infra');
    expect(rendered['Simplified Chinese']).toContain('## 架构职责');
    expect(rendered['Simplified Chinese']).toContain('## 结构');
  });
});
