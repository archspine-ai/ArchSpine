The `tests/` directory is the test suite for the ArchSpine system. It validates all core subsystems, including CLI commands, configuration management, LLM integration, sync workflows, repository bootstrap, credential storage, database operations, error handling, and architectural boundary enforcement. Testing is conducted through isolated unit tests, integration tests, and end-to-end workflows.

Tests are organized into several subdirectories by testing focus:
- **`tests/e2e/`** – End-to-end integration tests for CLI commands (init, pipeline execution, rule violation detection) using isolated git repositories and mocked prompts.
- **`tests/engines/`** – Integration tests for the Scanner engine, validating file discovery and exclusion logic.
- **`tests/helpers/`** – Utility scripts, including a lock manager test harness for multi-process lock behavior.
- **`tests/infra/`** – Tests for index-based resume recovery and LLM retry mechanisms, covering partial/corrupted index states and failure simulation.

Notable concrete submodules and test files include:
- `cli.test.ts` – E2E test of CLI command workflow and core engine orchestration using a custom mock LLM client.
- `schema-compliance.test.ts` – Validates JSON schemas and SyncService integration with Ajv.
- `integrity.test.ts` – Tests SpineDB batch commit atomicity and rollback on constraint violations.
- `robustness.test.ts` – Validates cross-process lock acquisition and release via an isolated worker script.
- `credentials-store.test.ts` – Tests CredentialStore with multiple backends, fallback file safety, and gitignore hardening.
- `config-validation.test.ts` – Validates configuration loading, language defaults, hook sync mode, and warning emissions.
- `error-system.test.ts` – Ensures consistent error propagation across service and infrastructure facade modules.
- `infra-facade-boundary.test.ts` – Enforces architectural boundary rules through import analysis.
- `view-module-boundary.test.ts` – Validates placement of view modules under `src/services/view` to maintain layer separation.

The test suite emphasizes isolated temporary directories for each test case to avoid side effects, extensive use of mocks (Vitest), and comprehensive coverage of both happy paths and error/edge cases across all major subsystems.