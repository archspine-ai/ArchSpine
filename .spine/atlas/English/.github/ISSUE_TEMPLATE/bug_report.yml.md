# Bug Report Template — ArchSpine Mirror Project

## Purpose

This document standardizes how bugs are reported in the ArchSpine mirror project. By providing a fixed structure, it ensures every report includes the information maintainers need to diagnose, reproduce, and resolve issues quickly. The template covers runtime, CLI, MCP, and documentation bugs, but explicitly excludes security vulnerabilities (which must follow `SECURITY.md`) and feature requests.

## Intended Audience

- **Users** encountering unexpected behavior in any ArchSpine component.
- **Developers** who need to report or triage bugs.
- **Maintainers** who use the collected data to prioritize fixes and update the codebase.

## Workflows and Decisions Anchored

- **Triage pipeline**: Every report with a `:bug` label enters a standardized review process. The summary, environment details, and reproduction steps are the first items a maintainer checks.
- **Reproducibility**: The template forces contributors to provide exact commands, file paths, and step-by-step reproduction instructions. This is the core decision driver for whether a bug can be acted upon quickly.
- **Release blocking**: Reports that lack environment information or clear reproduction steps may be flagged as incomplete, affecting their priority in the release cycle.

## Key Sections in the Template

| Section               | Purpose                                                                 |
|-----------------------|-------------------------------------------------------------------------|
| What happened?        | Observed vs. expected behavior                                          |
| Reproduction          | Exact commands and steps (e.g., `spine init`, `spine check`)            |
| Environment           | Node.js version, OS, provider, CLI version                              |
| Logs or screenshots   | CLI output, stack traces, screenshots                                   |

## Reminder for Security Issues

Before opening a public issue, always consult `SECURITY.md`. Security vulnerabilities must be disclosed privately and **not** through this template.