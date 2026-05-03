# ArchSpine Cache Database Schema Migration

## Overview
This document describes the schema migration process for the ArchSpine cache database, specifically the addition of `mtime` and `size` columns to the `files` table. It provides a safe, repeatable migration script and explains the rationale behind the schema change.

## Why This Document Exists
The ArchSpine mirror system relies on a cache database (`cache.db`) to track file metadata. Over time, the original schema lacked columns for modification time (`mtime`) and file size (`size`), which are necessary for efficient mirror operations. This document defines how to extend the schema without breaking existing data or causing errors from duplicate column additions.

## Who Should Read This Document
- Developers maintaining the ArchSpine mirror system’s data layer
- System administrators responsible for database integrity and schema evolution

## Key Decisions and Workflows
- **Schema extension**: The `files` table is extended with `mtime` (INTEGER) and `size` (INTEGER) columns to store file metadata directly in the cache.
- **Safe migration**: The script uses `try-catch` blocks to prevent crashes if columns already exist, making it safe to run multiple times.
- **Workflow anchor**: The migration script is a prerequisite for any feature that relies on per-file timestamps or sizes (e.g., incremental sync, cache validation).

## Summary
The migration is a simple, idempotent step that ensures the cache database schema is compatible with current ArchSpine requirements. The document provides clarity on the change and a reference for future schema updates.