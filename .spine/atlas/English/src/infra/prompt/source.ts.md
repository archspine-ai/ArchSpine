<!-- spine-content-hash:a8236d9098b3225013026e312c394a1ee1937e64a1f09d2acfea1f11062abfe4 -->
# ArchSpine – `generateSourcePrompt` Facade

## Role

This module is an **infrastructure facade** responsible for assembling structured LLM prompts for source code analysis. It does not perform inference, parse ASTs, or enforce rules — it only constructs prompts.

## Key Responsibilities

- Builds a `PromptBuilder` with identity, instructions, examples, and environmental context (branch, status).
- Integrates localized language instructions and output contract rendering for multilingual support.
- Injects architectural rules, git intent, dependency context, and previous semantic data into the prompt.
- Applies a JSON schema (`sourceFileSchema`) to enforce output structure.
- Supports configurable task modes (e.g., `'summarize'`, `'audit'`) and prompt policy tiers (e.g., `'balanced'`).

## Notable Invariants

- **Pure function**: Must have no side effects — only prompt assembly.
- **Delegation**: All prompt rendering logic is delegated to `PromptBuilder` and shared utilities.
- **No orchestration**: Must not absorb service, task, or engine orchestration concerns (per infra-facade-imports rule).

## Out of Scope

- Orchestrating LLM inference or API calls.
- Parsing or analyzing source code AST beyond the provided content.
- Enforcing architectural rules beyond injecting them into the prompt.
- Managing prompt templates or schema definitions (delegated to assets).

## Public Surface

- `generateSourcePrompt` — the sole exported function.

## Change Intent

The architectural intent is to provide a stable, configurable facade for generating prompts that adhere to architectural policies and output contracts, enabling consistent source code analysis across the system. Recent changes refactored the module to establish subsystem facades and resolve layer inversions, consolidating prompt generation logic into a dedicated infra facade.