<!-- spine-content-hash:d18ed7f0455a9c3997b72f4de7bc8a868465de7277200ba225fbb48586efbb9b -->
# ArchSpine Integration Test Suite

This Vitest integration test suite validates ArchSpine's JSON schema validation and synchronization service orchestration. It ensures that core system components work correctly together in isolated, deterministic environments.

## Key Responsibilities

- **Schema Validation**: Validates Spine unit and shared JSON schemas using Ajv with `allErrors` and `formats` enabled, guaranteeing schema correctness.
- **SyncService Testing**: Tests the SyncService integration with a mock LLM client, isolating tests from external AI services.
- **Test Environment Management**: Creates and cleans up temporary directories and files for schema validation and synchronization fixtures.
- **Index File Compliance**: Ensures all index files in the `.spine/index` directory conform to the Spine unit schema.

## Out of Scope

- UI components or frontend rendering
- Direct database persistence or ORM layer testing
- Production API endpoint integration beyond the SyncService
- Performance or load testing of the ArchSpine system

## Invariants

- Must be a Vitest test file (`.test.ts` suffix)
- Depends on `spine-unit.schema.json` and `shared.schema.json` for validation
- Uses a mocked LLM client to isolate tests from external AI services
- Creates and cleans up temporary directories during test execution

## Architectural Intent

Provide isolated, deterministic integration tests for core ArchSpine schema validation and synchronization services, ensuring system consistency and contract adherence. Recent changes have focused on hardening risk hotspots through LLM/database decoupling and engine smoke tests.