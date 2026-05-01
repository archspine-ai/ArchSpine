<!-- spine-content-hash:f92ec89e43efe99972a72990195d43a928d87e3642ade081180fe4d010f2c834 -->
# ArchSpine – Prompt Engine Benchmark Suite

This file is a **Vitest benchmark test suite** that evaluates the performance and scaling characteristics of the prompt engine under large inputs. It is not a unit test suite; it focuses on load behavior and structural validation of generated artifacts.

## Key Responsibilities

- Benchmarks the compacting of source prompt artifacts using task-specific budgets with large content and rule blocks.
- Tests generation of source prompts with extensive import/export structures and validates output constraints.
- Verifies integration between prompt-context artifact building and prompt generation modules under scaled conditions.
- Asserts structural constraints (line counts, import/export counts) in generated prompt artifacts.

## Notable Invariants

- Uses the Vitest testing framework with `describe`/`it`/`expect` assertions.
- Imports from `src/infra/prompt-context.js` and `src/infra/prompt-rendering.js`.
- Focuses on performance and scaling under artificially large inputs.

## Out of Scope

- Unit testing of individual prompt-context or prompt-rendering functions.
- Integration with non-prompt engine subsystems.
- End-to-end user workflow validation.

## Exported / External Behavior

This file does not export any public API. It is a test suite that runs benchmarks and assertions internally.