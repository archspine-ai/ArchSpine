<!-- spine-content-hash:c4776d0cb0149779bdc67072b52ada2c2a4e2797ca9c3a368bc57ddd736ece81 -->
# ArchSpine – `calculateSourcePromptBudgets` Utility

## Role
This is a pure, side-effect-free infrastructure utility that calculates token budget allocations for prompt construction. It takes a task mode, validation policy, and source code artifacts as input and returns a deterministic budget profile.

## Key Responsibilities
- Resolves the applicable prompt tier and validation policy from the given task mode and any input overrides.
- Selects the correct budget profile from predefined constants based on the resolved mode, policy, and tier.
- Computes line count and import count from the provided source content and skeleton.
- Applies profile multipliers and clamps to derive final budget values such as `maxTokens` and `reservedTokens`.

## Notable Invariants & Negative Scope
- **Pure function**: No side effects, no I/O, no state mutation.
- **Deterministic**: Output depends solely on input parameters.
- **Out of scope**: This utility does not orchestrate tasks, manage API calls, persist or cache results, or provide any user-facing interface.

## Public Surface
- **`calculateSourcePromptBudgets`** – the sole exported function. Callers provide task mode, validation policy, source content, and skeleton; receive a fully computed budget object.