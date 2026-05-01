<!-- spine-content-hash:599d9b8a15edc6a5a0771536936a1388d2cbf9d2f6f2c3fbb14280634f8422ea -->
# ArchSpine Default Configuration Factory

## Role
This module serves as a configuration factory that provides a default `SpineConfig` object for the ArchSpine system. It is the single source for creating a baseline configuration that all other parts of the system can rely on.

## Key Responsibilities
- Constructs and returns a default `SpineConfig` object with predefined values.
- Ensures the configuration always uses the current schema version (`CURRENT_CONFIG_SCHEMA_VERSION`).
- Integrates the default scan policy (`DEFAULT_SCAN_POLICY`) into the configuration.

## Notable Invariants
- The returned `SpineConfig` must always include `CURRENT_CONFIG_SCHEMA_VERSION`.
- The returned `SpineConfig` must always include `DEFAULT_SCAN_POLICY`.
- The project name defaults to `'unnamed-project'` and locales to `['en-US']`.

## Negative Scope (What This Module Does NOT Do)
- Does **not** perform configuration validation or schema enforcement.
- Does **not** load configuration from external sources (e.g., files, environment variables).
- Does **not** allow runtime modification of configuration after creation.

## Most Important Exported Behavior
The only public surface is the function `createDefaultConfig()`, which returns a fully populated `SpineConfig` object with all defaults applied.