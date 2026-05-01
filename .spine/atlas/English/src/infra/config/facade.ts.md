<!-- spine-content-hash:5618ec2cd7d4aadcaf616c3f7873b797f31dcc4a9c4525bb6797a7a8d669aecb -->
# ArchSpine Configuration Manager

## Role
Infrastructure configuration manager providing centralized access and mutation for the ArchSpine project's runtime settings.

## Key Responsibilities
- Loads and validates configuration data from the filesystem using the config loader.
- Resolves scan policies by delegating to the core scan-policy resolver.
- Manages LLM configuration values including setting, clearing, and persisting changes.
- Handles artifact and initialization state configuration sections.
- Parses boolean environment variables for configuration resolution.
- Resolves pre-commit hook settings via dedicated resolver.

## Notable Invariants
- Configuration data must be loaded and validated before any access.
- Scan policies must be resolved through the core scan-policy resolver.
- LLM configuration changes must be persisted to the filesystem.
- All configuration access must go through the public facade methods.

## Negative Scope (Out of Scope)
- Direct filesystem I/O operations (delegated to FileSystemManager).
- Core scan policy logic (delegated to core/scan-policy).
- Low-level environment variable parsing (delegated to env.ts).
- Pre-commit hook implementation details (delegated to precommit.ts).

## Most Important Exported / Public Surface
- `loadConfigData` – Load and validate configuration from filesystem.
- `resolveScanPolicy` – Resolve scan policies via core resolver.
- `parseBooleanEnv` – Parse boolean environment variables.
- `resolvePreCommitSetting` – Resolve pre-commit hook settings.
- `SpineConfig` – Configuration data type.
- `BooleanSettingResolution` – Boolean setting resolution type.
- `HookSyncMode` – Hook synchronization mode type.
- `ArtifactStrategy` – Artifact strategy type.
- `SupportedConfigKey` – Supported configuration key type.
- `PromptPolicyTier` – Prompt policy tier type.
- `LLMMode` – LLM mode type.
- `ValidatePolicy` – Validation policy type.

## Architectural Intent
Provide a stable infrastructure facade for configuration management, isolating runtime settings from core orchestration logic.

## Recent Change Intent
Resolve lint errors and finalize pipeline fixes before v1.0, ensuring configuration manager adheres to project standards.