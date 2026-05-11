import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// hoisted mock for os.homedir — must run before the skill module is evaluated
// ---------------------------------------------------------------------------

const { homeDirRef } = vi.hoisted(() => {
  const ref: { current: string } = { current: '' };
  return { homeDirRef: ref };
});

vi.mock('os', async (importOriginal) => {
  const actual = await importOriginal<typeof import('os')>();
  const fsActual = await import('fs');
  const tmpRoot = actual.tmpdir();
  const dir = fsActual.mkdtempSync(path.join(tmpRoot, 'archspine-skill-'));
  homeDirRef.current = dir;
  return {
    ...actual,
    homedir: () => dir,
  };
});

// The skill module uses import.meta.url to resolve the asset path.
// When running under vitest, import.meta.url resolves to the source file,
// so the asset at src/assets/skill-definition.md is found automatically.
import { executeSkillCommand } from '../../../src/cli/commands/skill.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getHomeDir(): string {
  return homeDirRef.current;
}

function skillFilePath(): string {
  return path.join(getHomeDir(), '.claude', 'skills', 'archspine', 'SKILL.md');
}

function skillDirPath(): string {
  return path.join(getHomeDir(), '.claude', 'skills', 'archspine');
}

function stateFilePath(): string {
  return path.join(getHomeDir(), '.archspine', 'skill-state.json');
}

function cleanArtifacts(): void {
  const sf = skillFilePath();
  if (fs.existsSync(sf)) {
    fs.unlinkSync(sf);
  }
  const sd = skillDirPath();
  if (fs.existsSync(sd)) {
    const rem = fs.readdirSync(sd);
    if (rem.length === 0) {
      fs.rmdirSync(sd);
    }
  }
  const stf = stateFilePath();
  if (fs.existsSync(stf)) {
    fs.unlinkSync(stf);
  }
  const stateD = path.join(getHomeDir(), '.archspine');
  if (fs.existsSync(stateD)) {
    try {
      fs.rmdirSync(stateD);
    } catch {
      // directory may have leftover files – ignore
    }
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('executeSkillCommand', () => {
  afterEach(() => {
    cleanArtifacts();
    vi.restoreAllMocks();
  });

  afterAll(() => {
    cleanArtifacts();
    const hd = getHomeDir();
    if (hd && fs.existsSync(hd)) {
      fs.rmSync(hd, { recursive: true, force: true });
    }
  });

  // ------------------------------------------------------------------
  // Main path: install
  // ------------------------------------------------------------------

  it('Main Path: install creates skill file and state file', async () => {
    await executeSkillCommand({ args: ['install'] });

    expect(fs.existsSync(skillFilePath())).toBe(true);
    // Skill file should contain non-empty content from the real asset
    const content = fs.readFileSync(skillFilePath(), 'utf-8');
    expect(content.length).toBeGreaterThan(0);

    expect(fs.existsSync(stateFilePath())).toBe(true);
    const state = JSON.parse(fs.readFileSync(stateFilePath(), 'utf-8'));
    expect(state).toHaveProperty('reminders');
  });

  it('Main Path: install does not overwrite existing state file', async () => {
    // Pre-create state file with custom data
    const stateD = path.join(getHomeDir(), '.archspine');
    fs.mkdirSync(stateD, { recursive: true });
    const existingState = { reminders: { lastSync: '2026-01-01' }, customField: 'keep-me' };
    fs.writeFileSync(stateFilePath(), JSON.stringify(existingState, null, 2) + '\n', 'utf-8');

    await executeSkillCommand({ args: ['install'] });

    const state = JSON.parse(fs.readFileSync(stateFilePath(), 'utf-8'));
    expect(state.reminders.lastSync).toBe('2026-01-01');
    expect(state.customField).toBe('keep-me');

    // Skill file was still written
    expect(fs.existsSync(skillFilePath())).toBe(true);
  });

  // ------------------------------------------------------------------
  // Main path: uninstall
  // ------------------------------------------------------------------

  it('Main Path: uninstall removes the skill file and empty directory', async () => {
    fs.mkdirSync(skillDirPath(), { recursive: true });
    fs.writeFileSync(skillFilePath(), '# Test skill\n', 'utf-8');

    await executeSkillCommand({ args: ['uninstall'] });

    expect(fs.existsSync(skillFilePath())).toBe(false);
    expect(fs.existsSync(skillDirPath())).toBe(false);
  });

  it('Boundary: uninstall when not installed is a no-op', async () => {
    await executeSkillCommand({ args: ['uninstall'] });

    expect(fs.existsSync(skillFilePath())).toBe(false);
  });

  it('Boundary: uninstall leaves skill-state.json in place', async () => {
    fs.mkdirSync(skillDirPath(), { recursive: true });
    fs.writeFileSync(skillFilePath(), '# Test skill\n', 'utf-8');

    const stateD = path.join(getHomeDir(), '.archspine');
    fs.mkdirSync(stateD, { recursive: true });
    fs.writeFileSync(stateFilePath(), '{"reminders":{}}', 'utf-8');

    await executeSkillCommand({ args: ['uninstall'] });

    expect(fs.existsSync(stateFilePath())).toBe(true);
  });

  // ------------------------------------------------------------------
  // Error handling: invalid args
  // ------------------------------------------------------------------

  it('Boundary: throws for invalid subcommand', async () => {
    await expect(executeSkillCommand({ args: ['invalid-cmd'] })).rejects.toThrow(
      'Usage: spine skill <install|uninstall>',
    );
  });

  it('Boundary: throws for empty args', async () => {
    await expect(executeSkillCommand({ args: [] })).rejects.toThrow(
      'Usage: spine skill <install|uninstall>',
    );
  });
});
