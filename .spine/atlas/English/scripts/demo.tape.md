## Purpose

This document is a terminal recording script used to generate a demonstrative GIF that showcases the typical workflow of the ArchSpine CLI. It exists to provide a quick, visual introduction to the command-line interface without requiring the reader to install or configure the tool.

## Audience

The script is intended for developers and users who want a visual walkthrough of how to use ArchSpine's core commands — `sync`, `check`, and `fix` — within a mock provider environment. It assumes basic familiarity with the terminal but no deep knowledge of ArchSpine internals.

## Key Workflows and Decisions

- **Build first**: The demo begins by building the project (`npm run build`) to ensure the CLI is ready.
- **Clean state**: Before syncing, the script explicitly removes `.spine` cache files (`index`, `atlas`, `cache.db`, `manifest.json`, `languages.json`, `.lock`). This decision anchors the workflow around a fresh, reproducible start.
- **Mock provider**: The environment variable `SPINE_PROVIDER=mock` is used to isolate testing from real storage backends, making the demo self-contained.
- **Command sequence**: After clearing cache, the script runs `sync`, then `check`, then `fix` with user confirmation (`y`). This sequence mirrors the typical ArchSpine workflow: synchronize data, validate it, then apply automated fixes.

## Why This Document Matters

This recording script anchors the demonstration and onboarding workflow for ArchSpine. It defines the exact steps potential users will see in the demo GIF, ensuring consistency between what is documented and what is shown. It also serves as a replicable test scenario for developers verifying CLI behavior.