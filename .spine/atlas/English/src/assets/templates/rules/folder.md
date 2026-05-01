<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets/templates/rules","role":"This directory defines the architectural and coding standards for the ArchSpine project.","responsibility":"Collectively, these files establish the layered architecture model (CLI, services, core, tasks, engines, infra) with boundary and dependency constraints, and define naming conventions (interface prefixes, test file suffixes) with severity levels and rationale to ensure codebase consistency.","children":[{"filePath":"src/assets/templates/rules/layered-architecture.yml","role":"Architectural constraint specification for the ArchSpine project's layered architecture","fileKind":"document"},{"filePath":"src/assets/templates/rules/naming-conventions.yml","role":"Defines naming conventions and coding standards for the ArchSpine monorepo codebase.","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:43.185Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine Rules Directory

This directory (`src/assets/templates/rules`) defines the architectural and coding standards that govern the ArchSpine project. It contains two primary specification files that together establish the project's structural integrity and codebase consistency.

## Layered Architecture Specification

The file `layered-architecture.yml` defines the project's layered architecture model, which consists of six distinct layers: CLI, services, core, tasks, engines, and infrastructure. This specification enforces boundary and dependency constraints between these layers, ensuring that code dependencies flow in the correct direction and that each layer maintains its intended responsibility. The architecture model prevents circular dependencies and enforces separation of concerns across the entire codebase.

## Naming Conventions Specification

The file `naming-conventions.yml` establishes the naming standards for the ArchSpine monorepo. It defines conventions for interface prefixes (such as the `I` prefix for interfaces), test file suffixes, and other naming patterns. Each convention includes a severity level and a rationale, providing clear guidance for developers and enabling automated enforcement through linting tools.

## Implementation Areas

The most critical implementation areas covered by these rules include:
- **Layer boundary enforcement**: Ensuring that code in higher layers (CLI, services) does not directly depend on lower layers (infrastructure) without going through the appropriate abstractions
- **Dependency direction**: Maintaining the correct dependency flow from outer layers to inner layers
- **Interface naming**: Consistent use of the `I` prefix for interface definitions
- **Test file organization**: Standardized naming of test files with appropriate suffixes
- **Severity-based enforcement**: Clear differentiation between errors, warnings, and informational rules