<!-- spine-content-hash:26277ba37c31a27adfe4b49f5a0f905752bfddddb390447540879e67b7141cde -->
# ArchSpine Sync Command Test Suite

This Vitest test suite validates the sync command's repair mode behavior and runtime service interactions. It focuses on ensuring the sync workflow integrates correctly with the runtime service and handles errors appropriately.

## Key Responsibilities

- Mocks the runtime service and LLM settings to isolate sync command behavior
- Tests the sync workflow's error handling and repair policy integration
- Verifies console output and process interactions during sync operations

## Out of Scope

- Testing non-sync CLI commands
- Validating LLM provider configurations
- Implementing the actual sync service logic

## Notable Invariants

- Uses Vitest framework for testing
- Relies on mocked runtime service and LLM settings
- Focuses on the sync command's CLI interface and error paths

## Change Intent

The architectural intent is to ensure the sync command's repair mode integrates correctly with the runtime service and handles errors appropriately. Recent changes are minor updates related to test robustness or mock adjustments.

## Exported Behavior

This test suite does not export any public surface; it is purely a test module.