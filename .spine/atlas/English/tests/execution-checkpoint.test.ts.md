<!-- spine-content-hash:9a4bc873c43050e7af1d250d00d48f912e082a0bad8534f6879c087fea46f03e -->
# resume-services test suite (ArchSpine)

**Role:** Vitest test suite for validating execution checkpoint resume candidate derivation logic during sync and check operations.

**Key Responsibilities:**
- Tests the deriveSyncResumeCandidateFiles function for correct file candidate generation during sync operations.
- Tests the deriveCheckResumeCandidateFiles function for checkpoint resume logic during check operations.
- Validates ExecutionCheckpointStore state handling and schema compliance.
- Ensures resume candidate derivation handles different command states and run identifiers appropriately.

**Notable Invariants / Negative Scope:**
- Out of scope: Integration testing of actual file system operations beyond temporary directories; performance or load testing; testing of other execution checkpoint store methods not related to resume candidate derivation.
- Invariant: Test file must end with .test.ts or .spec.ts (rule: test-file-suffix).

**Most Important Exported / Externally Visible Behavior:**
- `describe('resume-services')`
- `it('deriveSyncResumeCandidateFiles')`
- `it('deriveCheckResumeCandidateFiles')`