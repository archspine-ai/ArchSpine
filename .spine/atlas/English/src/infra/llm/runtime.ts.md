<!-- spine-content-hash:1e188e9c6a24586499f341961a720b7d694f8f4cbfec870d7dab493c7bcf5698 -->
# ArchSpine – LLM Runtime Configuration Resolver & Provider Factory

## Role
Infrastructure runtime configuration resolver and LLM provider client factory within the LLM subsystem.

## Key Responsibilities
- Resolves LLM runtime settings (provider, model, base URL, API key) by merging project configuration, global configuration, and environment variables with defined precedence rules.
- Parses and validates prompt policy tiers (`PromptPolicyTier`), LLM modes (`LLMMode`), and validation policies (`ValidatePolicy`) from resolved configuration using dedicated parser functions.
- Creates LLM provider client instances via the `LLMFactory` based on the fully resolved settings and overrides.
- Handles legacy configuration fallbacks and environment variable parsing for LLM settings, including boolean flags and string trimming.
- Derives validation policy and generation flow from the resolved LLM mode when explicit policy is not provided.

## Notable Invariants & Negative Scope
- **Must not** import from services, tasks, or engines layers to maintain infra facade isolation (per `infra-facade-imports` rule).
- Configuration resolution must follow precedence: **project config > global config > environment variables**.
- Provider client creation must go through `LLMFactory`, not direct instantiation.
- **Out of scope:** Runtime orchestration, task scheduling, service coordination (deferred to `services/runtime-service.ts`), direct HTTP request handling, persistent storage for LLM state, and user-facing CLI commands.

## Most Important Exported / Externally Visible Behavior
- `LLMRuntimeOverrides` (interface) – allows callers to override resolved settings.
- `ResolvedLLMSettings` (interface) – the final, fully resolved configuration object returned to consumers.