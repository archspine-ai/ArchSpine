<!-- spine-content-hash:95c6ab6cc6a65ab2f67d306b1446ef535bf7f09daa7c62343aaf8780734d6991 -->
# ArchSpine – Prompt Context Facade

## Role
This module is the **public facade** for the prompt-context subsystem. It provides a single, stable import surface for policy constants, budget profiles, artifact building, and resolution functions, shielding callers from internal implementation changes.

## Key Responsibilities
- Re-exports all public constants from the internal prompt-policy module:
  - `LLM_MODES`
  - `PROMPT_POLICY_TIERS`
  - `STRICT_VALIDATE_BUDGET_PROFILES`
  - `VALIDATE_POLICIES`
  - `PROMPT_BUDGET_PROFILES`
- Re-exports artifact building functions from the internal artifacts module:
  - `buildSourcePromptArtifacts`
  - `calculateSourcePromptBudgets`
- Re-exports parsing functions from the internal diagnostics module:
  - `parseLLMMode`
  - `parsePromptPolicyTier`
  - `parseRelevanceDiagnosticsMode`
  - `parseValidatePolicy`
- Re-exports default policy resolution functions from the internal resolution module:
  - `defaultPromptTierForTask`
  - `defaultValidatePolicyForTask`
- Re-exports policy resolution functions from the internal resolution module:
  - `resolvePromptPolicyTier`
  - `resolveValidatePolicy`
- Acts as the **sole import target** for all prompt-context consumers, isolating them from internal refactoring.

## Notable Invariants
- **All imports must go through this facade** – callers must not import directly from `src/infra/prompt-context/*` internal paths.
- **No new logic** is defined here; every export is a pure re-export.
- This module **must not** absorb service, task, or engine orchestration concerns (per the infra-facade-imports rule).

## Out of Scope
- Implementation details of prompt policy calculation or budget logic.
- Direct orchestration of service or engine tasks.
- Runtime state management or session handling.

## Public Surface (Exported Symbols)
`LLM_MODES`, `PROMPT_POLICY_TIERS`, `STRICT_VALIDATE_BUDGET_PROFILES`, `VALIDATE_POLICIES`, `PROMPT_BUDGET_PROFILES`, `buildSourcePromptArtifacts`, `calculateSourcePromptBudgets`, `parseLLMMode`, `parsePromptPolicyTier`, `parseRelevanceDiagnosticsMode`, `parseValidatePolicy`, `defaultPromptTierForTask`, `defaultValidatePolicyForTask`, `resolvePromptPolicyTier`, `resolveValidatePolicy`

## Drift Notice
This facade has expanded beyond its original contract to include budget calculation, parsing, and resolution functions. The previous semantic contract did not list these exports; they have been added to provide a complete public surface.