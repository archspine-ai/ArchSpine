# ArchSpine Changelog — Summary

## Purpose

This document records all significant changes made in each public release of ArchSpine, serving as the authoritative changelog for version tracking and upgrade planning. It is the single source of truth for understanding what changed between releases, especially regarding schema compatibility, CLI behavior, and artifact strategy.

## Audience

This changelog is intended for:

- **Developers** who need to understand API and CLI changes
- **Release managers** coordinating version bumps and migration paths
- **System integrators** who rely on ArchSpine's schema and artifact contracts

The document is bilingual (English and Chinese) and designed for both human readers and automated CI pipelines.

## Key Decisions and Workflows Anchored Here

- **Schema version enforcement**: Runtime now requires schema `1.0.0`; older snapshots are rejected and require `spine build` to rebuild.
- **Artifact strategy selection**: `spine init` supports two Git integration modes — `local` and `distributable` — chosen via `--artifact-strategy`.
- **Reliability guarantees**: `.spine` updates use atomic writes and runtime locks; Atlas cleanup removes stale locale directories before writing.
- **CLI architecture**: Commands are refactored into separate orchestration, repository integration, and bootstrap layers.
- **Retry mechanism**: `spine sync --retry-failed` allows targeted retries based on the latest sync checkpoint.
- **Symmetrical cleanup**: `spine remove` now rolls back managed `.gitignore` / `.gitattributes` blocks.

## What's New in 1.0.0

- First public release with core workflows: `init`, `sync`, `check`, `fix`, `mcp start`
- Local MCP Server, structured `.spine` control plane, view layer artifacts, and multilingual scanning
- Demo project updated to distributable reference layout
- Expanded test coverage for initialization, managed sync, and end-to-end CLI behavior