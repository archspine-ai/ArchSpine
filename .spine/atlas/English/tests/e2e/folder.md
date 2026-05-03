This directory is the **end-to-end integration test suite** for the ArchSpine Command-Line Interface (CLI). It validates every major CLI command and workflow by running the built binary in isolated temporary environments and checking stdout, stderr, exit codes, and file‑system side effects.

The test files are grouped by the specific command or scenario they cover:

- **Core command tests**  
  - `cli-config.test.ts` – general CLI orchestration, configuration, and argument handling.  
  - `cli-init-advanced.test.ts` – the `init` command with interactive prompt simulation (user input injected via wrapper scripts).  
  - `cli-readonly.test.ts` – read‑only commands such as inventory and generation, plus JSON output validation.  
  - `cli-remove.test.ts` – the `remove` command, including prompt mocking and git workflow validation.  
  - `cli-repo.test.ts` – repository‑level commands (`init`, `build`) in a temporary git repository.

- **Pipeline & LLM tests**  
  - `cli-pipeline-mock.test.ts` – end‑to‑end pipeline execution with the prompts module intercepted.  
  - `cli-real-llm.test.ts` – real LLM integration tests (requires an API key) to verify generation against a live model.

- **Rule violation detection**  
  - `cli-real-violation.test.ts` – tests that enforce rule violations are correctly detected and reported, including exit code assertions.

All tests leverage Vitest, `child_process.spawnSync`/`execFileSync`, and `fs.mkdtempSync` to guarantee isolation and reproducibility. The most important implementation areas are the automated prompt‑simulation wrappers, the ephemeral directory lifecycle (setup/teardown with `beforeAll`/`afterEach`), and the precise assertion of CLI behavior against expected error messages and file‑system outcomes.