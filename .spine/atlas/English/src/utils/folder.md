# Shared Utilities — `src/shared/utils/`

This directory provides the common infrastructure modules shared across the ArchSpine CLI and its core operations. These utilities collectively support file synchronization, template generation, terminal interaction, cryptographic fingerprinting, file I/O safety, git hook management, and system-level locking.

## Notable Children & Grouping

The modules fall into several functional clusters:

- **Agent instruction synchronization & templates** – `agent-instructions.sync.ts`, `agent-instructions.templates.ts`, and their barrel export `agent-instructions.ts` handle reading, writing, and removing ArchSpine-managed blocks in `.gitignore`, `.gitattributes`, `AGENTS.md`, `searchignore`, `.spineignore`, and `package.json` scripts. They also provide static configuration for marker delimiters and default ignore pattern content.
- **CLI presentation** – `banner.ts` renders branded ASCII art banners with version information using chalk theming. `confirm.ts` provides interactive confirmation prompts (both text input and single-keypress modes) with colored output via kleur.
- **Cryptographic fingerprinting** – `footprint.ts` computes stable SHA-256 hashes for `FileSkeleton` and `SpineSemantic` objects, enabling structural and semantic change detection.
- **Safe file I/O** – `fs.ts` implements atomic file writes (temp‑file + rename) and safe copy operations with directory creation.
- **Git hook lifecycle** – `git-hook.ts` manages the pre-commit hook installation, update, and removal, delegating to the spine CLI and performing safe backups.
- **Mutual exclusion** – `lock.ts` provides file‑based locking inside `.spine/` with UUID token generation and stale‑lock detection.
- **Path normalization** – `repo-path.ts` normalizes filesystem paths to repository‑relative, POSIX‑separated keys for consistent database lookups.

## Key Implementation Areas

The most critical modules for system correctness are `agent-instructions.sync.ts` (centralized I/O for all managed blocks), `footprint.ts` (deterministic fingerprinting that drives change detection), and `lock.ts` (prevents race conditions in concurrent operations). The git‑hook lifecycle (`git-hook.ts`) is essential for repository integration, while `fs.ts` ensures data integrity through atomic writes.