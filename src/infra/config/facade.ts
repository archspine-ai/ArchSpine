import * as fs from 'fs';
import * as path from 'path';
import { FileSystemManager } from '../../utils/fs.js';
import { resolveScanPolicy, ScanPolicy } from '../../core/scan-policy.js';
import { MCPContextMode } from '../../types/protocol.js';
import {
  SpineConfig,
  BooleanSettingResolution,
  HookSyncMode,
  ArtifactStrategy,
  SupportedConfigKey,
  PromptPolicyTier,
  LLMMode,
  ValidatePolicy,
} from './types.js';
import { loadConfigData } from './loader.js';
import { parseBooleanEnv } from './env.js';
import { resolvePreCommitSetting } from './precommit.js';
import {
  ConfigSupportedValueAccess,
  getSupportedValue as getDelegatedSupportedValue,
  setSupportedValue as setDelegatedSupportedValue,
} from './supported-values.js';

export class Config implements ConfigSupportedValueAccess {
  private configPath: string;
  private data: SpineConfig;

  constructor(rootDir: string) {
    this.configPath = path.join(rootDir, '.spine', 'config.json');
    this.data = loadConfigData(this.configPath);
  }

  private llmConfig(): SpineConfig['llm'] {
    return this.data.llm;
  }

  private mcpConfig(): NonNullable<SpineConfig['mcp']> {
    if (!this.data.mcp) {
      this.data.mcp = {};
    }
    return this.data.mcp;
  }

  private hooksConfig(): NonNullable<SpineConfig['hooks']> {
    if (!this.data.hooks) {
      this.data.hooks = {};
    }
    return this.data.hooks;
  }

  private artifactsConfig(): NonNullable<SpineConfig['artifacts']> {
    if (!this.data.artifacts) {
      this.data.artifacts = {};
    }
    return this.data.artifacts;
  }

  private initStateConfig(): NonNullable<SpineConfig['initState']> {
    if (!this.data.initState) {
      this.data.initState = {};
    }
    return this.data.initState;
  }

  private clearLLMValue<K extends keyof SpineConfig['llm']>(key: K): void {
    delete this.llmConfig()[key];
  }

  private setLLMValue<K extends keyof SpineConfig['llm']>(
    key: K,
    value: SpineConfig['llm'][K],
  ): void {
    this.llmConfig()[key] = value;
  }

  private clearArtifactValue<K extends keyof NonNullable<SpineConfig['artifacts']>>(key: K): void {
    delete this.artifactsConfig()[key];
  }

  private setArtifactValue<K extends keyof NonNullable<SpineConfig['artifacts']>>(
    key: K,
    value: NonNullable<SpineConfig['artifacts']>[K],
  ): void {
    this.artifactsConfig()[key] = value;
  }

  private clearInitStateValue<K extends keyof NonNullable<SpineConfig['initState']>>(key: K): void {
    delete this.initStateConfig()[key];
  }

  private setInitStateValue<K extends keyof NonNullable<SpineConfig['initState']>>(
    key: K,
    value: NonNullable<SpineConfig['initState']>[K],
  ): void {
    this.initStateConfig()[key] = value;
  }

  private saveAfter(mutator: () => void): void {
    mutator();
    this.save();
  }

  public getLanguages(): string[] {
    return this.data.project.locales || ['en-US'];
  }

  public hasPersistedConfig(): boolean {
    return fs.existsSync(this.configPath);
  }

  public getScanPolicy(): ScanPolicy {
    return resolveScanPolicy(this.data.scanPolicy);
  }

  public saveLanguages(locales: string[]): void {
    this.data.project.locales = locales;
    this.save();
  }

  public setLLMProvider(provider?: string): void {
    this.saveAfter(() => {
      if (!provider) {
        this.clearLLMValue('provider');
      } else {
        this.setLLMValue('provider', provider);
      }
    });
  }

  public setLLMModel(model?: string): void {
    this.saveAfter(() => {
      if (!model) {
        this.clearLLMValue('model');
      } else {
        this.setLLMValue('model', model);
      }
    });
  }

  public setLLMBaseURL(baseURL?: string): void {
    this.saveAfter(() => {
      if (!baseURL) {
        this.clearLLMValue('baseURL');
      } else {
        this.setLLMValue('baseURL', baseURL);
      }
    });
  }

