# ArchSpine Demo: Project Overview & Architecture Demonstration

## Purpose

This document provides a high-level overview of the **archspine-demo** project, which serves as a minimal demonstration of the ArchSpine protocol. It explains the project's architectural philosophy and key design decisions, showing how ArchSpine enforces architectural boundaries in a real-world codebase.

## Who Should Read This

- **Developers and architects** who want to understand how ArchSpine enforces architectural boundaries in a real project.
- **Anyone evaluating the ArchSpine protocol** for their own projects, to see a concrete example of its capabilities.

## Key Takeaways

- **Domain-Driven Design in Practice**: The project demonstrates DDD by cleanly separating domain logic (`src/domain`) from infrastructure (`src/infra`).
- **Boundary Enforcement**: Deliberate architectural violations (e.g., API directly calling Infra) are included to showcase ArchSpine's rule-checking capabilities.
- **Local Control Plane**: The `.spine/` directory stores semantic context locally, acting as a local control plane for the project.

## Decisions & Workflows Anchored by This Document

- **Architecture decisions**: The separation of domain and infrastructure layers is a core design choice that all future development must respect.
- **Rule-checking workflow**: The included violations serve as test cases for ArchSpine's validation rules, anchoring the testing and CI pipeline.
- **Local context management**: The `.spine/` directory pattern is established as the standard for storing project-level semantic metadata.