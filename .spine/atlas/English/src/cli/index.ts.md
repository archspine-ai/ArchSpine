<!-- spine-content-hash:7c89318ecab35bf20d89fdd03d7e2969d76e03580a0545ccf47acf6163b7f417 -->
## ArchSpine CLI Entrypoint Summary

**Role:**  
Primary CLI entrypoint and command router for the ArchSpine semantic mirror system.

**Key Responsibilities:**
- Configures global HTTP proxy via undici based on environment variables (`https_proxy` / `http_proxy`) before any application modules are imported.
- Bootstraps the runtime environment by initializing core infrastructure services (Config, Secrets, GlobalLLMConfig, RuntimeService) and checking manifest baseline.
- Parses command-line arguments (`process.argv`) to determine the requested operation and routes execution to the appropriate command executor module (e.g., init, sync, build, publish, check, fix, scan, history, etc.).
- Displays the system UI banner, provides help text (`printGeneralHelp`, `printCommandHelp`), and handles usage errors via `throwCliUsage`.
- Interacts with RuntimeService to retrieve resolved execution profiles and config states for routing decisions.

**Notable Invariants & Negative Scope:**
- CLI must remain a thin entrypoint and router; it must not absorb pipeline, persistence, or business logic that belongs in services, core, or infrastructure layers.
- All command implementations must reside in separate modules under `./commands/` and be imported dynamically or statically but not implemented inline.
- Environment-based proxy configuration must occur before any other imports that might perform network calls.
- Does **not** implement the actual logic of any specific command (e.g., build, fix, scan); those are delegated to dedicated modules under `./commands/`.
- Does **not** perform direct data persistence, LLM interactions, or pipeline execution.
- Does **not** manage file I/O or network requests beyond initial proxy configuration.
- Does **not** handle git operations or manifest manipulation directly.

**Exported / Externally Visible Behavior:**
- CLI executable invoked via command line (e.g., `node main.js <command> [options]`).
- Environment variables: `https_proxy`, `http_proxy` (for HTTP proxy configuration).
- Process exit codes (via `ErrorCodes` and `toArchSpineError`).
- stdout/stderr output for banner, help text, and progress messages.