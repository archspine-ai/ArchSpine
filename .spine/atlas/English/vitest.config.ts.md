<!-- spine-content-hash:d8bd94315d8a32ca3e3f69e32ca1e6690aaeabe7270b60c0205843847c813403 -->
# ArchSpine Vitest Configuration

## Role
This file serves as the Vitest configuration for the ArchSpine project, defining test runner settings and timeouts.

## Key Responsibilities
- Configures Vitest test runner inclusion patterns to target test and benchmark files in the `tests` directory.
- Sets a global test execution timeout of 60 seconds for all test suites.
- Sets a global hook timeout of 20 seconds for setup/teardown operations.
- Exports the configuration for consumption by the Vitest test runner.

## Notable Invariants & Negative Scope
- **Invariant:** Must export a default configuration object compatible with Vitest's `defineConfig`.
- **Out of Scope:** This file does not define environment variables or aliases, configure code coverage reports, or set up global setup/teardown scripts.

## Public Surface
- **Default export:** A Vitest configuration object.