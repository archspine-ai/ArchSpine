<!-- spine-content-hash:af9241b9e57c28db064f6b18909ab366e162efd5c683972e6c2feebca7425d05 -->
# ArchSpine – LLM 基础设施外观模块

## 角色
本模块作为 **基础设施外观**，为所有与 LLM 相关的配置、客户端创建和提供者工具函数提供稳定的公共接口。上层应用层可以依赖此接口，而无需直接导入 `src/infra/llm/**` 内部模块。

## 主要职责
- 为上层应用层提供 **统一的 LLM 基础设施导入表面**，防止直接导入内部模块。
- 提供 **LLM 客户端工厂函数**（`createResolvedLLMClient`）和 **配置解析工具**（`resolveLLMSettings`）。
- 导出 **全局配置和密钥类型**（`GlobalLLMConfig`、`GlobalLLMSecrets`）以及 **目录工具函数**（`getGlobalArchSpineDir`）。
- 导出 `providerRequiresApiKey` 工具函数，用于检查指定 LLM 提供者是否需要 API 密钥，支持提供者逻辑的解耦。

## 重要不变性
- **不得**导入或重新导出服务、任务或引擎模块中的内容。
- 必须保持为 **薄层重新导出外观**；不应包含超出重新导出范围的实现逻辑。
- 所有重新导出必须源自 `./llm/global.js` 或其他稳定的基础设施子模块。

## 负面范围（不包含）
- 直接的 LLM 提供者实现（例如 OpenAI、Gemini）。
- LLM 请求/响应处理或流式逻辑。
- 数据库或仓库访问。
- 服务或任务编排逻辑。

## 公共接口
- `GlobalLLMConfig`
- `GlobalLLMSecrets`
- `getGlobalArchSpineDir`
- `assertResolvedLLMUsable`
- `createResolvedLLMClient`
- `providerRequiresApiKey`
- `resolveLLMSettings`

## 变更意图
- **架构意图：** 为 LLM 基础设施提供稳定、版本化的公共接口，使上层模块与内部实现细节解耦。
- **近期变更：** 新增 `providerRequiresApiKey` 导出，以支持 LLM 提供者解耦并增强风险热点检测能力。