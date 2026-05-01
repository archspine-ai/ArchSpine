<!-- spine-content-hash:c71b9afe66b27ee29f18692e09e7d8cd8bc9020ca9e6f4a45c6f6fb00afe3ced -->
# ArchSpine – Scanner Utility Module

## Role
Scanner engine utility module providing path and pattern normalization for file scanning operations.

## Key Responsibilities
- Normalizes file paths to Unix-style slashes and strips leading `./` prefixes.
- Normalizes scanner patterns, ensuring directory patterns are expanded with `**`.
- Defines the `NotableExclusion` interface for tracking excluded patterns with metadata.

## Out of Scope
- File system traversal or directory walking logic.
- Pattern matching execution or glob evaluation.
- Scan result aggregation or reporting.

## Invariants
- Must remain free of CLI entrypoint imports to satisfy engine-independence rule.
- Must not import service-level orchestration modules.

## Public Surface
- `normalizeScannerPath(file: string): string`
- `normalizeScannerPattern(pattern: string): string`
- `NotableExclusion` interface

## Change Intent
**Architectural intent:** Provide reusable path and pattern normalization utilities for the scanner engine, ensuring consistent handling of file paths and glob patterns across scanning operations.  
**Recent changes:** No recent changes detected; the module remains stable as part of the pre-v1.0 pipeline fixes.