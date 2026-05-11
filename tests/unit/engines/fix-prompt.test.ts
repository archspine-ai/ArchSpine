import { describe, expect, it } from 'vitest';
import { generateFixPrompt, FixViolationContext } from '../../../src/engines/fix-prompt.js';

function makeCtx(overrides?: Partial<FixViolationContext>): FixViolationContext {
  return {
    filePath: 'src/api/handler.ts',
    fileContent: 'import { db } from "../infra/db.js";\nexport class Handler {}',
    structuralSkeleton: 'exports: [{name: "Handler", kind: "class"}]',
    violations: [
      {
        ruleId: 'infra-layer-isolation',
        severity: 'error',
        reason: 'API layer imports infra directly.',
        ruleContent: 'API modules must not import infra modules.',
      },
    ],
    ...overrides,
  };
}

describe('generateFixPrompt', () => {
  it('Main Path: includes all required sections', () => {
    const prompt = generateFixPrompt(makeCtx());

    expect(prompt).toContain('You are an expert developer assistant');
    expect(prompt).toContain('### File: src/api/handler.ts');
    expect(prompt).toContain('<FILE_CONTENT>');
    expect(prompt).toContain('<STRUCTURAL_SKELETON>');
    expect(prompt).toContain('<VIOLATION_DATA>');
    expect(prompt).toContain('### Violations to Fix:');
    expect(prompt).toContain('### Instructions:');
    expect(prompt).toContain('### Critical patterns for architectural fixes:');
  });

  it('Main Path: formats multiple violations with numbering', () => {
    const prompt = generateFixPrompt(
      makeCtx({
        violations: [
          { ruleId: 'R1', severity: 'error', reason: 'Bad import.' },
          { ruleId: 'R2', severity: 'warning', reason: 'Wrong name.' },
        ],
      }),
    );

    expect(prompt).toContain('### Violation 1');
    expect(prompt).toContain('### Violation 2');
    expect(prompt).toContain('- Rule ID: R1');
    expect(prompt).toContain('- Rule ID: R2');
  });

  it('Main Path: includes RULE_TEXT block when ruleContent is present', () => {
    const prompt = generateFixPrompt(makeCtx());

    expect(prompt).toContain('<RULE_TEXT>');
    expect(prompt).toContain('API modules must not import infra modules.');
    expect(prompt).toContain('</RULE_TEXT>');
  });

  it('Boundary: omits RULE_TEXT block when ruleContent is absent', () => {
    const prompt = generateFixPrompt(
      makeCtx({
        violations: [{ ruleId: 'R1', severity: 'error', reason: 'Bad import.' }],
      }),
    );

    expect(prompt).not.toContain('<RULE_TEXT>');
  });

  it('Boundary: omits STRUCTURAL_SKELETON block when empty', () => {
    const prompt = generateFixPrompt(makeCtx({ structuralSkeleton: '' }));

    expect(prompt).not.toContain('<STRUCTURAL_SKELETON>');
  });

  it('Boundary: includes instruction steps 1-6', () => {
    const prompt = generateFixPrompt(makeCtx());

    expect(prompt).toContain('1. Analyze the original file content');
    expect(prompt).toContain('2. Produce a corrected version');
    expect(prompt).toContain('3. Output ONLY the corrected file content');
    expect(prompt).toContain('4. Preserve all existing functionality');
    expect(prompt).toContain('5. Do not remove imports');
    expect(prompt).toContain('6. The output must be valid, compilable source code');
  });

  it('Boundary: handles single violation without ruleContent', () => {
    const prompt = generateFixPrompt(
      makeCtx({
        violations: [
          { ruleId: 'naming-convention', severity: 'advisory', reason: 'Use camelCase.' },
        ],
      }),
    );

    expect(prompt).toContain('### Violation 1');
    expect(prompt).toContain('- Severity: advisory');
    expect(prompt).not.toContain('### Violation 2');
  });
});
