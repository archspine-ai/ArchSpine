## 提示词组装与编排层

本目录实现了 ArchSpine 系统中 AI 代理交互的核心提示词组装与编排功能。它提供了一套工具和外观模式，用于统一构建 Markdown 文档与源代码分析任务所需的结构化提示词。

### 主要子模块及分组

- **`builder.ts`** — `PromptBuilder` 类，提供流畅的接口，用于按顺序组装提示词的各部分（身份设定、指令、上下文等），并将其拼接为最终字符串。
- **`shared.ts`** — 共享工具模块，根据 `PromptResponseMode` 与目标语言生成输出合约段落（包括 JSON 结构、语言指令与 Markdown 指引）。强制要求英语作为基础语言。
- **`types.ts`** — 定义 `PromptResponseMode` 类型（`json-only` 或 `json-and-markdown`）以及 `MarkdownPromptInput` 接口，编码了文件类型与本地化需求之间的契约。
- **`markdown.ts`** — 外观函数 `generateMarkdownPrompt`，根据语义 JSON 输入构建纯 Markdown 提示词，内部依赖 `PromptBuilder` 与 `shared.ts` 工具。
- **`source.ts`** — 用于生成源代码分析与校验任务的 LLM 提示词的外观函数。提供标准摘要变体以及专用校验变体 `generateSourceValidationJsonPrompt`，后者执行严格的架构审计并具备语义漂移检测能力。

### 关键实现领域

- **流畅的提示词构建**：通过 `PromptBuilder` 及可插拔的模板函数（身份、指令、上下文）实现。
- **本地化支持**：为每种目标语言生成对应的指令，并在输出合约中强制包含基础语言。
- **输出合约强制**：验证响应模式，并生成结构化 JSON 或 JSON+Markdown 输出。
- **源代码分析流程**：注入环境上下文（分支、Git 状态）、架构规则、依赖上下文以及历史语义合约，以引导 LLM 输出。
- **语义漂移检测**：通过比较当前 AST 状态与历史语义合约，在校验过程中标记不一致之处。