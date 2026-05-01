<!-- spine-content-hash:fcf284698e43bd8557ea0f75e6df128be134bb54b3465c015032e7b158acf454 -->
# ArchSpine DTO Interfaces

This TypeScript module defines the core data transfer object (DTO) interfaces used across the ArchSpine synchronization and manifest system. It provides a centralized, type-safe contract for the data shapes that flow between subsystems.

## Role

Core TypeScript module defining shared DTO interfaces for the ArchSpine synchronization and manifest system.

## Key Responsibilities

- **SyncBlock** – Represents the state of a synchronization operation.
- **DocRef** – Represents a reference to a localized documentation file.
- **FileStatus** – Represents the status of a file within the system.
- **SpineManifest** – Represents the root manifest structure for the ArchSpine project.

## Notable Invariants

- All exported symbols are TypeScript interfaces (no classes or runtime values).
- Interfaces define data structures without methods.
- Relies on imported types from `./index-documents.js` and `./versions.js`.

## Negative Scope (Out of Scope)

- Does **not** implement synchronization logic.
- Does **not** validate or transform DTO data.
- Does **not** provide runtime instantiation of these interfaces.

## Exported Public Surface

- `SyncBlock`
- `DocRef`
- `FileStatus`
- `SpineManifest`

## Rule Violations

The following interfaces do not follow the `I` prefix naming convention required by the `interface-prefix` rule for internal interfaces: `SyncBlock`, `DocRef`, `FileStatus`, `SpineManifest`. (Severity: warning)

## Drift Detection

No drift detected.