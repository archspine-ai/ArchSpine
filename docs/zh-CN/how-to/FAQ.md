# 常见问题与排障 (../how-to/FAQ)

关于 ArchSpine `v1.0.x` 的常见问题解答。

## 常见问题

### 问：为什么我的 `.spine/atlas/` 目录是空的或者缺少文件？

**答：** 在 `v1.0.x` 中，`spine sync` 仅更新 `.spine/index/` 中的机器可读 JSON 索引。要生成或更新人类可读的 Markdown 文档，你必须运行 `spine publish`。这种拆分确保了日常开发既快速又省钱。

### 问：ArchSpine 会将我的整个代码库发送给 LLM 吗？

**答：** 不会。ArchSpine 使用稀疏分析方法。它提取文件的“骨架”(AST)，仅发送摘要或规则检查所需的相关结构和内容。它还使用本地缓存和短路机制来避免重新处理未更改的文件。

### 问：如何解决 `Lock collision` 或 `stale lock` 警告？

**答：** ArchSpine 使用 `.spine/.lock` 来防止并发写入。如果之前的进程崩溃，可能会留下陈旧的锁。请确认没有其他 `spine` 进程正在运行，然后手动删除 `.spine/.lock`。

### 问：我可以在 Cursor 或 Claude Desktop 中使用 ArchSpine 吗？

**答：** 可以！运行 `spine mcp start` 并将服务器添加到你最喜欢的 AI 工具中。参见 [MCP 接入指南](../how-to/MCP) 获取设置说明。

### 问：为什么 `spine sync` 会因为“File is too large for LLM summarization”错误而失败？

**答：** 为了防止 Token 耗尽和上下文窗口溢出，ArchSpine 对语义总结强制执行单文件 2MB 的大小限制。如果源文件超过 2MB，它通常是打包产物、大型数据集或自动生成的代码，没有架构治理价值。你必须将该文件路径添加到 `.spineignore` 中才能跳过它并完成同步。

### 问：我的 Token 使用量高于预期。我该如何减少它？

**答：**

1. 使用 `spine llm set mode standard` 而不是 `heavy`。
2. 确保你的 `.spineignore` 配置正确，以排除大型、无关的文件（如：构建产物、依赖项）。
3. 使用像 DeepSeek 这样性价比更高的提供商。

## 常见错误排障

| 错误代码 / 消息            | 可能的原因                         | 解决方案                                                           |
| :------------------------- | :--------------------------------- | :----------------------------------------------------------------- |
| `[PUBLISH_LOCK_ACTIVE]`    | 另一个进程正在写入 `.spine`。      | 等待其完成，如果锁已陈旧，则手动清除。                             |
| `[RUNTIME_DB_OPEN_FAILED]` | 本地缓存数据库已损坏。             | 运行 `spine build` 执行全量重建。                                  |
| `[LLM_CONTEXT_EXCEEDED]`   | 文件对于模型的上下文窗口来说太大。 | 增加模型的上下文窗口或将文件添加到 `.spineignore`。                |
| `[INVALID_API_KEY]`        | LLM 提供商拒绝了你的凭证。         | 运行 `spine llm setup` 或 `spine llm set api-key` 来更新你的 Key。 |

有关更详细的操作指导，请参阅 [Runbook](../how-to/RUNBOOK)。
