<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"tests/infra/llm","role":"Test suite for the LLM retry utility's error classification function.","responsibility":"Validates that the `isRetryableError` function correctly classifies various error types as retryable or non-retryable, ensuring robust error handling for LLM interactions.","children":[{"filePath":"tests/infra/llm/retry.test.ts","role":"Vitest unit test suite for the LLM retry utility's error classification function.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.491Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `tests/infra/llm/` — LLM Retry Error Classification Tests

This directory contains the test suite for the LLM retry utility's core error classification function. Its sole purpose is to validate that `isRetryableError` correctly categorizes a variety of error types as retryable or non-retryable, which is essential for robust error handling in LLM interactions.

## Notable Children

- **`retry.test.ts`** — A Vitest unit test file that exercises the error classification logic. It covers multiple error scenarios, including transient network failures, authentication errors, rate limits, and internal server errors, verifying that each is assigned the correct retryability flag.

## How the Directory Is Organized

The directory is flat: a single test file resides directly under `tests/infra/llm/`. There are no subdirectories or additional configuration files. Everything is concentrated in one file to keep the testing scope narrow and focused.

## Key Implementation Areas

- **Error Classification Coverage** — The tests ensure that every error type handled by the LLM retry module is properly classified, reducing the risk of misidentifying permanent errors as retryable or vice versa.
- **Edge Cases** — The test suite includes boundary conditions such as custom error objects, nested causes, and non‑standard HTTP status codes to strengthen classification reliability.
- **Integration with Vitest** — The test harness is built on Vitest, using its describe/it structure and assertion utilities to provide clear, maintainable test outcomes.