## Test Suite Summary

The `tests/` directory houses the complete test suite for the ArchSpine mirror system, covering all layers of verification: unit tests, integration tests, end-to-end tests, and acceptance tests. Its primary responsibility is to validate the system's correctness, reliability, and architectural integrity through comprehensive testing of CLI commands, configuration, LLM integration, database operations, security, error handling, and core workflows.

### Notable Children and Grouping

The test suite is organized into several logical groups:

- **CLI and Workflow Tests** – Reside at the top level with names like `cli.test.ts`, `init-cli.test.ts`, `sync-command.test.ts`, `view-command.test.ts`, and `publish-command.test.ts`. These validate command-line execution, argument parsing, exit codes, and orchestration of core workflows (sync, check, fix, publish, view).

- **Configuration and LLM Tests** – Files such as `config.test.ts`, `config-validation.test.ts`, `llm-config.test.ts`, `llm.test.ts`, `llm-provider-utils.test.ts`, and `llm-command-ui.test.ts` verify configuration persistence, language settings, hook synchronization modes, LLM client resolution, secret injection, and provider utility functions.

- **Database and Index Tests** – `db-modules.test.ts`, `integrity.test.ts`, `index-reader.test.ts`, and `manifest.test.ts` validate schema initialization, batch commits, transaction integrity, index file schema enforcement, and manifest behavior.

- **Security and Error Handling Tests** – `security.test.ts`, `error-system.test.ts`, `credentials-backend.test.ts`, `credentials-store.test.ts`, `help-boundary-contract.test.ts`, and `schema-compliance.test.ts` cover credential storage, error propagation, lock serialization, schema validation, and security-sensitive prompt-flow behavior.

- **Engine and Core Logic Tests** – `scanner.test.ts`, `scan-policy.test.ts`, `context-engine.test.ts`, `prompt-engine.test.ts`, `post-commit-derivation.test.ts`, `runtime-service.test.ts`, `runtime-session.test.ts`, `task-runtime.test.ts`, `task-state-guard.test.ts`, `validate-task.test.ts`, and others verify file scanning, dependency resolution, prompt budget calculation, task orchestration, runtime configuration, and state management.

- **Subdirectories** – `tests/e2e/` contains end-to-end integration tests for CLI commands in isolated environments. `tests/engines/` holds integration tests for the Scanner engine. `tests/helpers/` provides utilities for concurrency lock testing (e.g., lock worker scripts). `tests/infra/` tests index-based resume recovery and LLM retry mechanisms.

### Key Implementation Areas

The most critical areas under test are:

- **Synchronization and Repair** – `sync-cli-built.test.ts`, `sync-command.test.ts`, `repair-policy.test.ts`, and `repair-forced-processing.test.ts` ensure sync workflows correctly handle file synchronization, repair policies, and forced processing.
- **Architectural Integrity** – `infra-facade-boundary.test.ts`, `view-module-boundary.test.ts`, and `footprint.test.ts` enforce layer separation, import rules, and structural/semantic footprint stability.
- **Resilience and Recovery** – `execution-checkpoint.test.ts`, `resume-services.test.ts`, `robustness.test.ts`, and `index-reader.test.ts` test checkpoint resume, cross-process lock management, and recovery from corrupted indexes.
- **Demo and Acceptance** – `demo-governance.test.ts` validates the full end-to-end governance workflow using the built CLI, ensuring sync, check, and fix operate correctly on a realistic project structure.
- **Platform Support** – `windows-platform.test.ts` tests platform-specific global directory resolution for Windows and non-Windows systems.