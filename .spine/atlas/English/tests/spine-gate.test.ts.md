<!-- spine-content-hash:1126ca6fe7663c86264565e94ba20340ab6e469494c13d75d4e31ecb0b00aeb7 -->
# ArchSpine – spine-gate Mutation Detection Test Suite

## Role
This is a Vitest unit test suite for the spine-gate module's protected output mutation detection.

## Key Responsibilities
- Sets up temporary test directories and cleans them before and after each test.
- Writes baseline files to simulate protected output states.
- Asserts that the spine-gate correctly detects mutations to protected output files.
- Validates the formatting of mutation warnings.

## Notable Invariants
- Must import vitest testing utilities (`describe`, `it`, `expect`, `beforeEach`, `afterEach`).
- Must import the spine-gate module functions under test.
- Must manage temporary test directories isolated from production data.

## Negative Scope (Out of Scope)
- Production runtime logic for mutation detection (delegated to spine-gate module).
- Persistence of mutation results beyond the test session.
- Integration testing with external systems.

## Exported / Externally Visible Behavior
This suite does not export any production code; it is purely a test harness. Its externally visible behavior is limited to test execution and reporting via Vitest.