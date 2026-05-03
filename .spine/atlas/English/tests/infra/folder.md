The `tests/infra/llm-recovery` directory holds a focused test suite that validates two critical resilience mechanisms in the ArchSpine system: **index-based resume recovery** and **LLM retry logic**. The test artifacts are organized into two main areas:

1. **`index-recovery.test.ts`** – A Vitest suite that creates isolated temporary directories per test case, mocks LLM summarization failures, writes incomplete index files, and verifies the system recovers from partial or corrupted index states. It also validates the integration of task state, telemetry state, and protocol versioning within recovery workflows, then cleans up all artifacts and restores mocks after each run.

2. **`tests/infra/llm/`** – A subdirectory containing tests for the LLM retry utility's error classification function. These tests ensure that the retry logic correctly identifies retryable errors (e.g., socket hang-ups, `ECONNRESET`, termination, HTTP 429) versus non‑retryable ones (e.g., HTTP 400).

Collectively, these tests guarantee that ArchSpine can gracefully recover from index corruption and from transient LLM failures, with proper isolation, mock simulation, and cleanup.