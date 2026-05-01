<!-- spine-content-hash:d263b409ce94ca18dc94122ca1961ff8d677b56d0d9c91c050a29a6c3a41da05 -->
# TaskContext Interface

## Role
Core interface defining the dependency injection context for ArchSpine task execution.

## Key Responsibilities
- Defines the `TaskContext` interface that provides task implementations with access to shared engines (Scanner, Aggregator, ContextEngine, RuleEngine, ASTExtractor) and infrastructure (Manifest, OutputManager).
- Declares type-only dependencies for LLM client, prompt policies, runtime I/O, execution checkpoint store, view identifiers, and task state types to support task execution contracts.

## Notable Invariants & Negative Scope
- Must remain a pure TypeScript interface with no runtime implementation.
- Must only depend on core engine, infrastructure, and type definitions, not on CLI or UI layers.
- **Out of scope:** Implementing concrete task logic, providing CLI command handlers or entry points, managing pipeline orchestration or stage transitions.

## Most Important Exported Behavior
- Exports the `TaskContext` interface, which serves as the centralized injection point for all dependencies required by task implementations.