<!-- spine-content-hash:ab10d0fb9dbfac90cea76c35d4c1f5eaaaa23db1476b9caaaa1d1dba0970008a -->
# ArchSpine Init Command — Source Summary

## Role
CLI command orchestrator for initializing the ArchSpine environment, configuration, and repository structure.

## Key Responsibilities
- Parses CLI arguments for agent file specification (`--agent-file`), artifact strategy (`--artifact-strategy`), and package script injection (`--inject-package-scripts`).
- Manages language configuration selection and persistence for documentation via the Config service.
- Orchestrates repository bootstrap to set up `.spine` directory structure via the `runRepositoryBootstrap` function.
- Orchestrates runtime bootstrap to initialize runtime state via the `runRuntimeBootstrap` function and prompt for initial sync.

## Notable Invariants & Negative Scope
- Must remain a thin CLI adapter, delegating all pipeline and persistence work to services or bootstrap modules.
- Must not absorb logic that would make runtime behavior non-reusable outside the CLI.
- Pipeline or persistence logic that belongs in services, core, engines, or infra is out of scope.
- Direct filesystem or database operations beyond delegation to bootstrap functions are out of scope.

## Most Important Exported / Externally Visible Behavior
- `parseInitAgentFileArg` — parses the `--agent-file` argument.
- `parseInitArtifactStrategyArg` — parses the `--artifact-strategy` argument.
- `parseInitInjectPackageScriptsArg` — parses the `--inject-package-scripts` argument.
- `parseInitLanguageArg` — parses the language configuration argument.
- `runInit` — the main entry point that orchestrates the full initialization flow.