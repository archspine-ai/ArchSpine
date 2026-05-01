<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"tests/infra/llm","role":"Test suite for the LLM retry utility's error classification function.","responsibility":"Validates that the `isRetryableError` function correctly classifies various error types as retryable or non-retryable, ensuring robust error handling for LLM interactions.","children":[{"filePath":"tests/infra/llm/retry.test.ts","role":"Vitest unit test suite for the LLM retry utility's error classification function.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.491Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `tests/infra/llm` — LLM Retry Error Classification Tests

This directory contains the test suite for the LLM retry utility's error classification function. Its sole purpose is to validate that `isRetryableError` correctly distinguishes between retryable and non-retryable error types, ensuring robust error handling for LLM interactions.

## Notable Children

- **`retry.test.ts`** — A Vitest unit test suite that exercises the error classification logic. It covers various error scenarios to confirm that the function returns the expected retryability verdict for each case.

## Implementation Areas

The most critical area is the error classification logic itself, which determines whether an error should trigger a retry. The tests in this directory directly validate that logic, making them essential for maintaining reliability in LLM communication.