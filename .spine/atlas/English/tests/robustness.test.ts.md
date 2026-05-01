<!-- spine-content-hash:c05545d1de48c32efcdc560278b13f24b46c5466ca94563e758d1e2a4759a3fe -->
# ArchSpine Lock Worker Test Suite

## Role
This is a Vitest test suite that validates cross-process lock acquisition and release behaviors using an isolated worker script. It ensures that the lock worker operates correctly across process boundaries.

## Key Responsibilities
- Spawns child processes running the lock worker script with configurable operation modes: `acquire-release`, `acquire-hold`, and `acquire-release-rewrite`.
- Listens to worker stdout and stderr to capture and parse JSON results for assertion.
- Cleans up temporary directories and processes after each test to ensure isolation.
- Asserts expected lock payload serialization and parsing consistency across process boundaries.
- Validates error codes and messages for failure scenarios in multi-process lock operations.

## Notable Invariants
- Uses Vitest testing framework with `describe`/`it`/`beforeEach`/`afterEach` structure.
- Relies on Node.js `child_process` for process isolation in tests.
- Depends on lock payload serialization utilities from `src/utils/lock.js`.
- Cleans up test artifacts via `FileSystemManager`.

## Negative Scope (Out of Scope)
- Does **not** implement the core lock acquisition logic (delegated to the worker script).
- Does **not** provide production lock management utilities.
- Does **not** handle real-time lock coordination beyond test simulation.

## Most Important Exported Behavior
The test suite validates that lock operations (acquire, release, hold, rewrite) work correctly across separate Node.js processes, ensuring serialization consistency and proper error handling. It is the primary validation layer for the lock worker's multi-process behavior.