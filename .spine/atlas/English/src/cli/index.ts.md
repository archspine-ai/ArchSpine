<!-- spine-content-hash:b51a8022e11eb47172d04d6b43e80afbf6432f5f28375f224f8fd01e89956788 -->
# ArchSpine CLI Entrypoint

## Role
Primary CLI entrypoint and command router for the ArchSpine semantic mirror system.

## Key Responsibilities
- Configures global HTTP proxy via undici based on environment variables before any other imports.
- Bootstraps runtime environment by initializing core infrastructure services (Config, Secrets, LLM configuration) and the RuntimeService.
- Parses command-line arguments to determine the requested operation and routes to the appropriate command executor (e.g., init, sync, build, publish, check, fix, scan, history, etc.).
- Displays the system UI banner and provides help text for commands.

## Notable Invariants & Negative Scope
- **Invariant:** CLI entrypoint must remain thin and not absorb pipeline or persistence logic (rule: cli-entrypoint-separation).
- **Out of Scope:** Pipeline or persistence logic—delegated to services, core, engines, or infra modules.
- **Out of Scope:** Business logic for individual commands—delegated to command modules (e.g., init, sync).

## Most Important Exported / Externally Visible Behavior
- The module is the primary CLI entrypoint; it is invoked directly from the command line.
- It performs early proxy configuration, runtime bootstrapping, argument parsing, and command routing.
- No domain logic is exposed; all business operations are delegated to dedicated command modules and services.