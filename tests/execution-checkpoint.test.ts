import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  ExecutionCheckpointStore,
  deriveCheckResumeCandidateFiles,
  deriveSyncResumeCandidateFiles,
  type ExecutionCheckpointState,
} from '../src/infra/execution-checkpoint.js';

function createState(): ExecutionCheckpointState {
  return {
    schemaVersion: '1.0',
    command: 'sync',
    runId: 'run-1',
    status: 'running',
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stages: {},
  };
}

describe('execution checkpoint resume derivation', () => {
  it('derives sync resume files from scanned files minus committed files', () => {
    const state = createState();
    state.stages['scan-cleanup'] = {
      status: 'completed',
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      data: {
        filteredFiles: ['src/a.ts', 'src/b.ts', 'src/c.ts'],
      },
    };
    state.stages['state-commit'] = {
      status: 'running',
      updatedAt: new Date().toISOString(),
      items: {
        'src/a.ts': {
          status: 'completed',
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      },
    };

    expect(deriveSyncResumeCandidateFiles(state)).toEqual(['src/b.ts', 'src/c.ts']);
  });

  it('derives check resume files from scanned files minus completed validations', () => {
    const state = createState();
    state.command = 'check';
    state.stages['scan-cleanup'] = {
      status: 'completed',
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      data: {
        filteredFiles: ['src/a.ts', 'src/b.ts', 'src/c.ts'],
      },
    };
    state.stages.validation = {
      status: 'running',
      updatedAt: new Date().toISOString(),
      items: {
        'src/a.ts': {
          status: 'completed',
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
        'src/b.ts': {
          status: 'skipped',
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      },
    };

    expect(deriveCheckResumeCandidateFiles(state)).toEqual(['src/c.ts']);
  });

  it('normalizes and de-duplicates candidate files from scan stage data', () => {
    const state = createState();
    state.stages['scan-cleanup'] = {
      status: 'completed',
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      data: {
        filteredFiles: ['src\\a.ts', 'src/a.ts', 'src/b.ts'],
      },
    };
    state.stages['state-commit'] = {
      status: 'running',
      updatedAt: new Date().toISOString(),
      items: {
        'src/a.ts': {
          status: 'completed',
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      },
    };

    expect(deriveSyncResumeCandidateFiles(state)).toEqual(['src/b.ts']);
  });

  it('returns empty candidates for resumable runs with empty checkpoints', () => {
    const state = createState();
    expect(deriveSyncResumeCandidateFiles(state)).toEqual([]);
    expect(deriveCheckResumeCandidateFiles(state)).toEqual([]);
  });
});

describe('execution checkpoint loading', () => {
  const createdDirs: string[] = [];

  afterEach(() => {
    for (const dir of createdDirs.splice(0)) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it('quarantines malformed checkpoint files instead of silently ignoring them', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-checkpoint-invalid-'));
    createdDirs.push(rootDir);
    const checkpointDir = path.join(rootDir, '.spine', 'runtime', 'checkpoints');
    fs.mkdirSync(checkpointDir, { recursive: true });
    const checkpointPath = path.join(checkpointDir, 'sync.json');
    fs.writeFileSync(
      checkpointPath,
      JSON.stringify(
        {
          schemaVersion: '1.0',
          command: 'sync',
          runId: 'run-1',
          status: 'running',
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stages: [],
        },
        null,
        2,
      ),
    );

    const store = new ExecutionCheckpointStore(rootDir, 'sync');
    expect(store.load()).toBeNull();
    expect(store.getLastLoadWarning()).toContain('Ignoring invalid sync checkpoint');
    expect(fs.existsSync(checkpointPath)).toBe(false);

    const quarantined = fs
      .readdirSync(checkpointDir)
      .find((entry) => entry.startsWith('sync.json.corrupt.'));
    expect(quarantined).toBeDefined();
  });

  it('loads valid checkpoint files without warnings', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-checkpoint-valid-'));
    createdDirs.push(rootDir);
    const checkpointDir = path.join(rootDir, '.spine', 'runtime', 'checkpoints');
    fs.mkdirSync(checkpointDir, { recursive: true });
    const checkpointPath = path.join(checkpointDir, 'check.json');
    fs.writeFileSync(
      checkpointPath,
      JSON.stringify(
        {
          schemaVersion: '1.0',
          command: 'check',
          runId: 'run-1',
          status: 'failed',
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          error: 'boom',
          stages: {
            validation: {
              status: 'failed',
              startedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              error: 'boom',
              items: {
                'src/demo.ts': {
                  status: 'failed',
                  startedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  error: 'boom',
                },
              },
            },
          },
        },
        null,
        2,
      ),
    );

    const store = new ExecutionCheckpointStore(rootDir, 'check');
    const loaded = store.load();
    expect(loaded).not.toBeNull();
    expect(loaded?.command).toBe('check');
    expect(store.getLastLoadWarning()).toBeNull();
  });

  it('rejects illegal item status transitions once an item is completed', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-checkpoint-transitions-'));
    createdDirs.push(rootDir);
    const store = new ExecutionCheckpointStore(rootDir, 'sync');
    store.startRun();
    store.markItemStarted('validation', 'src/demo.ts');
    store.markItemCompleted('validation', 'src/demo.ts');

    expect(() => store.markItemStarted('validation', 'src/demo.ts')).toThrow(
      /Invalid checkpoint item transition/,
    );
  });
});
