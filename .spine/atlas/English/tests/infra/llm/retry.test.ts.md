<!-- spine-content-hash:1a2a52856c835b1cfc53d95da9a71b4574d543090d7997957ad25dd0ef7e8392 -->
# ArchSpine – LLM Retry Error Classification Test Suite

## Role
Vitest unit test suite for the LLM retry utility's error classification function.

## Key Responsibilities
- Validates that `isRetryableError` correctly identifies socket-related errors (e.g., 'socket hang up', ECONNRESET) as retryable.
- Validates that `isRetryableError` correctly identifies 'terminated' errors as retryable.
- Validates that `isRetryableError` correctly identifies HTTP 429 (rate limit) errors as retryable.
- Validates that `isRetryableError` correctly identifies HTTP 400 (bad request) errors as non-retryable.

## Notable Invariants
- Must import the `isRetryableError` function from the LLM retry module.
- Must use Vitest's describe/it/expect assertions for test structure.
- Test file suffix must be `.test.ts` or `.spec.ts` (per architectural rule).

## Negative Scope (Out of Scope)
- Testing the `withRetry` function's retry logic or timing behavior.
- Mocking external LLM API calls or network conditions.
- Validating error messages or formatting beyond retryability classification.

## Most Important Exported Behavior
The test suite validates the `isRetryableError` function's ability to correctly classify errors as retryable or non-retryable, ensuring reliable LLM error handling.