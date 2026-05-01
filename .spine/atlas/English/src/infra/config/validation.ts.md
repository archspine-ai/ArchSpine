<!-- spine-content-hash:5bd0d2245014d581cfabba9e42c446bfa62509f66e9283d91698d5a506dd1b3e -->
# ArchSpine – Configuration Validation Facade

## Role
Infrastructure validation facade for Spine configuration payloads.

## Key Responsibilities
- Validates an unknown payload against the Spine configuration schema using the core config-schema resolver.
- Returns a typed `SpineConfig` object on successful validation, or `null` on failure.
- Produces a structured warning message to the console when validation fails, detailing the config path and issues.
- Provides helper functions to build formatted warning strings for validation and parse failures using `ErrorCodes.ConfigParseFailed`.

## Out of Scope
- Parsing or reading configuration files from disk.
- Loading or resolving configuration from external sources.
- Orchestrating service or task initialization.
- Handling runtime configuration reload or hot-reload logic.

## Invariants
- Infra modules must expose stable low-level capabilities and facades, not absorb service/task/engine orchestration concerns (Rule: `infra-facade-imports`).
- Callers should prefer public infra facades over reaching into deep private implementation paths when a facade exists (Rule: `infra-facade-imports`).

## Public Surface
- `validateConfigPayload(configPath: string, payload: unknown): SpineConfig | null`
- `buildConfigValidationWarning(configPath: string, issues: string[]): string`
- `buildConfigParseWarning(configPath: string, reason: string): string`

## Change Intent
- **Architectural Intent:** Provide a stable, low-level validation facade for Spine configuration payloads that decouples config validation from higher-level orchestration logic.
- **Recent Change Intent:** Fix lint warnings and type errors, and add CI workflow (no direct impact on this file's logic).

## Drift Detection
- **Drift Detected:** No
- **Drift Reason:** None
- **Rule Violations:** None