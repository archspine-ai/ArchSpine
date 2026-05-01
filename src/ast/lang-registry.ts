import { Lang, registerDynamicLanguage, type DynamicLangRegistrations } from '@ast-grep/napi';
import * as path from 'path';
import type { SourceLanguage } from '../types/protocol.js';

type NapiLang = Lang | (string & {});

export interface LangConfig {
  ruleName: string;
  langKey: NapiLang;
  sourceLanguage: SourceLanguage;
  loader?: () => Promise<unknown>;
}

export type InternalLangConfig = LangConfig & {
  packageName?: string;
};

const dynamicImport = (specifier: string) => import(specifier);

function createLoader(packageName: string): () => Promise<unknown> {
  return () => dynamicImport(packageName);
}

const LANG_EXTENSION_MAP: Record<string, InternalLangConfig> = {
  '.ts': { ruleName: 'typescript', langKey: Lang.TypeScript, sourceLanguage: 'typescript' },
  '.tsx': { ruleName: 'typescript', langKey: Lang.Tsx, sourceLanguage: 'typescript' },
  '.js': { ruleName: 'typescript', langKey: Lang.JavaScript, sourceLanguage: 'javascript' },
  '.jsx': { ruleName: 'typescript', langKey: Lang.JavaScript, sourceLanguage: 'javascript' },
  '.py': {
    ruleName: 'python',
    langKey: 'python',
    sourceLanguage: 'python',
    loader: createLoader('@ast-grep/lang-python'),
    packageName: '@ast-grep/lang-python',
  },
  '.go': {
    ruleName: 'go',
    langKey: 'go',
    sourceLanguage: 'go',
    loader: createLoader('@ast-grep/lang-go'),
    packageName: '@ast-grep/lang-go',
  },
  '.rs': {
    ruleName: 'rust',
    langKey: 'rust',
    sourceLanguage: 'rust',
    loader: createLoader('@ast-grep/lang-rust'),
    packageName: '@ast-grep/lang-rust',
  },
  '.java': {
    ruleName: 'java',
    langKey: 'java',
    sourceLanguage: 'java',
    loader: createLoader('@ast-grep/lang-java'),
    packageName: '@ast-grep/lang-java',
  },
  '.c': {
    ruleName: 'c',
    langKey: 'c',
    sourceLanguage: 'c',
    loader: createLoader('@ast-grep/lang-c'),
    packageName: '@ast-grep/lang-c',
  },
  '.h': {
    ruleName: 'c',
    langKey: 'c',
    sourceLanguage: 'c',
    loader: createLoader('@ast-grep/lang-c'),
    packageName: '@ast-grep/lang-c',
  },
  '.cpp': {
    ruleName: 'cpp',
    langKey: 'cpp',
    sourceLanguage: 'cpp',
    loader: createLoader('@ast-grep/lang-cpp'),
    packageName: '@ast-grep/lang-cpp',
  },
  '.cc': {
    ruleName: 'cpp',
    langKey: 'cpp',
    sourceLanguage: 'cpp',
    loader: createLoader('@ast-grep/lang-cpp'),
    packageName: '@ast-grep/lang-cpp',
  },
  '.cxx': {
    ruleName: 'cpp',
    langKey: 'cpp',
    sourceLanguage: 'cpp',
    loader: createLoader('@ast-grep/lang-cpp'),
    packageName: '@ast-grep/lang-cpp',
  },
  '.hpp': {
    ruleName: 'cpp',
    langKey: 'cpp',
    sourceLanguage: 'cpp',
    loader: createLoader('@ast-grep/lang-cpp'),
    packageName: '@ast-grep/lang-cpp',
  },
  '.hh': {
    ruleName: 'cpp',
    langKey: 'cpp',
    sourceLanguage: 'cpp',
    loader: createLoader('@ast-grep/lang-cpp'),
    packageName: '@ast-grep/lang-cpp',
  },
};

type ResolutionResult =
  | { supported: true; config: InternalLangConfig }
  | { supported: false; reason: string; config?: InternalLangConfig };

export class LangRegistry {
  private static dynamicRegistered = false;
  private static dynamicRegistrationPromise: Promise<void> | null = null;
  private static unavailablePackages = new Map<string, string>();
  private static announcedUnavailablePackages = new Set<string>();

