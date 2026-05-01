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
    return true;
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

  it('falls back to file storage when backend write cannot be verified', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-credential-store-'));
    tempDirs.push(rootDir);
    const fallbackPath = path.join(rootDir, '.spine', 'secrets.json');
    const store = new CredentialStore({
      backend: new UnreadableBackend(),
      fallbackPath,
      secretName: 'io.archspine.llm.project',
      account: rootDir,
      label: `${rootDir}/.spine`,
    });

    store.set('secret-token');

    expect(store.get()).toBe('secret-token');
    expect(store.getSource()).toBe('file');
    expect(fs.existsSync(fallbackPath)).toBe(true);
  });

  it('warns when fallback secrets are written but repository gitignore is missing', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-credential-store-'));
    tempDirs.push(rootDir);
    const fallbackPath = path.join(rootDir, '.spine', 'secrets.json');
    const warnings: string[] = [];
    vi.spyOn(console, 'warn').mockImplementation((message?: unknown) => {
      warnings.push(String(message ?? ''));
    });

    const store = new CredentialStore({
      backend: new UnreadableBackend(),
      fallbackPath,
      secretName: 'io.archspine.llm.project',
      account: rootDir,
      label: `${rootDir}/.spine`,
      repositoryRoot: rootDir,
    });

    store.set('secret-token');

    expect(warnings.join('\n')).toContain('.gitignore does not exist');
    expect(warnings.join('\n')).toContain('.spine/secrets.json');
  });

  it('warns when fallback secrets are written but repository gitignore does not ignore them', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-credential-store-'));
    tempDirs.push(rootDir);
    const fallbackPath = path.join(rootDir, '.spine', 'secrets.json');
    fs.writeFileSync(path.join(rootDir, '.gitignore'), 'node_modules/\n', 'utf-8');
    const warnings: string[] = [];
    vi.spyOn(console, 'warn').mockImplementation((message?: unknown) => {
      warnings.push(String(message ?? ''));
    });

    const store = new CredentialStore({
      backend: new UnreadableBackend(),
      fallbackPath,
      secretName: 'io.archspine.llm.project',
      account: rootDir,
      label: `${rootDir}/.spine`,
      repositoryRoot: rootDir,
    });

    store.set('secret-token');

    expect(warnings.join('\n')).toContain('does not ignore it');
    expect(warnings.join('\n')).toContain('.spine/secrets.json');
  });

  it('does not warn when fallback secrets are already ignored by repository gitignore', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-credential-store-'));
    tempDirs.push(rootDir);
    const fallbackPath = path.join(rootDir, '.spine', 'secrets.json');
    fs.writeFileSync(path.join(rootDir, '.gitignore'), '.spine/secrets.json\n', 'utf-8');
    const warnings: string[] = [];
    vi.spyOn(console, 'warn').mockImplementation((message?: unknown) => {
      warnings.push(String(message ?? ''));
    });

    const store = new CredentialStore({
      backend: new UnreadableBackend(),
      fallbackPath,
      secretName: 'io.archspine.llm.project',
      account: rootDir,
      label: `${rootDir}/.spine`,
      repositoryRoot: rootDir,
    });

    store.set('secret-token');

    expect(warnings).toHaveLength(0);
  });

  it('clears fallback secrets after a verified backend write', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'archspine-credential-store-'));
    tempDirs.push(rootDir);
    const fallbackPath = path.join(rootDir, '.spine', 'secrets.json');
    fs.mkdirSync(path.dirname(fallbackPath), { recursive: true });
    fs.writeFileSync(fallbackPath, JSON.stringify({ llm: { apiKey: 'stale-secret' } }, null, 2));

    const store = new CredentialStore({
      backend: new MemoryCredentialBackend(),
      fallbackPath,
      secretName: 'io.archspine.llm.project',
      account: rootDir,
      label: `${rootDir}/.spine`,
    });

    store.set('fresh-secret');

    expect(store.get()).toBe('fresh-secret');
    expect(store.getSource()).toBe('keychain');
    expect(fs.existsSync(fallbackPath)).toBe(false);
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
