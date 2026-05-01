<!-- spine-content-hash:949e27b174b4537099a624487eaadcf5a73fb4e76b92ae93e1ffb941f1cb9d04 -->
# ArchSpine 项目根配置

## 角色
定义 ArchSpine 语义索引系统的项目标识、模块结构和溯源元数据。

## 主要职责
- 管理项目元数据和模式版本控制
- 定义模块目录布局和角色分配
- 跟踪索引管道的处理阶段溯源

## 重要参数
- **schemaVersion**：控制与 ArchSpine 工具的兼容性；版本不匹配可能导致解析失败。
- **projectName**：标识仓库以保持交叉引用完整性；必须与根项目名称一致。
- **modules**：声明源代码和文档目录及其角色和文件数量；影响索引范围。
- **provenance.indexedAt**：上次索引的时间戳；用于缓存失效和过时检测。
- **provenance.generatorVersion**：生成此文件的索引工具版本；对可重现性至关重要。
- **provenance.pipelineStages**：生成索引的处理阶段有序列表（例如 AST、LLM）；影响下游工具行为。

## 不变约束
- `schemaVersion` 必须是有效的 semver 字符串
- `projectName` 必须与仓库根标识符匹配
- `provenance.indexedAt` 必须是有效的 ISO 8601 时间戳
- `pipelineStages` 必须至少包含一个阶段

## 稳定性与风险
此文件是 ArchSpine 索引管道的根配置。错误的 `schemaVersion` 或 `projectName` 可能破坏跨仓库链接和工具链兼容性。缺失或过时的溯源时间戳可能导致不必要的重新索引或遗漏更新。模块列表定义了语义分析的范围；遗漏目录会导致知识图谱不完整。

## 外部行为
此文件由 ArchSpine 工具读取以初始化索引管道。它不导出任何运行时函数或类；它是一个静态配置文档。