  public static getSourceExtensions(): string[] {
    return Object.keys(LANG_EXTENSION_MAP);
  }

  public static getTrackedExtensions(): string[] {
    return [...this.getSourceExtensions(), '.md', '.json'];
  }

  public static getConfigForFilePath(filePath: string): InternalLangConfig | null {
    const ext = path.extname(filePath).toLowerCase();
    return LANG_EXTENSION_MAP[ext] ?? null;
  }

  public static isSourceFile(filePath: string): boolean {
    return this.getConfigForFilePath(filePath) !== null;
  }

  public static getSourceLanguage(filePath: string): SourceLanguage {
    return this.getConfigForFilePath(filePath)?.sourceLanguage ?? 'unsupported';
  }

  public static async resolve(filePath: string): Promise<ResolutionResult> {
    const config = this.getConfigForFilePath(filePath);
    if (!config) {
      return { supported: false, reason: 'No language mapping found for file extension.' };
    }

    if (!config.loader) {
      return { supported: true, config };
    }

    await this.ensureDynamicLanguagesRegistered();

    const packageName = config.packageName ?? String(config.langKey);
    const unavailableReason = this.unavailablePackages.get(packageName);
    if (unavailableReason) {
      return { supported: false, reason: unavailableReason, config };
    }

    return { supported: true, config };
  }

  public static announceUnavailableLanguage(filePath: string, reason: string): void {
    const config = this.getConfigForFilePath(filePath);
    const key = config?.packageName ?? filePath;
    if (this.announcedUnavailablePackages.has(key)) {
      return;
    }
    this.announcedUnavailablePackages.add(key);
    // eslint-disable-next-line no-console -- Internal diagnostic warning
    console.warn(`[LangRegistry] ${reason}`);
  }

  private static async ensureDynamicLanguagesRegistered(): Promise<void> {
    if (this.dynamicRegistered) {
      return;
    }
    if (this.dynamicRegistrationPromise) {
      return this.dynamicRegistrationPromise;
    }

    this.dynamicRegistrationPromise = (async () => {
      const registrations: DynamicLangRegistrations = {};
      const dynamicConfigs = Object.values(LANG_EXTENSION_MAP).filter((config) => config.loader);
      const handledLangs = new Set<string>();

      for (const config of dynamicConfigs) {
        const langKey = String(config.langKey);
        if (handledLangs.has(langKey)) {
          continue;
        }
        handledLangs.add(langKey);

        try {
          const mod = await config.loader!();
          const registration = (mod as { default?: unknown }).default ?? mod;
          registrations[langKey] = registration as DynamicLangRegistrations[string];
        } catch (error) {
          const packageName = config.packageName ?? langKey;
          const message = error instanceof Error ? error.message : String(error);
          this.unavailablePackages.set(
            packageName,
            `Language package ${packageName} is unavailable: ${message}`,
          );
        }
      }

      if (Object.keys(registrations).length > 0) {
        registerDynamicLanguage(registrations);
      }

      this.dynamicRegistered = true;
    })();

    try {
      await this.dynamicRegistrationPromise;
    } finally {
      this.dynamicRegistrationPromise = null;
    }
  }

  /**
   * Internal reporter for lang-discovery layer.
   * Returns current known availability status of all languages defined in LANG_EXTENSION_MAP.
   */
  public static getStatusReport(): Record<
    string,
    { status: 'available' | 'unavailable'; reason?: string }
  > {
    const report: Record<string, { status: 'available' | 'unavailable'; reason?: string }> = {};

    for (const config of Object.values(LANG_EXTENSION_MAP)) {
      const langName = config.ruleName;
      if (report[langName]) {
        continue;
      }

      if (!config.loader) {
        report[langName] = { status: 'available' };
        continue;
      }

      const packageName = config.packageName ?? String(config.langKey);
      const unavailableReason = this.unavailablePackages.get(packageName);
      if (unavailableReason) {
        report[langName] = { status: 'unavailable', reason: unavailableReason };
      } else {
        // If we haven't loaded yet, it's not strictly 'available', but we assume intent is availability
        // until proven otherwise by ensureDynamicLanguagesRegistered.
        report[langName] = {
          status: this.dynamicRegistered ? 'available' : 'unavailable',
          reason: this.dynamicRegistered ? undefined : 'Registry not yet initialized',
        };
      }
    }

    return report;
  }
}
