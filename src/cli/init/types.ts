import { Config } from '../../infra/config.js';
import { RuntimeService } from '../../services/runtime-service.js';
import type { LanguageSnapshot } from '../../types/protocol.js';

export type LLMScope = 'global' | 'project';
export type HookSetupStatus = 'enabled' | 'disabled' | 'skipped-no-git-root';
export type ArtifactStrategy = 'local' | 'distributable';

export interface InitSharedOptions {
  rootDir: string;
  config: Config;
  runtimeService: RuntimeService;
  printStep: (message: string, options?: { inline?: boolean }) => void;
  promptForImmediateConfirmation: (
    message: string,
    options?: { skipNewline?: boolean },
  ) => Promise<boolean>;
}

export interface RepositoryBootstrapOptions extends InitSharedOptions {
  artifactStrategyArg?: ArtifactStrategy;
  requestedAgentFile?: string;
  injectPackageScriptsArg?: boolean;
}

export interface RepositoryBootstrapResult {
  installRules: boolean;
  hookSetupStatus: HookSetupStatus;
}

export interface RuntimeBootstrapOptions extends InitSharedOptions {
  printLanguageDiscovery: (snapshot: LanguageSnapshot) => void;
  promptForInitLLMScope: () => Promise<LLMScope | undefined>;
  promptForLLMSetup: (scope: LLMScope) => Promise<boolean>;
}
