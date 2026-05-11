import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { CredentialBackend } from '../credentials/backend.js';
import {
  CredentialSource,
  CredentialStore,
  createGlobalLLMCredentialStore,
} from '../credentials/store.js';
import { FileSystemManager } from '../../utils/fs.js';
export interface GlobalLLMConfigShape {
  llm?: {
    provider?: string;
    model?: string;
    baseURL?: string;
  };
}

export function getGlobalArchSpineDir(): string {
  // Windows: use %APPDATA% (roaming) for global config — the standard location
  // for cross-platform CLI tools on Windows.
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA;
    if (appData && appData.trim() !== '') {
      return path.join(appData, 'archspine');
    }
    // Fallback: construct from homedir (non-standard but safe)
    return path.join(os.homedir(), 'AppData', 'Roaming', 'archspine');
  }

  // macOS / Linux: XDG Base Directory compliant
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome && xdgConfigHome.trim() !== '') {
    return path.join(xdgConfigHome, 'archspine');
  }
  return path.join(os.homedir(), '.config', 'archspine');
}

export class GlobalLLMConfig {
  private configPath: string;
  private data: GlobalLLMConfigShape;

  constructor(baseDir?: string) {
    this.configPath = path.join(baseDir || getGlobalArchSpineDir(), 'config.json');
    this.data = this.load();
  }

  private load(): GlobalLLMConfigShape {
    if (!fs.existsSync(this.configPath)) {
      return {};
    }

    try {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf-8')) as GlobalLLMConfigShape;
    } catch {
      // eslint-disable-next-line no-console -- Warn on config parse failure
      console.warn(
        `[GlobalConfig] Failed to parse ${this.configPath}, ignoring persisted global config.`,
      );
      return {};
    }
  }

  public getLLMProvider(): string | undefined {
    return this.data.llm?.provider;
  }

  public getLLMModel(): string | undefined {
    return this.data.llm?.model;
  }

  public getLLMBaseURL(): string | undefined {
    return this.data.llm?.baseURL;
  }

  public setLLMProvider(provider?: string): void {
    this.ensureLLM();
    if (!provider) {
      delete this.data.llm!.provider;
    } else {
      this.data.llm!.provider = provider;
    }
    this.save();
  }

  public setLLMModel(model?: string): void {
    this.ensureLLM();
    if (!model) {
      delete this.data.llm!.model;
    } else {
      this.data.llm!.model = model;
    }
    this.save();
  }

  public setLLMBaseURL(baseURL?: string): void {
    this.ensureLLM();
    if (!baseURL) {
      delete this.data.llm!.baseURL;
    } else {
      this.data.llm!.baseURL = baseURL;
    }
    this.save();
  }

  private ensureLLM(): void {
    if (!this.data.llm) {
      this.data.llm = {};
    }
  }

  private save(): void {
    this.prune();
    if (Object.keys(this.data).length === 0) {
      if (fs.existsSync(this.configPath)) {
        fs.rmSync(this.configPath, { force: true });
      }
      return;
    }
    FileSystemManager.safeWriteFile(this.configPath, JSON.stringify(this.data, null, 2));
  }

  private prune(): void {
    if (this.data.llm && Object.keys(this.data.llm).length === 0) {
      delete this.data.llm;
    }
  }
}

export class GlobalLLMSecrets {
  private store: CredentialStore;

  constructor(baseDir?: string, backend?: CredentialBackend) {
    this.store = createGlobalLLMCredentialStore(baseDir || getGlobalArchSpineDir(), backend);
  }

  public getLLMApiKey(): string | undefined {
    return this.store.get();
  }

  public hasLLMApiKey(): boolean {
    return this.store.has();
  }

  public setLLMApiKey(apiKey: string): void {
    this.store.set(apiKey);
  }

  public clearLLMApiKey(): void {
    this.store.clear();
  }

  public getLLMApiKeySource(): CredentialSource {
    return this.store.getSource();
  }

  public getCredentialBackendName(): string {
    return this.store.getBackendName();
  }
}
