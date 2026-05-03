# ArchSpine Bug Report Template Overview

## Why This Document Exists
This document provides a standardized template for reporting bugs in ArchSpine. It ensures that all bug submissions — whether for runtime, CLI, MCP, or documentation — contain the necessary details (observed vs. expected behavior, reproduction steps, environment information, and logs) so maintainers can diagnose and resolve issues efficiently. By using this template, contributors and users help maintain consistency and completeness across all public issue reports.

## Who Should Read This
This template is intended for anyone encountering a bug in ArchSpine: developers using the runtime, contributors working on CLI commands or the MCP server, and users who spot errors in documentation. It is designed for public issue tracking on GitHub. Security vulnerabilities should *not* be reported through this template; instead, follow the private disclosure process described in `SECURITY.md`.

## Key Decisions & Workflows It Anchors
- **Clear bug vs. feature request distinction:** The template is purpose-built for bugs only. Feature requests, documentation improvements, and security disclosures each have separate processes (e.g., security goes through a private channel).
- **Required fields for efficient triage:** Every report must include a summary (what happened vs. what was expected), a reproduction section with exact commands/steps, and environment details (Node.js version, OS, provider, CLI version). Optional logs or screenshots help speed up resolution.
- **Directs security issues away from public issues:** The template includes a prominent warning to redirect security reports to the private disclosure flow, protecting the project and its users.
- **Accelerates diagnosis:** By requiring precise commands, file paths, and error outputs, the template enables maintainers to reproduce and fix bugs quickly without back-and-forth clarification.