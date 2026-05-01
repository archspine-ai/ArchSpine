<!-- spine-content-hash:ca1480451afaf6bbccd5f98ed77312ace447ae864338fff242a9da32f9218f9d -->
# ArchSpine Mutation Detection Utility

This module is a pure infrastructure utility responsible for detecting and reporting unauthorized mutations in ArchSpine's protected output directories. It operates at the lowest level of the system, isolating file system and hash operations from higher-level orchestration.

## Role

Infrastructure utility module for detecting and reporting unauthorized mutations in ArchSpine's protected output directories.

## Key Responsibilities

- Defines constants for baseline file location and protected directories (`.spine/index`, `.spine/atlas`, `.spine/view`).
- Exports the `ProtectedOutputMutationReport` interface for structured mutation reporting.
- Provides functions to read baseline state, collect file hashes, and compute added, changed, and removed paths.
- Generates mutation reports to detect unauthorized changes in generated protected outputs.

## Out of Scope

- Orchestrating service, task, or engine workflows.
- Providing a public facade for other infrastructure capabilities.
- Handling authentication, authorization, or user sessions.
- Managing database queries or external API calls.

## Invariants

- Must only depend on Node.js built-in modules (`crypto`, `fs`, `path`).
- Must not import from other project modules to avoid absorbing orchestration concerns.
- Must expose stable low-level file hash comparison and mutation detection.

## Public Surface

- `ProtectedOutputMutationReport` — the primary interface for structured mutation reporting.