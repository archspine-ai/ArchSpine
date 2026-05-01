<!-- spine-content-hash:1adb39b47bfd204a2d8fd6649e6b9200f36e3256111a9998f113c59c0dfc506a -->
# ArchSpine – Environment Variable Utility Module

## Role
Infrastructure utility module providing environment variable parsing constants and functions.

## Key Responsibilities
- Defines the environment variable name `SPINE_PRECOMMIT` used to control pre-commit hook behavior.
- Parses string environment variable values into boolean `true`, `false`, or `undefined` based on common truthy/falsy string representations.

## Notable Invariants & Negative Scope
- Exports stable low-level environment parsing utilities.
- Pure functions with no side effects.
- No dependencies on other project modules.
- Does **not** orchestrate services, tasks, or engines.
- Does **not** provide high-level business logic.
- Does **not** act as a facade for other infrastructure modules.

## Most Important Exported / Externally Visible Behavior
- `PRE_COMMIT_ENV_VAR` – the constant defining the environment variable name.
- `parseBooleanEnv` – the function that converts environment variable strings to boolean values.