<!-- spine-content-hash:f549b4b475bdefa91a5dfdfa015bc9bfc548412e5f512a4b1a141f38cd51e15e -->
# ArchSpine Prompt Policy Configuration

This module serves as the **centralized configuration hub** for the ArchSpine prompt policy system. It defines typed constants and budget profiles that govern how prompts are structured and validated across the system.

## Role

Centralized configuration module defining typed constants and budget profiles for the ArchSpine prompt policy system.

## Key Responsibilities

- Exports typed arrays of valid prompt policy tiers (`'lite'`, `'balanced'`), validation policies, and LLM modes for runtime validation and iteration.
- Provides a structured record mapping each policy tier and task mode to a detailed prompt budget profile with line, import, and export constraints.
- Serves as a single source of truth for prompt budgeting configuration, enabling consistent policy enforcement across the system.

## Out of Scope

- Runtime enforcement or validation of prompt budgets.
- Loading or parsing of external configuration files.
- Any logic related to LLM invocation or prompt generation.

## Invariants

- All exported arrays and records must remain consistent with the types defined in `./types.js`.
- The `PROMPT_BUDGET_PROFILES` record must cover every combination of `PromptPolicyTier` and `PromptTaskMode`.

## Public Surface

- `PROMPT_POLICY_TIERS`
- `VALIDATE_POLICIES`
- `LLM_MODES`
- `PROMPT_BUDGET_PROFILES`

## Change Intent

The architectural intent is to centralize prompt policy configuration into a single, typed module to ensure consistency and ease of maintenance across the system. No recent changes have been detected; the file appears stable and unchanged in the current git status.