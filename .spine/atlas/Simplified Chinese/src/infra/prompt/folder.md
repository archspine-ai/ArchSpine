`prompt` 目录是 ArchSpine AI 交互系统的提示组装与生成层。它提供了流畅的提示构建器、共享的协议以及专用的生成器，用于构造结构化、本地化且经过验证的 AI 代理提示。

### 主要子模块

- **`builder.ts`** – 导出 `PromptBuilder` 类，提供流畅接口，用于按顺序组装提示的各个部分（身份说明、指令、上下文等），最终拼接成一个字符串。
- **`types.ts`** – 定义提示生成协议所需的 TypeScript 类型，包括 `PromptResponseMode`（仅 JSON，或 JSON 与 Markdown 混合）和 `MarkdownPromptInput` 接口。
- **`shared.ts`** – 工具模块，负责生成格式化的输出约束（OUTPUT CONTRACT）字符串以及相关的语言/Markdown 指导。验证 `English` 是否始终作为必需的基础语言包含在内。
- **`markdown.ts`** – 外观层，根据语义 JSON 输入生成仅包含 Markdown 的本地化提示。借助 `PromptBuilder` 和共享指导，指示模型仅返回带有精确语言标记的 Markdown 块。
- **`source.ts`** – 外观层，用于生成源代码分析和验证的结构化 LLM 提示。注入环境上下文、架构规则、依赖上下文以及先前的语义合约。包含一个专用的验证变体，用于严格的架构审计和语义漂移检测。
- **`aggregate.ts`** – 存在但角色未知，可能为未来的聚合逻辑预留。

### 关键实现领域

- **提示组装编排** – `PromptBuilder` 链式调用并渲染身份、指令、上下文和输出格式等结构化块。
- **本地化与输出约束执行** – `shared.ts` 构建语言特定的指令，并强制要求包含 `English` 作为基础语言。
- **Markdown 专用生成** – `markdown.ts` 序列化语义 JSON，并指示模型仅按语言返回 Markdown 块。
- **源代码分析提示** – `source.ts` 提供包含少样本示例和 Schema 驱动输出约束的完整上下文，用于摘要或验证任务。
- **验证与漂移检测** – `source.ts` 的验证变体执行严格的架构审计，并通过比较语义合约来检测漂移。