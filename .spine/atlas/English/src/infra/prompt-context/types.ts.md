<!-- spine-content-hash:7a26230413d14f1d32ee82da693c35f1d2525fff22d37bb04305fb47f88a0a8d -->
# ArchSpine Type Definitions Module

## Role
Central TypeScript type definition module for prompt generation, validation, diagnostic configuration, and generation strategy within the ArchSpine LLM orchestration system.

## Key Responsibilities
- Defines the type schema for prompt task modes (e.g., `'summarize'`, `'validate'`), policy tiers, LLM operational modes, and generation strategies (including `'json-only'`).
- Provides interface definitions for prompt budget profiles, specifying line count constraints for header, body, and footer sections.
- Exports diagnostic interface structures for tracking prompt context, rule blocks, relevance, and source file snapshots.
- Serves as the authoritative type contract for cross-module communication between the AST extractor, context resolution engines, and LLM base layers.

## Notable Invariants & Negative Scope
- Contains **only** TypeScript type aliases and interface declarations — no executable code or runtime dependencies.
- Imports are strictly for type references from other modules.
- **Out of scope:** Runtime implementation of prompt generation or validation logic; orchestration of LLM calls or task execution; direct interaction with infrastructure or external services.

## Most Important Exported Types
- `PromptTaskMode`, `PromptPolicyTier`, `ValidatePolicy`, `LLMMode`, `GenerationFlow`
- `PromptProfile`, `ValidationProfile`, `GenerationStrategy`
- `RelevanceDiagnosticsMode`, `PromptBudgetProfile`, `PromptBudgets`
- `SourcePromptArtifactsInput`, `SourcePromptArtifacts`
- `PromptContextDiagnostics`, `PromptRuleBlockDiagnostics`, `PromptRelevanceDiagnostics`
- `SourceFileDiagnosticsSnapshot`, `RelevanceDiagnosticsSnapshot`

## Change Intent
- **Architectural intent:** Provide a stable, centralized type contract for the LLM prompt orchestration system, enabling type-safe communication between modules and clear configuration boundaries.
- **Recent change:** Extended the `GenerationStrategy` type to include `'json-only'` mode, supporting a new JSON-only synchronization feature with semantic short-circuit and publish backfill.