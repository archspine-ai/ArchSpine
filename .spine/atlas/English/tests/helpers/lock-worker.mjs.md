# Lock Worker Script Summary

## Purpose
To act as a lightweight, scriptable worker that acquires a lock in a separate process, enabling integration tests for concurrent lock behavior.

## Context and Audience
This script is intended for developers writing or maintaining tests related to file-based locking. It is run as a child process by test suites such as 'lock-worker.mjs' or similar test harnesses. The reader should be familiar with Node.js child processes and the LockManager interface.

## Key Takeaways
- The worker supports three modes: acquire-release (default), acquire-hold, and acquire-release-rewrite (no release).
- It uses ts-node/esm to run TypeScript directly, importing LockManager from src/utils/lock.ts.
- Output is JSON on stdout, making it easy to parse in test assertions.
- Signal handling ensures clean exit even during long holds.