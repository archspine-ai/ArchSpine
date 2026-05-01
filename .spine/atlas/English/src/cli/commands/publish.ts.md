<!-- spine-content-hash:53452e47c5aa276fa3a8d5816eef961a106e3d9cffadaa8fec5db50472871a94 -->
# ArchSpine Publish Command Handler

## Role
CLI command handler orchestrating the publish workflow for the ArchSpine mirror system, coordinating preflight checks, sync, document backfill, and atlas state management.

## Key Responsibilities
- Validates publish preconditions via runtime baseline and snapshot readiness assertions.
- Warns if publishing from a local Git strategy to prevent unintended distribution.
- Executes the sync workflow to ensure the atlas is up-to-date before publishing.
- Runs the DocumentBackfillTask to backfill missing documents before publishing.
- Clears stale atlas data via `Manifest.open(rootDir).clearAtlasStale()` to ensure a clean publish state.
- Coordinates with `RuntimeService`, `Config`, and runtime IO to execute the publish command.

## Out of Scope
- Direct database or persistence layer operations (e.g., raw queries, index management).
- LLM client resolution or model configuration details.
- Language-specific translation or generation logic.
- Snapshot creation or versioning logic.

## Invariants
- CLI entrypoints must not absorb pipeline or persistence logic; they should delegate to services, core, engines, or infra layers.
- Preflight checks must be performed before any publish operation.
- The sync workflow must complete successfully before publishing.

## Public Surface
- `ExecutePublishCommandOptions` (interface)

## Notable Violations
The publish command handler directly imports and invokes `DocumentBackfillTask` (a task) and `Manifest.open(rootDir).clearAtlasStale()` (persistence logic). This violates the rule that CLI modules should stay as thin entrypoints and not absorb pipeline or persistence logic. These responsibilities should be delegated to a service or engine layer.

## Drift Detected
Yes. The previous semantic contract did not include responsibilities for running `DocumentBackfillTask` or clearing stale atlas data via `Manifest`. The current implementation adds these pipeline/persistence operations, indicating semantic drift.