This directory houses the test suite for the ArchSpine mirror system's index-based resume recovery and LLM retry mechanisms. It validates the system's resilience by simulating corrupted index states and LLM summarization failures, ensuring correct recovery behavior and error classification.

The suite is grouped into two concrete areas:
- **`index-recovery.test.ts`** — Tests index recovery from partial or corrupted states, using isolated temporary directories and mocked LLM failures to verify retry logic. It also validates integration with task state, telemetry state, and protocol versioning.
- **`infra/llm/`** — Tests the LLM retry utility's error classification function, confirming that retryable errors (socket hang up, ECONNRESET, terminated, HTTP 429) are distinguished from non-retryable ones (HTTP 400).

Key implementation concerns include test isolation, mock restoration, and comprehensive coverage of recovery workflows across the mirror system's error boundary.