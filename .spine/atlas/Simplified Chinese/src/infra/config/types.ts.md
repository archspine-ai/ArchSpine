<!-- spine-content-hash:97f40567d4a55916688ef74b0f734c47ec7c2a3767be3fbd3c97fa62c3be2b4b -->
# ArchSpine 配置类型模块

本模块是 ArchSpine 镜像系统中所有配置相关接口和枚举的**中心类型定义枢纽**。它提供稳定的纯 TypeScript 类型契约，将类型定义与实现逻辑解耦。

## 角色

集中化并重新导出 ArchSpine 系统中使用的配置类型，确保配置接口拥有单一真实来源。

## 主要职责

- **重新导出 `SpineConfig`** 来自协议层，使其可在配置域内直接使用，避免重复定义。
- **定义 `BooleanSettingResolution`** 接口——用于建模布尔设置项的解析来源及其值。
- **定义系统行为的字面量联合类型**：
  - `HookSyncMode` —— 枚举钩子的同步模式。
  - `ArtifactStrategy` —— 枚举制品的处理策略。
- **导出 `SupportedConfigKey`** 类型——枚举所有有效的配置键。

## 重要不变性

- **纯类型定义** —— 不包含任何可执行代码或运行时逻辑。
- 作为整个系统中配置相关类型的**权威来源**。

## 不包含范围

- 运行时配置加载或验证。
- 服务或引擎的编排。
- 任何业务逻辑的实现。

## 公开接口

以下类型和接口供外部使用：

- `SpineConfig`
- `BooleanSettingResolution`
- `HookSyncMode`
- `ArtifactStrategy`
- `SupportedConfigKey`