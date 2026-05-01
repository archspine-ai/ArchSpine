<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"tests/infra","role":"This directory contains test suites for validating index-based recovery and LLM retry mechanisms.","responsibility":"Collectively, these tests ensure the ArchSpine system can recover from corrupted index states and correctly classify LLM errors for retry logic, maintaining data integrity and robust error handling.","children":[{"filePath":"tests/infra/index-recovery.test.ts","role":"Vitest test suite for validating index-based resume recovery and LLM retry mechanisms in the ArchSpine system.","fileKind":"source"},{"filePath":"tests/infra/llm","role":"Test suite for the LLM retry utility's error classification function.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:51.850Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# tests/infra — Infrastructure Recovery & Retry Tests

This directory contains test suites that validate two critical infrastructure behaviors in the ArchSpine system: **index-based recovery** and **LLM retry classification**. These tests ensure that the system can gracefully recover from corrupted index states and correctly categorize LLM errors for retry logic, preserving data integrity and operational robustness.

## Notable Children

- **`index-recovery.test.ts`** — A Vitest test suite that exercises the index-based resume recovery mechanism and the LLM retry utility. This is the primary test file for validating that the system can detect and recover from index corruption, and that LLM errors are properly classified for retry decisions.
- **`llm/`** — A subfolder containing tests focused specifically on the LLM retry utility's error classification function. This isolates the logic that determines which LLM errors are retryable, ensuring the retry mechanism behaves correctly under various error conditions.

## Implementation Areas

The most important implementation areas covered here are:

1. **Index Recovery** — Validates that the system can detect corrupted index states and resume processing from a known good checkpoint, preventing data loss or duplication.
2. **LLM Error Classification** — Ensures that the retry logic correctly distinguishes between transient errors (which should be retried) and permanent errors (which should not), based on the error type and context.
3. **Integration of Recovery and Retry** — The tests in `index-recovery.test.ts` combine both mechanisms, verifying that the system can recover from index corruption and then correctly handle subsequent LLM errors during the resumed operation.