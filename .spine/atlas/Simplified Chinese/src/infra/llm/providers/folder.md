# LLM 客户端

此目录提供多种大型语言模型（LLM）供应商的具体实现及工具函数，服务于 ArchSpine 镜像系统。这些组件共同实现了 LLM 客户端接口，支持对不同文件类型（配置、文档、源码、文件夹、项目等）生成语义摘要。

## 主要子模块

| 子模块 | 说明 |
|--------|------|
| `gemini.ts` | Google Gemini API 的具体实现。使用 `GoogleGenerativeAI` 发送结构化提示，并通过工具函数解析 JSON 和 Markdown 响应。 |
| `openai.ts` | OpenAI 兼容 API（包括自定义端点）的实现。依赖 OpenAI SDK 处理聊天完成、提示生成和响应解析。 |
| `mock.ts` | 用于单元测试和集成测试的模拟 LLM 客户端。提供确定性响应、模拟架构规则违规，并测试提示处理管道。 |
| `utils.ts` | 基础工具模块，提供共享函数：响应解析（`parseStructuredResponse`、`parseMarkdownBlocks`）、上下文组装（`buildSupportingContext`）和用量聚合（`mergeUsage`）。 |

## 重点实现领域

- **供应商通信**：每个客户端处理各自供应商的身份验证、模型选择和请求/响应循环。
- **提示构造**：按文件类型使用专用生成器（如 `generateSourcePrompt`、`generateConfigPrompt`）构建提示。
- **响应解析**：通过 `utils.ts` 中的正则表达式和回退逻辑从原始 LLM 输出中提取结构化 JSON 和 Markdown 块。
- **用量聚合**：合并连续 API 调用的令牌计数和用量信息，实现统一报告。
- **测试支持**：模拟客户端可在无需外部 API 调用的情况下确定性验证提示处理和规则检查。