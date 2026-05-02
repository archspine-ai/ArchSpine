<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"tests/engines","role":"This directory contains the test suite for the Scanner engine.","responsibility":"The test suite validates the Scanner engine's file discovery behavior by creating isolated temporary directories, generating synthetic file system fixtures, invoking the Scanner with a resolved scan policy, and asserting correct inclusion and exclusion of files based on ignore patterns.","children":[{"filePath":"tests/engines/scanner.test.ts","role":"Vitest integration test suite for the Scanner engine's smoke and file discovery behavior.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:52.287Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# tests/engines – Scanner Engine Test Suite

This directory holds the complete test suite for the Scanner engine, which is responsible for file discovery within the ArchSpine project. The suite validates that the Scanner correctly traverses directories, respects ignore patterns, and includes or excludes files according to the resolved scan policy.

The directory currently contains a single integration test file:

- **scanner.test.ts** – A Vitest-based test file that verifies the Scanner's smoke test scenarios and detailed file discovery behavior. It isolates tests by creating temporary directories, generating synthetic file system fixtures, invoking the Scanner with a configured policy, and asserting that the results match expected inclusion and exclusion patterns.

Key implementation areas covered by this suite include:
- Temporary directory creation and isolation.
- Synthetic filesystem generation for deterministic test environments.
- Policy resolution and its effect on file listing.
- Edge cases for glob patterns, ignore rules, and nested directory traversal.

This suite is critical for ensuring that the Scanner engine behaves correctly before it is used by higher-level components.