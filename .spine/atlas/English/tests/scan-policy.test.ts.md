<!-- spine-content-hash:f80b93e99520f1390ec618be4c7fb19cf0ce6600a848fb2220d7564b8a8fecf3 -->
# ArchSpine – ScanPolicy Integration Test Suite

## Role
This is a Vitest integration test suite that validates the ScanPolicy module's behavior using temporary file structures and configuration schema.

## Key Responsibilities
- Creates temporary directories and file structures to simulate repository layouts for testing.
- Tests the `DEFAULT_SCAN_POLICY` constants and scanning behavior.
- Validates that the Scanner correctly applies scan policies in a controlled environment.
- Tests configuration schema handling and version compatibility.
- Cleans up test artifacts after each test run.

## Notable Invariants & Negative Scope
- **Invariants:** Must be a test file with suffix `.test.ts` or `.spec.ts`. Must isolate test artifacts to temporary directories. Must not affect the actual project configuration.
- **Out of Scope:** Production deployment logic, user interface components, permanent file system modifications, network or external API calls.

## Most Important Exported / Externally Visible Behavior
- The suite ensures the scanning engine respects policies and configuration schemas through isolated, repeatable tests.
- Recent changes have tightened schema handling and added try preview capabilities, reflected in updated test cases for configuration validation.