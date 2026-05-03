The `config/` directory is the centralized configuration management module of the ArchSpine mirror system. It provides the entire lifecycle of configuration: default values, loading from disk, validation, environment variable parsing, runtime read/write access, and supported value enumeration.

**Key submodules and their roles:**

- `defaults.ts` – Constructs a fully populated default `SpineConfig` object (with schema version, scan policy, project metadata, empty LLM/MCP stubs).
- `env.ts` – Exposes environment variable parsing utilities (`parseBooleanEnv`, `parsePositiveIntegerEnv`) and the canonical variable name `SPINE_PRECOMMIT`.
- `precommit.ts` – Resolves the pre-commit hook enablement setting from the environment variable, with an explicit fallback.
- `loader.ts` – Reads configuration from a file path, merges with defaults, and validates the payload via `validation.ts`.
- `validation.ts` – Validates an unknown payload against the core configuration schema, returning a typed `SpineConfig` or null with structured warnings.
- `facade.ts` – The runtime configuration store; a facade over `loader.ts` and `supported-values.ts` that provides read/write access, scan policy resolution, LLM config management, and persistence.
- `supported-values.ts` – Defines the `ConfigSupportedValueAccess` interface and provides getter/setter functions for all user-configurable system parameters.
- `types.ts` – Centralized type definitions: re-exports `SpineConfig`, defines `BooleanSettingResolution`, `HookSyncMode`, `ArtifactStrategy`, and the `SupportedConfigKey` union.

**Implementation areas that matter most:** Environment variable governance (env, precommit), config loading and merging (loader, validation), and the runtime facade (facade) that coordinates all operations and persists changes.