## Utilities Directory

The `utilities` directory contains all shared infrastructure modules that power core ArchSpine operations: file synchronization, cryptographic fingerprinting, CLI presentation, and runtime mutual exclusion. These modules are designed to be standalone, testable, and reusable across different parts of the system.

### Notable Children and Groups

- **Agent Instruction Management** (`agent-instructions.sync.ts`, `agent-instructions.templates.ts`, `agent-instructions.ts`)  
  Handles the full lifecycle of ArchSpine-managed blocks in repository files: inserting, updating, and removing bounded sections in `.gitignore`, `.gitattributes`, `AGENTS.md`, search ignore files, spine ignore files, and `package.json` scripts. The `templates` file provides static marker constants and default content; the `sync` file implements all mutation logic; the barrel file re-exports a unified public API.

- **Fingerprinting** (`footprint.ts`)  
  Generates deterministic SHA-256 fingerprints for both architectural skeletons (`FileSkeleton`) and semantic contracts (`SpineSemantic`). This enables short-circuit change detection without full content comparison. Internally it normalizes and deduplicates import/export symbols for stable hash computation.

- **Safe File I/O** (`fs.ts`)  
  Provides atomic file writes (temp file + rename pattern) and safe copy operations with automatic directory creation. All operations are corruption-resistant and support rollback via `FileSystemManager`.

- **Git Hook Lifecycle** (`git-hook.ts`)  
  Manages the ArchSpine pre-commit hook: installation, update, and removal. It generates a managed shell block that locates the spine CLI, handles existing hooks gracefully (append vs. replace), sets executable permissions, and returns typed results (`installed`, `updated`, `appended`, etc.).

- **File Locking** (`lock.ts`)  
  Implements file-based mutual exclusion using lock files under `.spine/`. Uses `crypto.randomUUID` for tokens, detects stale locks by checking process liveness, and registers cleanup handlers for termination signals.

- **Path Normalization** (`repo-path.ts`)  
  Converts raw file system paths to repository-relative POSIX-separated strings, stripping `./` and `/` prefixes and converting Windows backslashes. Ensures consistent database key representation.

- **CLI UI** (`banner.ts`, `confirm.ts`)  
  `banner.ts` renders an ASCII art banner with version info using chalk theming. `confirm.ts` provides interactive confirmation prompts with both explicit text input and single-keypress modes, with proper terminal state management.

### Key Implementation Areas

- **Synchronization correctness**: The agent instruction sync module must handle multiple bounded blocks per file, detect stale blocks, and restore original content when removing managed sections.
- **Deterministic fingerprinting**: The `footprint` module's normalization of imports/exports is critical for reliable change detection; any ordering instability would produce false positives.
- **Atomicity and safety**: Both `fs.ts` and `git-hook.ts` depend on safe write patterns and backup/rollback to prevent corruption during concurrent operations.
- **Lock robustness**: The locking module must handle process crashes gracefully, preventing permanent lock files from blocking future runs.
- **Cross-platform path handling**: `repo-path.ts` ensures that paths from Windows and POSIX systems are normalized identically for database lookups.