import { CredentialBackend } from './credentials/backend.js';
import {
  CredentialSource,
  CredentialStore,
  createProjectLLMCredentialStore,
} from './credentials/store.js';

export class Secrets {
  private store: CredentialStore;

  constructor(rootDir: string, backend?: CredentialBackend) {
    this.store = createProjectLLMCredentialStore(rootDir, backend);
  }

  public getLLMApiKey(): string | undefined {
    return this.store.get();
  }

  public setLLMApiKey(apiKey: string): void {
    this.store.set(apiKey);
  }

  public clearLLMApiKey(): void {
    this.store.clear();
  }

  public hasLLMApiKey(): boolean {
    return this.store.has();
  }

  public getLLMApiKeySource(): CredentialSource {
    return this.store.getSource();
  }

  public getCredentialBackendName(): string {
    return this.store.getBackendName();
  }
}
