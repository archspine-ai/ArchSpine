<!-- spine-content-hash:0e670d8386f29a58a1b336bc1a6a632fbc6259151056f7c8c1576e81d43c699c -->
This file serves as the integration test suite for ArchSpine's CLI commands, built with vitest. It spawns the compiled CLI binary and simulates user interactions to validate end-to-end behavior.

**Key responsibilities:**
- Exports the `runCli` helper that launches the CLI with given arguments, capturing stdout, stderr, and exit code.
- Creates ephemeral temporary directories per test to prevent file system contamination.
- Mocks the `prompts` module via a custom wrapper script, enabling automated input injection.
- Executes comprehensive end-to-end tests covering `init`, `generate`, and configuration commands using `describe`/`it` blocks.
- Integrates with `git` through `execFileSync` to verify scaffolding and commit workflows.
- Cleans up temporary directories in `afterEach` hooks.

**Notable invariants & out-of-scope:**
- Test files must follow the `<name>.test.ts` or `<name>.spec.ts` naming convention.
- Temporary directories are created and destroyed deterministically.
- All tests target the built CLI at `dist/cli/index.js`.
- Lifecycle hooks from vitest enforce proper isolation.
- This suite does **not** cover unit tests of internal modules, UI/browser testing, performance/load testing, or cross-platform compatibility beyond the test environment.

**Primary external interface:** The `runCli` helper function is the most important exported behavior, enabling any test to programmatically exercise CLI commands and assert on output and exit codes.