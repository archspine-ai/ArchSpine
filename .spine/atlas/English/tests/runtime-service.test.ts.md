<!-- spine-content-hash:a115e138281e676deefcb7c9a7d34c1fbc820e3bd0bac8b496b27ecafa9fc6e2 -->
# ArchSpine – RuntimeService Unit Test Suite

## Role
This is a Vitest unit test suite for `RuntimeService`. It validates LLM configuration resolution, secret injection, and runtime override behavior.

## Key Responsibilities
- Creates isolated temporary directories per test to prevent side effects between test cases.
- Mocks `Config` and `Secrets` instances to control LLM provider, mode, prompt tier, validation policy, and API key.
- Asserts that `RuntimeService.getResolvedLLMSettings()` correctly reflects configuration overrides (provider, mode, prompt tier, validate policy).
- Validates that runtime overrides are applied correctly and do not leak across test boundaries via `afterEach` cleanup.
- Imports and exercises `resolveExecutionProfileFromSettings` to verify execution profile derivation from LLM settings.

## Notable Invariants & Negative Scope
- **Invariants:**  
  - Test file must end with `.test.ts` or `.spec.ts`.  
  - Each test must create and clean up its own temporary directory to ensure isolation.  
  - `RuntimeService` must reflect the latest configuration overrides after they are applied.
- **Out of Scope:**  
  - Does not test `RuntimeService` methods beyond `getResolvedLLMSettings`.  
  - Does not test database interactions, file scanning, or manifest operations.  
  - Does not test error handling paths or edge cases for invalid configurations.  
  - Does not test integration with actual LLM providers or credential backends.

## Most Important Exported Behavior
- `describe('RuntimeService')` – the test suite container.
- `beforeEach` hook – sets up mocks and temporary directories.
- `afterEach` hook – cleans up to prevent state leakage.
- `it('should resolve LLM settings with overrides')` – the primary test case verifying configuration override propagation.