# Lock Worker Script: Testing LockManager in ArchSpine

## Purpose

This document exists to provide the source code and full description of a lock worker script designed to test the `LockManager` class within the ArchSpine mirror system. It serves as a reference for understanding how file locking is acquired, held, and released in various scenarios.

## Audience

The document is intended for **developers and testers** working on the ArchSpine project who need to verify the behavior of the file locking mechanism, especially in concurrent or distributed environments. It is also useful for anyone integrating external monitoring tools that consume JSON status messages.

## What the Document Covers

- **Three operational modes**: `acquire-release`, `acquire-hold`, and `acquire-release-rewrite`. Each mode demonstrates a distinct lock lifecycle pattern.
- **Integration with `LockManager`**: the script imports and uses the `LockManager` utility from the project's source tree.
- **JSON status output**: the script emits structured messages to `stdout` for debugging and external monitoring.
- **Signal handling**: it registers graceful shutdown handlers for `SIGINT` and `SIGTERM` to release locks properly.

## Key Takeaways

- The lock worker supports three modes, each with different behavior for acquiring, holding, and releasing locks.
- It relies on the project's `LockManager` class, not a custom implementation.
- Status messages are in JSON format, enabling automated testing and observability.
- The script can hold the process open to simulate long-lived locks, and handles termination signals cleanly.

## Workflows and Decisions Anchored by This Document

- Decisions about the lock lifecycle (e.g., when to release, how long to hold) are tested and validated through this script.
- The JSON output format becomes the contract for external monitoring tools.
- The signal handling pattern is a precedent for graceful shutdown in other ArchSpine components.
- The script's structure (argument parsing, mode selection) sets a template for other test harnesses in the project.