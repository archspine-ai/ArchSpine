# ArchSpine Architecture Rule: No Direct Database Import

## Purpose
This document defines a mandatory architectural constraint for the ArchSpine project: application services and middleware must **never** import from the database adapter layer (`src/db/*`). The rule exists to preserve clean domain boundaries and prevent business logic from becoming tightly coupled to a specific storage implementation. Enforcing this division improves long-term maintainability, testability, and the project's ability to swap out storage backends without rewriting business logic.

## Audience
All developers contributing to ArchSpine must read and follow this rule, especially those implementing service or middleware layers. It is equally essential for code reviewers and architects who are responsible for ensuring that the project's architectural invariants are respected. The rule applies to every TypeScript file under `src/` (except files within `src/db/` itself) and is treated as a hard violation (error severity).

## Key Rules and Decision Anchors
- **Prohibition**: Do not write `import ... from 'src/db/*'` in any service or middleware file.  
- **Allowed alternative**: Use service abstractions (e.g., repository interfaces) to access data.  
- **Enforcement**: The rule is enforced automatically by the project's rule engine; violations are flagged as errors.  
- **Rationale**: Decoupling business logic from storage specifics keeps the domain layer independent and adaptable.

This rule anchors the project's commitment to a layered architecture where the domain and application layers remain unaware of persistence details. It drives the workflow of always introducing an abstraction when crossing from application logic to data access.