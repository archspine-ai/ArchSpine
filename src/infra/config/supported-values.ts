import { ArtifactStrategy, HookSyncMode, PromptPolicyTier, SupportedConfigKey } from './types.js';

export interface ConfigSupportedValueAccess {
  getLLMProvider(): string | undefined;
  getLLMModel(): string | undefined;
  getLLMBaseURL(): string | undefined;
  getLLMMode(): 'standard' | 'heavy' | undefined;
  getPromptTier(): PromptPolicyTier | undefined;
  getValidatePolicy(): 'default' | 'strict' | undefined;
  isPreCommitEnabled(): boolean;
  getHookSyncMode(): HookSyncMode;
  getArtifactStrategy(): ArtifactStrategy | undefined;
  getExperimentalViewLayer(): boolean | undefined;
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
  setLLMMode(mode?: 'standard' | 'heavy'): void;
  setPromptTier(promptTier?: PromptPolicyTier): void;
  setValidatePolicy(validatePolicy?: 'default' | 'strict'): void;
  setPreCommitEnabled(enabled: boolean): void;
  setHookSyncMode(mode: HookSyncMode): void;
  setArtifactStrategy(strategy?: ArtifactStrategy): void;
  setExperimentalViewLayer(enabled?: boolean): void;
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
    case 'llm.mode':
      return access.getLLMMode();
    case 'llm.promptTier':
      return access.getPromptTier();
    case 'llm.validatePolicy':
      return access.getValidatePolicy();
    case 'hooks.preCommit':
      return access.isPreCommitEnabled();
    case 'hooks.syncMode':
      return access.getHookSyncMode();
    case 'artifacts.strategy':
      return access.getArtifactStrategy();
    case 'artifacts.experimentalViewLayer':
      return access.getExperimentalViewLayer();
    case 'artifacts.enabledViews':
      return access.getConfiguredEnabledViews();
    case 'initState.artifactStrategy':
      return access.getInitArtifactStrategy();
    case 'initState.agentInstructionsFile':
      return access.getAgentInstructionsFile();
    case 'initState.agentInstructionsCreatedByArchSpine':
      return access.isAgentInstructionsCreatedByArchSpine();
    case 'initState.gitIgnoreManaged':
      return access.isGitIgnoreManaged();
    case 'initState.gitIgnoreCreatedByArchSpine':
      return access.isGitIgnoreCreatedByArchSpine();
    case 'initState.gitAttributesManaged':
      return access.isGitAttributesManaged();
    case 'initState.gitAttributesCreatedByArchSpine':
      return access.isGitAttributesCreatedByArchSpine();
    case 'initState.spineIgnoreManaged':
      return access.isSpineIgnoreManaged();
    case 'initState.spineIgnoreCreatedByArchSpine':
      return access.isSpineIgnoreCreatedByArchSpine();
    case 'initState.searchIgnoreManaged':
      return access.isSearchIgnoreManaged();
    case 'initState.searchIgnoreCreatedByArchSpine':
      return access.isSearchIgnoreCreatedByArchSpine();
    case 'initState.injectedPackageScripts':
      return access.getInjectedPackageScripts();
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
    case 'llm.mode':
      access.setLLMMode(value === 'standard' || value === 'heavy' ? value : undefined);
      return;
    case 'llm.promptTier':
      if (value === 'lite' || value === 'balanced' || value === undefined) {
        access.setPromptTier(value as PromptPolicyTier);
        return;
      }
      throw new Error(`Unsupported value for ${key}`);
    case 'llm.validatePolicy':
      access.setValidatePolicy(value === 'default' || value === 'strict' ? value : undefined);
      return;
    case 'hooks.preCommit':
      access.setPreCommitEnabled(Boolean(value));
      return;
    case 'hooks.syncMode':
      if (value === 'hook' || value === 'standard' || value === 'heavy') {
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
    case 'artifacts.experimentalViewLayer':
      access.setExperimentalViewLayer(typeof value === 'boolean' ? value : undefined);
      return;
    case 'artifacts.enabledViews':
      if (Array.isArray(value)) {
        access.setEnabledViews(value.filter((entry): entry is string => typeof entry === 'string'));
        return;
      }
      throw new Error(`Unsupported value for ${key}`);
    case 'initState.artifactStrategy':
      if (value === 'local' || value === 'distributable' || value === undefined) {
        access.setInitArtifactStrategy(value as ArtifactStrategy | undefined);
        return;
      }
      throw new Error(`Unsupported value for ${key}`);
    case 'initState.agentInstructionsFile':
      access.setAgentInstructionsFile(typeof value === 'string' ? value : undefined);
      return;
    case 'initState.agentInstructionsCreatedByArchSpine':
      access.setAgentInstructionsCreatedByArchSpine(Boolean(value));
      return;
    case 'initState.gitIgnoreManaged':
      access.setGitIgnoreManaged(Boolean(value));
      return;
    case 'initState.gitIgnoreCreatedByArchSpine':
      access.setGitIgnoreCreatedByArchSpine(Boolean(value));
      return;
    case 'initState.gitAttributesManaged':
      access.setGitAttributesManaged(Boolean(value));
      return;
    case 'initState.gitAttributesCreatedByArchSpine':
      access.setGitAttributesCreatedByArchSpine(Boolean(value));
      return;
    case 'initState.spineIgnoreManaged':
      access.setSpineIgnoreManaged(Boolean(value));
      return;
    case 'initState.spineIgnoreCreatedByArchSpine':
      access.setSpineIgnoreCreatedByArchSpine(Boolean(value));
      return;
    case 'initState.searchIgnoreManaged':
      access.setSearchIgnoreManaged(Boolean(value));
      return;
    case 'initState.searchIgnoreCreatedByArchSpine':
      access.setSearchIgnoreCreatedByArchSpine(Boolean(value));
      return;
    case 'initState.injectedPackageScripts':
      if (Array.isArray(value)) {
        access.setInjectedPackageScripts(
          value.filter((entry): entry is string => typeof entry === 'string'),
        );
        return;
      }
      throw new Error(`Unsupported value for ${key}`);
  }
}
