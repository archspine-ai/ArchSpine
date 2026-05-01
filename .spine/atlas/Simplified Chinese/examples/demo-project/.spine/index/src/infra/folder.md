<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/index/src/infra","role":"Metadata and indexing layer for the ArchSpine mirror system's database infrastructure.","responsibility":"Provides structural metadata, content integrity tracking, and provenance records for database-related source files and directories within the ArchSpine mirror system.","children":[{"filePath":"examples/demo-project/.spine/index/src/infra/database.ts.json","role":"Metadata and structural index for a TypeScript database infrastructure source file","fileKind":"config"},{"filePath":"examples/demo-project/.spine/index/src/infra/folder.json","role":"Defines the structural metadata and indexing provenance for a source code directory within the ArchSpine mirror system.","fileKind":"config"}],"provenance":{"indexedAt":"2026-05-01T03:58:34.643Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# infra/ — 元数据与索引层

此目录存放 ArchSpine 镜像系统中数据库基础设施源文件的结构化元数据和内容完整性记录。它是 `.spine/index/src` 层级的一部分，为项目的源代码树提供机器可读的镜像。

## 主要子项

- **database.ts.json** — 一个配置类文件，索引了一个 TypeScript 数据库基础设施源文件。它包含该特定源文件的结构化元数据和溯源信息。
- **folder.json** — 一个配置类文件，定义了 `infra/` 目录本身的结构化元数据和索引溯源，记录了目录的索引时间和方式。

## 关键实现领域

- **元数据存储** — 两个子项都是 JSON 文件，存储结构化元数据（文件路径、角色、种类）和溯源记录（索引时间戳、生成器版本、流水线阶段）。
- **内容完整性追踪** — 每个文件中的溯源块记录了用于生成元数据的索引流水线阶段（`ast`、`llm`），实现了可追溯性。
- **溯源记录** — `folder.json` 文件专门跟踪目录级别的索引溯源，而 `database.ts.json` 跟踪文件级别的溯源。

## 具体子模块

- `database.ts.json` — 一个 TypeScript 数据库基础设施文件的元数据。
- `folder.json` — 目录级别的结构化元数据和溯源。