  public setPromptTier(promptTier?: PromptPolicyTier): void {
    this.saveAfter(() => {
      if (!promptTier) {
        this.clearLLMValue('promptTier');
      } else {
        this.setLLMValue('promptTier', promptTier);
      }
    });
  }

  public setLLMMode(mode?: LLMMode): void {
    this.saveAfter(() => {
      if (!mode) {
        this.clearLLMValue('mode');
      } else {
        this.setLLMValue('mode', mode);
      }
    });
  }

  public setValidatePolicy(validatePolicy?: ValidatePolicy): void {
    this.saveAfter(() => {
      if (!validatePolicy) {
        this.clearLLMValue('validatePolicy');
      } else {
        this.setLLMValue('validatePolicy', validatePolicy);
      }
    });
  }

  public getLLMProvider(): string | undefined {
    return this.llmConfig().provider;
  }

  public getLLMModel(): string | undefined {
    return this.llmConfig().model;
  }

  public getLLMBaseURL(): string | undefined {
    return this.llmConfig().baseURL;
  }

  public getLLMMode(): LLMMode | undefined {
    return this.llmConfig().mode;
  }

  public getPromptTier(): PromptPolicyTier | undefined {
    return this.llmConfig().promptTier;
  }

  public getValidatePolicy(): ValidatePolicy | undefined {
    return this.llmConfig().validatePolicy;
  }

  public getArtifactStrategy(): ArtifactStrategy | undefined {
    return this.data.artifacts?.strategy;
  }

  public setArtifactStrategy(strategy?: ArtifactStrategy): void {
    this.saveAfter(() => {
      if (!strategy) {
        this.clearArtifactValue('strategy');
      } else {
        this.setArtifactValue('strategy', strategy);
      }
    });
  }

  public getInitArtifactStrategy(): ArtifactStrategy | undefined {
    return this.data.initState?.artifactStrategy;
  }

  public setInitArtifactStrategy(strategy?: ArtifactStrategy): void {
    this.saveAfter(() => {
      if (!strategy) {
        this.clearInitStateValue('artifactStrategy');
      } else {
        this.setInitStateValue('artifactStrategy', strategy);
      }
    });
  }

  public getAgentInstructionsFile(): string | undefined {
    return this.data.initState?.agentInstructionsFile;
  }

  public setAgentInstructionsFile(fileName?: string): void {
    this.saveAfter(() => {
      if (!fileName) {
        this.clearInitStateValue('agentInstructionsFile');
      } else {
        this.setInitStateValue('agentInstructionsFile', fileName);
      }
    });
  }

  public isAgentInstructionsCreatedByArchSpine(): boolean {
    return this.data.initState?.agentInstructionsCreatedByArchSpine === true;
  }

  public setAgentInstructionsCreatedByArchSpine(created: boolean): void {
    this.saveAfter(() => {
      this.setInitStateValue('agentInstructionsCreatedByArchSpine', created);
    });
  }

  public isGitIgnoreManaged(): boolean {
    return this.data.initState?.gitIgnoreManaged === true;
  }

  public setGitIgnoreManaged(managed: boolean): void {
    this.saveAfter(() => {
      this.setInitStateValue('gitIgnoreManaged', managed);
    });
  }

  public isGitIgnoreCreatedByArchSpine(): boolean {
    return this.data.initState?.gitIgnoreCreatedByArchSpine === true;
  }

  public setGitIgnoreCreatedByArchSpine(created: boolean): void {
    this.saveAfter(() => {
      this.setInitStateValue('gitIgnoreCreatedByArchSpine', created);
    });
  }

  public isGitAttributesManaged(): boolean {
    return this.data.initState?.gitAttributesManaged === true;
  }

  public setGitAttributesManaged(managed: boolean): void {
    this.saveAfter(() => {
      this.setInitStateValue('gitAttributesManaged', managed);
    });
  }

  public isGitAttributesCreatedByArchSpine(): boolean {
    return this.data.initState?.gitAttributesCreatedByArchSpine === true;
  }

  public setGitAttributesCreatedByArchSpine(created: boolean): void {
    this.saveAfter(() => {
      this.setInitStateValue('gitAttributesCreatedByArchSpine', created);
    });
  }

