<!-- spine-content-hash:0fabba4b153351db1e9604c2ea2b5bd7a20d178680f2ffd674492eb6388b3746 -->
# ArchSpine Scanner Integration Smoke Test

This file is a Vitest integration test suite that validates the Scanner engine's basic file discovery and policy application behavior in a controlled, temporary environment.

## Key Responsibilities

- Creates and manages temporary directories for isolated test execution.
- Generates synthetic file system fixtures (directories and files) to simulate scanning targets.
- Invokes the Scanner engine with a resolved scan policy to perform file discovery.
- Asserts that the Scanner correctly includes expected files and excludes ignored patterns.

## Out of Scope

- Unit testing of individual Scanner methods in isolation.
- Performance or stress testing of the Scanner engine.
- Testing of other engines or core components beyond Scanner.

## Notable Invariants

- Test files must end with `.test.ts` or `.spec.ts` (Rule: test-file-suffix).

## Exported or Externally Visible Behavior

This file does not export any public API surface. It is a test suite that runs as part of the Vitest framework and is not intended for external consumption.