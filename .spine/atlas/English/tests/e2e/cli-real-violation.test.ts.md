<!-- spine-content-hash:382f8edf82648bc32a3b580a078840fb7aef0e25acbed77da9c0d01ef3cb9b04 -->
This file is an end-to-end (E2E) integration test for the ArchSpine CLI binary, implemented using Vitest. It validates the complete execution of the CLI and its ability to detect rule violations within isolated Git repositories.

**Key responsibilities:**
- Creates temporary directories (using `fs.mkdtempSync`) to provide fully isolated test environments.
- Initializes bare Git repositories and configures a test user identity as part of test scaffolding.
- Writes project configuration files (like `archspine.json`) programmatically via `fs.writeFileSync`.
- Executes the compiled CLI binary (`dist/cli/index.js`) using `child_process.execFileSync` or `spawnSync`.
- Asserts CLI exit codes and stdout/stderr output using Vitest expectations.
- Cleans up ephemeral directories after each test (either through OS temp cleanup or Vitest lifecycle hooks).
- Simulates user input by configuring a prompts module path.

**Notable invariants:**
- All test file names must end with `.test.ts` or `.spec.ts`.

**Negative scope (what the file does NOT cover):**
- Unit testing of individual functions or modules within the source code.
- Direct file system interactions outside of the temporary test directories.
- Cross-platform compatibility testing (though broader test intent includes it, this code is platform‑agnostic).

**Most important externally visible behavior:**
The file exports no public API or components. Its primary contribution is the collection of test cases it defines, each verifying specific CLI behaviors and rule violation detection scenarios. These tests serve as the authoritative verification of the CLI’s correctness in a controlled environment.