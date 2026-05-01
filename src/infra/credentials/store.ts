import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import ignore from 'ignore';
import { FileSystemManager } from '../../utils/fs.js';
import { CredentialBackend, createDefaultCredentialBackend } from './backend.js';

export type CredentialSource = 'keychain' | 'file' | 'missing';

export interface FileCredentialShape {
  llm?: {
    apiKey?: string;
  };
}

interface CredentialStoreOptions {
  backend?: CredentialBackend;
  fallbackPath: string;
  secretName: string;
  account: string;
  label: string;
  repositoryRoot?: string;
}

export class CredentialStore {
  private backend?: CredentialBackend;
  private fallbackPath: string;
  private secretName: string;
  private account: string;
  private label: string;
  private repositoryRoot?: string;

  constructor(options: CredentialStoreOptions) {
    this.backend =
      options.backend !== undefined
        ? options.backend.isAvailable()
          ? options.backend
          : undefined
        : createDefaultCredentialBackend();
    this.fallbackPath = options.fallbackPath;
    this.secretName = options.secretName;
    this.account = options.account;
    this.label = options.label;
    this.repositoryRoot = options.repositoryRoot;
  }

  public get(): string | undefined {
    if (this.backend) {
      const secret = this.backend.get(this.secretName, this.account);
      if (typeof secret === 'string' && secret.trim() !== '') {
        return secret;
      }
    }

    return this.loadFallback().llm?.apiKey;
  }

  public has(): boolean {
    const value = this.get();
    return typeof value === 'string' && value.trim() !== '';
  }

  public set(secret: string): void {
    if (this.backend) {
      try {
        this.backend.set(this.secretName, this.account, secret);
        const persisted = this.backend.get(this.secretName, this.account);
        if (persisted === secret) {
          this.clearFallback();
          return;
        }
      } catch {
        // Fall back to file-backed secrets when the system backend fails or
        // cannot immediately read back the stored credential.
      }
    }

    const data = this.loadFallback();
    if (!data.llm) {
      data.llm = {};
    }
    data.llm.apiKey = secret;
    this.saveFallback(data);
    this.warnIfFallbackSecretMayBeTracked();
  }

  public clear(): void {
    if (this.backend) {
      this.backend.delete(this.secretName, this.account);
    }
    this.clearFallback();
  }

  public getSource(): CredentialSource {
    if (this.backend) {
      const secret = this.backend.get(this.secretName, this.account);
      if (typeof secret === 'string' && secret.trim() !== '') {
        return 'keychain';
      }
    }

    const fallback = this.loadFallback().llm?.apiKey;
    if (typeof fallback === 'string' && fallback.trim() !== '') {
      return 'file';
    }

    return 'missing';
  }

  public getBackendName(): string {
    if (this.backend) {
      return this.backend.name;
    }
    return 'file';
  }

  public getLabel(): string {
    return this.label;
  }

  private loadFallback(): FileCredentialShape {
    if (!fs.existsSync(this.fallbackPath)) {
      return {};
    }

    try {
      return JSON.parse(fs.readFileSync(this.fallbackPath, 'utf-8')) as FileCredentialShape;
    } catch {
      // eslint-disable-next-line no-console -- Warn on fallback secret parse failure
      console.warn(
        `[CredentialStore] Failed to parse ${this.fallbackPath}, ignoring fallback secrets.`,
      );
      return {};
    }
  }

  private saveFallback(data: FileCredentialShape): void {
    const dir = path.dirname(this.fallbackPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    FileSystemManager.safeWriteFile(this.fallbackPath, JSON.stringify(data, null, 2));
  }

  private clearFallback(): void {
    if (fs.existsSync(this.fallbackPath)) {
      fs.rmSync(this.fallbackPath, { force: true });
    }
  }

  private warnIfFallbackSecretMayBeTracked(): void {
    if (!this.repositoryRoot) {
      return;
    }

    const gitIgnorePath = path.join(this.repositoryRoot, '.gitignore');
    const relativeFallbackPath = path
      .relative(this.repositoryRoot, this.fallbackPath)
      .replace(/\\/g, '/');
    if (!relativeFallbackPath || relativeFallbackPath.startsWith('..')) {
      return;
    }

    if (!fs.existsSync(gitIgnorePath)) {
      // eslint-disable-next-line no-console -- Warn on missing .gitignore for fallback secrets
      console.warn(
        `[CredentialStore] WARNING: Fallback secret was written to ${relativeFallbackPath}, ` +
          `but ${gitIgnorePath} does not exist. Add ${relativeFallbackPath} to .gitignore or run ` +
          `"spine repo strategy set <local|distributable>" to restore the managed ignore block.`,
      );
      return;
    }

    const rules = fs.readFileSync(gitIgnorePath, 'utf-8');
    const matcher = ignore().add(rules);
    if (matcher.ignores(relativeFallbackPath)) {
      return;
    }

    // eslint-disable-next-line no-console -- Warn on unignored fallback secrets
    console.warn(
      `[CredentialStore] WARNING: Fallback secret was written to ${relativeFallbackPath}, ` +
        `but the repository .gitignore does not ignore it. Run "spine repo strategy set <local|distributable>" ` +
        `or add ${relativeFallbackPath} to .gitignore immediately to avoid committing credentials.`,
    );
  }
}

export function createProjectLLMCredentialStore(
  rootDir: string,
  backend?: CredentialBackend,
): CredentialStore {
  return new CredentialStore({
    backend,
    fallbackPath: path.join(rootDir, '.spine', 'secrets.json'),
    secretName: 'io.archspine.llm.project',
    account: rootDir,
    label: `${rootDir}/.spine`,
    repositoryRoot: rootDir,
  });
}

export function createGlobalLLMCredentialStore(
  baseDir: string,
  backend?: CredentialBackend,
): CredentialStore {
  return new CredentialStore({
    backend,
    fallbackPath: path.join(baseDir, 'secrets.json'),
    secretName: 'io.archspine.llm.global',
    account: crypto.createHash('sha256').update(baseDir).digest('hex'),
    label: baseDir,
  });
}
