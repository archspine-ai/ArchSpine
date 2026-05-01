<!-- spine-content-hash:7cf308e51abca3228e225829a0af22011fdeb2326a8cba6c79607e959c6301c1 -->
# ArchSpine — `repo` Command Router

This module serves as the **CLI command router** for repository-level operations within the ArchSpine system. Its primary responsibility is to accept a `repo` subcommand from the command line, validate the arguments, and dispatch execution to the appropriate strategy function.

## Key Responsibilities

- Defines the `ExecuteRepoCommandOptions` interface, which specifies the shape of options passed to the repository command executor.
- Routes the `repo` subcommand to one of three strategies: `check`, `strategy`, or `help`.
- Validates subcommand arguments and calls `throwCliUsage` to display usage guidance when input is invalid.
- Coordinates parsing and execution of repository artifact strategies via `parseArtifactStrategy`.

## Notable Invariants

- This module must remain a **thin router** — it should never contain business logic for repository scanning, analysis, or artifact generation.
- All core logic is delegated to services and engines (e.g., `repo/strategy.js`).

## Out of Scope

- Implementing repository analysis or strategy logic (delegated to `repo/strategy.js`).
- Handling configuration loading or persistence.
- Directly managing file I/O or pipeline execution.

## Public Surface

- `ExecuteRepoCommandOptions` — interface for command execution options.
- `executeRepoCommand` — the main function that routes subcommands to their handlers.