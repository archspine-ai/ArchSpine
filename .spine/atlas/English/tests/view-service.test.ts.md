<!-- spine-content-hash:075ddae93eaec8a2ae7e4850e8b8deea0beccef189a284394efed5b6868918df -->
# ViewService Integration Test Suite

This file is a Vitest integration test suite for the **ViewService** module. It validates the service's behavior using mocked LLM clients and file system fixtures, ensuring that view generation from Spine units works correctly in a controlled, reproducible environment.

## Key Responsibilities

- Creates temporary test directories and file system fixtures to isolate ViewService testing.
- Mocks LLM client responses to simulate view generation without making external API calls.
- Asserts that ViewService correctly processes Spine units and produces expected view outputs.
- Verifies error handling and edge cases in the view generation pipeline.

## Notable Invariants & Negative Scope

- **Pure test file**: Must have no side effects on production systems.
- **Deterministic mocking**: All external dependencies (LLM, file system) must be mocked to ensure tests are repeatable.
- **Resource cleanup**: Temporary directories must be cleaned up after each test to prevent resource leaks.
- **Out of scope**: This file does not handle production deployment, runtime service hosting, direct LLM API interaction, persistence of test artifacts beyond the session, or UI rendering.

## Exported / Externally Visible Behavior

This file does not export any production-facing API. Its sole purpose is to run integration tests that verify the ViewService's internal logic under controlled conditions.