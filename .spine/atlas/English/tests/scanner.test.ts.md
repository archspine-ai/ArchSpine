<!-- spine-content-hash:8677caab10a61e0bfb3a9d68ca61dc2d47ab8e0ce8c9d6889cb0c90f68558c95 -->
# Scanner Test Suite

This Vitest test suite validates the Scanner engine's file scanning behavior within isolated temporary directories. Each test creates a fresh temporary directory containing a `.spine` subdirectory and a `.gitignore` file, then instantiates a `Config` object bound to that directory to simulate a real project configuration. The suite exercises the Scanner's file discovery logic against controlled filesystem structures, using `vi.fn` to mock and spy on filesystem interactions where necessary.

## Key Responsibilities

- Create a temporary directory with `.spine` subdirectory and `.gitignore` for each test run
- Instantiate a `Config` object bound to the temporary directory to simulate project configuration
- Test the Scanner's file discovery logic against controlled filesystem structures
- Use `vi.fn` to mock and spy on filesystem interactions where needed

## Out of Scope

- Testing non-Scanner components like the Config engine in isolation
- End-to-end integration testing with live external services
- Performance benchmarking of scanning operations

## Invariants

- Each test runs in a fresh temporary directory to ensure isolation
- Uses the `Config` class to provide a valid configuration context for the Scanner
- Relies on Vitest's mocking utilities (`vi`) for controlled filesystem interactions

## Architectural Intent

Provide isolated, deterministic unit tests for the Scanner engine's core file discovery and scanning logic. Recent changes have hardened scan resume validation and fixed fallback paths.