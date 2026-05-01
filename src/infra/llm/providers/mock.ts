import { LLMClient, LLMResponse, PreviousSemanticContext, ProviderConfig } from '../base.js';
import type { PromptPolicyTier, PromptTaskMode, ValidatePolicy } from '../../prompt-policy.js';

export class MockClient implements LLMClient {
  constructor(_config: ProviderConfig) {
    // Config not needed for mock
  }

  private extractRuleBlocks(
    ruleData?: string,
  ): Array<{ id: string; severity: string; body: string }> {
    if (!ruleData) {
      return [];
    }

    return ruleData
      .split(/\n(?=\[Rule: )/g)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        const idMatch = block.match(/\[Rule:\s*([^\]]+)\]/);
        const severityMatch = block.match(/\(Severity:\s*([^)]+)\)/i);
        return {
          id: idMatch?.[1]?.trim() || 'mock-rule',
          severity: severityMatch?.[1]?.trim().toLowerCase() || 'warning',
          body: block,
        };
      });
  }

  private detectMockViolations(filePath: string, content: string, ruleData?: string) {
    const rules = this.extractRuleBlocks(ruleData);
    const violations: Array<{ id: string; severity: string; reason: string }> = [];
    let searchableContent = content;

    try {
      const parsed = JSON.parse(content);
      if (typeof parsed?.fileHeader === 'string') {
        searchableContent = `${parsed.fileHeader}\n${content}`;
      }
    } catch {
      // Validation may pass raw file content for non-source files.
    }

    for (const rule of rules) {
      const isLayerIsolationRule =
        /infra/i.test(rule.body) &&
        /api/i.test(rule.body) &&
        /(must not|forbidden|only import)/i.test(rule.body);

      const hasInfraImport =
        /from\s+['"]\.\.\/infra\/[^'"]+['"]/.test(searchableContent) ||
        /from\s+['"]src\/infra\/[^'"]+['"]/.test(searchableContent) ||
        /(?:\.\.\/|src\/)infra\//.test(searchableContent);

      if (isLayerIsolationRule && hasInfraImport) {
        violations.push({
          id: rule.id,
          severity: rule.severity,
          reason: `${filePath} imports infrastructure code directly from the API layer.`,
        });
      }
    }

    return violations;
  }

  private buildDemoFix(filePath: string): string | null {
    if (filePath !== 'src/api/handler.ts') {
      return null;
    }

    return `import { UserService } from '../domain/user-service.js';

/**
 * API Handler - Entry Point
 * This module coordinates domain services without depending on infra directly.
 */
export class CreateUserHandler {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public async handle(req: any): Promise<any> {
    return this.userService.createUser(req.name, req.email);
  }
}
`;
  }

  async generateSummary(
    filePath: string,
    content: string,
    contextData?: string,
    ruleData?: string,
    gitIntent?: string,
    languages: string[] = ['en-US'],
    branch?: string,
    status?: string,
    previousSemantic?: PreviousSemanticContext,
    _promptTier?: PromptPolicyTier,
    _validatePolicy?: ValidatePolicy,
    _fileKind?: string,
    _taskMode?: PromptTaskMode,
  ): Promise<LLMResponse> {
    const markdownRecord: Record<string, string> = {};
    for (const lang of languages) {
      markdownRecord[lang] =
        `# File: ${filePath}\n\n## Role\nMock Summary for ${filePath} in ${lang}\n\n## Responsibility\n- Mock description of ${filePath} in ${lang}`;
    }

    const ruleViolations = this.detectMockViolations(filePath, content, ruleData);

    return {
      json: {
        semantic: {
          role: `Mock role for ${filePath}`,
          responsibilities: [`Mock resp for ${filePath}`],
          ruleViolations,
          driftDetected: false,
          driftReason: null,
          previousRole: previousSemantic?.role,
        },
      },
      markdown: markdownRecord,
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    };
  }

  async generateFolderSummary(
    dirPath: string,
    childrenInfo: string,
    languages: string[] = ['en-US'],
    _branch?: string,
    _status?: string,
  ): Promise<LLMResponse> {
    const markdownRecord: Record<string, string> = {};
    for (const lang of languages) {
      markdownRecord[lang] =
        `# Directory: ${dirPath}\n\n## Role\nMock Folder Summary for ${dirPath} in ${lang}\n\n## Responsibility\nMock responsibilities for ${dirPath}`;
    }

    return {
      json: {
        role: `Mock role for folder ${dirPath}`,
        responsibility: `Mock resp for folder ${dirPath}`,
      },
      markdown: markdownRecord,
      usage: { inputTokens: 5, outputTokens: 15, totalTokens: 20 },
    };
  }

  async generateProjectSummary(
    projectName: string,
    modulesInfo: string,
    languages: string[] = ['en-US'],
    _branch?: string,
    _status?: string,
  ): Promise<LLMResponse> {
    const markdownRecord: Record<string, string> = {};
    for (const lang of languages) {
      markdownRecord[lang] =
        `# Project: ${projectName}\n\n## Role\nMock Project Summary for ${projectName} in ${lang}\n\n## Responsibility\nMock responsibilities for project ${projectName}`;
    }

    return {
      json: {
        role: `Mock role for project ${projectName}`,
        responsibility: `Mock resp for project ${projectName}`,
      },
      markdown: markdownRecord,
      usage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 },
    };
  }

  async generateText(prompt: string): Promise<{
    content: string;
    usage?: { inputTokens: number; outputTokens: number; totalTokens: number };
  }> {
    if (prompt.includes('### Task: Architecture Diagram View')) {
      return {
        content: JSON.stringify({
          title: 'Mock Architecture Diagram',
          subtitle: 'Architecture view derived from mock project and folder summaries.',
          nodes: [
            { id: 'cli', label: 'CLI', sublabel: 'Entry Surface', type: 'frontend' },
            { id: 'api', label: 'API Layer', sublabel: 'Core Services', type: 'backend' },
            { id: 'rules', label: 'Rule Engine', sublabel: 'Policy Checks', type: 'security' },
            { id: 'db', label: 'SQLite Runtime', sublabel: 'Local State', type: 'database' },
            {
              id: 'github',
              label: 'Git Provider',
              sublabel: 'External Repo State',
              type: 'external',
            },
          ],
          edges: [
            { from: 'cli', to: 'api', label: 'Commands', style: 'solid' },
            { from: 'api', to: 'rules', label: 'Validation', style: 'dashed' },
            { from: 'api', to: 'db', label: 'Reads/Writes', style: 'solid' },
            { from: 'api', to: 'github', label: 'Git Data', style: 'solid' },
          ],
          summaryCards: [
            {
              heading: 'Core Modules',
              points: [
                'CLI entry surface',
                'Service orchestration layer',
                'Protected runtime state',
              ],
            },
            {
              heading: 'Key Dependencies',
              points: ['Rule evaluation', 'SQLite runtime', 'Git metadata inputs'],
            },
            {
              heading: 'System Boundaries',
              points: ['Local repo runtime', 'Protected outputs', 'External Git context'],
            },
          ],
        }),
        usage: { inputTokens: 20, outputTokens: 60, totalTokens: 80 },
      };
    }

    const fileMatch = prompt.match(/^### File:\s+(.+)$/m);
    const filePath = fileMatch?.[1]?.trim();
    const demoFix = filePath ? this.buildDemoFix(filePath) : null;

    return {
      content: demoFix || 'export const validFix = true;\n',
      usage: { inputTokens: 10, outputTokens: 30, totalTokens: 40 },
    };
  }
}
