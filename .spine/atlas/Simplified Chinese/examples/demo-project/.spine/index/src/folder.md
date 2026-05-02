<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/index/src","role":"Aggregates metadata and indexing records for the source code directory tree within the ArchSpine mirror system.","responsibility":"Collectively defines the structural metadata schema for source code directories and files, including indexing provenance, dependency graphs, architectural rule enforcement, content integrity tracking, and pipeline stage logging for the src directory and its subdirectories (api, domain, infra).","children":[{"filePath":"examples/demo-project/.spine/index/src/api","role":"This directory contains metadata definitions for indexing and analyzing source code files within the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"examples/demo-project/.spine/index/src/domain","role":"This directory aggregates metadata and indexing records for a domain source folder within the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"examples/demo-project/.spine/index/src/folder.json","role":"Defines the structural hierarchy and metadata for the source code directory tree within the ArchSpine project.","fileKind":"config"},{"filePath":"examples/demo-project/.spine/index/src/infra","role":"Metadata and indexing layer for the ArchSpine mirror system's database infrastructure.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:38.753Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 源索引目录 (`src`)

`examples/demo-project/.spine/index/src` 目录汇总了示例项目整个源代码树的所有元数据与索引记录。它构成了 ArchSpine 镜像系统自省层的结构骨架，记录了源目录和文件在组织、验证及追踪方面的信息。

### 角色与职责

本目录定义了所有源代码目录和文件的结构化元数据模式。其核心职责是统一记录源码层级（包括 `api`、`domain`、`infra` 三个子层）的索引来源、依赖关系图、架构规则实施情况、内容完整性校验以及流水线阶段日志。

### 子项概览

| 条目 | 类型 | 用途 |
|------|------|------|
| `api` | 文件夹 | 存放 API 相关源文件的索引及分析元数据定义。 |
| `domain` | 文件夹 | 聚合领域逻辑源文件夹的索引记录。 |
| `infra` | 文件夹 | 数据库基础设施（持久化、ORM 映射等）的元数据与索引层。 |
| `folder.json` | 配置文件 | 定义整个 `src` 目录树的结构层级和元数据。 |

### 关键实现领域

- **索引来源**：记录于 `indexedAt` 时间戳 (`2026-05-01T03:58:38.753Z`)，生成器版本为 `archspine/1.0.0`。
- **流水线阶段**：包含 `ast` 和 `llm` 两个阶段，用于处理与增强。
- **子模块粒度**：每个子文件夹（`api`、`domain`、`infra`）持有自身的索引记录，从而支持按架构层独立遍历和应用规则。

`folder.json` 配置作为 `src` 索引的根入口，将这三个具体的子模块及其元数据文件联结在一起。