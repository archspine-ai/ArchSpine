# ArchSpine Research Bench Workflow

## Overview
This document defines a GitHub Actions workflow that lets developers manually run the ArchSpine research benchmark suite. It guarantees a consistent, isolated environment using Node.js 20 and cached dependencies, ensuring reproducible results every time.

## Why This Document Exists
The research bench is a specialized, on‑demand workflow. It is not part of the standard CI pipeline; instead, it exists to validate performance or functional aspects under controlled conditions. Triggering it manually (via `workflow_dispatch`) prevents accidental or unnecessary runs and gives researchers full control over when tests execute.

## Who Should Read This
- **ArchSpine developers and researchers** who need to run the research test suite outside the regular commit cycle.
- **QA engineers** who want isolated, reproducible benchmark runs for debugging or validation.
- **Anyone maintaining or modifying the workflow** – understanding its concurrency model and dependency setup is essential.

## Key Workflows & Decisions Anchored Here

### Manual Trigger Only
The workflow uses `workflow_dispatch`, meaning it **must be initiated via the GitHub UI or API**. It never runs automatically, preserving CI resources for integration tests.

### Concurrency Management
The `concurrency` block groups runs by workflow name and Git ref. If a new run is started while one is already in progress for the same branch, the older run is cancelled. This prevents redundant tests and keeps the queue clean.

### Reproducible Environment
- **Node.js 20** is pinned via `actions/setup-node`.
- **npm cache** is enabled to speed up installs.
- `npm ci` ensures exact dependency versions from `package‑lock.json`, eliminating version drift.

### Orchestration Only
The workflow does **not** contain test logic itself. It simply runs the project’s `npm run test:research` script. All test definitions live in the ArchSpine codebase; this file is only the orchestration wrapper.

---

**Out of scope:** Deployment, integration tests, scheduled runs, or any production monitoring. This workflow exists purely for on‑demand research benchmarking.