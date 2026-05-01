<!-- spine-content-hash:299b6f8f446c06de3eb3caa266f026ce63ae84b6691b4316d9f1f6319d8e1ffb -->
# ArchSpine – LLM 接口类型模块

## 角色
该模块为基础设施层中的 LLM 客户端抽象、响应结构、提供者配置以及语义上下文追踪提供 TypeScript 接口定义。

## 主要职责
- 定义 `UsageInfo` 接口，用于追踪 LLM 令牌消耗指标。
- 定义 `LLMResponse` 接口，用于 LLM 调用的结构化 JSON 和本地化 Markdown 输出。
- 定义 `LLMClient` 接口抽象，实现与提供者无关的 LLM 交互。
- 定义 `PreviousSemanticContext` 接口，用于跨文件版本的语义漂移检测。
- 定义 `ProviderConfig` 接口，用于 LLM 提供者配置。

## 重要不变性与负面范围
- **不变性：** 仅导出 TypeScript 接口和类型，不包含任何运行时逻辑。作为代码库中 LLM 相关基础设施的稳定契约。属于基础设施层公开类型表面的一部分。
- **不涉及范围：** 不编排 LLM 调用或管理运行时客户端实例。不实现具体的 LLM 提供者集成。不处理 LLM 服务的认证或网络通信。

## 最重要的导出行为
该模块暴露五个关键接口：`UsageInfo`、`LLMResponse`、`LLMClient`、`PreviousSemanticContext` 和 `ProviderConfig`。它们构成了基础设施层中所有 LLM 交互的基础类型契约，支持跨提供者的一致响应处理和语义追踪。