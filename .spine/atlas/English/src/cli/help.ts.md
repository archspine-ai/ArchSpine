<!-- spine-content-hash:e3643077b264960090ae0924fadc376938235c1668c16951131a4faf79917e84 -->
# ArchSpine CLI Help Renderer

## Role
This module is the **CLI help text renderer** for the ArchSpine command-line interface. It is responsible for presenting help information to users in a readable, formatted manner.

## Key Responsibilities
- **General help display**: Formats and prints the main help message that lists all available commands grouped by category (e.g., Setup & Config, Core Workflows).
- **Command-specific help**: Provides detailed help for individual commands (`init`, `try`, `sync`, etc.) using a switch-based dispatch function.
- **Up-to-date descriptions**: Maintains current command descriptions, including experimental features such as the `view` command runtime.

## Notable Invariants
- **No business logic**: This module must not import or invoke any pipeline, persistence, or core domain logic. It is strictly a presentation layer.
- **Side-effect limited**: The only side effect allowed is console output. No file I/O, configuration changes, or state mutations occur here.

## Out of Scope (Negative Scope)
- Command execution or business logic for any CLI command.
- Pipeline orchestration, persistence, or core domain logic.
- Configuration reading or writing (delegated to the config module).
- Git hook management logic (delegated to the hook module).

## Public Surface (Exported Behavior)
- `printGeneralHelp()` – Prints the full list of commands and categories.
- `printCommandHelp(cmd: string)` – Prints detailed help for a specific command identified by its name.

## Architectural Intent
This module serves as a thin CLI adapter for rendering help text, ensuring that command routing remains cleanly separated from business logic. It enforces the **cli-entrypoint-separation** rule by avoiding any dependency on internal domain modules.