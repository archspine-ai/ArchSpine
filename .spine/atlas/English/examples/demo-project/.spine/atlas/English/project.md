# ArchSpine Demo: Protocol Demonstration & Validation

## Why This Document Exists

This document introduces the **archspine-demo** project—a minimal, concrete implementation designed to showcase the core capabilities of the ArchSpine protocol. It exists to bridge the gap between abstract protocol concepts and practical understanding, providing a hands-on reference for how ArchSpine enforces architectural boundaries and manages semantic context within a local repository.

## Who Should Read This

- **Developers** seeking a practical example of ArchSpine's rule enforcement in action
- **Architects** evaluating how ArchSpine supports Domain-Driven Design patterns and boundary enforcement
- **Technical evaluators** who want to see a small-scale, concrete implementation before committing to broader adoption

## Key Decisions and Workflows Anchored by This Document

### Architecture Decisions
- **Domain-Driven Design Separation**: The project explicitly separates domain logic (`src/domain`) from infrastructure (`src/infra`), demonstrating clean architectural layering
- **Intentional Violations**: The demo includes deliberate architectural violations (e.g., API directly calling Infra) to validate ArchSpine's rule checking capabilities
- **Local Control Plane**: The `.spine/` directory stores semantic context locally, illustrating how ArchSpine maintains architectural awareness without external dependencies

### Workflows Demonstrated
1. **Rule Checking**: How ArchSpine detects and reports architectural violations
2. **Semantic Context Management**: How the local control plane maintains and utilizes architectural knowledge
3. **Boundary Enforcement**: How ArchSpine ensures domain logic remains isolated from infrastructure concerns

## Key Takeaways

- The project separates domain logic from infrastructure using Domain-Driven Design principles
- Intentional architectural violations are included to demonstrate ArchSpine's rule checking capabilities
- The `.spine/` directory stores semantic context locally, illustrating the Local Control Plane concept