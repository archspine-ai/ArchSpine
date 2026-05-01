<!-- spine-content-hash:7a26230413d14f1d32ee82da693c35f1d2525fff22d37bb04305fb47f88a0a8d -->
# ArchSpine 类型定义模块

## 角色
ArchSpine LLM 编排系统中用于提示生成、验证、诊断配置和生成策略的中央 TypeScript 类型定义模块。

## 主要职责
- 定义提示任务模式（例如 `'summarize'`、`'validate'`）、策略层级、LLM 操作模式和生成策略（包括 `'json-only'`）的类型模式。
- 提供提示预算配置文件的接口定义，指定头部、主体和底部部分的行数约束。
- 导出用于跟踪提示上下文、规则块、相关性和源文件快照的诊断接口结构。
- 作为 AST 提取器、上下文解析引擎和 LLM 基础层之间跨模块通信的权威类型契约。

## 重要不变性与负面范围
- **仅**包含 TypeScript 类型别名和接口声明——无可执行代码或运行时依赖。
- 导入严格限于来自其他模块的类型引用。
- **不在范围内：** 提示生成或验证逻辑的运行时实现；LLM 调用或任务执行的编排；与基础设施或外部服务的直接交互。

## 最重要的导出类型
- `PromptTaskMode`、`PromptPolicyTier`、`ValidatePolicy`、`LLMMode`、`GenerationFlow`
- `PromptProfile`、`ValidationProfile`、`GenerationStrategy`
- `RelevanceDiagnosticsMode`、`PromptBudgetProfile`、`PromptBudgets`
- `SourcePromptArtifactsInput`、`SourcePromptArtifacts`
- `PromptContextDiagnostics`、`PromptRuleBlockDiagnostics`、`PromptRelevanceDiagnostics`
- `SourceFileDiagnosticsSnapshot`、`RelevanceDiagnosticsSnapshot`

## 变更意图
- **架构意图：** 为 LLM 提示编排系统提供稳定、集中的类型契约，实现模块间的类型安全通信和清晰的配置边界。
- **近期变更：** 扩展了 `GenerationStrategy` 类型以包含 `'json-only'` 模式，支持新的仅 JSON 同步功能，具有语义短路和发布回填特性。