<!-- spine-content-hash:ad91bf44cc9a53739e84ef99cc938badf9dfe9770c1c568f2b30221d3d384eda -->
# ArchSpine – Service Runtime Types

This module defines the type contracts for resolved execution profiles and runtime commands used by the service layer. It establishes a clean boundary between configuration resolution and execution logic.

## Role

Type definition module for resolved runtime execution profiles and commands within the service layer.

## Key Responsibilities

- Defines the `ResolvedExecutionProfile` interface, which aggregates resolved LLM settings, mode, prompt tier, validation policy, and generation flow into a single, non-optional structure.
- Defines the `RuntimeCommand` type alias for representing runtime commands.
- Imports and reuses types from the infra layer (`ResolvedLLMSettings`, `GenerationFlow`, `GenerationStrategy`, `LLMMode`, `PromptPolicyTier`, `PromptProfile`, `ValidatePolicy`, `ValidationProfile`) to ensure type consistency across the service boundary.

## Notable Invariants

- All fields in `ResolvedExecutionProfile` are resolved (non-optional) values derived from configuration or defaults.
- The module depends only on infra type definitions, not on runtime infra modules.

## Out of Scope

- Runtime orchestration or execution logic.
- Service implementation or business logic.
- Direct interaction with infra modules beyond type imports.

## Public Surface

- `ResolvedExecutionProfile`
- `RuntimeCommand`

## Change Intent

**Architectural intent:** Establish a typed contract for resolved execution profiles that the runtime service uses to drive LLM interactions, separating configuration resolution from execution.

**Recent change:** Initial commit for open source release (v1.0.0) — establishes the foundational type definitions for the service runtime.