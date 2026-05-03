# ArchSpine Demo Script – Overview

This document is a terminal recording script (demo tape) that walks through the core ArchSpine workflow: building the project, cleaning a demo project's spine data, then running `sync`, `check`, and `fix` commands in sequence. It serves as a quick, visual introduction to how ArchSpine manages project documentation and governance.

## Who Should Read This

- **Developers and technical evaluators** who want to see ArchSpine in action before reading deeper documentation.
- **Presenters or tutorial creators** who need a repeatable demo scenario to showcase ArchSpine's features.

## Key Workflows Anchored by This Document

| Workflow | What It Demonstrates |
|----------|----------------------|
| `sync`   | Generates and updates the spine index and atlas from source code |
| `check`  | Detects violations (missing documentation, architectural drift) |
| `fix`    | Interactively repairs detected issues |

The demo shows a complete "clean slate → fixed state" cycle that completes in seconds, illustrating how ArchSpine can be used to maintain documentation alignment with a project's architecture.

## Decisions This Document Anchors

- Adoption of ArchSpine's CLI workflow for documentation governance.
- Evaluation of ArchSpine's automatic detection and repair capabilities.
- Understanding the typical interaction pattern (sync → check → fix) without needing full configuration knowledge.