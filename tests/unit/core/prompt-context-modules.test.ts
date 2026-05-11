import { describe, expect, it } from 'vitest';
import { calculateSourcePromptBudgets } from '../../../src/infra/prompt-context/budgets.js';
import {
  buildDependencySelectionDiagnostics,
  buildRuleBlockDiagnostics,
} from '../../../src/infra/prompt-context/diagnostics.js';

describe('Prompt-context modules', () => {
  it('allocates stricter validation budgets from extracted budget helper', () => {
    const input = {
      content: Array.from({ length: 120 }, (_, index) => `line ${index + 1}`).join('\n'),
      skeleton: {
        imports: Array.from({ length: 10 }, (_, index) => ({
          source: `./dep-${index + 1}`,
          symbols: [`fn${index + 1}`],
        })),
        exports: Array.from({ length: 10 }, (_, index) => ({
          name: `export${index + 1}`,
          kind: 'Function' as const,
          signature: `export${index + 1}()`,
          implementation_clue: `clue ${index + 1}`,
        })),
        usages: Array.from({ length: 10 }, (_, index) => `usage${index + 1}`),
      },
      dependencyContext: 'd'.repeat(2600),
      ruleData: 'r'.repeat(4200),
      previousSemantic: { role: 'role', responsibilities: ['a', 'b', 'c', 'd'] },
      taskMode: 'validate' as const,
    };

    const defaultBudgets = calculateSourcePromptBudgets({
      ...input,
      validatePolicy: 'default',
    });
    const strictBudgets = calculateSourcePromptBudgets({
      ...input,
      validatePolicy: 'strict',
    });

    expect(strictBudgets.totalContextChars).toBeGreaterThan(defaultBudgets.totalContextChars);
    expect(strictBudgets.ruleChars).toBeGreaterThanOrEqual(defaultBudgets.ruleChars);
    expect(strictBudgets.maxResponsibilities).toBeGreaterThan(defaultBudgets.maxResponsibilities);
  });

  it('computes retained and truncated dependency diagnostics from extracted helper', () => {
    const diagnostics = buildDependencySelectionDiagnostics(
      {
        retainedDependencyCandidates: [
          {
            path: 'src/kept.ts',
            importedSymbols: ['kept'],
            role: 'Kept role',
            totalScore: 90,
            contributions: [{ factor: 'same-directory', score: 10, reason: 'nearby' }],
          },
          {
            path: 'src/trimmed.ts',
            importedSymbols: ['trimmed'],
            role: 'Trimmed role',
            totalScore: 50,
            contributions: [{ factor: 'semantic-doc', score: 10, reason: 'documented' }],
          },
        ],
        truncatedDependencyCandidates: [
          {
            path: 'src/dropped.ts',
            importedSymbols: ['dropped'],
            role: 'Dropped role',
            totalScore: 12,
            contributions: [{ factor: 'path-distance', score: -4, reason: 'far' }],
          },
        ],
        symbolTargets: [],
      },
      'Known Internal Dependency Semantics:\n- `src/kept.ts`: role=Kept role',
    );

    expect(diagnostics.retainedDependencyCandidates.map((candidate) => candidate.path)).toEqual([
      'src/kept.ts',
    ]);
    expect(diagnostics.truncatedDependencyCandidates).toMatchObject([
      { path: 'src/trimmed.ts', truncationReason: 'dependency-context-trimmed' },
      { path: 'src/dropped.ts', truncationReason: 'not-ranked-in-top-dependencies' },
    ]);
  });

  it('computes retained and dropped rule blocks from extracted helper', () => {
    const diagnostics = buildRuleBlockDiagnostics(
      [
        '[Rule: kept] (Severity: warning)\nshort body',
        '[Rule: dropped] (Severity: error)\nbody',
      ].join('\n\n'),
      '[Rule: kept] (Severity: warning)\nshort body',
    );

    expect(diagnostics.retainedRuleBlocks).toMatchObject([{ ruleId: 'kept' }]);
    expect(diagnostics.droppedRuleBlocks).toMatchObject([{ ruleId: 'dropped' }]);
  });
});
