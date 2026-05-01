<!-- spine-content-hash:eeb2acb68544c963938be12864f64a62efbb17a0068e1f0093efe135ca7df566 -->
# ArchSpine Demo Governance Acceptance Test Suite

## Role
This is a Vitest acceptance test suite that validates the end-to-end demo governance workflow of the ArchSpine system. It ensures that the core CLI commands operate correctly in a realistic, isolated environment.

## Key Responsibilities
- Creates a temporary, isolated test directory that mirrors the demo project structure.
- Copies all necessary demo source files and configuration into the test environment.
- Executes the built ArchSpine CLI commands (`sync`, `check`, `fix`) against the test directory.
- Verifies the correctness of synchronization, architectural rule checking, and automated fix mechanisms.

## Out of Scope
- Unit testing of individual services or engines.
- Integration testing with external LLM APIs (the suite uses `MockClient`).
- Performance or load testing.

## Notable Invariants
- Test files must end with `.test.ts` or `.spec.ts` to comply with the test-file-suffix rule.

## Exported / Public Surface
- `describe('demo governance acceptance')` — the top-level test suite block.
- `runBuiltCli(command, args)` — a helper function that runs the built CLI with given arguments.

## Change Intent
The architectural intent is to provide a comprehensive acceptance test for the demo governance workflow, ensuring that the `sync`, `check`, and `fix` commands work correctly end-to-end. The most recent changes resolved lint errors and finalized pipeline fixes before v1.0, making the acceptance tests stable and reliable.