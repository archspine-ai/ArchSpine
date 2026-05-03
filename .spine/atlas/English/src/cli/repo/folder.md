## Directory: Repository Artifact Strategy CLI Adapter

This directory serves as the CLI command adapter layer for repository artifact strategy operations within the ArchSpine system. It provides the command-line interfaces to both **check** and **set** the artifact strategy (either `"local"` or `"distributable"`) for a given repository.

### Structure and Grouping

The directory contains a single primary module:

- **`strategy.ts`** – The main entry point that orchestrates all CLI interactions. It parses and normalizes strategy input from command-line arguments, delegates to core logic via `checkRepositoryStrategy` and `applyRepositoryStrategy`, and displays step-by-step progress and results using a `printStep` callback.

All logic is encapsulated in one file, keeping the adapter focused on input/output concerns while the core business rules remain in a separate domain layer.

### Key Implementation Areas

1. **Input Parsing** – Validates and normalizes the user-supplied strategy value (`"local"` or `"distributable"`) from CLI arguments.
2. **Strategy Checking** – Calls `checkRepositoryStrategy` to report current strategy status, including warnings for missing or inconsistent strategies.
3. **Strategy Setting** – Invokes `applyRepositoryStrategy` with a progress callback (`printStep`) to provide real-time feedback during the operation.
4. **Configuration Reporting** – Reads system configuration (`Config`) to display the persisted artifact strategy and the initialization strategy back to the user.

### Concrete Submodules

- `strategy.ts` – The sole and complete CLI adapter for repository artifact strategy check/set commands.