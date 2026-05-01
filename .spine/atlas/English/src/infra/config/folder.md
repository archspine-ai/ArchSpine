<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/config","role":"Configuration management layer for the ArchSpine mirror system.","responsibility":"Provides centralized configuration loading, validation, merging, and runtime access for all ArchSpine system settings, including LLM configuration, scan policies, pre-commit hooks, and artifact strategies.","children":[{"filePath":"src/infra/config/defaults.ts","role":"Configuration factory module providing a default SpineConfig object for the ArchSpine system.","fileKind":"source"},{"filePath":"src/infra/config/env.ts","role":"Infrastructure utility module providing environment variable parsing constants and functions.","fileKind":"source"},{"filePath":"src/infra/config/facade.ts","role":"Infrastructure configuration manager providing centralized access and mutation for the ArchSpine project's runtime settings.","fileKind":"source"},{"filePath":"src/infra/config/loader.ts","role":"Configuration loader and validator for the ArchSpine system, responsible for reading, parsing, validating, and merging configuration files with defaults.","fileKind":"source"},{"filePath":"src/infra/config/precommit.ts","role":"Configuration resolution utility for the pre-commit setting, determining its boolean value from environment variables or explicit parameters.","fileKind":"source"},{"filePath":"src/infra/config/supported-values.ts","role":"Core TypeScript interface defining the contract for accessing supported configuration values within the ArchSpine system.","fileKind":"source"},{"filePath":"src/infra/config/types.ts","role":"Type definition module centralizing configuration interfaces and enums for the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/infra/config/validation.ts","role":"Infrastructure validation facade for Spine configuration payloads.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T04:57:43.045Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/infra/config` — Configuration Management Layer

This directory is the centralized configuration management layer for the ArchSpine mirror system. It is responsible for loading, validating, merging, and providing runtime access to all system settings, including LLM configuration, scan policies, pre-commit hooks, and artifact strategies.

## Notable Children

- **`types.ts`** — Centralizes all configuration interfaces and enums, defining the shape of the `SpineConfig` object and its sub-settings.
- **`defaults.ts`** — Provides a factory function that returns a default `SpineConfig` object, serving as the baseline for all configuration merging.
- **`loader.ts`** — Reads, parses, validates, and merges configuration files with the defaults, acting as the primary entry point for configuration ingestion.
- **`validation.ts`** — A validation facade that checks configuration payloads for correctness before they are applied.
- **`facade.ts`** — The runtime configuration manager that exposes centralized access and mutation methods for all settings during system operation.
- **`env.ts`** — Utility module for parsing environment variables into configuration constants, bridging external inputs with internal settings.
- **`precommit.ts`** — Resolves the pre-commit hook boolean setting from environment variables or explicit parameters.
- **`supported-values.ts`** — Defines the contract for accessing supported configuration values, ensuring type-safe lookups.

## Implementation Areas

- **Configuration Loading & Validation** — The `loader.ts` and `validation.ts` modules form the core pipeline for ingesting and verifying configuration data.
- **Runtime Access & Mutation** — The `facade.ts` module provides the primary API for other system components to read and modify settings at runtime.
- **Environment Integration** — The `env.ts` and `precommit.ts` modules handle external configuration sources, such as environment variables.
- **Type Safety & Defaults** — The `types.ts` and `defaults.ts` modules ensure that all configuration operations are type-safe and have sensible fallbacks.