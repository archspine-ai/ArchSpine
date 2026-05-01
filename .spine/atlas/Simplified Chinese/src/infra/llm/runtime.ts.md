<!-- spine-content-hash:1e188e9c6a24586499f341961a720b7d694f8f4cbfec870d7dab493c7bcf5698 -->
# ArchSpine – LLM 运行时配置解析器与提供商工厂

## 角色
LLM 子系统中的基础设施运行时配置解析器和提供商客户端工厂。

## 主要职责
- 通过合并项目配置、全局配置和环境变量，按照定义的优先级规则解析 LLM 运行时设置（提供商、模型、基础 URL、API 密钥）。
- 使用专用的解析函数从已解析的配置中解析和验证提示策略层级（`PromptPolicyTier`）、LLM 模式（`LLMMode`）和验证策略（`ValidatePolicy`）。
- 基于完全解析的设置和覆盖项，通过 `LLMFactory` 创建 LLM 提供商客户端实例。
- 处理 LLM 设置的旧配置回退和环境变量解析，包括布尔标志和字符串修剪。
- 当未提供显式策略时，从已解析的 LLM 模式派生验证策略和生成流程。

## 重要不变项与职责范围外
- **不得**从 services、tasks 或 engines 层导入，以保持基础设施外观隔离（遵循 `infra-facade-imports` 规则）。
- 配置解析必须遵循优先级：**项目配置 > 全局配置 > 环境变量**。
- 提供商客户端创建必须通过 `LLMFactory`，而非直接实例化。
- **职责范围外：** 运行时编排、任务调度、服务协调（推迟到 `services/runtime-service.ts`）、直接 HTTP 请求处理、LLM 状态的持久化存储，以及面向用户的 CLI 命令。

## 最重要的导出/外部可见行为
- `LLMRuntimeOverrides`（接口）——允许调用者覆盖已解析的设置。
- `ResolvedLLMSettings`（接口）——返回给消费者的最终、完全解析的配置对象。