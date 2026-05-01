<!-- spine-content-hash:626129714884864cb8452ab7bf28806b02bfffa233939589d0cc5cdb1d26be62 -->
# FileSystemManager — Infrastructure Utility

The `FileSystemManager` class provides atomic file write and safe file copy operations for the ArchSpine system. It is designed to prevent file corruption during writes and to handle file copy failures gracefully.

## Key Responsibilities

- **Atomic file writes**: Uses a temporary file and atomic rename pattern to ensure writes are corruption-resistant.
- **Directory creation**: Automatically creates the target directory (recursively) if it does not exist before writing.
- **Safe file copy**: Copies files while handling existing destination files and logging warnings on failure.

## Notable Invariants

- All file system operations are performed **synchronously**.
- Atomic writes are guaranteed via temporary file creation and atomic rename.
- Directory existence is verified and created if missing before any write operation.

## Out of Scope

- Network I/O operations
- File watching or event-driven filesystem changes
- Asynchronous file operations (uses synchronous methods)
- Complex file parsing or content transformation

## Public Surface

- `FileSystemManager`
- `FileSystemManager.safeWriteFile`
- `FileSystemManager.safeCopyFile`