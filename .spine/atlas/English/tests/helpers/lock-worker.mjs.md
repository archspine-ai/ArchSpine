<!-- spine-content-hash:2478dbdc800821486e1b8fba0ec0ceb566c3cf5989c6a38c04f5fc6e5f975f12 -->
# Lock Worker Script

## Purpose
This document implements a lock worker script used to test the ArchSpine distributed locking system. It provides a command-line interface for acquiring, holding, and releasing file-based locks, emitting structured status messages for integration with automated test suites.

## Context and Audience
Intended for developers and QA engineers working on the ArchSpine mirror system who need to validate lock acquisition and release behavior across multiple processes. The script is designed to be invoked by test harnesses rather than used directly by end users.

## Key Responsibilities
- Provides a CLI-based lock worker that acquires and optionally holds or releases a file lock
- Supports three modes: acquire-release, acquire-hold, and acquire-release-rewrite
- Emits structured JSON status messages to stdout for test harness consumption
- Handles process lifecycle including signal-based exit and timed hold periods

## Out of Scope
- Does not define the LockManager class itself (imported from `../../src/utils/lock.ts`)
- Does not handle multi-process coordination beyond the lock primitive
- Does not include test assertions or validation logic

## Key Takeaways
- Supports three operational modes: acquire-release, acquire-hold, and acquire-release-rewrite
- Emits JSON status messages to stdout for test automation
- Handles SIGINT and SIGTERM signals for clean process termination
- Imports LockManager from the project's utility layer