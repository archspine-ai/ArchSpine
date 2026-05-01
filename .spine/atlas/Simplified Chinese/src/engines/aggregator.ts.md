<!-- spine-content-hash:32cf7a08fa4fbc21f6175427f0435fccdaa4442e960cb67c2f1429d1071248b6 -->
# ArchSpine 聚合器

## 角色
核心引擎类，负责遍历 spine 文件系统，将索引和图谱数据聚合为结构化的 SpineUnit 集合，供下游同步和视图操作使用。

## 主要职责
- 遍历 `.spine/index` 和 `.spine/atlas` 目录结构，发现 spine 单元（文件夹、项目、文件）。
- 使用索引读取基础设施（`isCompatibleIndexDocument`、`readIndexDocument`、`reportIndexReadIssueOnce`）读取并验证 spine 索引文档。
- 构建结构化的 `SpineUnit` 对象集合（`SpineFolderUnit`、`SpineProjectUnit`），供下游处理（例如同步、视图生成）。
- 集成 LLM 客户端，用于对 spine 内容进行潜在的语义增强或分析。

## 不涉及范围
- CLI 参数解析或命令行接口相关功能。
- 服务级编排或 HTTP 请求处理。
- 超出文件系统遍历范围的直接数据库或持久化存储操作。
- 用户身份验证或授权逻辑。

## 不变约束
- **引擎独立性**：不得导入 CLI 入口点或服务编排模块；必须保持为可复用的分析组件。

## 公开接口
- `Aggregator`（类）

## 重要说明
- 该类设计为可复用的引擎，与 CLI 和服务关注点解耦。
- 最近的变更侧重于常规维护，修复 lint 警告和类型错误，确保代码质量和 CI 兼容性。