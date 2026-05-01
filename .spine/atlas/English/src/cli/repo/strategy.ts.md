<!-- spine-content-hash:af11cf4c189a12d47d81301e8a419f8813c157174f1f65aabaa47133f1c5f475 -->
# ArchSpine CLI Artifact Strategy Adapter

## Role
CLI command adapter for repository artifact strategy management within the ArchSpine system.

## Key Responsibilities
- Parses and validates the artifact strategy input from CLI arguments.
- Coordinates repository strategy checks and application by delegating to the repository admin service.
- Provides user-facing console output for strategy operations, including warnings and step-by-step feedback.
- Integrates with the system configuration to retrieve persisted and initialization artifact strategies.

## Notable Invariants & Negative Scope
- Must remain a thin command adapter, delegating core logic to services.
- Must not contain business logic for repository strategy evaluation or application.
- Must provide clear console feedback for CLI users.
- Out of scope: implementing repository strategy logic (handled by repository-admin-service), persisting configuration changes (handled by config infra), and direct file system operations for artifact management.

## Most Important Exported Behavior
- `parseArtifactStrategy(value: string | undefined): ArtifactStrategy | undefined` — Parses and validates artifact strategy input from CLI arguments, returning the strategy or undefined if input is missing or invalid.