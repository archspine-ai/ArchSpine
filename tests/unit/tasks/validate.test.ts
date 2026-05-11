import { describe, expect, it } from 'vitest';
import { normalizeRuleViolations } from '../../../src/tasks/validate.js';

describe('normalizeRuleViolations', () => {
  it('Main Path: normalizes valid violation objects', () => {
    const result = normalizeRuleViolations([
      { id: 'infra-isolation', severity: 'error', reason: 'API imports infra.' },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'infra-isolation',
      severity: 'error',
      reason: 'API imports infra.',
    });
  });

  it('Main Path: deduplicates identical violations', () => {
    const result = normalizeRuleViolations([
      { id: 'dup', severity: 'error', reason: 'Same.' },
      { id: 'dup', severity: 'error', reason: 'Same.' },
    ]);

    expect(result).toHaveLength(1);
  });

  it('Boundary: returns empty array for non-array input', () => {
    expect(normalizeRuleViolations(null)).toEqual([]);
    expect(normalizeRuleViolations(undefined)).toEqual([]);
    expect(normalizeRuleViolations('string')).toEqual([]);
    expect(normalizeRuleViolations(42)).toEqual([]);
  });

  it('Boundary: filters entries with invalid severity', () => {
    const result = normalizeRuleViolations([
      { id: 'valid', severity: 'critical', reason: 'Bad severity.' },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe('warning');
  });

  it('Boundary: filters entries with empty id', () => {
    const result = normalizeRuleViolations([{ id: '', severity: 'error', reason: 'Empty id.' }]);

    expect(result).toHaveLength(0);
  });

  it('Boundary: filters entries with id "rule-id"', () => {
    const result = normalizeRuleViolations([
      { id: 'rule-id', severity: 'error', reason: 'Placeholder id.' },
    ]);

    expect(result).toHaveLength(0);
  });

  it('Boundary: allows advisory, warning, and error severities', () => {
    const result = normalizeRuleViolations([
      { id: 'a', severity: 'advisory', reason: 'Advisory.' },
      { id: 'b', severity: 'warning', reason: 'Warning.' },
      { id: 'c', severity: 'error', reason: 'Error.' },
    ]);

    expect(result).toHaveLength(3);
  });

  it('Boundary: trims whitespace from id and reason', () => {
    const result = normalizeRuleViolations([
      { id: '  my-rule  ', severity: 'error', reason: '  Needs trimming.  ' },
    ]);

    expect(result[0].id).toBe('my-rule');
    expect(result[0].reason).toBe('Needs trimming.');
  });

  it('Boundary: filters non-object entries', () => {
    const result = normalizeRuleViolations([
      'not-an-object',
      null,
      42,
      { id: 'real', severity: 'error', reason: 'Real violation.' },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('real');
  });
});
