<!-- spine-content-hash:9de50da33880a4731fa18dbd18149828eb34d6c474d290296d40d3136b3fcb64 -->
# ArchSpine 配置模式（`SpineConfig`）

此 TypeScript 接口定义了 ArchSpine 镜像系统的中央配置模式。它作为系统配置的主要契约，将配置结构与实现细节解耦。

## 主要职责

- 声明系统根配置对象（`SpineConfig`）的结构。
- 指定所需的模式版本和项目元数据（名称、语言区域）。
- 定义可选的 LLM 集成设置（提供商、模型、baseURL、模式）。
- 导出 `MCPContextMode` 类型，用于上下文模式区分。

## 重要不变性

- 将 `SpineConfig` 导出为主要配置契约。
- 依赖导入的类型（`PartialScanPolicy`、`SchemaVersion`）以确保类型安全。
- 为项目和 LLM 设置定义嵌套结构。

## 不涉及范围

- 实现配置验证或解析逻辑。
- 提供默认值或环境变量绑定。
- 处理运行时配置更新或动态重新加载。

## 公开表面

- `SpineConfig` 接口
- `MCPContextMode` 类型

## 规则违规

- **interface-prefix**（警告）：接口 `SpineConfig` 未以字符 `I` 开头，不符合内部接口的 interface-prefix 规则要求。

## 漂移检测

- **检测到漂移：** 否
- **漂移原因：** 无