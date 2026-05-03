# ArchSpine SpineManifest Configuration Summary

## Overview

The **SpineManifest** is the authoritative sync index for the ArchSpine mirror system. It records the state of indexed source files, their documentation mappings across multiple locales, and synchronization metadata. This manifest serves as the single source of truth for operators managing documentation coverage and cross-locale consistency.

## Key Parameters

- **schemaVersion**: The version of the manifest schema used. Ensures compatibility between tools and the manifest file.
- **generatorVersion**: The version of the tool that generated this manifest. Helps track which software produced the manifest.
- **createdAt / updatedAt**: ISO 8601 timestamps for when the manifest was first created and last updated. Operators can use these to gauge staleness.
- **sync**: An object containing synchronization state:
  - **lastSyncAt** (date-time or null): The timestamp of the last synchronization cycle.
  - **lastSyncMode** (enum: `full`, `incremental`, `unknown`): Indicates whether the last sync was a full rebuild, an incremental update, or unknown.
  - **reverseIndexComplete** (boolean): Whether the reverse index (mapping from documentation back to source) has been fully built.
  - **indexedUnitCount** (non-negative integer): Total number of indexed units (source files) tracked.
- **files**: A map from repo-relative source file paths to their indexing metadata. Each entry contains:
  - **contentHash**: A checksum of the source file content for integrity checks.
  - **fileKind**: The type or category of the file (e.g., plain, generated, etc.).
  - **lastIndexedAt**: Timestamp when this file was last indexed.
  - **docs**: An array of objects, each with a **locale** and a **path**, linking to the documentation files for that source file in different languages.
  - **sourceExists** (boolean): Flag indicating whether the source file still exists in the repository.

## Stability and Risks

The manifest is a critical consistency point between source files and their documentation across multiple locales.

- **Corruption or staleness** can lead to missed documentation updates, incorrect indexing, or broken localization links.
- The **contentHash** field provides a mechanism for detecting drift between indexed and actual file content. A mismatch warns operators that the file has changed without being re-indexed.
- The **reverseIndexComplete** flag signals whether all reverse linkages are established. If `false`, features like cross-locale navigation may be incomplete or missing.
- The **indexedUnitCount** must match the actual number of entries in the `files` map. Any discrepancy suggests an incomplete or corrupted sync process.
- **Operational recommendation**: Always validate this manifest against the actual repository state before using it for any operation. Tools should reject manifests with mismatched hashes or missing required fields to avoid data integrity issues.