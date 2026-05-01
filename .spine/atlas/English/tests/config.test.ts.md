<!-- spine-content-hash:9c32aa6493ebf4de07d814d80e48f1dd0b8ad8894fd20c304047124b507e29e5 -->
# Config Test Suite

This Vitest unit test suite validates the configuration persistence and LLM provider/model settings of the Config infrastructure class.

## Responsibilities

- Sets up a temporary directory with a `.spine/config.json` path for isolated config file testing.
- Tears down the temporary directory and unstubs environment variables after each test.
- Tests that `hasPersistedConfig()` returns `false` when no config file exists.
- Tests that `hasPersistedConfig()` returns `true` after setting LLM provider and model values.
- Validates that `setLLMProvider` and `setLLMModel` persist values correctly.
- Validates that `getLLMProvider` and `getLLMModel` return the expected values after setting.

## Out of Scope

- Testing of other Config methods not related to LLM provider/model or persistence.
- Integration testing with actual file system outside temporary directories.
- Testing of error handling or edge cases for Config operations.

## Invariants

- Test files must end with `.test.ts` or `.spec.ts`.

## Public Surface

- `describe('Config')`
- `beforeEach`
- `afterEach`
- `it('should return false when no config file exists')`
- `it('should persist and retrieve LLM provider and model')`

## Change Intent

The architectural intent is to provide a comprehensive test suite for the Config infrastructure class to ensure configuration persistence and LLM settings work correctly in isolation. This suite has no direct relation to the recent commit "tighten schema handling and add try preview".