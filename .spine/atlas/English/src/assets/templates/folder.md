This directory, `src/assets/templates`, holds all template definitions for the ArchSpine mirror system. It serves as the central repository for foundational blueprints that govern the system's documentation mirroring, AI prompt schemas, architectural rules, and view inventories. The templates collectively define the structural and behavioral contracts of ArchSpine.

The directory is organized into four notable submodules:

- **atlas**: Contains foundational documentation and templates that outline ArchSpine's purpose, configuration, and mirroring contracts. This is the system's core conceptual blueprint.
- **prompts**: Provides prompt template schemas, rendering utilities, and examples. These enable AI agents to generate structured architecture diagrams and semantic summaries in a consistent JSON format.
- **rules**: Defines architectural constraints and naming conventions for the codebase. It enforces layered architecture rules, dependency flow, separation of concerns, and standards for interfaces and test files.
- **view**: Aggregates auto-generated inventories and risk assessments of the project's public interface (CLI commands, MCP tools, exported modules) and codebase health, identifying high-risk files to prioritize refactoring.

The most important implementation areas are the AI prompt generation pipeline (prompts), the enforcement of architectural rules (rules), and the automated health and interface auditing (view). Together they ensure mirrored documentation is accurate, AI output is structured, architecture remains compliant, and codebase risks are visible.