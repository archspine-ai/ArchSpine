import * as crypto from 'crypto';
import { CredentialBackend, createDefaultCredentialBackend } from './backend.js';

export type CredentialSource = 'keychain' | 'missing';

interface CredentialStoreOptions {
  backend?: CredentialBackend;
  secretName: string;
  account: string;
  label: string;
}

export class CredentialStore {
  private backend?: CredentialBackend;
  private secretName: string;
  private account: string;
  private label: string;

  constructor(options: CredentialStoreOptions) {
    this.backend =
      options.backend !== undefined
        ? options.backend.isAvailable()
          ? options.backend
          : undefined
        : createDefaultCredentialBackend();
    this.secretName = options.secretName;
    this.account = options.account;
    this.label = options.label;
  }

  public get(): string | undefined {
    if (this.backend) {
      const secret = this.backend.get(this.secretName, this.account);
      if (typeof secret === 'string' && secret.trim() !== '') {
        return secret;
      }
    }
    return undefined;
  }

  public has(): boolean {
    const value = this.get();
    return typeof value === 'string' && value.trim() !== '';
  }

  public set(secret: string): void {
    if (this.backend) {
      try {
        this.backend.set(this.secretName, this.account, secret);
      } catch (error) {
        // eslint-disable-next-line no-console -- Credential storage failures must be visible to CLI users.
        console.warn(
          `[CredentialStore] Failed to store API key in ${this.backend.name} backend:`,
          error instanceof Error ? error.message : String(error),
        );
      }
    } else {
      // eslint-disable-next-line no-console -- Credential storage failures must be visible to CLI users.
      console.warn(
        `[CredentialStore] No valid credential backend available to store API keys securely.`,
      );
    }
  }

  public clear(): void {
    if (this.backend) {
      this.backend.delete(this.secretName, this.account);
    }
  }

  public getSource(): CredentialSource {
    if (this.backend) {
      const secret = this.backend.get(this.secretName, this.account);
      if (typeof secret === 'string' && secret.trim() !== '') {
        return 'keychain';
      }
    }
    return 'missing';
  }

  public getBackendName(): string {
    if (this.backend) {
      return this.backend.name;
    }
    return 'none';
  }

  public getLabel(): string {
    return this.label;
  }
}

export function createProjectLLMCredentialStore(
  rootDir: string,
  backend?: CredentialBackend,
): CredentialStore {
  return new CredentialStore({
    backend,
    secretName: 'io.archspine.llm.project',
    account: rootDir,
    label: `${rootDir}/.spine`,
  });
}

export function createGlobalLLMCredentialStore(
  baseDir: string,
  backend?: CredentialBackend,
): CredentialStore {
  return new CredentialStore({
    backend,
    secretName: 'io.archspine.llm.global',
    account: crypto.createHash('sha256').update(baseDir).digest('hex'),
    label: baseDir,
  });
}
