<!-- spine-content-hash:c9cb1ce6d5d97a05a3783e17f4c68854472c69abfdc4ec0f9e978cf1fb03e7d9 -->
# ArchSpine Shared Types & Validation Schemas

This file defines the core type definitions and validation schemas used across the entire ArchSpine system. It ensures data consistency, security, and interoperability between all components.

## Role

Provides reusable type definitions and validation schemas shared across the ArchSpine system.

## Key Responsibilities

- **Schema Versioning & Timestamps**: Enforces semantic versioning (`X.Y.Z`) for schema compatibility and validates ISO 8601 timestamps for event logging and synchronization.
- **Path Validation**: Validates repository-relative paths (must not start with `/`, `./`, `../`, and must not contain backslashes or double slashes) and scope paths (empty or same constraints).
- **Content Integrity**: Validates SHA-256 content hashes (64-character lowercase hex strings) for file integrity verification.
- **Locale & Language**: Validates language tags (e.g., `en`, `zh-CN`) and ensures language selection keys are non-empty strings for localization maps.
- **Classification**: Enumerates source languages, file kinds (source, config, document, other), symbol kinds, and dependency relations for analysis pipelines.
- **Provenance Tracking**: Tracks whether dependency edges are derived from AST or inferred, and records which pipeline stage produced the data (AST, LLM, etc.).
- **Generic Types**: Defines `nonEmptyString` and `stringArray` for flexible use.
- **Localized Content**: Structures localized content as key-value pairs with validated language keys.

## Notable Invariants

- `schemaVersion` must follow semantic versioning (`X.Y.Z`).
- `repoRelativePath` must not start with `/`, `./`, or `../`, and must not contain backslashes or double slashes.
- `scopePath` must be empty or match the same path constraints as `repoRelativePath`.
- `contentHash` must be a 64-character lowercase hex string (SHA-256).
- `locale` must match a valid language tag pattern.
- `sourceLanguage`, `fileKind`, `symbolKind`, `dependencyRelation`, `edgeProvenance`, and `pipelineStage` must be one of their respective enumerated values.
- `nonEmptyString` must have at least one character.
- `localizedContentMap` property names must conform to the `languageSelectionKey` pattern.

## Negative Scope (Out of Scope)

This file does not handle any runtime logic, data processing, or external system interactions. It is purely a schema definition and validation layer.

## Most Important Exported Behavior

The primary exported behavior is the set of validation functions and type definitions that enforce the invariants listed above. These are used by all other ArchSpine components to ensure data integrity and consistency.

## Stability & Risks

This schema file is foundational for data integrity across ArchSpine. Incorrect validation could lead to path traversal vulnerabilities, hash mismatches causing data corruption, or locale parsing errors breaking internationalization. The strict patterns and enums reduce ambiguity but require careful maintenance when adding new languages or pipeline stages. Overall, this file enforces consistent data shapes that prevent many common configuration and security errors.