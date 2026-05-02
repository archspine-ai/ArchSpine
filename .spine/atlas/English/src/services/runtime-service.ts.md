<!-- spine-content-hash:0f9da658177ecf6ab39e4b4a74d6dd6c50c78e54f02a62c3b5c5974b63c46344 -->
# RuntimeService - ArchSpine Runtime Orchestration Facade

**Role**: Service layer facade for runtime orchestration that resolves execution profiles, LLM settings, view configurations, and constructs domain service instances (Check, Fix, Sync) in the ArchSpine system.

## Key Responsibilities

- Resolves LLM client settings by merging global configuration, secrets, and runtime overrides via `resolveLLMSettings` and `createResolvedLLMClient`.
- Constructs a resolved execution profile integrating prompt policies, validation profiles, and generation strategies via `resolveExecutionProfileFromSettings`.
- Determines enabled and experimental view layers for the runtime environment via `resolveEnabledViews` and `resolveExperimentalViewLayer`.
- Provides centralized access to language configurations and scan policies from the global config.
- Builds and exposes `CheckService`, `FixService`, and `SyncService` instances with appropriate options for runtime execution.
- Parses positive integer environment variables for runtime configuration via `parsePositiveIntegerEnv`.

## Out of Scope (Negative Scope)

- Direct database or persistence operations.
- Low-level LLM API calls or token management.
- File system scanning or AST parsing logic.
- User interface rendering or CLI command handling.

## Invariants

- `RuntimeService` must be instantiated with a valid root directory path.
- LLM settings resolution depends on `Config`, `Secrets`, `GlobalLLMConfig`, and `GlobalLLMSecrets` being properly initialized.
- Execution profile resolution requires a valid `RuntimeCommand` and LLM settings.
- View layer resolution is independent of LLM configuration but depends on `Config`.

## Public Surface (Exported Behavior)

- `class RuntimeService`
- `RuntimeService.constructor(rootDir: string)`
- `RuntimeService.getResolvedLLMSettings(): ResolvedLLMSettings`
- `RuntimeService.getResolvedExecutionProfile(): ResolvedExecutionProfile`
- `RuntimeService.getEnabledViews(): string[]`
- `RuntimeService.getExperimentalViewLayer(): string | null`
- `RuntimeService.getLanguages(): string[]`
- `RuntimeService.getScanPolicy(): any`
- `RuntimeService.createCheckService(options?: CheckServiceOptions): CheckService`
- `RuntimeService.createFixService(options?: FixServiceOptions): FixService`
- `RuntimeService.createSyncService(): SyncService`