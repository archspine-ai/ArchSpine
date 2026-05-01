import { describe, expect, it } from 'vitest';
import { evaluateRepairPolicy } from '../src/infra/repair-policy.js';

describe('repair policy', () => {
  it('uses targeted repair for small file-level violations', () => {
    const decision = evaluateRepairPolicy({
      hasBaseline: true,
      addedPaths: ['.spine/index/src/example.ts.json'],
      changedPaths: ['.spine/atlas/English/.github/workflows/test.yml.md'],
      removedPaths: [],
    });

    expect(decision.action).toBe('targeted-repair');
    expect(decision.targetedSourceFiles).toEqual(['.github/workflows/test.yml', 'src/example.ts']);
    expect(decision.aggregateLevelPaths).toEqual([]);
    expect(decision.unmappedPaths).toEqual([]);
    expect(decision.safeNonInteractiveDowngrade).toBeNull();
  });

  it('prompts for full rebuild when aggregate-level violations are present', () => {
    const decision = evaluateRepairPolicy({
      hasBaseline: true,
      addedPaths: ['.spine/index/project.json'],
      changedPaths: [],
      removedPaths: [],
    });

    expect(decision.action).toBe('prompt-full-rebuild');
    expect(decision.aggregateLevelPaths).toEqual(['.spine/index/project.json']);
    expect(decision.safeNonInteractiveDowngrade).toBeNull();
  });

  it('allows a safe non-interactive downgrade when aggregate violations are fully covered by file-level repairs', () => {
    const decision = evaluateRepairPolicy({
      hasBaseline: true,
      addedPaths: ['.spine/index/src/example.ts.json', '.spine/index/src/folder.json'],
      changedPaths: ['.spine/atlas/English/project.md'],
      removedPaths: [],
    });

    expect(decision.action).toBe('prompt-full-rebuild');
    expect(decision.targetedSourceFiles).toEqual(['src/example.ts']);
    expect(decision.safeNonInteractiveDowngrade).toEqual({
      action: 'targeted-repair',
      targetedSourceFiles: ['src/example.ts'],
      reason:
        'Aggregate-level violations are covered by the same source files and can be repaired safely without prompting in non-interactive mode.',
    });
  });

  it('requires full rebuild for structurally unsafe aggregate-only violations', () => {
    const decision = evaluateRepairPolicy({
      hasBaseline: true,
      addedPaths: ['.spine/index/src/folder.json'],
      changedPaths: [],
      removedPaths: ['.spine/index/project.json'],
    });

    expect(decision.action).toBe('require-full-rebuild');
    expect(decision.aggregateLevelPaths).toEqual([
      '.spine/index/project.json',
      '.spine/index/src/folder.json',
    ]);
  });

  it('requires full rebuild when violation paths cannot be mapped safely', () => {
    const decision = evaluateRepairPolicy({
      hasBaseline: true,
      addedPaths: [],
      changedPaths: ['.spine/atlas/English'],
      removedPaths: [],
    });

    expect(decision.action).toBe('require-full-rebuild');
    expect(decision.unmappedPaths).toEqual(['.spine/atlas/English']);
    expect(decision.safeNonInteractiveDowngrade).toBeNull();
  });
});
