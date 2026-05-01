<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"tests/helpers","role":"Contains the lock worker script for testing the distributed lock mechanism.","responsibility":"Provides a CLI-based lock worker that acquires, holds, and releases file locks for testing and validation of the ArchSpine distributed lock system, emitting structured JSON status messages for test harness consumption.","children":[{"filePath":"tests/helpers/lock-worker.mjs","role":"Lock worker script for testing and validating the ArchSpine distributed lock mechanism","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:51.847Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `tests/helpers` — Lock Worker for Distributed Lock Testing

This directory contains a single, focused helper script used to validate the ArchSpine distributed lock system. The lock worker (`lock-worker.mjs`) is a CLI tool that acquires, holds, and releases file locks, emitting structured JSON status messages for test harness consumption. It is the primary test fixture for verifying lock acquisition, contention, and release behavior across concurrent test scenarios.

**Notable children:**
- `lock-worker.mjs` — The lock worker script itself, implementing the full lock lifecycle for testing.

**Key implementation areas:**
- Lock acquisition and release logic
- JSON status message emission
- CLI argument parsing for lock configuration
- Integration with the ArchSpine distributed lock mechanism