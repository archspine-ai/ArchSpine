<!-- spine-content-hash:27b2ce56721dcb13536b641c90cc57f4105a75b1763374ffe891785a0e47ab73 -->
# ArchSpine Credential Backend Integration Test Suite

This Vitest integration test suite validates the credential backend availability and LLM configuration resolution within the ArchSpine mirror system.

## Role

The suite ensures that the LLM configuration resolution system correctly handles scenarios where credential backends are unavailable, maintaining robustness in the credential resolution pipeline.

## Key Responsibilities

- **Mock unavailable backends**: Simulates missing backend scenarios by mocking an unavailable `CredentialBackend` implementation.
- **Integration testing**: Tests the integration between `Config`, `Secrets`, and LLM runtime resolution under different credential backend states.
- **Validation**: Verifies that LLM settings resolve correctly when credential backends are either available or unavailable.
- **Isolation management**: Manages temporary test directories for isolated test execution and ensures proper cleanup after tests complete.

## Notable Invariants

- All test files must use the `.test.ts` or `.spec.ts` suffix (enforced by the `test-file-suffix` rule).

## Out of Scope

- Unit testing of individual `CredentialBackend` implementations.
- Testing of LLM provider-specific API calls or network behavior.
- Performance or load testing of the credential system.

## Exported Behavior

This suite does not export any public API surface; it is purely a test harness for validating integration behavior.