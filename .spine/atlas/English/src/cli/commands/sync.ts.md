<!-- spine-content-hash:a31ce59c19f341c1db2b74644afceee5e50a3c0eaec445ef07c0499fc258eb9a -->
# ArchSpine Sync Command Adapter

## Role
CLI command adapter orchestrating the synchronization workflow for the ArchSpine mirror system.

## Key Responsibilities
- Parses CLI arguments to determine sync mode flags (e.g., `--force`, `--dry-run`, `--repair`) and validates argument combinations.
- Coordinates the sync workflow by delegating to Scanner, Manifest, RuntimeService, and language discovery modules via `runSyncWorkflow`.
- Enforces spine gate protection by invoking `detectProtectedOutputMutations` before proceeding with sync.
- Evaluates and applies repair policies via `evaluateRepairPolicy` when protected outputs are mutated or corrupted.
- Formats sync LLM resolution output for user-facing display.

## Notable Invariants & Negative Scope
- **Must remain a thin CLI adapter** – must not absorb pipeline or persistence logic that belongs in services, core, engines, or infra (per rule `cli-entrypoint-separation`).
- **Must validate CLI argument combinations** before proceeding with sync workflow.
- **Must enforce spine gate protection** before allowing sync mutations.
- **Must delegate all domain logic** to appropriate service/engine/infra modules.
- **Out of scope:** Direct file system scanning, manifest file I/O, runtime service execution, language discovery, diff computation, protected output mutation detection, repair policy evaluation, and execution checkpoint storage.

## Most Important Exported Behavior
- `formatSyncLLMResolution` – formats the sync LLM resolution output for user-facing display.