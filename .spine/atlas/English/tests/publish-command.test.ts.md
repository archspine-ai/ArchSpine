<!-- spine-content-hash:49bdb1e8a459ea33ea853870fe982398e1c835587211fd74402825ca735f52e5 -->
# ArchSpine Publish Workflow Test Suite

## Role
Vitest test suite for the publish workflow command (`runPublishWorkflow`).

## Key Responsibilities
- Mocks all external dependencies of the publish workflow using `vi.hoisted` and `vi.mock`: `syncWorkflow`, `warnIfPublishingFromLocalStrategy`, `assertPublishRuntimeBaseline`, `assertPublishSnapshotReady`, `clearAtlasStale`, `documentBackfillRun`.
- Tracks mock function call order via a shared `callOrder` array to verify execution sequence.
- Provides a `describe` block with a `beforeEach` hook to reset mocks before each test case.
- Defines an `it` block that invokes `runPublishWorkflow` with mocked arguments and asserts expected behavior (e.g., call order).

## Notable Invariants & Negative Scope
- **Invariant:** Test file must end with `.test.ts` or `.spec.ts`.
- **Out of scope:** Production implementation of the publish workflow; integration testing with real external services; UI or CLI rendering logic.

## Most Important Exported Behavior
- `runPublishWorkflow` (imported from `../src/cli/commands/publish.js`) is the sole public surface tested.
- The test verifies that the orchestration logic calls dependencies in the correct order, ensuring the workflow sequence is preserved.