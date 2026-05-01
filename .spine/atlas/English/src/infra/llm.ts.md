<!-- spine-content-hash:af9241b9e57c28db064f6b18909ab366e162efd5c683972e6c2feebca7425d05 -->
# ArchSpine – LLM Infrastructure Facade

## Role
This module serves as the **infrastructure facade** for all LLM-related configuration, client creation, and provider utilities. It provides a stable, versioned public interface that higher application layers can depend on without needing to import directly from `src/infra/llm/**`.

## Key Responsibilities
- Exposes a **unified import surface** for LLM infrastructure, preventing direct internal imports.
- Provides **LLM client factory** (`createResolvedLLMClient`) and **configuration resolution** (`resolveLLMSettings`) utilities.
- Exports **global configuration and secrets types** (`GlobalLLMConfig`, `GlobalLLMSecrets`) and a **directory utility** (`getGlobalArchSpineDir`).
- Exports `providerRequiresApiKey` to check whether a given LLM provider requires an API key, supporting decoupled provider logic.

## Notable Invariants
- Must **not** import or re-export from service, task, or engine modules.
- Must remain a **thin re-export facade**; should not contain implementation logic beyond re-exports.
- All re-exports must originate from `./llm/global.js` or other stable infra submodules.

## Negative Scope (Out of Scope)
- Direct LLM provider implementations (e.g., OpenAI, Gemini).
- LLM request/response handling or streaming logic.
- Database or repository access.
- Service or task orchestration logic.

## Public Surface
- `GlobalLLMConfig`
- `GlobalLLMSecrets`
- `getGlobalArchSpineDir`
- `assertResolvedLLMUsable`
- `createResolvedLLMClient`
- `providerRequiresApiKey`
- `resolveLLMSettings`

## Change Intent
- **Architectural intent:** Provide a stable, versioned public surface for LLM infrastructure to decouple higher layers from internal implementation details.
- **Recent change:** Added `providerRequiresApiKey` export to support LLM provider decoupling and harden risk hotspot detection.