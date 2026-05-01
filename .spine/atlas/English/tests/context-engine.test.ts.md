<!-- spine-content-hash:08129d507b8038d3bce1407a343b9a7ba6fbc6092d9438d3b195c317e7bba1f9 -->
# ContextEngine Test Suite

This Vitest unit test suite validates the ContextEngine's lightweight relevance sorting algorithm and dependency resolution.

## Responsibilities

- Sets up temporary test directories and files to simulate a project structure for isolation.
- Tests the ContextEngine's dependency resolution and relevance scoring logic.
- Cleans up temporary resources after each test to prevent side effects.

## Out of Scope

- Integration tests with real file systems or external services.
- Performance or load testing of the ContextEngine.
- Testing of other engines or components in the ArchSpine system.

## Invariants

- Test files must end with `.test.ts` or `.spec.ts` (rule: test-file-suffix).

## Architectural Intent

Provide a focused test suite for the ContextEngine's core functionality, ensuring correctness of dependency resolution and relevance sorting in isolated environments.

## Recent Changes

No recent changes detected in this file; the commit 'feat: tighten schema handling and add try preview' does not directly affect this test suite.

## Public Surface

None.

## Drift Detection

No drift detected.