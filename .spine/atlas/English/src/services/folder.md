The `src/services` directory implements the service orchestration layer of the ArchSpine mirror system. It coordinates multi-stage pipelines for scanning, AST extraction, validation, LLM-driven correction, synchronization, summarization, and view generation. This layer bridges CLI commands with infrastructure components by managing runtime sessions that support checkpoints, resume, error handling, and configuration resolution.

Key submodules include:
- **check-service**: Orchestrates the check pipeline (scan, AST extraction, validation) with session lifecycle and usage recording.
- **fix-service**: Manages the fix pipeline with retry logic (up to 2 attempts), recheck passes, and runtime session integration.
- **sync-service**: Coordinates the full synchronization pipeline (reconciliation, scanning, AST extraction, summarization, state commit, post-commit derivation) and integrates with the view service registry.
- **llm-admin-service**: Bridges CLI commands for LLM configuration with config/secrets stores and resolves status views.
- **runtime-service**: Central facade that resolves LLM settings, execution profiles, view configurations, and constructs `CheckService`, `FixService`, and `SyncService` instances.
- **view-service** (inside `src/services/view`): Generates and renders architectural views (architecture diagrams, risk hotspots, public surface) from indexed codebase data using LLM specifications and markdown templates.
- **task-runtime**: Factory that prepares a fully configured task context, including scanner, aggregator, AST extractor, rule engine, context engine, and output manager.
- **repository-admin-service**: Manages repository artifact strategies, agent instructions, and syncing of managed files (git attributes, git ignore, package scripts).
- **runtime-session**: Provides resumable command execution sessions with checkpoint validation, lock management, and protected output mutation safety.
- **publish-preflight**: Validates pre-publish conditions (directory presence, manifest integrity, lock file validity, snapshot readiness).
- **runtime-execution-profile**: Resolves execution profiles from LLM settings and runtime commands, handling defaults and command-specific overrides.

These components together ensure consistent, resumable, and policy-compliant operations across the entire ArchSpine mirror workflow.