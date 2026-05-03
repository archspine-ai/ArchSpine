# LLM Cost & Token Usage Guide

ArchSpine is a high-context synthesis engine. It provides deterministic context by reading a significant amount of your repository structure. This guide explains how ArchSpine consumes tokens and how you can manage your costs.

## 1. Which Commands Consume Tokens?

| Command           | LLM Usage  | Description                                                                                                                        |
| :---------------- | :--------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `spine sync`      | **High**   | The primary command for updating the semantic mirror. It analyzes source files to generate JSON indexes.                           |
| `spine publish`   | **Medium** | Backfills human-readable Markdown (Atlas) from existing JSON indexes. Uses LLM for summarization if enabled.                       |
| `spine check`     | **Medium** | Analyzes code against architecture rules. Token usage depends on the number and complexity of rules.                               |
| `spine fix`       | **Medium** | Generates code patches to fix rule violations.                                                                                     |
| `spine status`    | None       | Local-only metadata check.                                                                                                         |
| `spine info`      | None       | Local-only repository summary.                                                                                                     |
| `spine mcp start` | None       | The MCP server itself is local; individual tool calls by your AI agent (e.g., in Cursor) will consume tokens via _their_ provider. |

## 2. Token Consumption Patterns

ArchSpine uses a **Dual-Layer Semantic Short-Circuiting** mechanism to minimize costs:

- **L1 (AST-based)**: If a file's structure (imports/exports) hasn't changed, summarization is bypassed entirely (0 tokens).
- **L2 (Hash-based)**: If the structural change doesn't meaningfully impact semantics, subsequent aggregation steps are skipped.

### Typical Usage Examples (Standard Mode)

_Figures based on ArchSpine's own codebase (~100 files)._

- **Small File** (e.g., utility function): ~4k - 9k tokens.
- **Medium File** (e.g., core service): ~25k - 35k tokens.
- **Complex File** (e.g., AST parser): ~50k+ tokens.

## 3. Managing Costs

### Choose the Right Model

For the best balance of quality and cost, we recommend **DeepSeek-V3** or **DeepSeek-R1**. They provide large context windows and high TPM limits at a fraction of the cost of other "Performance" tier models.

### Use `mode` for Control

- `spine llm set mode standard`: Optimized for day-to-day balance.
- `spine llm set mode heavy`: More thorough, but more expensive and slower. Use for critical architecture audits.

### Local LLMs

You can run ArchSpine against local models (Ollama, LM Studio) to eliminate API costs entirely. See the [Local LLM Guide](../how-to/LOCAL-LLM).

## 4. Cost Transparency in CLI

At the end of every `sync`, `check`, or `fix` operation, ArchSpine prints:

- The resolved model and provider.
- Total token usage for the session.
- Estimated costs (if the provider supports metadata reporting).

You can also run `spine usage` to see historical consumption.
