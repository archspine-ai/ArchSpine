<!-- spine-content-hash:fea1d71ca595291cf5037c1fe213bcd42854fd2d162a6271478dfeaf5c89fc5f -->
# ArchSpine Configuration Compatibility Test Suite

This Vitest test suite validates the runtime compatibility matrix and configuration schema version resolution within the ArchSpine system. It ensures that configuration schema evolution remains backward compatible and is correctly handled by the runtime.

## Key Responsibilities

- **Isolated Test Execution**: Sets up and tears down temporary directories for each test scenario, ensuring no cross-test state contamination.
- **Version Classification**: Tests classification of configuration versions across current, legacy, malformed, and unsupported schema inputs.
- **`resolveSpineConfig` Validation**: Asserts behavior regarding config validity, migration status, and issue reporting.
- **Integration Testing**: Validates the integration between configuration resolution and index document reading subsystems.

## Out of Scope

- Production runtime logic for configuration resolution.
- User interface or CLI interaction.
- Persistence or network operations beyond local file system mocking.

## Invariants

- Must be a Vitest test file (`.test.ts` suffix).
- Must isolate test state using temporary directories cleaned after each test.
- Must import and test the public API of `resolveSpineConfig` and `readIndexDocument`.

## Public Surface

- `resolveSpineConfig`
- `readIndexDocument`
- `CURRENT_CONFIG_SCHEMA_VERSION`
- `CURRENT_SCHEMA_VERSION`

## Change Intent

The architectural intent is to ensure configuration schema evolution is backward compatible and correctly handled by the runtime. Recent changes have tightened schema handling and added try preview functionality.