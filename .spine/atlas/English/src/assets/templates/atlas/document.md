# ArchSpine Document Summary

## Why ArchSpine Exists

ArchSpine is a documentation mirror system that creates a parallel `.spine` directory structure alongside your source code. This `.spine` directory forms an "atlas" of architectural annotations, rules, and views that stay synchronized with the actual codebase. The system exists to solve the chronic problem of architecture documentation drifting away from the code it describes. By mirroring the file tree and storing annotations close to the source, ArchSpine makes architectural knowledge live, accurate, and accessible to both humans and AI agents.

## Who Should Read This Document

This document is intended for:

- **Developers** and **teams** who want to keep architectural documentation accurate without duplicating effort. They will learn how the mirror system works, what it covers, and how it integrates into their workflow.
- **Technical writers** responsible for maintaining documentation deliverables that reflect the true state of the architecture.
- **AI agents** that need to understand and interact with the ArchSpine documentation layer — for example, agents that detect drift, annotate code, or generate reports.

Readers should be familiar with software architecture concepts and comfortable working in a project that uses a mirror documentation structure.

## Core Concepts and Design Decisions

The document anchors several key decisions and workflows:

- **Mirroring**: The `.spine` directory mirrors the project's file tree, storing architectural annotations directly beside the corresponding source files. This ensures documentation is never far from the code it refers to.
- **Drift Detection**: The system automatically detects inconsistencies between code and documentation, alerting teams when architecture diverges from reality.
- **Multi-Language Atlas**: The atlas supports multiple languages (e.g., English, Simplified Chinese) for documentation deliverables, allowing global teams to contribute and consume architecture docs in their preferred language.

## Maintenance Boundaries

To keep the system focused and manageable, the document clearly defines what is in scope and what is out of scope:

- **In scope**: Documentation mirroring, architectural rules and annotations, views, drift detection, and the multi-language atlas.
- **Out of scope**: Modification of source code, CI/CD configuration, detailed implementation or API reference of ArchSpine internals, and installation or usage instructions (which are covered in separate how-to documents).