# Knowledge Graph

## Why a Knowledge Graph

Grep understands text; it does not understand architecture. An AI agent that searches for import statements finds individual edges but cannot see the topology. The knowledge graph gives agents and developers a **queryable model of the codebase's structure** — not a flat list of files, but a graph of modules with typed edges, weights, and compliance states.

## From File-Level to Module-Level

The raw data is file-level dependencies: file A imports file B. A single package might have hundreds of files, each with dozens of imports. This granularity is too fine for architectural reasoning — nobody asks "what does `src/utils/string-helpers.ts` depend on?" in a design review. They ask "what does the utils module depend on?"

The **D1 aggregation strategy** groups files into modules using a three-tier fallback:

1. **Package boundary** — if the file belongs to a declared package (e.g., `package.json`, `Cargo.toml`), group by package.
2. **src/ subdirectory** — for monorepos or structured projects, group by the first subdirectory under `src/`.
3. **Top-level directory** — as a last resort, use the top-level directory containing the file.

File-level edges are aggregated: if three files in module A import from module B, that becomes a single weighted edge with count=3. The result is a module-level topology graph that is small enough to reason about but faithful enough to be actionable.

## Edge Compliance

Every edge in the knowledge graph is checked against `.spine/rules/`. A rule might say "module `core` must not depend on module `cli`". If the graph contains such an edge, it is flagged as non-compliant. CI can then block the PR. This is how ArchSpine enforces architecture: not by convention, but by machine-checked constraints that fail the build.

## How the Graph Enables Query Tools

Three MCP tools depend on the knowledge graph:

- **`spine_query_graph`** — traverse the graph: find all dependencies of a module, all dependents, shortest paths, cycles.
- **`spine_match_semantic`** — find modules whose semantic index entries are similar to a natural language query. This is not keyword search — it compares embedding vectors from the LLM.
- **`spine_get_change_impact`** — given a changed file, walk the dependency graph to find every module transitively affected.

Architecture views also consume the graph: the architecture diagram renders it visually, the project health report scores it for risks, and the agent briefing includes a topology summary.

## The Granularity Tradeoff

Finer granularity (file-level or symbol-level edges) would produce more precise impact analysis but dramatically increase graph size and build time. A 10,000-file repository with file-level edges produces a graph with hundreds of thousands of edges — expensive to compute, store, and diff. Coarser granularity (package-only) would miss internal module boundaries that matter for architecture enforcement. D1 is the middle ground: specific enough to catch real architecture violations, coarse enough to remain fast and reviewable.
