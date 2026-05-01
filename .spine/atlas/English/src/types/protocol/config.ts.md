<!-- spine-content-hash:9de50da33880a4731fa18dbd18149828eb34d6c474d290296d40d3136b3fcb64 -->
# ArchSpine Configuration Schema (`SpineConfig`)

This TypeScript interface defines the central configuration schema for the ArchSpine mirror system. It serves as the primary contract for system configuration, decoupling configuration structure from implementation details.

## Key Responsibilities

- Declares the structure for the system's root configuration object (`SpineConfig`).
- Specifies required schema version and project metadata (name, locales).
- Defines optional LLM integration settings (provider, model, baseURL, mode).
- Exports the `MCPContextMode` type for context mode discrimination.

## Notable Invariants

- Exports `SpineConfig` as the primary configuration contract.
- Relies on imported types (`PartialScanPolicy`, `SchemaVersion`) for type safety.
- Defines a nested structure for project and LLM settings.

## Out of Scope

- Implementing configuration validation or parsing logic.
- Providing default values or environment variable binding.
- Handling runtime configuration updates or dynamic reloading.

## Public Surface

- `SpineConfig` interface
- `MCPContextMode` type

## Rule Violations

- **interface-prefix** (warning): Interface `SpineConfig` does not start with the character `I` as required by the interface-prefix rule for internal interfaces.

## Drift Detection

- **Drift detected:** No
- **Drift reason:** None