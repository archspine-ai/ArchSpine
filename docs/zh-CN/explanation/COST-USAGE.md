# LLM 成本与 Token 消耗指南

ArchSpine 是一个高上下文合成引擎。它通过读取大量仓库结构来提供确定性的上下文。本指南解释了 ArchSpine 如何消耗 Token 以及你如何管理成本。

## 1. 哪些命令会消耗 Token？

| 命令              | LLM 使用量 | 说明                                                                                                      |
| :---------------- | :--------- | :-------------------------------------------------------------------------------------------------------- |
| `spine sync`      | **高**     | 更新语义镜像的主要命令。它分析源文件以生成 JSON 索引。                                                    |
| `spine publish`   | **中**     | 从现有 JSON 索引回填人类可读的 Markdown (Atlas)。如果启用，则使用 LLM 进行摘要。                          |
| `spine check`     | **中**     | 根据架构规则分析代码。Token 使用量取决于规则的数量和复杂度。                                              |
| `spine fix`       | **中**     | 生成代码补丁以修复规则违规。                                                                              |
| `spine status`    | 无         | 仅限本地的元数据检查。                                                                                    |
| `spine info`      | 无         | 仅限本地的仓库摘要。                                                                                      |
| `spine mcp start` | 无         | MCP 服务器本身是本地的；你的 AI Agent（如在 Cursor 中）发起的单个工具调用将通过*它们*的提供商消耗 Token。 |

## 2. Token 消耗模式

ArchSpine 使用 **双层语义短路机制 (Dual-Layer Semantic Short-Circuiting)** 来最小化成本：

- **L1 (基于 AST)**：如果文件的结构（导入/导出）没有改变，则完全跳过摘要（0 Token）。
- **L2 (基于哈希)**：如果结构变化没有对语义产生实质性影响，则跳过随后的聚合步骤。

### 典型使用示例（标准模式）

_数据基于 ArchSpine 自身的代码库（约 100 个文件）。_

- **小文件** (如：工具函数): ~4k - 9k tokens。
- **中型文件** (如：核心服务): ~25k - 35k tokens。
- **复杂文件** (如：AST 解析器): ~50k+ tokens。

## 3. 管理成本

### 选择合适的模型

为了获得质量和成本的最佳平衡，我们推荐使用 **DeepSeek-V3** 或 **DeepSeek-R1**。它们以其他“性能”层级模型的一小部分成本，提供了巨大的上下文窗口和高 TPM 限制。

### 使用 `mode` 进行控制

- `spine llm set mode standard`: 针对日常平衡进行了优化。
- `spine llm set mode heavy`: 更彻底，但更贵且更慢。用于关键架构审计。

### 本地 LLM

你可以针对本地模型（Ollama、LM Studio）运行 ArchSpine，以完全消除 API 成本。参见 [本地 LLM 指南](../how-to/LOCAL-LLM)。

## 4. CLI 中的成本透明度

在每次 `sync`、`check` 或 `fix` 操作结束时，ArchSpine 会打印：

- 解析出的模型和提供商。
- 会话的总 Token 使用量。
- 预估成本（如果提供商支持元数据报告）。

你也可以运行 `spine usage` 来查看历史消耗。
