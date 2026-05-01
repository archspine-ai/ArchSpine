<!-- spine-content-hash:ced0ca63ada461d98f464b1d2b23e2530fcd26c2288d6e60d2e2235dd2a54ecf -->
# ArchSpine Test Suite: Index Recovery & LLM Retry

This Vitest test suite validates the index-based resume recovery and LLM retry mechanisms within the ArchSpine system. It ensures that the system can gracefully handle failures and corrupted states during summarization tasks.

## Key Responsibilities

- **Isolated Test Environments**: Creates a unique temporary directory for each test case to prevent side effects and ensure deterministic results.
- **LLM Failure Simulation**: Mocks failures in LLM summarization tasks to test the system's retry logic under controlled conditions.
- **Recovery Verification**: Confirms that the system correctly recovers from partial or corrupted index states, restoring functionality as expected.
- **Cleanup**: Removes all test artifacts after each run to maintain a pristine environment for subsequent tests.

## Scope & Boundaries

- **In Scope**: Unit-level validation of recovery and retry logic using mocked dependencies.
- **Out of Scope**: Production implementation of summarization or index recovery; integration tests with real LLM services; performance or load testing.

## Invariants

- All test files must use the `.test.ts` or `.spec.ts` suffix to comply with project conventions.

## Architectural Intent

The suite is designed to provide robust, deterministic coverage for the index recovery and retry mechanisms, ensuring they behave correctly under failure scenarios. Recent changes focused on resolving lint errors and aligning the test structure with project conventions ahead of the v1.0 release.

## Public Surface

This module does not expose any public API; it is purely a test harness for internal validation.