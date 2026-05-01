<!-- spine-content-hash:ab312cd25e97a5290cb5ac6cfb80370cf50fc2acb270a59b3cff0d2e969abd1b -->
# ArchSpine – Languages Command Adapter

## Role
This module is a thin CLI command adapter for interactive documentation language configuration management in the ArchSpine system. It bridges user-facing CLI commands with backend services without containing business logic itself.

## Key Responsibilities
- Presents an interactive prompt for users to select documentation languages from available choices.
- Lists currently configured languages from the system configuration.
- Loads and displays language snapshots from the manifest for user reference.
- Saves updated language selections back to the configuration via the infrastructure layer.

## Notable Invariants & Negative Scope
- **Must remain a thin command adapter** – it delegates all business logic and persistence to services and infrastructure modules.
- **Must not contain** pipeline, scanning, or data transformation logic.
- **Out of scope:** Core language discovery or validation (handled by the `document-languages` module), direct persistence (handled by the Config service), and any business logic for language processing or analysis.

## Most Important Exported / Externally Visible Behavior
- Exposes the `ExecuteLanguagesCommandOptions` interface, which defines the contract for executing the languages command.