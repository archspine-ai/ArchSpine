# LLM Retry Utility – Error Classification Test Suite

This directory contains the unit test for the `isRetryableError` function, which classifies errors for retry logic in the LLM retry utility. The test validates which error types should or should not trigger a retry, ensuring robust and correct behavior.

## Notable Child

- **retry.test.ts** – Vitest-based test file that covers four key error categories:
  - Socket-related errors (e.g., `'socket hang up'`, `ECONNRESET`) – should be retryable.
  - Termination errors (e.g., `'terminated'`) – should be retryable.
  - HTTP 429 (rate limit) – should be retryable.
  - HTTP 400 (bad request) – should **not** be retryable.

## Implementation Areas

The most critical logic being tested is the error classification inside the retry utility. Correctly distinguishing transient errors (which warrant a retry) from permanent or client-side errors (which should be surfaced immediately) is essential for building a resilient LLM client. Each test case targets a real-world scenario that the retry loop must handle.