<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"tests/engines","role":"This directory contains the test suite for the Scanner engine.","responsibility":"The test suite validates the Scanner engine's file discovery behavior by creating isolated temporary directories, generating synthetic file system fixtures, invoking the Scanner with a resolved scan policy, and asserting correct inclusion and exclusion of files based on ignore patterns.","children":[{"filePath":"tests/engines/scanner.test.ts","role":"Vitest integration test suite for the Scanner engine's smoke and file discovery behavior.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:52.287Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# tests/engines – Scanner Engine Test Suite

This directory contains the test suite for the Scanner engine, which is responsible for file discovery within the ArchSpine system. The tests validate the engine's behavior by creating isolated temporary directories, generating synthetic file system fixtures, invoking the Scanner with a resolved scan policy, and asserting correct inclusion and exclusion of files based on ignore patterns.

The directory currently contains a single test file:

- **scanner.test.ts** – A Vitest integration test suite that covers both smoke tests and detailed file discovery behavior. This file is the primary implementation area for validating the Scanner engine's core logic.

The test suite is essential for ensuring that the Scanner engine correctly respects ignore patterns and produces the expected file lists under various directory structures.