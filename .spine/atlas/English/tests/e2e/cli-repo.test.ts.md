<!-- spine-content-hash:b03a3983271a45378b313ef9f137da07b1972af277b580ca0495a3a68c459529 -->
## ArchSpine CLI E2E Test Suite (Vitest)

This file provides a comprehensive **end-to-end (E2E) test suite** for the ArchSpine CLI commands, implemented using Vitest. It validates the CLI’s behavior by running commands in a child process with `spawnSync`, setting up temporary directories and configuring the execution environment, then asserting outputs against expected results.

### Responsibilities

- Spawns ArchSpine CLI commands (e.g., `init`, `build`) in isolated subprocesses.
- Creates temporary workspaces and configures environment variables for test runs.
- Executes integration tests for specific subcommands, including interactive scenarios (via wrapper scripts).
- Cleans up all temporary artifacts after each test using `afterEach`.
- Organizes test scenarios with `describe` and `it` blocks, leveraging Vitest matchers.
- Writes auxiliary scripts to simulate interactive CLI input when needed.

### Out of Scope

- Unit tests for individual functions or modules inside ArchSpine.
- Production code of the CLI or library.
- Non-CLI features (e.g., GUI, browser testing).
- Cross-platform or performance testing.

### Notable Invariants

- All test file names must end with `.test.ts` or `.spec.ts`.

### Public Surface

- **No public exports.** This file is a self-executing test suite, not a library module. It is run by Vitest directly and does not expose any functions or classes for external consumption.