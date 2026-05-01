<!-- spine-content-hash:7e5763ad350bfa4f489ed760f062f527061e088fc724cc76d43c35e2a9e02d1d -->
# ArchSpine 项目结构定义

此文件为 ArchSpine 镜像系统定义项目的结构布局和元数据，将目录模块映射到其角色和职责。

## 主要职责

- **项目结构注册与模块枚举** – 注册文件夹层次结构并列出所有模块。
- **目录角色与职责分配** – 为每个目录分配功能角色及其职责描述。
- **索引与生成流水线的来源追踪** – 记录此配置的生成时间和方式，包括索引时间戳、生成器版本以及使用的流水线阶段（例如 AST 解析、LLM 分析）。

## 重要不变性

- `schemaVersion` 必须是有效的 semver 字符串。
- 每个模块必须包含 `directory`、`role` 和 `childCount`。
- `provenance.indexedAt` 必须是有效的 ISO 8601 时间戳。
- `provenance.generatorVersion` 必须遵循 `archspire/<semver>` 格式。

## 范围外 / 不负责的内容

此文件不处理任何超出范围的责任。

## 导出 / 外部可见行为

此文件不暴露任何公共表面（无函数、类或 API）。它是一个静态配置文档，由 ArchSpine 镜像系统消费。

## 稳定性与风险

此文件是 ArchSpine 镜像系统理解项目结构的基础。模块定义错误可能导致职责路由错误或索引不完整。`provenance` 块对可审计性至关重要；篡改 `indexedAt` 或 `generatorVersion` 可能导致流水线不匹配。`schemaVersion` 不变性确保了向前/向后兼容性。总体而言，如果自动生成，此文件的操作风险较低，但手动编辑模块角色或 `childCount` 可能静默破坏下游分析。

## 参数定义

- **schemaVersion** – 配置模式的版本号；确保与 ArchSpine 解析器兼容。
- **projectName** – 项目的人类可读名称；用于在镜像系统中进行标识。
- **role** – 项目在 ArchSpine 生态系统中的高级功能用途。
- **responsibility** – 项目的高级职责描述。
- **modules** – 目录条目数组，每个条目指定路径、角色及其包含的子项数量。这定义了项目的文件夹层次结构。
- **provenance** – 元数据块，记录此配置的生成时间和方式，包括索引时间戳、生成器版本以及使用的流水线阶段（例如 AST 解析、LLM 分析）。