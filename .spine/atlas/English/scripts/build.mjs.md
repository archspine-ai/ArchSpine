# ArchSpine Build and Distribution Script

## Why This Document Exists

This document describes the automated build script that transforms ArchSpine’s TypeScript source tree into a ready-to-distribute package. It exists to centralize and codify the build pipeline steps, ensuring consistency and reproducibility across releases. It anchors the workflow that every maintainer or contributor must follow when preparing a distribution.

## Who Should Read It

- **Project maintainers** responsible for publishing ArchSpine releases.
- **Infrastructure contributors** who need to modify the build chain (e.g., adding new asset types, changing compilation flags, or adjusting cleanup logic).
- **Developers debugging distribution issues** who want to understand exactly what happens between source code and the final `dist/` folder.

## Key Decisions and Workflows

The script is written as a Node.js module using ES module syntax (`import/export`). It is intended to be run directly or invoked programmatically.

### Compilation

- TypeScript compilation is performed via `tsc` (the standard TypeScript compiler). The command runs from the repository root and inherits `stdio` so that compilation errors are visible.

### File Copying

- Non-TypeScript assets (e.g., rule files in `src/ast/rules/` and the entire `src/assets/` directory) are manually copied into `dist/` using `fs.copyFileSync` and a recursive directory copy function (`copyDir`).
- The copy logic respects an exclusion function (`shouldExcludeDistEntry`) that filters out any path containing `__mocks__` to prevent test stubs from leaking into the distribution.

### Cleanup

- The script explicitly removes all `__mocks__` directories from `dist/` after the initial copy. This is a safety net in case any mock files were inadvertently copied.
- Before anything, the entire `dist/` directory is deleted to avoid mixing old artifacts.

### Executable Permissions

- The CLI entry point (`dist/cli/index.js`) is given executable permission (`chmod 755`) so that users can invoke it directly without needing to run through `node`.

## How to Use

Run the script as a standalone command (it checks `process.argv[1]` against its own URL). Typically this is done via an npm script or a continuous integration job.

```bash
node build.js
```