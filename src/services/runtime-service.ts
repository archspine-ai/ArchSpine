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
import { resolveEnabledViews, resolveViewLayer } from './view/index.js';
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
  scanPolicy: ReturnType<Config['getScanPolicy']>;
}

interface CheckLikeServiceOptions {
  rootDir: string;
  llmClient: RuntimeServiceDependencies['llmClient'];
  scanPolicy: RuntimeServiceDependencies['scanPolicy'];
}

function resolveSummarizationRuntimeOption(envName: string, fallback: number): number {
  return parsePositiveIntegerEnv(process.env[envName]) ?? fallback;
}

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
    _command: RuntimeCommand,
    overrides: LLMRuntimeOverrides = {},
  ): ResolvedExecutionProfile {
    return resolveExecutionProfileFromSettings(this.getResolvedLLMSettings(overrides));
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
      scanPolicy: this.config.getScanPolicy(),
    };
  }

  private buildCheckLikeServiceOptions(
    _command: Exclude<RuntimeCommand, 'sync'>,
    overrides: LLMRuntimeOverrides,
  ): CheckLikeServiceOptions {
    const runtime = this.createRuntimeDependencies(overrides);
    return {
      rootDir: this.rootDir,
      llmClient: runtime.llmClient,
      scanPolicy: runtime.scanPolicy,
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
          scanPolicy: this.config.getScanPolicy(),
        };
    const viewLayer = resolveViewLayer(this.config);
    const enabledViews = resolveEnabledViews(this.config);

    return {
      rootDir: this.rootDir,
      config: this.config,
      llmClient: runtime.llmClient,
      resolvedLLMSettings: runtime.resolvedLLMSettings,
      scanPolicy: runtime.scanPolicy,
      summarizeConcurrency: resolveSummarizationRuntimeOption('SPINE_SUMMARIZE_CONCURRENCY', 10),
      summarizeRetryLimit: resolveSummarizationRuntimeOption('SPINE_SUMMARIZE_RETRIES', 2),
      viewLayer: viewLayer.value,
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

  public getCheckService(overrides: LLMRuntimeOverrides = {}, fresh = false): CheckService {
    return new CheckService({ ...this.createCheckServiceOptions(overrides), fresh });
  }

  public getFixService(
    overrides: LLMRuntimeOverrides = {},
    skipConfirmation = false,
    dryRun = false,
  ): FixService {
    return new FixService({ ...this.createFixServiceOptions(overrides), skipConfirmation, dryRun });
  }
}
