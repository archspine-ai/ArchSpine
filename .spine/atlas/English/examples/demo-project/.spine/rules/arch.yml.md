# ArchSpine Demo Project: Architecture Rule Definitions

This document exists to codify specific architectural boundaries and documentation expectations for the demo project under the ArchSpine mirror system. It ensures consistent, machine-enforceable constraints that both human developers and automated tools (e.g., linters, AI agents) must follow when working with the codebase.

## Who should read this
- Project developers who modify code in `src/api/` or `src/domain/`.
- AI agents that perform code changes, reviews, or generate architectural context.
- Any team member or tool responsible for verifying compliance with the project's architecture conventions.

## What it anchors
- **Layer Isolation Rule** (severity: error) – API handlers (`src/api/**`) may import from `src/domain/**` but must **not** directly import from `src/infra/**`. This keeps the API layer independent of infrastructure details and enforces a clean domain intermediary.
- **Documentation Rule** (severity: warning) – All public domain classes and methods (in `src/domain/**`) must have TSDoc comments. This ensures domain contracts remain readable in generated architecture context.

## Key takeaways
- API handlers must not directly import from `src/infra/`; use the domain layer as an intermediary.
- All public domain classes and methods must have TSDoc comments.
- Violations of Layer Isolation are errors; missing documentation is a warning.