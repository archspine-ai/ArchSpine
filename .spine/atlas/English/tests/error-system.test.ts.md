<!-- spine-content-hash:226e303f29752e0dfc0758671db62e6abe56539a5db59ef0de867f58683792eb -->
# ArchSpine Error Convergence Integration Tests

## Role
Vitest integration test suite validating error handling consistency and convergence across ArchSpine's service and infrastructure facade modules.

## Key Responsibilities
- Sets up isolated temporary directories for each test case to ensure test isolation and clean state.
- Validates error propagation and handling consistency across CheckService, FixService, SpineResources, SpineTools, and MCPContextGate facade modules.
- Tests that specific error codes (e.g., from ErrorCodes) are thrown with expected structure and properties by various subsystems.
- Verifies lock payload serialization behavior in error contexts to ensure proper error reporting across module boundaries.

## Notable Invariants & Negative Scope
- **Invariant:** Test files must end with `.test.ts` or `.spec.ts` (rule: `test-file-suffix`).
- **Out of scope:** Unit testing of individual internal functions or utilities not directly related to error convergence.
- **Out of scope:** Performance or load testing of the error handling system.
- **Out of scope:** Integration testing of non-error code paths or successful operation flows.

## Most Important Exported / Externally Visible Behavior
- `describe('error system convergence (round 1)')` — top-level test suite
- `beforeEach` hook — sets up isolated temp directory per test
- `afterEach` hook — cleans up temp directory after each test
- `it('should propagate errors from CheckService with correct error codes')`
- `it('should propagate errors from FixService with correct error codes')`
- `it('should propagate errors from SpineResources with correct error codes')`
- `it('should propagate errors from SpineTools with correct error codes')`
- `it('should propagate errors from MCPContextGate with correct error codes')`
- `it('should serialize lock payload correctly in error contexts')`

## Architectural Intent
Ensure that error handling across the ArchSpine system is consistent, predictable, and properly propagates error codes and payloads across module boundaries.