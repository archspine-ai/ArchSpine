<!-- spine-content-hash:b163b8384e9f069b1a4dc2dd826586356c50e3a7894599286655832381245925 -->
# ArchSpine Usage Report Utility

## Role
ArchSpine CLI utility function that generates formatted usage and audit reports from the manifest database.

## Key Responsibilities
- Retrieves total usage statistics, summary breakdown, and active violations from the Manifest.
- Formats and outputs a human-readable report to the runtime IO channel.
- Handles empty data scenarios gracefully with appropriate messages.
- Calculates and displays token counts and estimated costs.

## Notable Invariants & Negative Scope
- **Depends on:** The Manifest interface for data retrieval and the RuntimeIO interface for output formatting.
- **Assumes:** The manifest database is accessible at the provided root directory.
- **Out of scope:** Data persistence or modification of the manifest database; user authentication or authorization; interactive command-line argument parsing; graphical user interface (GUI) rendering.

## Most Important Exported Behavior
- **`runUsageReport`** — the primary public function that executes the report generation and output.

## Architectural Intent
Provides a decoupled, reusable reporting function for CLI and other services to display usage and audit data. Part of a broader refactor to modularize CLI and decouple core infrastructure services.