  public isSpineIgnoreManaged(): boolean {
    return this.data.initState?.spineIgnoreManaged === true;
  }

  public setSpineIgnoreManaged(managed: boolean): void {
    this.saveAfter(() => {
      this.setInitStateValue('spineIgnoreManaged', managed);
    });
  }

  public isSpineIgnoreCreatedByArchSpine(): boolean {
    return this.data.initState?.spineIgnoreCreatedByArchSpine === true;
  }

  public setSpineIgnoreCreatedByArchSpine(created: boolean): void {
    this.saveAfter(() => {
      this.setInitStateValue('spineIgnoreCreatedByArchSpine', created);
    });
  }

  public isSearchIgnoreManaged(): boolean {
    return this.data.initState?.searchIgnoreManaged === true;
  }

  public setSearchIgnoreManaged(managed: boolean): void {
    this.saveAfter(() => {
      this.setInitStateValue('searchIgnoreManaged', managed);
    });
  }

  public isSearchIgnoreCreatedByArchSpine(): boolean {
    return this.data.initState?.searchIgnoreCreatedByArchSpine === true;
  }

  public setSearchIgnoreCreatedByArchSpine(created: boolean): void {
    this.saveAfter(() => {
      this.setInitStateValue('searchIgnoreCreatedByArchSpine', created);
    });
  }

  public getInjectedPackageScripts(): string[] {
    return Array.isArray(this.data.initState?.injectedPackageScripts)
      ? this.data.initState!.injectedPackageScripts!.filter(
          (entry): entry is string => typeof entry === 'string',
        )
      : [];
  }

  public setInjectedPackageScripts(scripts: string[]): void {
    this.saveAfter(() => {
      this.setInitStateValue('injectedPackageScripts', Array.from(new Set(scripts)));
    });
  }

  public setExperimentalViewLayer(enabled?: boolean): void {
    this.saveAfter(() => {
      if (enabled === undefined) {
        this.clearArtifactValue('experimentalViewLayer');
      } else {
        this.setArtifactValue('experimentalViewLayer', enabled);
      }
    });
  }

  public getConfiguredEnabledViews(): string[] | undefined {
    const value = this.data.artifacts?.enabledViews;
    if (!Array.isArray(value)) {
      return undefined;
    }
    return value.filter((entry): entry is string => typeof entry === 'string');
  }

  public setEnabledViews(viewIds?: string[]): void {
    this.saveAfter(() => {
      if (viewIds === undefined) {
        this.clearArtifactValue('enabledViews');
        return;
      }
      this.setArtifactValue('enabledViews', Array.from(new Set(viewIds)));
    });
  }

  public setPreCommitEnabled(enabled: boolean): void {
    this.saveAfter(() => {
      this.hooksConfig().preCommit = enabled;
    });
  }

  public setHookSyncMode(mode: HookSyncMode): void {
    this.saveAfter(() => {
      this.hooksConfig().syncMode = mode;
    });
  }

  public getHookSyncMode(): HookSyncMode {
    const mode = this.data.hooks?.syncMode;
    if (mode === 'hook' || mode === 'standard' || mode === 'heavy') {
      return mode;
    }
    return 'hook';
  }

  public getMCPContextMode(): MCPContextMode {
    const mode = this.data.mcp?.contextMode;
    if (mode === 'project-first' || mode === 'search-first' || mode === 'off') {
      return mode;
    }
    return 'off';
  }

  public getExperimentalViewLayer(): boolean | undefined {
    return this.data.artifacts?.experimentalViewLayer;
  }

  public getSupportedValue(key: SupportedConfigKey): unknown {
    return getDelegatedSupportedValue(this, key);
  }

  public setSupportedValue(key: SupportedConfigKey, value: unknown): void {
    setDelegatedSupportedValue(this, key, value);
  }

  public isPreCommitEnabled(): boolean {
    return resolvePreCommitSetting(this.data.hooks?.preCommit).value;
  }

  public getPreCommitResolution(): BooleanSettingResolution {
    return resolvePreCommitSetting(this.data.hooks?.preCommit);
  }

  public static parseBooleanEnv(value: string | undefined): boolean | undefined {
    return parseBooleanEnv(value);
  }

  public save(): void {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    FileSystemManager.safeWriteFile(this.configPath, JSON.stringify(this.data, null, 2));
  }
}
