<!-- spine-content-hash:2931b913ac23c3e4d78d0127a74e4bdccb27ce315fe31b495739d21e2304578f -->
# ArchSpine – TaskContextFactory

**Role:**  
Service-level factory and orchestrator that prepares a fully configured task context for analysis pipelines.

**Responsibilities:**  
- Resolves prompt policy tier and validation policy from options and environment.  
- Creates and initializes task state and artifact state for execution pipelines.  
- Instantiates and coordinates Scanner, Aggregator, ASTExtractor, RuleEngine, ContextEngine, and OutputManager.  
- Manages LockManager and ScanPolicy for thread-safe and policy‑compliant operations.  
- Constructs and returns a `PreparedTaskContext` encapsulating all initialized components.

**Out of Scope:**  
- Direct interaction with an LLM client (only the `LLMClient` type is imported).  
- Execution of scanning, analysis, or output – this file only prepares context.  
- View‑specific service logic (which belongs under `src/services/view/`).

**Invariants:**  
- The resolved prompt policy tier must match the derived task mode (`validate` or `summarize`).  
- Task state and artifact state are created *before* any engine is instantiated.  
- The manifest is opened using `rootDir` and `scanPolicy` before use.  
- `LockManager` ensures exclusive access during initialization.

**Public Surface (most important exports):**  
- `createTaskContext(...)` – the primary entry point.  
- `ServiceOptions` – the configuration type consumed by the factory.  
- `PreparedTaskContext` – the result object bundling all components.

This module is the central factory that ensures all required analysis components and policies are correctly wired before any pipeline begins its work. It does not execute any analysis itself, but it guarantees that every dependency is initialized and consistent.