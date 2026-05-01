<!-- spine-content-hash:65869dd886d90e752d043f6bfaa138bbab86703fbbaa2c8d326020801165d549 -->
# ArchSpine Error Codes Module

## Role
Core infrastructure module providing centralized error code constants and error option type definitions for the ArchSpine system.

## Key Responsibilities
- Defines a canonical set of string error codes for various failure domains (CLI, runtime, publish, config).
- Exports the `ArchSpineErrorCode` type, a union of all defined error code strings, for type-safe error handling.
- Exports the `ArchSpineErrorOptions` interface specifying the structure for constructing structured errors.

## Notable Invariants & Negative Scope
- Must remain a pure TypeScript declaration file with no side effects.
- Must not depend on CLI entry points or runtime modules.
- Error codes must be string constants usable across the codebase.
- **Out of scope:** Error instantiation or throwing logic, CLI command execution or parsing, runtime service orchestration, pipeline stage implementation.

## Most Important Exported / Externally Visible Behavior
- `ErrorCodes` – the constant object containing all error code strings.
- `ArchSpineErrorCode` – the union type of all error code strings.
- `ArchSpineErrorOptions` – the interface for constructing structured errors.