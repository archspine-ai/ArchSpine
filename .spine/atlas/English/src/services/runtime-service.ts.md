<!-- spine-content-hash:6fbef8331f21b225768da576deb2de42e9aa14ae95d62cec75ab1b005caef80e -->
# ArchSpine RuntimeService — Service Layer Facade

## Role
`RuntimeService` is the central orchestration facade for the ArchSpine runtime. It resolves execution profiles, LLM settings, and view configurations, and constructs domain service instances (`CheckService`, `FixService`, `SyncService`). It decouples service instantiation from CLI or UI layers, providing consistent dependency injection.

## Key Responsibilities
- **LLM Settings Resolution**: Merges global configuration, secrets, and runtime overrides via `resolveLLMSettings` and `createResolvedLLMClient`.
- **Execution Profile Construction**: Integrates prompt policies, validation profiles, and generation strategies via `resolveExecutionProfileFromSettings`.
- **View Layer Determination**: Identifies enabled and experimental view layers for the runtime environment via `resolveEnabledViews` and `resolveExperimentalViewLayer`.
- **Centralized Configuration Access**: Provides access to language configurations and scan policies from the global config.
- **Domain Service Instantiation**: Builds and exposes `CheckService`, `FixService`, and `SyncService` instances with appropriate runtime options.
- **Environment Variable Parsing**: Parses positive integer environment variables for runtime configuration via `parsePositiveIntegerEnv`.

## Notable Invariants
- `RuntimeService` must be instantiated with a valid root directory path.
- LLM settings resolution depends on `Config`, `Secrets`, `GlobalLLMConfig`, and `GlobalLLMSecrets` being properly initialized.
- Execution profile resolution requires a valid `RuntimeCommand` and LLM settings.
- View layer resolution is independent of LLM configuration but depends on `Config`.

## Out of Scope
- Direct database or persistence operations.
- Low-level LLM API calls or token management.
- File system scanning or AST parsing logic.
- User interface rendering or CLI command handling.

## Public Surface
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

## Change Intent
The architectural intent is to provide a centralized runtime orchestration facade that decouples service instantiation from CLI or UI layers, enabling consistent dependency injection for Check, Fix, and Sync services. Recent changes (e.g., "gogogo") suggest rapid iteration to concretize the service by wiring up actual domain services rather than just resolving settings.