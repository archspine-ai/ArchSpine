<!-- spine-content-hash:af4ffc10c0d2c4a20e565ad1a20e91b980401bcef0f12cc7ab2860964abaf3bd -->
# ArchSpine Source Summary: LLM Command UI Test Suite

## Role
This is a Vitest unit test suite that validates the user interface and configuration surface of the LLM command within the ArchSpine mirror system.

## Key Responsibilities
- Ensures that the LLM command correctly rejects internal compatibility keys when performing `set` operations.
- Verifies that the `llm status` command prints provider and model information to the console as expected.

## Notable Invariants & Negative Scope
- **Invariant:** The test file must use the `.test.ts` or `.spec.ts` suffix to comply with the `test-file-suffix` rule.
- **Out of Scope:** This suite does not cover integration or end-to-end testing of the LLM command, nor does it test LLM API call execution, response handling, or configuration persistence/storage.

## Most Important Exported Behavior
The suite exposes two primary test cases:
- `describe('LLM command UI surface', ...)` — groups the UI-related tests.
- `it('rejects internal compatibility keys from llm set usage', ...)` — validates rejection of invalid keys.
- `it('prints provider and model info from llm status', ...)` — confirms correct status output.

This test suite provides automated regression coverage for the LLM command's CLI surface, ensuring configuration validation and status display function correctly.