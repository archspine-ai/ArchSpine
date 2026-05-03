## Integration Tests for ArchSpine CLI (`tests/integration/`)

This directory contains the end‑to‑end integration test suite for the ArchSpine CLI. All tests are written in TypeScript using [Vitest](https://vitest.dev/) and validate the CLI binary by spawning it in isolated, temporary environments. They simulate real user interactions, assert correct output and exit codes, and clean up all artifacts after each run.

### Notable Children and Grouping

The test files are grouped by the CLI command or scenario they exercise:

- **`cli-config.test.ts`** – General CLI configuration and output validation (37 tests across 7 files).  
- **`cli-init-advanced.test.ts`** – Advanced `init` command behaviors, including interactive prompt simulation.  
- **`cli-pipeline-mock.test.ts`** – End‑to‑end pipeline flow with a mocked prompt module.  
- **`cli-readonly.test.ts`** – Read‑only commands (inventory, validation) and file generation output.  
- **`cli-real-llm.test.ts`** – Real LLM integration in a temporary git repository.  
- **`cli-real-violation.test.ts`** – Rule violation detection using a bare git repository.  
- **`cli-remove.test.ts`** – `remove` and related commands with prompt mocking.  
- **`cli-repo.test.ts`** – Repository‑level commands (`init`, `build`) in a child process.

### Key Implementation Areas

- **Isolated Git Repositories** – Each test creates a temporary directory (via `fs.mkdtempSync`) and often initializes a git repo with a fixed branch and user configuration to guarantee a clean, reproducible environment.
- **Prompt Mocking** – To simulate interactive input, tests write wrapper scripts that intercept or stub the `prompts` module, allowing automated non‑interactive execution.
- **Binary Spawning** – All tests use `child_process.spawnSync` or `execFileSync` to run the built CLI binary (`dist/cli/index.js`) with controlled arguments.
- **Lifecycle Management** – Using Vitest’s `beforeAll` and `afterEach` hooks, tests set up scaffolding (e.g., `archspine.json`) and clean up temporary directories to prevent disk pollution.
- **Assertion of Side Effects** – Tests verify not only stdout and stderr but also file creation, directory structure, and JSON output of CLI commands.

These suites collectively ensure the reliability of ArchSpine’s CLI across initialization, generation, removal, pipeline execution, and violation detection workflows.