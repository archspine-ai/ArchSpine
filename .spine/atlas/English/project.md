ArchSpine is a mirror system that provides AI-augmented architectural governance, automated validation, and intelligent documentation for software projects. It maintains codebase integrity and generates living documentation by combining modular analysis pipelines with LLM-based reasoning.

**Core Modules and Integration**

The system is driven by a pipeline orchestrated through several key layers:

1. **Configuration and Scanning Policies** – The `.spine` directory and rule files define scanning strategies, language detection mappings, and ignoring patterns. These policies instruct the system which files to discover and how to interpret them.

2. **AST Extraction Engines** – Located in `src/ast`, these engines parse source code using language-specific rules to detect imports, exports, and usages. They build a dependency graph from the codebase, enabling further analysis.

3. **Architectural Rules Engine** – Rules defined in `.spine/rules` enforce layering, naming conventions, and dependency flow. The engine (`src/engines`) matches extracted dependencies against these rules, flagging violations such as reverse layer dependencies or missing documentation.

4. **LLM Infrastructure** – The system integrates with multiple LLM providers (OpenAI, Gemini) via `src/infra/llm`. It constructs prompts using templates (`src/assets/templates/prompts`) to generate semantic summaries of files, architecture diagrams, and structured outputs. The prompt context system manages budget calculation, trimming, and policy resolution.

5. **CLI and MCP Interface** – The CLI (`src/cli/commands`) exposes operations: `init`, `sync`, `fix`, `scan`, `publish`, `view`. The MCP server (`src/infra/mcp`) provides the same capabilities to external AI agents via the Model Context Protocol, with context-aware gating.

6. **Service Orchestration** – Services in `src/services` manage the lifecycle of pipeline runs, including checkpoint/resume. They coordinate scanning, AST extraction, validation, LLM correction, summarization, and view generation. Session state is persisted in checkpoints, allowing interrupted runs to resume reliably.

7. **Infrastructure Layer** – This includes SQLite database persistence (`src/infra/db`) for file metadata, drift events, and violations; credential storage with platform-specific backends (`src/infra/credentials`); manifest tracking (`src/infra/manifest`); and prompt assembly (`src/infra/prompt`). These components provide the data foundation for all operations.

8. **Templates and Views** – Templates in `src/assets/templates/atlas`, `prompts`, `rules`, and `view` define the contracts for mirroring documentation, AI interactions, architectural constraints, and generated risk assessments. The view subsystem (`src/services/view`) generates architecture diagrams, risk hotspots, and public surface inventories.

9. **Task Pipeline** – Individual pipeline stages (`src/tasks`) implement specific steps: scanning, reconciliation, AST extraction, summarization, validation, fix generation, aggregation, reverse indexing, view derivation, and state commitment. They execute in order and support resumability based on checkpoint state.

**Practical Workflow Example**

When a developer runs `archspine sync`, the system:
- Reads `.spine` configuration and loads rules.
- Scans the file system, ignoring patterns from policies.
- Parses source files with AST engines to extract dependencies and exports.
- Validates dependencies against architectural rules, recording violations.
- Generates LLM-based summaries for each file using prompt templates.
- Produces aggregated views (architecture diagram, risk assessment).
- Persists all results in the SQLite database and updates manifests.
- Saves checkpoints at each stage to enable resumption.

The same workflow can be triggered from an AI agent via MCP, with context access controlled by priming state and operational mode.

Testing across unit, integration, and end-to-end scenarios ensures reliability. The demo project in `examples/` provides a concrete illustration of the system’s behavior, including intentional violation detection.