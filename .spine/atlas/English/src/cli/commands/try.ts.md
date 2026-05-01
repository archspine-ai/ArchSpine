<!-- spine-content-hash:a175724ae462044e0cef102accaff027b8b901d7b94818f2e34f7f981ad62879 -->
# ArchSpine – `try` Preview Command Adapter

## Role
This module acts as the CLI command adapter for the `try` preview command. It is responsible for validating the filesystem, parsing configuration, and providing immediate user feedback.

## Key Responsibilities
- Validate that specified directories exist and are non-empty using synchronous filesystem checks.
- Parse and validate the `archspine.json` configuration file for required schema properties.
- Output user guidance and error messages to the console based on validation results.
- Coordinate the command flow, including displaying a UI banner and delegating usage errors.

## Notable Invariants & Negative Scope
- **Must remain a thin CLI adapter.** All non-UI logic should be delegated to engines or services.
- **Must not contain business rules or domain logic.** This module should not implement scanning, analysis, or transformation pipelines.
- **Must rely on injected utilities** for filesystem and configuration operations to allow testing.
- **Out of scope:** Business logic for scanning or analysis pipelines, persistence beyond basic file reads, network or external service communication, and complex data transformation or orchestration.

## Public Surface
- `ExecuteTryCommandOptions` interface

## Rule Violations
- **cli-entrypoint-separation (error):** The module directly performs filesystem I/O (`fs.existsSync`, `fs.readdirSync`, `fs.readFileSync`) and JSON parsing, which are pipeline/persistence logic. According to the rule, such logic belongs in services, core, engines, or infra, not in the CLI entrypoint.

## Drift Status
- **Drift detected:** No
- **Drift reason:** N/A