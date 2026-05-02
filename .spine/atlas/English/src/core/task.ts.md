<!-- spine-content-hash:e18ad0df80bb255d03ec240985e11aee07fe33b489e815c10fe4f6a10b5ab32e -->
# ArchSpine TaskContext Interface

The `TaskContext` interface is the core dependency injection context for ArchSpine task execution. It defines a contract that provides task implementations with access to shared engines (Scanner, Aggregator, ContextEngine, RuleEngine, ASTExtractor) and infrastructure (Manifest, OutputManager). It also declares type-only dependencies for the LLM client, prompt policies, runtime I/O, execution checkpoint store, view identifiers, and task state types.

**Key responsibilities:**
- Define the `TaskContext` interface as a centralized injection point.
- Provide task implementations with access to all core engines and infrastructure.
- Declare type dependencies that support task execution contracts without runtime behavior.

**Out of scope:**
- Implementing concrete task logic.
- Providing CLI command handlers or entry points.
- Managing pipeline orchestration or stage transitions.

**Notable invariants:**
- Must remain a pure TypeScript interface with no runtime implementation.
- Must only depend on core engine, infrastructure, and type definitions — not on CLI or UI layers.

**Public surface:**  
The only exported symbol is the `TaskContext` interface.

This interface decouples task implementations from concrete dependencies, ensuring a clean separation of concerns and promoting testability across the ArchSpine system.