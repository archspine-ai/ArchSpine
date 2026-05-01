<!-- spine-content-hash:c5f7465f64621bc4abe9afd24a859280652f2847552eef6846b773bb0f9ab45e -->
# ArchSpine Configuration Schema – Core Validation Contract

This module defines the foundational validation contract and constant sets for the ArchSpine configuration schema. It serves as the single source of truth for allowed configuration values and the structure of validation results.

## Role

Core validation contract and constants definition for the ArchSpine configuration schema.

## Key Responsibilities

- Defines the `SpineConfigValidationResult` interface, which provides a structured output format for all validation operations.
- Declares constant sets of allowed values for critical configuration fields, including:
  - LLM modes
  - Prompt tiers
  - Validation policies
  - (Other key fields as needed)

## Notable Invariants

- Provides **centralized** allowed value sets that all validation logic must reference.
- Exports a **typed result structure** (`SpineConfigValidationResult`) to ensure consistency across the entire validation pipeline.

## Out of Scope (Negative Scope)

- **Does not implement** validation logic – that is handled by separate modules (e.g., `config-validation.ts`).
- **Does not handle** CLI command entry or user interaction.
- **Does not read or parse** configuration files.

## Most Important Exported Behavior

- **`SpineConfigValidationResult`** – the primary public interface that all validation functions must return. It standardizes how validation outcomes are communicated throughout the system.

## Architectural Intent

This module establishes a shared vocabulary and contract for configuration validation across the entire ArchSpine pipeline. By centralizing allowed values and the result structure, it ensures that all validation components remain consistent and interoperable.

## Recent Change Intent

Recent commits indicate a potential tightening of schema handling and the addition of preview capabilities, suggesting ongoing refinement of the validation contract.