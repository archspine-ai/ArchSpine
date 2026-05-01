<!-- spine-content-hash:751c4ee4517dc3362146571e75a24c53df519c4159e04200f15d133379158676 -->
# ArchSpine – Policy Constants & Parsing Facade

## Role
This module serves as the **public facade** for prompt policy constants, LLM mode enumerations, and their parsing/resolution utilities. It provides a stable import surface that decouples policy definitions from broader prompt context concerns.

## Key Responsibilities
- **Export constants** for LLM operational modes, prompt policy tiers, validation policies, and budget profiles.
- **Export parsing functions** (`parseLLMMode`, `parsePromptPolicyTier`, `parseRelevanceDiagnosticsMode`, `parseValidatePolicy`) to convert raw strings into typed enumerations.
- **Export resolution functions** (`resolvePromptPolicyTier`, `resolveValidatePolicy`) to determine appropriate policies for given contexts.
- **Export helper functions** (`defaultPromptTierForTask`, `defaultValidatePolicyForTask`) to provide default configurations based on task type.

## Notable Invariants & Negative Scope
- **Must remain a pure re-export facade** – no internal logic or algorithm implementations live here.
- **Must not absorb** service, task, or engine orchestration concerns.
- **Out of scope**: prompt artifact generation, direct parsing/resolution algorithm implementations, and infrastructure-level capabilities.

## Public Surface
- `LLM_MODES`
- `PROMPT_POLICY_TIERS`
- `STRICT_VALIDATE_BUDGET_PROFILES`
- `VALIDATE_POLICIES`
- `PROMPT_BUDGET_PROFILES`
- `parseLLMMode`
- `parsePromptPolicyTier`
- `parseRelevanceDiagnosticsMode`
- `parseValidatePolicy`
- `defaultPromptTierForTask`
- `defaultValidatePolicyForTask`
- `resolvePromptPolicyTier`
- `resolveValidatePolicy`

## Architectural Intent
This facade reduces import overhead and improves modularity by separating policy constants and parsing utilities from broader prompt context concerns. It aligns with the architectural goal of clarifying subsystem boundaries and resolving layer inversions.