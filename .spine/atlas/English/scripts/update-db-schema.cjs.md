<!-- spine-content-hash:808cb76a458aef0e09e7f7d8359638113791edb10a4671741eca1f33cea0104c -->
# ArchSpine Cache Schema Migration

## Purpose
This document is a lightweight database migration script that ensures the ArchSpine cache schema includes the `mtime` and `size` columns for tracking file metadata.

## Context & Audience
Intended for developers maintaining the ArchSpine mirror system who need to evolve the local SQLite cache schema without breaking existing installations.

## Key Responsibilities
- Adding `mtime` (modification time) column to the `files` table
- Adding `size` column to the `files` table
- Ensuring idempotent schema updates via try-catch blocks

## Out of Scope
- Data migration or backfilling of existing records
- Schema creation or initial database setup
- Querying or reading cached data

## Key Takeaways
- The script uses `ALTER TABLE` with try-catch to handle cases where columns already exist.
- It targets the `.spine/cache.db` SQLite database used for file tracking.
- The migration is additive and non-destructive, preserving existing data.