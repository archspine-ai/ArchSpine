import { ArtifactStrategy, HookSyncMode, SupportedConfigKey } from './types.js';

export interface ConfigSupportedValueAccess {
  getLLMProvider(): string | undefined;
  getLLMModel(): string | undefined;
  getLLMBaseURL(): string | undefined;
  isPreCommitEnabled(): boolean;
  getHookSyncMode(): HookSyncMode;
  getArtifactStrategy(): ArtifactStrategy | undefined;
  getViewLayer(): boolean | undefined;
  getConfiguredEnabledViews(): string[] | undefined;
  getInitArtifactStrategy(): ArtifactStrategy | undefined;
  getAgentInstructionsFile(): string | undefined;
  isAgentInstructionsCreatedByArchSpine(): boolean;
  isGitIgnoreManaged(): boolean;
  isGitIgnoreCreatedByArchSpine(): boolean;
  isGitAttributesManaged(): boolean;
  isGitAttributesCreatedByArchSpine(): boolean;
  isSpineIgnoreManaged(): boolean;
  isSpineIgnoreCreatedByArchSpine(): boolean;
  isSearchIgnoreManaged(): boolean;
  isSearchIgnoreCreatedByArchSpine(): boolean;
  getInjectedPackageScripts(): string[];
  setLLMProvider(provider?: string): void;
  setLLMModel(model?: string): void;
  setLLMBaseURL(baseURL?: string): void;
  setPreCommitEnabled(enabled: boolean): void;
  setHookSyncMode(mode: HookSyncMode): void;
  setArtifactStrategy(strategy?: ArtifactStrategy): void;
  setViewLayer(enabled?: boolean): void;
  setEnabledViews(viewIds?: string[]): void;
  setInitArtifactStrategy(strategy?: ArtifactStrategy): void;
  setAgentInstructionsFile(fileName?: string): void;
  setAgentInstructionsCreatedByArchSpine(created: boolean): void;
  setGitIgnoreManaged(managed: boolean): void;
  setGitIgnoreCreatedByArchSpine(created: boolean): void;
  setGitAttributesManaged(managed: boolean): void;
  setGitAttributesCreatedByArchSpine(created: boolean): void;
  setSpineIgnoreManaged(managed: boolean): void;
  setSpineIgnoreCreatedByArchSpine(created: boolean): void;
  setSearchIgnoreManaged(managed: boolean): void;
  setSearchIgnoreCreatedByArchSpine(created: boolean): void;
  setInjectedPackageScripts(scripts: string[]): void;
}

export function getSupportedValue(
  access: ConfigSupportedValueAccess,
  key: SupportedConfigKey,
): unknown {
  switch (key) {
    case 'llm.provider':
      return access.getLLMProvider();
    case 'llm.model':
      return access.getLLMModel();
    case 'llm.baseURL':
      return access.getLLMBaseURL();
    case 'hooks.preCommit':
      return access.isPreCommitEnabled();
    case 'hooks.syncMode':
      return access.getHookSyncMode();
    case 'artifacts.strategy':
      return access.getArtifactStrategy();
    case 'artifacts.viewLayer':
      return access.getViewLayer();
    case 'artifacts.enabledViews':
      return access.getConfiguredEnabledViews();
  }
}

export function setSupportedValue(
  access: ConfigSupportedValueAccess,
  key: SupportedConfigKey,
  value: unknown,
): void {
  switch (key) {
    case 'llm.provider':
      access.setLLMProvider(typeof value === 'string' ? value : undefined);
      return;
    case 'llm.model':
      access.setLLMModel(typeof value === 'string' ? value : undefined);
      return;
    case 'llm.baseURL':
      access.setLLMBaseURL(typeof value === 'string' ? value : undefined);
      return;
    case 'hooks.preCommit':
      access.setPreCommitEnabled(Boolean(value));
      return;
    case 'hooks.syncMode':
      if (value === 'hook') {
        access.setHookSyncMode(value);
        return;
      }
      throw new Error(`Unsupported value for ${key}`);
    case 'artifacts.strategy':
      if (value === 'local' || value === 'distributable' || value === undefined) {
        access.setArtifactStrategy(value as ArtifactStrategy | undefined);
        return;
      }
      throw new Error(`Unsupported value for ${key}`);
    case 'artifacts.viewLayer':
      access.setViewLayer(typeof value === 'boolean' ? value : undefined);
      return;
    case 'artifacts.enabledViews':
      if (Array.isArray(value)) {
        access.setEnabledViews(value.filter((entry): entry is string => typeof entry === 'string'));
        return;
      }
      throw new Error(`Unsupported value for ${key}`);
  }
}
