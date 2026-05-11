import { describe, expect, it, vi } from 'vitest';
import { printCommandHelp, printGeneralHelp } from '../../../src/cli/help.js';

describe('CLI help boundary contract', () => {
  it('keeps sync incremental and points baseline work to build', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    printCommandHelp('sync');

    const output = consoleSpy.mock.calls.map((call) => String(call[0])).join('\n');
    expect(output).toContain('spine sync [--hook] [--repair-violations] [--retry-failed]');
    expect(output).toContain("Use 'spine build' for a full baseline rebuild");
    expect(output).toContain('Everyday incremental sync');
    expect(output).not.toContain('sync --full');
  });

  it('shows build positioned as a recovery command in general help', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    printGeneralHelp();

    const output = consoleSpy.mock.calls.map((call) => String(call[0])).join('\n');
    expect(output).toContain('Full rebuild of the semantic mirror baseline (new repos, recovery)');
    expect(output).toContain('Getting Started');
    expect(output).toContain('Daily Use');
    expect(output).not.toContain('spine sync --full');
  });
});
