<!-- spine-content-hash:237c9fe0c4705b49214cffc08c7056702d19015475676471e8f29a7b33a60f50 -->
# ArchSpine CLI Demo Script

## Purpose
This document is a terminal recording script that visually demonstrates the core CLI workflow of the ArchSpine project. It walks through building the project, cleaning up demo artifacts, and running sync, check, and fix commands using a mock provider.

## Context and Audience
Intended for developers evaluating ArchSpine, contributors setting up a demo environment, or anyone wanting a quick visual overview of how the tool operates from the command line.

## Key Takeaways
- The demo shows a complete cycle: build → clean → sync → check → fix.
- Uses a mock provider (`SPINE_PROVIDER=mock`) to avoid external dependencies.
- The script is designed to be replayed with tools like VHS or similar terminal recorders.

## File Role
This file serves as a demonstration script for the ArchSpine project's CLI workflow.

## Key Responsibilities
- Showcasing the build, sync, check, and fix commands in sequence.
- Providing a reproducible demo for end-users or contributors.

## Notable Invariants / Negative Scope
- This script does **not** provide a detailed explanation of ArchSpine's architecture or configuration.
- It does **not** handle error cases or edge cases beyond the happy path.

## Exported / Externally Visible Behavior
- The script is intended to be run as a terminal recording, not imported as a module.
- It has no public API surface; its value is in the visual demonstration it produces.