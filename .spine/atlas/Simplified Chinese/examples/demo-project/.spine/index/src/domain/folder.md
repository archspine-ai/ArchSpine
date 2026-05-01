<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/index/src/domain","role":"This directory aggregates metadata and indexing records for a domain source folder within the ArchSpine mirror system.","responsibility":"Collectively, the components in this directory define the structural metadata, file indexing provenance, and semantic entry for a TypeScript source file, ensuring content integrity, dependency tracking, and pipeline stage logging.","children":[{"filePath":"examples/demo-project/.spine/index/src/domain/folder.json","role":"Defines the structural metadata and indexing provenance for a domain source folder within the ArchSpine mirror system.","fileKind":"config"},{"filePath":"examples/demo-project/.spine/index/src/domain/user-service.ts.json","role":"File metadata and semantic index entry for a TypeScript source file","fileKind":"config"}],"provenance":{"indexedAt":"2026-05-01T03:58:35.021Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# 领域索引目录

此目录（`domain`）是 ArchSpine 镜像系统索引层的一部分，用于存储项目源码中领域文件夹的元数据和索引记录。

## 目录内容

该目录包含两个关键的配置文件：

- **`folder.json`** – 定义领域源文件夹的结构元数据和索引来源信息。该文件记录了文件夹的索引时间、生成器版本以及所经过的处理流水线阶段。
- **`user-service.ts.json`** – 针对 TypeScript 源文件（`user-service.ts`）的文件元数据和语义索引条目。该 JSON 记录捕获了文件的功能角色、依赖关系以及内容完整性信息。

## 关键实现领域

该目录最重要的方面包括：

- **结构元数据** – `folder.json` 提供了文件夹级别的索引记录，为其中的所有文件建立了上下文基础。
- **文件索引** – `user-service.ts.json` 展示了如何追踪单个源文件，包括其语义角色和来源信息。
- **流水线集成** – 来源数据表明索引过程经历了两个流水线阶段：AST 解析和 LLM 分析，确保了对代码结构和语义的双重理解。

## 来源信息

索引操作于 2026 年 5 月 1 日执行，使用 ArchSpine 1.0.0 版本，并应用了 AST 和 LLM 两个流水线阶段。