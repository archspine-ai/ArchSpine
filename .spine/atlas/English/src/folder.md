The `src/` directory is the source code root for the ArchSpine mirror system. It holds all modules needed to implement the complete system: configuration and AST analysis, CLI commands, service orchestration, pipeline tasks, infrastructure support, type definitions, and utility functions.  

The directory is organized into twelve primary subdirectories, each focused on a distinct area:  

- **assets** – Template definitions for documentation blueprints, AI prompt schemas, architectural rules, and view inventories.  
- **ast** – Core AST-based code extraction, language discovery and resolution, and extraction rules for imports/exports/usages.  
- **cli** – User-facing CLI entry point with command routing, help text, UI formatting, initialization, and repository configuration.  
- **core** – Foundational runtime infrastructure: configuration validation, error definitions, pipeline orchestration, task state management, scanning policies, and type contracts for pipeline stages and dependency injection.  
- **engines** – Operational backbone: scanning, aggregation (index/atlas), rule enforcement, dependency context analysis, automated fix generation, and system diagnostics.  
- **infra** – Infrastructure services: configuration management, LLM integration, persistence, credentials, prompt generation, MCP server integration, and output management.  
- **services** – Service orchestration coordinating multi-stage pipelines (scan, AST extract, validate, LLM correct, summarize, view generate) with session management, checkpoint/resume, and error handling.  
- **tasks** – Individual pipeline stage tasks: scanning, reconciliation, AST extraction, summarization, validation, fix generation, aggregation, reverse indexing, view derivation, and state commitment.  
- **types** – Canonical type contracts for configuration, documents, languages, manifests, rules, versioning, and views, ensuring data consistency across all subsystems.  
- **utils** – Utility modules for atomic file operations, git hook lifecycle, file locking, SHA‑256 fingerprinting, agent instruction synchronization, path normalization, interactive prompts, and branded CLI banners.  

The most critical implementation areas are the pipeline execution core (`core`, `engines`, `services`, `tasks`), which drives the entire mirror workflow; the CLI (`cli`) as the primary user interaction point; and the template definitions (`assets`) that define the system’s structural contracts.