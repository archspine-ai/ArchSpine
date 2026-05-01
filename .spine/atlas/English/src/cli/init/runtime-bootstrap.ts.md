<!-- spine-content-hash:b343483e3962c839f9c7d1914ea6c4fba72559f6081eed058e2375c18ffd53ea -->
# ArchSpine CLI Runtime Bootstrap

## Role
CLI runtime bootstrap orchestrator that initializes the ArchSpine system and triggers the build pipeline.

## Key Responsibilities
- Coordinates LLM credential setup and scope confirmation via runtime service prompts.
- Triggers initial file system scan using the Scanner engine to discover tracked files.
- Invokes language discovery to detect programming languages in the codebase.
- Updates the system manifest with the discovered language snapshot.
- Calls the build workflow command to process the scanned and discovered data.

## Out of Scope / Negative Scope
- Direct file system I/O or persistence operations (delegated to Scanner and Manifest).
- Language detection algorithms (delegated to `discoverLanguages`).
- Build pipeline execution details (delegated to `runBuildWorkflow`).

## Invariants
- CLI entrypoints must not absorb pipeline or persistence logic that belongs in services, core, engines, or infra.

## Public Surface
- `runRuntimeBootstrap(options: RuntimeBootstrapOptions): Promise<void>`

## Notable Rule Violation
- **cli-entrypoint-separation (error):** The `runRuntimeBootstrap` function orchestrates pipeline steps (scan, language discovery, manifest update, build workflow) directly, absorbing logic that should reside in services, core, engines, or infra. This violates the rule that CLI modules must stay as entrypoints and command adapters.

## Change Intent
- **Architectural intent:** Provide a thin CLI bootstrap entrypoint that initializes the system and delegates to engines and services.
- **Recent change intent:** Resolve lint errors and finalize pipeline fixes before v1.0, likely involving adjustments to the bootstrap flow.