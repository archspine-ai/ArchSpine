<!-- spine-content-hash:c8c6f6b7821d81911bc78aac24d04b639766d5fc11c5bef8cffbff1ed75b0efe -->
# FileStatusSnapshot — TypeScript Interface

## Role
TypeScript interface defining a data structure for file metadata snapshots within the ArchSpine mirror system.

## Key Responsibilities
- Defines the shape of a file status snapshot, including modification time (`mtime`) and file size.
- Provides a type contract for components that need to pass or store file metadata consistently.

## Notable Invariants & Negative Scope
- **Pure type definition** with no executable code.
- Exports a single interface for structural typing.
- Serves as a stable data contract across the codebase.
- **Out of scope:** Infrastructure orchestration, facade provision, runtime logic, validation, serialization, or direct integration with scanners, engines, or services.

## Most Important Exported Behavior
- **`FileStatusSnapshot`** — the sole public surface; used by scanning, comparison, and reporting components to ensure consistent file metadata representation.