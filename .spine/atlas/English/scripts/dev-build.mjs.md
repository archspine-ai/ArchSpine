# ArchSpine Development Build Watcher

## Purpose
This document describes the development-time auto-rebuild mechanism that watches source files and triggers a rebuild when changes are detected. It reduces manual recompilation for developers.

## Audience
ArchSpine core tooling developers who modify TypeScript source code, build scripts, or configuration files and need immediate feedback.

## How It Works
- Polls specified directories and files every 1 second for modifications.
- When a change is detected, it runs `npm run build`.
- Build requests are queued to prevent overlapping builds.
- Monitors `src/`, build scripts, `tsconfig.json`, and `package.json`.

## Key Decisions
- Uses polling rather than filesystem events for cross-platform simplicity.
- Queues builds to avoid concurrent executions.
- Logs build status to console.

---