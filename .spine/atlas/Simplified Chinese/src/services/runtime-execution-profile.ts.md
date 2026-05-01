<!-- spine-content-hash:ad91bf44cc9a53739e84ef99cc938badf9dfe9770c1c568f2b30221d3d384eda -->
# ArchSpine – 服务运行时类型

本模块定义了服务层使用的已解析执行配置和运行时命令的类型契约，在配置解析与执行逻辑之间建立了清晰的边界。

## 角色

服务层中已解析运行时执行配置和命令的类型定义模块。

## 主要职责

- 定义 `ResolvedExecutionProfile` 接口，聚合已解析的 LLM 设置、模式、提示策略层级、验证策略和生成流程，所有字段均为非可选值。
- 定义 `RuntimeCommand` 类型别名，用于表示运行时命令。
- 从基础设施层导入并复用类型（`ResolvedLLMSettings`、`GenerationFlow`、`GenerationStrategy`、`LLMMode`、`PromptPolicyTier`、`PromptProfile`、`ValidatePolicy`、`ValidationProfile`），确保服务边界上的类型一致性。

## 重要不变性

- `ResolvedExecutionProfile` 中的所有字段均为已解析（非可选）值，源自配置或默认值。
- 本模块仅依赖基础设施层的类型定义，不依赖运行时基础设施模块。

## 不包含范围

- 运行时编排或执行逻辑。
- 服务实现或业务逻辑。
- 超出类型导入范围的基础设施模块直接交互。

## 公开接口

- `ResolvedExecutionProfile`
- `RuntimeCommand`

## 变更意图

**架构意图：** 为已解析的执行配置建立类型契约，供运行时服务驱动 LLM 交互，将配置解析与执行分离。

**最近变更：** 开源版本 v1.0.0 的初始提交——为服务运行时建立基础类型定义。