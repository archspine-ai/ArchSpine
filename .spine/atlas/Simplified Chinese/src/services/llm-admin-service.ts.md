<!-- spine-content-hash:68a93a9fd747aeddd627ba43048e0a64f007748407a2a239a2eb4386097bff06 -->
# ArchSpine – LLM 配置类型定义

## 角色
该模块提供 TypeScript 类型定义，用于视图服务层中的 LLM 配置命令结构和视图模型。它定义了 CLI 命令和运行时服务与 LLM 设置交互时使用的契约。

## 主要职责
- 定义 LLM 命令目标、设置值和状态视图模型的接口。
- 提供 LLM 配置和密钥存储子集的类型别名，以在 LLM 配置边界上强制类型安全。
- 封装便于视图服务与基础设施模块之间就 LLM 设置进行通信的类型定义。

## 重要不变项与负面范围
- **纯类型定义** – 不包含任何可执行代码。
- 依赖于基础设施类型（`Config`、`Secrets`、`GlobalLLMConfig`）和运行时服务类型。
- 仅由视图服务和 CLI 用于 LLM 配置类型化。
- **不在范围内：** 编排运行时 LLM 操作、直接与 LLM API 或密钥管理交互、渲染 UI 组件或处理 HTTP 请求。

## 最重要的导出类型
- `LLMCommandTarget`
- `LLMSetupValues`
- `LLMStatusViewModel`
- `LLMScope`

这些类型构成了模块的公共表面，是系统其他部分使用的主要契约。