<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/index/src/api","role":"This directory contains metadata definitions for indexing and analyzing source code files within the ArchSpine mirror system.","responsibility":"Collectively, the components in this directory define the structural metadata schema for source code directories and files, including indexing provenance, dependency graphs, and architectural rule enforcement.","children":[{"filePath":"examples/demo-project/.spine/index/src/api/folder.json","role":"Defines the structural metadata and indexing provenance for a source code directory within the ArchSpine mirror system.","fileKind":"config"},{"filePath":"examples/demo-project/.spine/index/src/api/handler.ts.json","role":"Defines the semantic metadata, dependency graph, and structural skeleton for a single source file within the ArchSpine mirror system.","fileKind":"config"}],"provenance":{"indexedAt":"2026-05-01T03:58:34.797Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine API 元数据目录

此目录（`api/`）存放了驱动 ArchSpine 镜像系统索引与分析层的核心元数据定义。它定义了源代码目录和文件的结构化元数据模式，包括索引来源、依赖关系图和架构规则执行。

## 主要子文件

- **`folder.json`** – 定义了 ArchSpine 镜像系统中源代码目录的结构化元数据和索引来源。该文件作为目录在镜像中如何表示的架构。
- **`handler.ts.json`** – 定义了单个源文件的语义元数据、依赖关系图和结构骨架。这是每个文件的元数据描述符，捕获了导入、导出和架构关系。

## 关键实现领域

- **索引来源** – 两个文件都记录了索引的时间和方式，包括使用的流水线阶段（AST 解析和 LLM 分析）。
- **依赖关系图** – `handler.ts.json` 文件专门捕获源文件的依赖关系图，支持架构分析。
- **结构骨架** – 元数据包含源代码的结构骨架，使镜像系统无需重新解析原始文件即可理解代码组织。
- **架构规则执行** – 元数据模式通过提供代码结构和依赖关系的标准化表示，支持架构规则的执行。