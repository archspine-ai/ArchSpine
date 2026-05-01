<!-- spine-content-hash:f78619ac0c33c3b922a22d528e2f31492d80c315087d309bbf4ad6d534f7ecb9 -->
# ArchSpine Configuration Loader & Validator

This module is the configuration loading and validation pipeline for the ArchSpine system. It reads, parses, validates, and merges configuration files with system defaults.

## Role

Configuration loader and validator for the ArchSpine system, responsible for reading, parsing, validating, and merging configuration files with defaults.

## Key Responsibilities

- Reads configuration file from the filesystem using synchronous file operations.
- Parses JSON configuration content and validates its structure against a schema.
- Merges user-provided configuration overrides with system defaults using deep merge logic.
- Generates and logs human-readable warnings for configuration parsing issues.

## Notable Invariants

- Configuration file must be valid JSON and conform to the SpineConfig schema.
- Defaults are always applied as a base; overrides are merged on top.
- Parse warnings are generated for structural issues but do not halt execution.

## Negative Scope (Out of Scope)

- Does not handle asynchronous file operations or streaming.
- Does not manage runtime state or session lifecycle.
- Does not perform network I/O or remote configuration fetching.
- Does not enforce access control or authentication.

## Public Surface

- `mergeConfigWithDefaults` — the primary exported function for merging user configuration with system defaults.

## Architectural Intent

Provide a stable, validated configuration loading pipeline that separates concerns between file I/O, schema validation, and default merging. Recent changes have tightened schema handling and added try preview support, improving validation robustness and preview capabilities.