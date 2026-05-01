<!-- spine-content-hash:0e38f6ab676e967b8fa5d6860e7ee17a576f44d2b5fdcebced228bda5ba726ac -->
# SpineDB — Database Facade / Repository Aggregator

**Role:**  
SpineDB provides a unified interface for all SQLite runtime database operations in the ArchSpine mirror system. It acts as the single entry point for any code that needs to persist or query runtime data.

**Key Responsibilities:**
- Manages the database connection lifecycle and schema initialization for the runtime SQLite database.
- Offers a consolidated API for file tracking operations: create, read, update status, delete, and list.
- Handles symbol export registration, cache invalidation, and cross-file symbol resolution for dependency analysis.
- Records and queries LLM usage metrics for cost monitoring and analytics.
- Manages architectural rule violation recording and querying.
- Provides batch transaction commit support for atomic operations.

**Notable Invariants & Negative Scope:**
- SpineDB exposes a stable, aggregated public API for all runtime database operations.
- It delegates specific domain operations (files, symbols, usage, violations) to internal repository modules.
- The database connection is managed as a private resource.
- SpineDB does **not** orchestrate high-level business logic or engine workflows.
- It does **not** directly execute SQL queries (that is delegated to repository modules).
- It does **not** provide HTTP or network interfaces.

**Most Important Exported Behavior:**
- The `SpineDB` class is the sole public surface. All runtime database interactions go through this class.