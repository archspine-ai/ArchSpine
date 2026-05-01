<!-- spine-content-hash:6bc3ff90c686321640781a3e78d9597c8f271c0fb261f2560071b24340c589e9 -->
# `parsePromptPolicyTier` — Infrastructure Utility

## Role
A pure, deterministic utility function that parses and validates a `PromptPolicyTier` configuration value from a raw string input.

## Key Responsibilities
- Accepts a raw string (or `undefined`) and returns a validated `PromptPolicyTier` enum value (`'lite'` or `'balanced'`).
- Normalizes input by trimming whitespace and converting to lowercase for type-safe matching.
- Returns `undefined` for empty, `undefined`, or unrecognized inputs, ensuring a clean optional result.

## Notable Invariants & Negative Scope
- **Pure & deterministic**: Same input always yields the same output; no side effects.
- **Never throws**: Invalid inputs always return `undefined` — no exceptions.
- **Input type strictly `string | undefined`**: No other types are handled.
- **Out of scope**: Does not parse other configuration values, interact with file systems, networks, or external services, and performs no logging or error reporting.

## Public Surface
- `parsePromptPolicyTier(value: string | undefined): PromptPolicyTier | undefined`