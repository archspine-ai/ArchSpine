<!-- spine-content-hash:4ab9b19c76c077e70e85a5d6de8f43b858f5fa934b20ea013ae0aec40ed2ba09 -->
# ArchSpine Project Conventions

## Purpose
This document serves as the central reference for all contributors to the ArchSpine repository. It establishes the ground rules for project structure, coding style, testing, documentation, and how to leverage the built-in ArchSpine context system for efficient development.

## Context and Audience
The intended audience is any developer or maintainer working on the ArchSpine codebase. It is particularly important for new contributors who need to understand the project's conventions and for all team members to ensure consistency across contributions. The document also provides critical instructions for AI agents on how to interact with the ArchSpine context files.

## Key Responsibilities
- Describing the project directory layout and module organization
- Listing build, test, and development commands
- Specifying TypeScript coding style and naming conventions
- Outlining testing guidelines with Vitest
- Defining commit and pull request conventions
- Explaining documentation maintenance and the role of the temporary working area
- Providing instructions for using the ArchSpine context system

## Out of Scope
- Detailed API reference or function-level documentation
- Architecture design rationale or planning documents
- Third-party dependency licenses or security policies
- Deployment or release procedures

## Key Takeaways
- The project follows a strict modular structure under `src/` with clear separation of concerns (CLI, core, services, infra).
- All code must adhere to the defined TypeScript style: ES modules, strict typing, 2-space indentation, and specific naming conventions.
- Testing is mandatory for all behavior changes, using Vitest, with research fixtures kept separate from the main test suite.
- Commits must follow Conventional Commits format, and PRs must include verification steps and related issue links.
- Documentation changes must keep English and Chinese versions aligned; a temporary working area (`docs/temporary-to-be-cleared/`) is the source of truth for interim change notes.
- AI agents and developers must consult the ArchSpine context (`.spine/atlas/`, `.spine/view/pages/`) before broad searches, and must not directly modify generated ArchSpine output files.