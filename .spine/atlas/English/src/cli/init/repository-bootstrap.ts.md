<!-- spine-content-hash:1c6f6f674beeab7048c3f7e6ccd674dd7c0f28885d857bd37af9c63efd930408 -->
# ArchSpine Bootstrap Command Adapter

## Role
This module is a CLI command adapter responsible for bootstrapping an ArchSpine configuration and its associated artifacts into a target repository. It acts as the entry point for initializing a repository with ArchSpine's managed files, scripts, hooks, and rule templates.

## Key Responsibilities
- Prompts the user to select or confirm an artifact strategy (`index`, `atlas`, or `hybrid`) for initialization.
- Coordinates the synchronization of managed repository files (e.g., `.gitattributes`, `.gitignore`) via the repository admin service.
- Coordinates the injection of package scripts and installation of recommended rule templates into the repository.
- Manages the installation and configuration of git hooks for pre-commit integrity checks.

## Notable Invariants & Negative Scope
- **Must remain a thin command adapter** — it delegates all core operations to dedicated services and must not contain business logic for repository management or artifact generation.
- **Out of scope**: Implementing pipeline or persistence logic, performing direct file system operations beyond coordination, or implementing business logic for artifact generation.

## Most Important Exported Behavior
- **`runRepositoryBootstrap`** — the primary public function that orchestrates the entire bootstrap process. It is the only externally visible surface of this module.