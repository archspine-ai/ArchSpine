import { describe, expect, it } from 'vitest';
import {
  buildSourcePromptArtifacts,
  calculateSourcePromptBudgets,
} from '../src/infra/prompt-context.js';
import { generateMarkdownPrompt, generateSourcePrompt } from '../src/infra/prompt-rendering.js';

describe('Prompt Engine P0', () => {
  it('compacts source prompt artifacts using task-specific budgets', () => {
    const content = Array.from({ length: 40 }, (_, index) => `line ${index + 1}`).join('\n');
    const ruleBlocks = Array.from(
      { length: 20 },
      (_, index) =>
        `[Rule: rule-${index + 1}] (Severity: warning)\nBody ${index + 1}\n` + 'x'.repeat(280),
    ).join('\n\n');

    const artifacts = buildSourcePromptArtifacts({
      content,
      skeleton: {
        imports: Array.from({ length: 20 }, (_, index) => ({
          source: `./dep-${index + 1}`,
          symbols: [`fn${index + 1}`],
        })),
        exports: Array.from({ length: 30 }, (_, index) => ({
          name: `export${index + 1}`,
          kind: 'Function',
          signature: `export${index + 1}()`,
          implementation_clue: `a\nb\nc\nd\ne`,
        })),
        usages: Array.from({ length: 30 }, (_, index) => `usage${index + 1}`),
      },
      dependencyContext: `Import Inventory:\n${'a'.repeat(2500)}\n\nKnown Internal Dependency Semantics:\n${'b'.repeat(1500)}`,
      dependencyDiagnostics: {
        retainedDependencyCandidates: [
          {
            path: 'src/local/a.ts',
            importedSymbols: ['a'],
            role: 'A',
            totalScore: 82,
            contributions: [{ factor: 'same-directory', score: 30, reason: 'same directory' }],
          },
        ],
        truncatedDependencyCandidates: [
          {
            path: 'src/far/b.ts',
            importedSymbols: ['b'],
            role: 'B',
            totalScore: 12,
            contributions: [{ factor: 'path-distance', score: -4, reason: 'far away' }],
          },
        ],
        symbolTargets: [],
      },
      ruleData: ruleBlocks,
      previousSemantic: {
        role: 'Previous role',
        responsibilities: Array.from({ length: 10 }, (_, index) => `resp-${index + 1}`),
      },
      taskMode: 'summarize',
      promptTier: 'balanced',
    });

    const parsedInput = JSON.parse(artifacts.fileInput);
    expect(parsedInput.fileHeader.split('\n')).toHaveLength(
      artifacts.diagnostics.budgets.headerLines,
    );
    expect(parsedInput.structuralSkeleton.imports).toHaveLength(
      artifacts.diagnostics.budgets.maxImports,
    );
    expect(parsedInput.structuralSkeleton.exports).toHaveLength(
      artifacts.diagnostics.budgets.maxExports,
    );
    expect(parsedInput.structuralSkeleton.usages).toHaveLength(
      artifacts.diagnostics.budgets.maxUsages,
    );
    expect(parsedInput.structuralSkeleton.exports[0].implementation_clue).toContain('...');
    expect(artifacts.diagnostics.promptTier).toBe('balanced');
    expect(artifacts.contextData.length).toBeLessThanOrEqual(
      artifacts.diagnostics.budgets.dependencyContextChars + 4,
    );
    expect(artifacts.ruleData.length).toBeLessThanOrEqual(
      artifacts.diagnostics.budgets.ruleChars + 4,
    );
    expect(artifacts.previousSemantic?.responsibilities).toHaveLength(4);
    expect(artifacts.diagnostics.final.ruleChars).toBeGreaterThan(0);
    expect(artifacts.diagnostics.final.dependencyContextChars).toBeGreaterThan(0);
    expect(artifacts.diagnostics.relevance.retainedDependencyCandidates).toHaveLength(0);
    expect(artifacts.diagnostics.relevance.truncatedDependencyCandidates[0].path).toBe(
      'src/local/a.ts',
    );
    expect(artifacts.diagnostics.relevance.truncatedDependencyCandidates[0].truncationReason).toBe(
      'dependency-context-trimmed',
    );
    expect(artifacts.diagnostics.relevance.droppedRuleBlocks.length).toBeGreaterThan(0);
  });

  it('adds audit-specific instructions for validate mode', () => {
    const prompt = generateSourcePrompt(
      'src/example.ts',
      '{"fileHeader":"x","structuralSkeleton":{"imports":[],"exports":[],"usages":[]}}',
      'dependency context',
      '[Rule: example] (Severity: warning)\nbody',
      'refactor example',
      ['English'],
      'main',
      'M src/example.ts',
      { role: 'Example role', responsibilities: ['one'] },
      'validate',
    );

    expect(prompt).toContain('This request is an architectural audit.');
    expect(prompt).toContain(
      'Only report rule violations that are directly supported by the provided evidence.',
    );
  });

  it('can request one-shot json and markdown output together', () => {
    const prompt = generateSourcePrompt(
      'src/example.ts',
      '{"fileHeader":"x","structuralSkeleton":{"imports":[],"exports":[],"usages":[]}}',
      '',
      '',
      '',
      ['English', 'Simplified Chinese'],
      '',
      '',
      undefined,
      'summarize',
      'balanced',
      'default',
      'json-and-markdown',
    );

    expect(prompt).toContain('---JSON---');
    expect(prompt).toContain('---MARKDOWN:English---');
    expect(prompt).toContain('---MARKDOWN:Simplified Chinese---');
  });

  it('builds a markdown-only prompt for semantic-first generation', () => {
    const prompt = generateMarkdownPrompt({
      identifier: 'src/cli/index.ts',
      fileKind: 'source',
      semanticJson: {
        semantic: {
          role: 'CLI entrypoint',
          responsibilities: ['Dispatch commands'],
        },
      },
      languages: ['English', 'Simplified Chinese'],
      supportingContext: 'file header context',
    });

    expect(prompt).toContain('Return markdown blocks only. Do not return JSON.');
    expect(prompt).toContain('---MARKDOWN:English---');
    expect(prompt).toContain('---MARKDOWN:Simplified Chinese---');
    expect(prompt).toContain('Semantic JSON');
  });

  it('allocates more context budget to rules during validation than during summarization', () => {
    const input = {
      content: Array.from({ length: 120 }, (_, index) => `line ${index + 1}`).join('\n'),
      skeleton: {
        imports: Array.from({ length: 10 }, (_, index) => ({
          source: `./dep-${index + 1}`,
          symbols: [`fn${index + 1}`],
        })),
        exports: Array.from({ length: 12 }, (_, index) => ({
          name: `export${index + 1}`,
          kind: 'Function' as const,
          signature: `export${index + 1}()`,
          implementation_clue: `clue ${index + 1}`,
        })),
        usages: Array.from({ length: 12 }, (_, index) => `usage${index + 1}`),
      },
      dependencyContext: 'd'.repeat(2800),
      ruleData: 'r'.repeat(4200),
      previousSemantic: { role: 'role', responsibilities: ['a', 'b', 'c', 'd', 'e'] },
    };

    const summarizeBudgets = calculateSourcePromptBudgets({
      ...input,
      taskMode: 'summarize',
      promptTier: 'balanced',
    });
    const validateBudgets = calculateSourcePromptBudgets({
      ...input,
      taskMode: 'validate',
      promptTier: 'balanced',
    });

    expect(validateBudgets.ruleChars).toBeGreaterThan(summarizeBudgets.ruleChars);
    expect(validateBudgets.totalContextChars).toBeGreaterThan(summarizeBudgets.totalContextChars);
    expect(validateBudgets.headerLines).toBeLessThanOrEqual(summarizeBudgets.headerLines);
  });

  it('makes prompt tier differences explicit in budget allocation', () => {
    const input = {
      content: Array.from({ length: 100 }, (_, index) => `line ${index + 1}`).join('\n'),
      skeleton: {
        imports: Array.from({ length: 18 }, (_, index) => ({
          source: `./dep-${index + 1}`,
          symbols: [`fn${index + 1}`],
        })),
        exports: Array.from({ length: 20 }, (_, index) => ({
          name: `export${index + 1}`,
          kind: 'Function' as const,
          signature: `export${index + 1}()`,
          implementation_clue: `clue ${index + 1}\nmore`,
        })),
        usages: Array.from({ length: 20 }, (_, index) => `usage${index + 1}`),
      },
      dependencyContext: 'd'.repeat(2600),
      ruleData: 'r'.repeat(4200),
      previousSemantic: { role: 'role', responsibilities: ['a', 'b', 'c', 'd', 'e', 'f'] },
      taskMode: 'validate' as const,
    };

    const liteBudgets = calculateSourcePromptBudgets({
      ...input,
      promptTier: 'lite',
      validatePolicy: 'default',
    });
    const balancedBudgets = calculateSourcePromptBudgets({
      ...input,
      promptTier: 'balanced',
      validatePolicy: 'default',
    });
    const strictBudgets = calculateSourcePromptBudgets({
      ...input,
      promptTier: 'balanced',
      validatePolicy: 'strict',
    });

    expect(liteBudgets.maxResponsibilities).toBeLessThan(balancedBudgets.maxResponsibilities);
    expect(liteBudgets.ruleChars).toBeLessThanOrEqual(balancedBudgets.ruleChars);
    expect(strictBudgets.totalContextChars).toBeGreaterThan(balancedBudgets.totalContextChars);
    expect(strictBudgets.maxResponsibilities).toBeGreaterThan(balancedBudgets.maxResponsibilities);
  });

  it('keeps retained rule blocks and records dropped ones in diagnostics', () => {
    const artifacts = buildSourcePromptArtifacts({
      content: 'line 1\nline 2\nline 3',
      skeleton: { imports: [], exports: [], usages: [] },
      dependencyContext:
        'Known Internal Dependency Semantics:\n- `src/kept.ts`: role=Kept; responsibilities=A',
      dependencyDiagnostics: {
        retainedDependencyCandidates: [
          {
            path: 'src/kept.ts',
            importedSymbols: ['kept'],
            role: 'Kept',
            totalScore: 90,
            contributions: [{ factor: 'semantic-doc', score: 25, reason: 'has docs' }],
          },
        ],
        truncatedDependencyCandidates: [],
        symbolTargets: [],
      },
      ruleData: [
        '[Rule: kept] (Severity: warning)\nShort body',
        '[Rule: dropped] (Severity: error)\n' + 'x'.repeat(7000),
      ].join('\n\n'),
      taskMode: 'validate',
      promptTier: 'lite',
    });

    expect(artifacts.diagnostics.relevance.retainedDependencyCandidates[0].path).toBe(
      'src/kept.ts',
    );
    expect(
      artifacts.diagnostics.relevance.retainedRuleBlocks.some((block) => block.ruleId === 'kept'),
    ).toBe(true);
    expect(artifacts.diagnostics.relevance.droppedRuleBlocks.length).toBeGreaterThan(0);
  });
});
