<!-- spine-content-hash:3afda12da942e9494d133daa85c2e72426014221afbb66cd6c4d6a7c0f7ff31d -->
# LoadedUnit — TypeScript Interface

## Role
TypeScript interface defining a metadata wrapper for `SpineUnit` with line count, used by infrastructure components for index reading.

## Key Responsibilities
- Defines the `LoadedUnit` interface combining a `SpineUnit` with its line count.
- Provides a typed structure for tracking source file metadata during processing.
- Serves as a data transfer object for index reading operations.

## Notable Invariants & Negative Scope
- Pure type definition with no executable code.
- Located in a core types directory, not subject to service/infra boundary rules.
- Does **not** include runtime orchestration, business logic, view-specific service functionality, or implementation of index reading/processing logic.

## Most Important Exported Behavior
- Exports the `LoadedUnit` interface, which is the sole public surface of this file.