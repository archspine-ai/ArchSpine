<!-- spine-content-hash:b268f44939fb5af3dc6825c30d4a420f514a9a633a1b32bdd31315b2f85df904 -->
# ArchSpine – Git Client Utility

**Role:** Reusable engine utility providing a git command execution client for scanner modules.

**Key Responsibilities:**
- Defines the `ScannerGitClient` interface for executing git commands synchronously.
- Provides a default implementation that delegates to `child_process.execFileSync`.

**Out of Scope:**
- Orchestrating scanner workflows or service-level logic.
- Handling git repository state management or higher-level analysis.
- Providing asynchronous git command execution.

**Invariants:**
- Must remain decoupled from CLI entrypoints and presentation concerns.
- Must export a synchronous git client interface for engine consumption.

**Public Surface:**
- `ScannerGitClient` interface
- `defaultScannerGitClient` constant

**Architectural Intent:** Provide a decoupled, reusable git client interface for engine modules to execute git commands without depending on orchestration layers. This file remains a stable utility supporting scanner engines.