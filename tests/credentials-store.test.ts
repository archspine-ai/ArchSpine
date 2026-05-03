import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  CredentialBackend,
  MemoryCredentialBackend,
  WindowsDPAPIBackend,
} from '../src/infra/credentials/backend.js';
import { CredentialStore } from '../src/infra/credentials/store.js';

class UnreadableBackend implements CredentialBackend {
  readonly name = 'broken-backend';

  public isAvailable(): boolean {
    return false;
  }

  public get(_secretName: string, _account: string): string | undefined {
    return undefined;
  }

  public set(_secretName: string, _account: string, _secret: string): void {}

  public delete(_secretName: string, _account: string): void {}
}

describe('CredentialStore', () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    vi.restoreAllMocks();
    for (const dir of tempDirs.splice(0)) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it('fails gracefully when backend write cannot be verified or fails', () => {
    const store = new CredentialStore({
      backend: new UnreadableBackend(),
      secretName: 'io.archspine.llm.project',
      account: 'dummy-account',
      label: 'dummy-label',
    });

    const warnings: string[] = [];
    vi.spyOn(console, 'warn').mockImplementation((message?: unknown) => {
      warnings.push(String(message ?? ''));
    });

    store.set('secret-token');

    expect(store.get()).toBeUndefined();
    expect(store.getSource()).toBe('missing');
    expect(warnings.join('\n')).toContain('No valid credential backend available');
  });

  it('derives different Windows storage paths for different secret names', () => {
    const backend = new WindowsDPAPIBackend();
    const getStoragePath = (
      backend as unknown as {
        getStoragePath(secretName: string, account: string): string;
      }
    ).getStoragePath.bind(backend);

    const projectPath = getStoragePath('io.archspine.llm.project', 'same-account');
    const globalPath = getStoragePath('io.archspine.llm.global', 'same-account');

    expect(projectPath).not.toBe(globalPath);
  });
});
