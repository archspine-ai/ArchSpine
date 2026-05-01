<!-- spine-content-hash:4c6ca96b65be3ad7b0a4d02cccdfc332d3720b072b32ff0a77be6b4c817c7f2d -->
# ArchSpine Resume Candidate Derivation Test Suite

## Role
Vitest test suite for validating execution checkpoint resume candidate derivation logic during sync and check operations.

## Key Responsibilities
- Tests the `deriveSyncResumeCandidateFiles` function for correct file candidate generation during sync operations.
- Tests the `deriveCheckResumeCandidateFiles` function for checkpoint resume logic during check operations.
- Validates `ExecutionCheckpointStore` state handling and schema compliance.
- Ensures resume candidate derivation handles different command states and run identifiers appropriately.

## Notable Invariants & Negative Scope
- **Invariant:** Test file must end with `.test.ts` or `.spec.ts` (rule: test-file-suffix).
- **Out of scope:** Integration testing of actual file system operations beyond temporary directories; performance or load testing of resume candidate derivation; testing of other execution checkpoint store methods not related to resume candidate derivation.

## Most Important Exported Behavior
- `describe('resume-services')` — top-level test suite grouping.
- `it('deriveSyncResumeCandidateFiles')` — validates sync resume candidate generation.
- `it('deriveCheckResumeCandidateFiles')` — validates check resume candidate generation.