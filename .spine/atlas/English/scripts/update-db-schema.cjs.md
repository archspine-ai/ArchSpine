# ArchSpine Cache Schema Migration

This document describes a low-level database migration script for the ArchSpine mirror system. It ensures the cache SQLite schema remains consistent across deployments and updates.

## Purpose

The script adds two essential columns (`mtime` and `size`) to the `files` table inside the cache database (`cache.db`). These columns are required for tracking file metadata during mirror operations. The script runs silently — it adds the columns if missing, and does nothing if they already exist.

## Who Should Read This

- **Maintainers** of the ArchSpine storage layer.
- **Developers** modifying the cache schema or debugging migration issues.
- **Operators** deploying or updating ArchSpine who need to verify that the cache database is properly structured.

## Key Decisions & Workflows Anchored by This Document

- The migration uses `ALTER TABLE` wrapped in a `try/catch` block to avoid errors when columns are already present. This idempotent pattern is the standard for all future schema changes.
- The script operates on `.spine/cache.db`, a SQLite database. This path is hardcoded and must exist before the script runs.
- This migration is executed during ArchSpine initialization or after a schema update. It is **not** a user-facing feature; it is an internal maintenance tool.

## Takeaways

- Adds two integer columns to the `files` table: `mtime` (last modified time) and `size` (file size in bytes).
- Uses graceful error handling to allow repeated runs without failure.
- Only concerns the cache database — core mirroring logic remains unchanged.