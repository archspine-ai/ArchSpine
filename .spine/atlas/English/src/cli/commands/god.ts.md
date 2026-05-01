<!-- spine-content-hash:eb5852e542698a8696c2876c0987f1975b56231532afdf54484aac9774bb0717 -->
# ArchSpine – God Mode CLI Handler

## Role
This module serves as the CLI command handler for the God Mode feature. It is responsible for presenting user warnings and obtaining confirmation before delegating the actual work to the God engine.

## Key Responsibilities
- Defines the command-line interface options for the God Mode command via the `ExecuteGodCommandOptions` interface.
- Displays warnings about the non-production nature and overwrite behavior of God Mode.
- Checks for the `--force` flag to bypass interactive confirmation.
- Prompts the user for explicit confirmation before proceeding (unless forced).
- Delegates execution to the God engine's `runGodMode` function.

## Notable Invariants & Negative Scope
- **Must remain a thin adapter** – This module must not absorb core logic; it only handles CLI routing and user interaction.
- **No pipeline or persistence logic** – It does not implement document generation, nor does it persist or read generated documents.
- **No complex orchestration** – It does not manage multi-step pipelines.

## Most Important Exported / Externally Visible Behavior
- `ExecuteGodCommandOptions` interface – Defines the CLI options for the God Mode command.
- `executeGodCommand` function – The main entry point that orchestrates warnings, confirmation, and delegation to the engine.