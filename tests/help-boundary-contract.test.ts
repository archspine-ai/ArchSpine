import { describe, expect, it, vi } from 'vitest';
import { printCommandHelp, printGeneralHelp } from '../src/cli/help.js';

describe('CLI help boundary contract', () => {
  it('keeps sync incremental and points heavy baseline work to build', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    printCommandHelp('sync');

    const output = consoleSpy.mock.calls.map((call) => String(call[0])).join('\n');
    expect(output).toContain('spine sync [--hook] [--repair-violations] [--retry-failed]');
    expect(output).toContain("Use 'spine build' for a full baseline rebuild");
    expect(output).toContain("prefer 'spine publish' instead of retrying sync");
    expect(output).not.toContain('sync --full');
  });

  it('shows build as a first-run baseline command in general help', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    printGeneralHelp();

    const output = consoleSpy.mock.calls.map((call) => String(call[0])).join('\n');
    expect(output).toContain(
      'build          Build the heavy semantic mirror baseline for a new repo or full recovery',
    );
    expect(output).toContain(
      "Use 'spine sync --retry-failed' for narrow sync recovery and 'spine publish' when Atlas docs need backfill",
    );
    expect(output).not.toContain('spine sync --full');
  });

  it('keeps publish help aligned with atlas backfill routing', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    printCommandHelp('publish');

    const output = consoleSpy.mock.calls.map((call) => String(call[0])).join('\n');
    expect(output).toContain(
      'Prefer this command when the .spine/index/ baseline is already present and you mainly need Atlas backfill',
    );
    expect(output).toContain(
      "use 'spine sync --retry-failed' when the sync pipeline itself failed on a limited file set",
    );
  });
});
