<!-- spine-content-hash:d456cb2f632dcd4d26569c0497d0f3f6dc614bb709d46ae2ec26f43c5a3b026c -->
# ArchSpine Global LLM Configuration & Secrets Facade

## Role
Infrastructure facade for global LLM configuration file I/O and credential store integration.

## Key Responsibilities
- Defines the `GlobalLLMConfigShape` interface for structured LLM provider configuration including provider, model, baseURL, mode, prompt tier, and validation policy.
- Implements `GlobalLLMConfig` class for reading, writing, and pruning a JSON config file at a platform-appropriate global directory (XDG_CONFIG_HOME or ~/.config).
- Implements `GlobalLLMSecrets` class wrapping `CredentialStore` for secure LLM API key management via `createGlobalLLMCredentialStore`.
- Exports `getGlobalArchSpineDir` utility to resolve the global ArchSpine configuration directory.
- Re-exports type definitions for `LLMMode`, `PromptPolicyTier`, and `ValidatePolicy` from the prompt-policy module.

## Notable Invariants
- `GlobalLLMConfigShape` must remain a stable interface for all LLM configuration consumers.
- `GlobalLLMSecrets` must delegate credential storage to the `CredentialStore` abstraction, not manage secrets directly.
- Config file path must be deterministic based on XDG_CONFIG_HOME or OS home directory.

## Negative Scope (Out of Scope)
- Does not handle per-project or per-user override resolution.
- Does not perform LLM inference or orchestration.
- Does not validate provider-specific configuration schemas beyond the generic shape.

## Public Surface
- `getGlobalArchSpineDir`
- `GlobalLLMConfig`
- `GlobalLLMSecrets`
- `GlobalLLMConfigShape`
- `LLMMode`
- `PromptPolicyTier`
- `ValidatePolicy`