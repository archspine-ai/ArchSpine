# Engineering Principles & Technical Hardening

ArchSpine is built with industrial-grade resilience to ensure that architectural governance remains consistent even in large-scale, volatile development environments. This document outlines the core engineering principles and optimizations implemented in the current `v1.0.x` line.

## 1. Atomic Increment Detection (Hash Bypass)

To maintain a sub-second response time for Git Hooks, ArchSpine implements a "Fast-Path" for file change detection.

- **Mechanism**: The system stores the `mtime` (last modified time) and `size` of every tracked file in the local SQLite `cache.db`.
- **Optimization**: During the hashing phase, `Manifest.calculateHash` performs a shallow metadata check. If the disk metadata matches the database record, the system bypasses the expensive SHA-256 calculation and returns the cached hash.
- **Reliability**: This approach is independent of Git state, allowing the system to detect changes even if the developer bypasses pre-commit hooks or manually modifies files.

## 2. Graph Self-Healing (Resilience)

The architectural dependency graph (Reverse Index) is the foundation of ArchSpine's semantic reasoning. Ensuring its integrity is a top priority.

- **State Persistence**: The completion status of the reverse index is persisted in `.spine/manifest.json`.
- **Auto-Recovery**: If a sync operation is interrupted (e.g., process kill, power loss), the `ReverseIndexComplete` flag remains `false`. On the next run, the `ReverseIndexingTask` will force a full graph reconstruction regardless of file changes.
- **Consistency**: This prevents "Semantic Divergence" where the file summaries and the dependency graph become out of sync.

## 3. Memory-Safe Indexing (Streaming)

Processing repositories with 10,000+ files requires careful memory management to avoid Node.js OOM (Out of Memory) errors.

- **Selective Caching**: During graph construction, the `ReverseIndexingTask` only loads the `identity` and `graph` metadata from the index JSONs, skipping large fields like full content summaries or token usage arrays.
- **Atomic Rewriting**: Full `SpineUnit` objects are only reloaded from disk at the exact moment a write is required for a specific node, and are instantly discarded thereafter.
- **Scalability**: This ensures the peak memory footprint stays within 512MB-1GB even for massive codebases.

## 4. Root-Level Scan Pruning (Performance)

Scanning large projects with deep `node_modules` or `dist` folders can be a bottleneck in filesystem-based environments.

- **Recursive Pruning**: The `Scanner.walkFileSystem` method performs proactive pruning. Before recursing into a directory, it queries the `ScanPolicy` and `.gitignore` rules.
- **Short-Circuit**: If a directory is ignored at the root (e.g., `node_modules/`), the scanner prunes the entire branch immediately, avoiding thousands of unnecessary `stat` calls and recursive depth-checks.

## 5. Industrial-Grade Concurrency

ArchSpine utilizes a layered parallel model to maximize throughput during full or incremental syncs.

- **Depth-Parallel Aggregation**: Directories at the same depth in the filesystem tree are aggregated in parallel (concurrency: 20), effectively bubbling up semantic context to the root.
- **Exponential Backoff**: All LLM calls are wrapped in a resilient retry utility that handles socket resets, DNS issues, and API rate limits (429) using a jittered exponential backoff strategy (3 retries).
