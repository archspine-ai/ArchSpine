# ArchSpine Prompt Infrastructure Layer

This directory (`src/infrastructure/prompt`) constitutes the **assembly and policy core** of ArchSpine's prompt system. It is responsible for resolving policies, calculating token/line budgets, compressing structural skeletons, trimming contextual content, generating diagnostics, and defining type contracts — all necessary to produce a coherent `SourcePromptArtifacts` object consumed by downstream LLM orchestration layers.

## Notable Submodules and Grouping

- **Policy resolution** — `policy.ts` resolves the effective prompt policy tier and validation policy based on the task mode and optional overrides. It provides stateless, default-driven decisions used throughout the infrastructure.
- **Budget calculation** — `budgets.ts` selects the appropriate budget profile (strict or standard) and computes final allocations (maxTokens, reservedTokens) using profile multipliers and clamps. `constants.ts` serves as the single source of truth for profile definitions across tiers and modes.
- **Artifact assembly** — `artifacts.ts` orchestrates the entire pipeline: it resolves policy, calculates budgets, compacts the file skeleton, trims previous context, rule blocks, and sectioned context, and builds dependency-selection and rule-block diagnostics. It returns the complete `SourcePromptArtifacts`.
- **Trimming utilities** — `trim.ts` provides core text-formatting helpers: line-based trimming, character-based trimming, splitting rule data on `[Rule: ]` markers, and compacting skeletons and context sections.
- **Diagnostics** — `diagnostics.ts` extracts rule IDs from raw rule blocks and builds structured comparisons (retained vs. dropped) for both rule blocks and dependency selections, aiding debugging of context trimming and relevance.
- **Parsing utilities** — `parsers.ts` offers type-safe normalization and enum (PromptPolicyTier, ValidatePolicy, LLMMode, RelevanceDiagnosticsMode) parsing from raw strings.
- **Type definitions** — `types.ts` defines all TypeScript interfaces and type schemas for prompt task modes, policy tiers, budget profiles, diagnostic structures, and generation strategies, serving as the authoritative contract for cross-module communication.

## Key Implementation Areas

- **Policy resolution and override logic** — ensures correct default behavior per task mode (e.g., `'strict'` for validate, `'default'` otherwise) while allowing explicit overrides.
- **Budget allocation with strict vs. standard profiles** — adapts token/line limits based on resolved policy tier and mode.
- **Multi-stage content trimming** — sequentially trims previous semantic context, rule blocks, and sectioned context to fit within budgets, preserving structural integrity.
- **Diagnostic generation** — provides visibility into which rule blocks and dependencies are retained or dropped during trimming, critical for debugging prompt quality.
- **Centralized constants and enums** — `constants.ts` and `types.ts` ensure consistent configuration and type safety across all prompt-related modules.