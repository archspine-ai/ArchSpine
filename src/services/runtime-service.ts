import { Config } from '../infra/config.js';
import { parsePositiveIntegerEnv } from '../infra/config/env.js';
import {
  createResolvedLLMClient,
  GlobalLLMConfig,
  GlobalLLMSecrets,
  type LLMRuntimeOverrides,
  type ResolvedLLMSettings,
  resolveLLMSettings,
} from '../infra/llm.js';
import { resolveEnabledViews, resolveExperimentalViewLayer } from './view/index.js';
import type { GenerationFlow, PromptPolicyTier, ValidatePolicy } from '../infra/prompt-policy.js';
import { Secrets } from '../infra/secrets.js';
import { SyncService } from './sync-service.js';
import { CheckService, type CheckServiceOptions } from './check-service.js';
import { FixService, type FixServiceOptions } from './fix-service.js';
import {
  resolveExecutionProfileFromSettings,
  type ResolvedExecutionProfile,
  type RuntimeCommand,
} from './runtime-execution-profile.js';

interface RuntimeServiceDependencies {
  llmClient: ReturnType<typeof createResolvedLLMClient>['llmClient'];
  resolvedLLMSettings: ReturnType<typeof createResolvedLLMClient>['resolved'];
  targetLocales: string[];
  scanPolicy: ReturnType<Config['getScanPolicy']>;
}

interface CheckLikeServiceOptions {
  rootDir: string;
  llmClient: RuntimeServiceDependencies['llmClient'];
  scanPolicy: RuntimeServiceDependencies['scanPolicy'];
  promptTier: PromptPolicyTier;
  validatePolicy: ValidatePolicy;
  generationFlow: GenerationFlow;
}

function resolveSummarizationRuntimeOption(envName: string, fallback: number): number {
  return parsePositiveIntegerEnv(process.env[envName]) ?? fallback;
}

/**
 * RuntimeService is the frozen hand-off point between CLI/engines and runtime-aware
 * services. New proposal/review/agent entrypoints should be added here or next to it
 * instead of growing infra/llm/runtime.ts.
 */
export class RuntimeService {
  constructor(
    private readonly rootDir: string,
    private readonly config: Config = new Config(rootDir),
    private readonly secrets: Secrets = new Secrets(rootDir),
    private readonly globalConfig: GlobalLLMConfig = new GlobalLLMConfig(),
    private readonly globalSecrets: GlobalLLMSecrets = new GlobalLLMSecrets(),
  ) {}

  public getResolvedLLMSettings(overrides: LLMRuntimeOverrides = {}): ResolvedLLMSettings {
    return resolveLLMSettings(
      this.config,
      this.secrets,
      this.globalConfig,
      this.globalSecrets,
      overrides,
    );
  }

  public getResolvedLLMClient(
    overrides: LLMRuntimeOverrides = {},
  ): Pick<RuntimeServiceDependencies, 'llmClient' | 'resolvedLLMSettings'> {
    const runtime = this.createRuntimeDependencies(overrides);
    return {
      llmClient: runtime.llmClient,
      resolvedLLMSettings: runtime.resolvedLLMSettings,
    };
  }

  public getResolvedExecutionProfile(
    command: RuntimeCommand,
    overrides: LLMRuntimeOverrides = {},
  ): ResolvedExecutionProfile {
    return resolveExecutionProfileFromSettings(this.getResolvedLLMSettings(overrides), command);
  }

  private createRuntimeDependencies(overrides: LLMRuntimeOverrides): RuntimeServiceDependencies {
    const runtime = createResolvedLLMClient(
      this.config,
      this.secrets,
      this.globalConfig,
      this.globalSecrets,
      overrides,
    );
    return {
      llmClient: runtime.llmClient,
      resolvedLLMSettings: runtime.resolved,
      targetLocales: this.config.getLanguages(),
      scanPolicy: this.config.getScanPolicy(),
    };
  }

  private buildCheckLikeServiceOptions(
    command: Exclude<RuntimeCommand, 'sync'>,
    overrides: LLMRuntimeOverrides,
  ): CheckLikeServiceOptions {
    const runtime = this.createRuntimeDependencies(overrides);
    const profile = this.getResolvedExecutionProfile(command, overrides);
    return {
      rootDir: this.rootDir,
      llmClient: runtime.llmClient,
      scanPolicy: runtime.scanPolicy,
      promptTier: profile.promptProfile,
      validatePolicy: profile.validationProfile,
      generationFlow: profile.generationFlow,
    };
  }

  private createSyncServiceOptions(
    overrides: LLMRuntimeOverrides = {},
    options: { requireLLMClient?: boolean } = {},
  ): ConstructorParameters<typeof SyncService>[0] {
    const requireLLMClient = options.requireLLMClient !== false;
    const runtime = requireLLMClient
      ? this.createRuntimeDependencies(overrides)
      : {
          llmClient: undefined,
          resolvedLLMSettings: this.getResolvedLLMSettings(overrides),
          targetLocales: this.config.getLanguages(),
          scanPolicy: this.config.getScanPolicy(),
        };
    const profile = this.getResolvedExecutionProfile('sync', overrides);
    const experimentalViewLayer = resolveExperimentalViewLayer(this.config);
    const enabledViews = resolveEnabledViews(this.config);

    return {
      rootDir: this.rootDir,
      llmClient: runtime.llmClient,
      resolvedLLMSettings: runtime.resolvedLLMSettings,
      targetLocales: runtime.targetLocales,
      scanPolicy: runtime.scanPolicy,
      promptTier: profile.promptProfile,
      summarizeConcurrency: resolveSummarizationRuntimeOption('SPINE_SUMMARIZE_CONCURRENCY', 10),
      summarizeRetryLimit: resolveSummarizationRuntimeOption('SPINE_SUMMARIZE_RETRIES', 2),
      experimentalViewLayer: experimentalViewLayer.value,
      enabledViews: enabledViews.value,
      invalidEnabledViews: enabledViews.unknown,
    };
  }

  private createCheckServiceOptions(overrides: LLMRuntimeOverrides = {}): CheckServiceOptions {
    return this.buildCheckLikeServiceOptions('check', overrides);
  }

  private createFixServiceOptions(overrides: LLMRuntimeOverrides = {}): FixServiceOptions {
    return this.buildCheckLikeServiceOptions('fix', overrides);
  }

  public getSyncService(overrides: LLMRuntimeOverrides = {}): SyncService {
    return new SyncService(this.createSyncServiceOptions(overrides));
  }

  public getSyncStatusService(overrides: LLMRuntimeOverrides = {}): SyncService {
    return new SyncService(this.createSyncServiceOptions(overrides, { requireLLMClient: false }));
  }

  public getCheckService(overrides: LLMRuntimeOverrides = {}): CheckService {
    return new CheckService(this.createCheckServiceOptions(overrides));
  }

  public getFixService(
    overrides: LLMRuntimeOverrides = {},
    skipConfirmation = false,
    dryRun = false,
  ): FixService {
    return new FixService({ ...this.createFixServiceOptions(overrides), skipConfirmation, dryRun });
  }
}
