# ArchSpine Development Build Watcher

## Overview
This document describes the **Automatic Development Build Watcher**, a lightweight script designed for the ArchSpine project. It runs during local development, continuously monitors source directories and configuration files, and triggers a rebuild whenever changes are detected. The goal is to ensure that developers always have up-to-date compiled output without manually invoking the build step.

## Why This Document Exists
- It serves as the reference for the watcher's behavior, responsibilities, and configuration.
- It anchors the local development workflow by replacing manual `npm run build` with automatic rebuilds.
- It clarifies what the watcher does **and does not** handle, avoiding confusion with CI/CD or production tooling.

## Who Should Read This
- **Contributors to ArchSpine** who set up their local environment.
- Developers who need to understand or modify the build‑watch loop.
- Anyone debugging build‑related issues during development.

## How It Works
1. The script polls a set of watch targets (e.g., `src/`, `tsconfig.json`, `package.json`, `scripts/build.mjs`) every second.
2. It computes a signature (based on modification time and file size) for each target.
3. When the signature changes, a single build is queued. If a build is already running, the request is queued to run immediately after the current build finishes.
4. After the build completes, it logs the outcome and continues watching.

## Key Features & Decisions
- **Automatic rebuild** – saves time and ensures the output reflects the latest source.
- **Queue mechanism** – prevents overlapping builds by allowing only one pending rebuild at a time.
- **Configurable targets** – the `WATCH_TARGETS` array can be extended to monitor additional files or directories.
- **Cross‑platform** – the script detects the operating system to use the correct `npm` command (`npm.cmd` on Windows).
- **Initial build** – triggers a full build on startup, so the output is guaranteed to be fresh.

## Out of Scope
- Production deployment, CI/CD pipelines.
- Management of build artifacts or distribution.
- Unit testing or linting – the watcher only rebuilds.

For full implementation details, see the source file `scripts/dev-build-watcher.mjs`.