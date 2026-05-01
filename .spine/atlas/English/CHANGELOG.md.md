<!-- spine-content-hash:b904b3030e078cc225bf302ebb34929ef8beda9280ea818f024e48a037cde46b -->
# ArchSpine Changelog Summary

## Purpose
This document serves as the official changelog for ArchSpine, recording all significant changes made in each public release version. It is intended to help developers, contributors, and users quickly understand what has been added, improved, or fixed between versions.

## Context and Audience
The primary audience includes developers using or contributing to ArchSpine, system integrators, and anyone tracking the evolution of the project. The changelog focuses on public releases only, starting from version 1.0.0, and excludes internal pre-release history.

## Key Takeaways
- First public release (1.0.0) introduces core workflows: init, sync, check, fix, and MCP server.
- New features include artifact strategy selection for Git integration and retry-failed sync.
- Security and reliability improvements include atomic writes, runtime locks, and strict schema version enforcement.
- Documentation now includes bilingual README and a documentation site entry.
- Refactoring includes modularized CLI init flow and symmetric rollback for managed files.
- Old schema versions (0.4.0) are no longer supported; rebuild required.

## Scope and Boundaries
- **In scope**: Tracking new features, security enhancements, documentation updates, refactoring, and test changes for each public release. Maintaining a record of versioned changes from 1.0.0 onward. Providing a clear, structured history for developers and users.
- **Out of scope**: Internal development history prior to the first public release. Detailed bug reports or issue tracking. Future roadmap or planned features beyond the current release.