# `src/cli` — Command‑Line Interface & Entry Point

The `src/cli` directory is the primary user‑facing entry point for the ArchSpine mirror system. It handles all terminal‑based operations, from project initialization and repository configuration to daily synchronization and system diagnostics.

## Notable Children

- **`index.ts`** – The main command router. It bootstraps the runtime (configuration, secrets, LLM setup), parses `process.argv`, and dispatches execution to the appropriate handler module (e.g., `init`, `sync`, `build`, `publish`, `check`, `fix`, `scan`, `history`). Also configures global HTTP proxy and displays system banners.

- **`cli-utils.ts`** – A set of UI presentation helpers for consistent command output: banner display (full/mini/suppressed), text wrapping, value parsing, error formatting, and step‑by‑step progress messages.

- **`help.ts`** – Renders general help (list of all commands grouped by category) and detailed per‑command help for operations such as `init`, `sync`, `view`, etc.

- **`document-languages.ts`** – Defines the `DocumentLanguageChoice` type and logic for building a list of supported document languages, including a separator for high‑capacity languages.

- **`commands/`** – Houses dedicated handler modules for each CLI subcommand; the router in `index.ts` delegates to these modules after argument parsing.

- **`init/`** – Orchestrates the full project initialization sequence: artifact strategy selection, rule template installation, Git hooks, LLM credential setup, file‑system scanning, language discovery, manifest updates, and handoff to the build workflow.

- **`repo/`** – Provides CLI adapters for checking and setting repository artifact strategies, with progress feedback and result display.

## Key Implementation Areas

- **Command Routing & Help** – Central argument parsing and dispatcher (`index.ts`) combined with comprehensive help text (`help.ts`) that stays current with experimental commands.
- **UI Formatting** – A consistent look and feel for all terminal output, handled by `cli-utils.ts`.
- **Initialization Flow** – A multi‑step bootstrap that prepares an ArchSpine project from scratch (`init/`).
- **Repository Configuration** – Interactive management of artifact strategies via the `repo/` adapters.