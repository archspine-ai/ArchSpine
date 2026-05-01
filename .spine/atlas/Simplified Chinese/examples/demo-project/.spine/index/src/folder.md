<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/index/src","role":"Aggregates metadata and indexing records for the source code directory tree within the ArchSpine mirror system.","responsibility":"Collectively defines the structural metadata schema for source code directories and files, including indexing provenance, dependency graphs, architectural rule enforcement, content integrity tracking, and pipeline stage logging for the src directory and its subdirectories (api, domain, infra).","children":[{"filePath":"examples/demo-project/.spine/index/src/api","role":"This directory contains metadata definitions for indexing and analyzing source code files within the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"examples/demo-project/.spine/index/src/domain","role":"This directory aggregates metadata and indexing records for a domain source folder within the ArchSpine mirror system.","fileKind":"folder"},{"filePath":"examples/demo-project/.spine/index/src/folder.json","role":"Defines the structural hierarchy and metadata for the source code directory tree within the ArchSpine project.","fileKind":"config"},{"filePath":"examples/demo-project/.spine/index/src/infra","role":"Metadata and indexing layer for the ArchSpine mirror system's database infrastructure.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:38.753Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 源码索引（`src`）

此目录聚合了 ArchSpine 镜像系统中源码目录树的元数据和索引记录。它定义了源码目录和文件的结构元数据模式，包括索引来源、依赖关系图、架构规则执行、内容完整性跟踪以及 `src` 目录及其子目录（`api`、`domain`、`infra`）的流水线阶段日志。

## 主要子目录

- **`api/`** – 包含用于在 ArchSpine 镜像系统中索引和分析源码文件的元数据定义。
- **`domain/`** – 聚合 ArchSpine 镜像系统中领域源码文件夹的元数据和索引记录。
- **`infra/`** – 提供 ArchSpine 镜像系统数据库基础设施的元数据和索引层。
- **`folder.json`** – 定义 ArchSpine 项目中源码目录树的结构层次和元数据。

## 关键实现领域

- **索引来源**：跟踪索引执行的时间和方式（`indexedAt`、`generatorVersion`）。
- **流水线阶段**：记录处理过程中涉及的阶段（`ast`、`llm`）。
- **结构元数据**：定义目录和文件的模式，包括其角色和关系。
- **依赖关系图**：支持分析源码组件之间的依赖关系。
- **架构规则执行**：支持验证架构约束。
- **内容完整性跟踪**：确保索引内容的完整性。