# FAQ & Troubleshooting

Common questions and answers about ArchSpine `v1.0.x`.

## Frequently Asked Questions

### Q: Why is my `.spine/atlas/` directory empty or missing files?

**A:** In `v1.0.x`, `spine sync` only updates the machine-readable JSON indexes in `.spine/index/`. To generate or update human-readable Markdown docs, you must run `spine publish`. This split ensures daily development is fast and cost-effective.

### Q: Does ArchSpine send my entire codebase to the LLM?

**A:** No. ArchSpine uses a sparse analysis approach. It extracts the "skeleton" (AST) of your files and only sends the relevant structure and content needed for summarization or rule checking. It also uses a local cache and short-circuiting to avoid re-processing unchanged files.

### Q: How do I resolve a `Lock collision` or `stale lock` warning?

**A:** ArchSpine uses `.spine/.lock` to prevent concurrent writes. If a previous process crashed, a stale lock might remain. Confirm that no other `spine` process is running, then manually delete `.spine/.lock`.

### Q: Can I use ArchSpine with Cursor or Claude Desktop?

**A:** Yes! Run `spine mcp start` and add the server to your favorite AI tool. See the [MCP Integration Guide](../how-to/MCP) for setup instructions.

### Q: Why does `spine sync` fail with a "File is too large for LLM summarization" error?

**A:** ArchSpine enforces a strict 2MB size limit per file for semantic summarization to protect against token exhaustion and context window overflows. If a source file exceeds 2MB, it is usually a bundled artifact, massive dataset, or generated code that offers no architectural value. You must add the file path to `.spineignore` to bypass it and complete the sync.

### Q: My token usage is higher than expected. How can I reduce it?

**A:**

1. Use `spine llm set mode standard` instead of `heavy`.
2. Ensure your `.spineignore` is configured correctly to exclude large, irrelevant files (e.g., build artifacts, dependencies).
3. Use a more cost-effective provider like DeepSeek.

## Troubleshooting Common Errors

| Error Code / Message       | Possible Cause                                      | Solution                                                               |
| :------------------------- | :-------------------------------------------------- | :--------------------------------------------------------------------- |
| `[PUBLISH_LOCK_ACTIVE]`    | Another process is writing to `.spine`.             | Wait for it to finish, or clear the lock manually if stale.            |
| `[RUNTIME_DB_OPEN_FAILED]` | The local cache database is corrupted.              | Run `spine build` to perform a clean rebuild.                          |
| `[LLM_CONTEXT_EXCEEDED]`   | A file is too large for the model's context window. | Increase the model's context window or add the file to `.spineignore`. |
| `[INVALID_API_KEY]`        | The LLM provider rejected your credentials.         | Run `spine llm setup` or `spine llm set api-key` to update your key.   |

For more detailed operational guidance, refer to the [Runbook](../how-to/RUNBOOK).
