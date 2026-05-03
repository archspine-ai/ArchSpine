## Configuration Management Layer (`config/`)

This directory implements the **configuration management layer** for the ArchSpine system. It handles the lifecycle of all configuration settings: definition of defaults, loading from disk, environment variable parsing, validation against a schema, runtime read/write access, and persistence of user overrides. The layer is designed to be a central, type-safe gateway for the rest of the system to obtain a fully resolved `SpineConfig` object.

### Notable Children & Grouping

- **Core types and defaults:**  
  `types.ts` – Centralizes configuration interfaces (`SpineConfig`, `BooleanSettingResolution`, `HookSyncMode`, `ArtifactStrategy`, `SupportedConfigKey`).  
  `defaults.ts` – Factory module that constructs and returns a default `SpineConfig` object using the current schema version, default scan policy, and empty stubs for LLM and MCP.

- **Environment and pre‑commit handling:**  
  `env.ts` – Utilities for parsing environment variables (e.g., `parseBooleanEnv`, `parsePositiveIntegerEnv`) and defines the canonical `PRE_COMMIT_ENV_VAR` name.  
  `precommit.ts` – Resolves the pre‑commit hook setting from the environment variable, falling back to an explicit parameter; returns a typed `BooleanSettingResolution`.

- **Loading and validation:**  
  `loader.ts` – Reads configuration from a JSON file, parses it, validates the structure, and merges with defaults via a shallow‑to‑moderately deep merge (arrays are replaced). Emits human‑readable warnings on parse errors.  
  `validation.ts` – Facade that validates an unknown payload against the core config schema, returning a typed `SpineConfig` or `null` with structured warnings.

- **Runtime access and mutation:**  
  `facade.ts` – Centralized configuration store providing read/write access. Loads/writes persisted config data, resolves scan policies, manages LLM settings, and handles artifact strategy / initialization state. Implements the `ConfigSupportedValueAccess` interface.  
  `supported-values.ts` – Defines the type‑safe interface and implementation (`getSupportedValue`, `setSupportedValue`) for accessing and mutating all user‑configurable parameters (LLM settings, validation policies, hook modes, etc.).

### Key Implementation Areas

- **Schema‑driven validation:** Configuration payloads are validated against the core config‑schema resolver, ensuring structural integrity before any runtime usage.
- **Environment variable integration:** Boolean and positive‑integer settings can be overridden via environment variables with safe parsing and fallback logic.
- **Layered defaults and overrides:** A merge strategy that combines built‑in defaults with user‑supplied overrides, stopping at arrays to prevent unintended deep merging.
- **Runtime configuration store:** `facade.ts` acts as a single point of contact for other modules to read/write configuration values, with persistence to disk.
- **Pre‑commit hook governance:** The pre‑commit setting can be forced via an environment variable, giving DevOps control without modifying config files.