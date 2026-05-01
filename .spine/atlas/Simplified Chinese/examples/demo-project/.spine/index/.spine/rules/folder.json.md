<!-- spine-content-hash:b8cc64957fc835ad34a7e395f548d09496055e2afff42105be16b2e7141de971 -->
# ArchSpine 规则文件夹配置

## 角色
定义 ArchSpine 项目中规则文件夹的目录结构和元数据，作为配置文档的容器。

## 主要职责
- 组织 `.spine/rules` 下的规则文件
- 提供文件夹及其子文件的元数据（角色、职责）
- 跟踪索引和生成的来源信息

## 不变约束
- 目录必须为 `.spine/rules`
- `schemaVersion` 必须精确为 `1.0.0`
- 每个子文件必须包含 `filePath`、`role` 和 `fileKind`

## 排除范围
此文件不定义运行时行为、不执行安全策略、也不管理用户认证。它纯粹是用于文档和 AI 上下文的结构描述符。

## 导出的行为
配置由索引和生成管道消费。它验证目录路径和子文件引用是否正确。`provenance` 块仅提供信息，不影响运行时行为。

## 稳定性与风险
此文件是结构描述符，操作风险较低。错误的目录或 `schemaVersion` 可能导致索引失败或规则文件路由错误。只要目录路径和子文件引用有效，系统稳定性即可保持。

## 参数定义
- **schemaVersion**：用于验证此配置的架构版本；必须为 `1.0.0` 以确保兼容性。
- **directory**：规则文件存储的目标目录路径；必须为 `.spine/rules`。
- **role**：文件夹功能描述，用于文档和 AI 上下文理解。
- **responsibility**：分配给此文件夹的高级职责，帮助系统理解其用途。
- **children**：子文件条目数组，每个条目指定文件路径、角色和文件类型（例如 `document`）。
- **provenance**：关于此配置生成时间和方式的元数据，包括索引时间戳和生成器版本。
  - **provenance.indexedAt**：文件夹最后被索引的 ISO 8601 时间戳。
  - **provenance.generatorVersion**：生成器工具的版本标识（例如 `archspine/1.0.0`）。
  - **provenance.pipelineStages**：用于生成此配置的处理阶段列表（例如 `ast`、`llm`）。