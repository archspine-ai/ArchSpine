<!-- spine-content-hash:2de5bef2f2ba093f29891a7cfe68d5fd9f541340bcc155a8f75154c38f8e6e6a -->
# ArchSpine Infrastructure Barrel Export

## Role
Public API facade (barrel export) for the infrastructure subsystem, aggregating and re-exporting all infra-layer modules.

## Key Responsibilities
- Centralizes and exposes the public contract of the infrastructure layer to other subsystems
- Provides a single import point for consumers needing infra services (config, documents, languages, manifest, rules, versions)

## Out of Scope
- Does not contain any business logic or implementation details
- Does not define or enforce any architectural rules itself

## Notable Invariants
- All re-exported modules must exist and be valid TypeScript modules
- The barrel export must not introduce circular dependencies

## Public Surface
- `config.js`
- `index-documents.js`
- `languages.js`
- `manifest.js`
- `rules.js`
- `versions.js`

## Architectural Intent
Provides a clean, centralized public API surface for the infrastructure layer, enabling other subsystems to import infra services without coupling to internal module paths. No changes detected in this file; the recent refactor (c4ed85e) likely established this facade pattern as part of subsystem boundary enforcement.