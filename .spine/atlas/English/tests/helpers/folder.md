<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"tests/helpers","role":"Contains the lock worker script for testing the distributed lock mechanism.","responsibility":"Provides a CLI-based lock worker that acquires, holds, and releases file locks for testing and validation of the ArchSpine distributed lock system, emitting structured JSON status messages for test harness consumption.","children":[{"filePath":"tests/helpers/lock-worker.mjs","role":"Lock worker script for testing and validating the ArchSpine distributed lock mechanism","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:51.847Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `tests/helpers/` — Distributed Lock Worker for Testing

This directory contains a single, focused helper script used to simulate and validate the ArchSpine distributed lock mechanism. The sole file, `lock-worker.mjs`, acts as a CLI‑based lock worker that acquires, holds for a configurable duration, and releases file locks.

## Structure and Grouping

Because the helper set is purpose‑built for lock testing, it consists of exactly one module (no subdirectories). The grouping is flat and functional: the lock worker is the only component needed to exercise the distributed lock system end‑to‑end.

## Key Implementation Areas

- **Lock‑worker CLI** – Parses command‑line arguments to specify lock parameters and outputs structured JSON status messages for test harness consumption.
- **File lock acquisition/release** – Uses system‑level file locking primitives to demonstrate and verify the correct behavior of ArchSpine’s distributed lock transactions.
- **Integration with test suites** – Designed to be invoked directly by testing frameworks or orchestrated by integration tests. The worker’s output can be piped into assertion logic or result collectors.

This module is critical for validating that distributed lock operations succeed under normal and concurrent conditions.