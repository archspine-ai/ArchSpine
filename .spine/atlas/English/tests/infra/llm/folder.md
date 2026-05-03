## Test Suite: Error Classification for LLM Retry Utility

This directory contains the unit test suite that validates the LLM retry utility's error classification function. The tests ensure that the retry logic correctly identifies which errors should trigger a retry and which should not.

### Structure

The suite consists of a single test file:

- **`retry.test.ts`** — A Vitest test file that exercises the `isRetryableError` function against four distinct error scenarios.

### Test Coverage

The `retry.test.ts` file validates the following cases:

- **Socket hang up** — verified as retryable.
- **ECONNRESET** — verified as retryable.
- **Terminated errors** — verified as retryable.
- **HTTP 429 (rate limit)** — verified as retryable.
- **HTTP 400 (bad request)** — verified as non-retryable.

Together these tests confirm that only transient or server‑side throttling errors are marked for retry, while client‑side request errors are not.