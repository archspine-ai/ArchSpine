<!-- spine-content-hash:57564861f46007d470a369bcc85bc156e192d01aa64ac994a21c96b971d8f385 -->
# ArchSpine Forced Processing Test Suite

This Vitest test suite validates the forced processing behavior of ArchSpine tasks under repair policy conditions. It ensures that `ASTExtractionTask` and `SummarizationTask` correctly handle forced processing triggers and state transitions.

## Key Responsibilities

- Sets up isolated temporary directories and mocks for each test case.
- Tests forced processing behavior of `ASTExtractionTask` and `SummarizationTask` under repair policy conditions.
- Validates task execution and state transitions when forced processing is triggered.
- Cleans up all test artifacts and restores mocks after each test case.

## Out of Scope

- Production task execution or orchestration.
- Permanent file system modifications.
- Integration with external APIs or services.

## Invariants

- The file is a Vitest test suite (`.test.ts`).
- Each test uses an isolated temporary directory.
- All mocks are restored and artifacts cleaned up after each test case.

## Exported Behavior

This file does not export any public API. It is a test suite that runs automatically as part of the Vitest test runner.