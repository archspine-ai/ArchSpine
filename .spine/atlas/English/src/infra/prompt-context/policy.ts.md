<!-- spine-content-hash:7ceb4309b7ebd0efb4726aa5f71f9ba720c4ad8e701a7b0e3af60d977ba9bf7b -->
# ArchSpine – Policy Resolver (Infrastructure Facade)

## Role
This module is an **infrastructure policy resolver** that provides default prompt and validation policies based on the current task mode. It acts as a stable, decoupled facade for other parts of the system to query policy decisions without needing to understand the underlying resolution logic.

## Key Responsibilities
- **Default Prompt Tier**: Determines the default prompt policy tier (e.g., `"balanced"`) for a given `PromptTaskMode`.
- **Default Validation Policy**: Determines the default validation policy (e.g., `"strict"`, `"default"`) for a given `PromptTaskMode`.
- **Policy Resolution with Override**: Resolves the prompt policy tier, optionally considering an override value (partial function shown).
- **Stable Facade**: Exposes policy decision functions as a clean, stable API for other modules to consume.

## Notable Invariants & Negative Scope
- **Pure Function Library**: Must remain a pure function library with **no side effects**. No state mutation, I/O, or external calls.
- **No Orchestration**: Must **not** absorb service orchestration concerns (e.g., task execution, engine workflows). This is strictly a policy resolver.
- **No Runtime State**: Does **not** manage runtime state, configuration loading, or user input parsing.
- **Stable Exports**: The exported functions (`defaultPromptTierForTask`, `defaultValidatePolicyForTask`, `resolvePromptPolicyTier`) must provide a stable, predictable facade for policy resolution.

## Exported / Public Surface
- `defaultPromptTierForTask(taskMode: PromptTaskMode): string` – Returns the default prompt tier for the given task mode.
- `defaultValidatePolicyForTask(taskMode: PromptTaskMode): string` – Returns the default validation policy for the given task mode.
- `resolvePromptPolicyTier(taskMode: PromptTaskMode, override?: string): string` – Resolves the prompt policy tier, applying an optional override if provided.

## Architectural Intent
This module is part of a broader effort to modularize the CLI and decouple core infrastructure. It provides a consistent, centralized policy resolution point, ensuring that all tasks receive the same default policies based on their mode. This reduces duplication and makes policy changes easier to manage.