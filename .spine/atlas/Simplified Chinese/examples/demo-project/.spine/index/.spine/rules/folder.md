<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/index/.spine/rules","role":"Defines the architectural rules and directory structure for the ArchSpine mirror system's rule engine.","responsibility":"Collectively establishes the schema, metadata, and organizational framework for rule files within the .spine/rules directory, enabling rule indexing, drift detection, and configuration management.","children":[{"filePath":"examples/demo-project/.spine/index/.spine/rules/arch.yml.json","role":"Architecture rule definition for the ArchSpine mirror system","fileKind":"config"},{"filePath":"examples/demo-project/.spine/index/.spine/rules/folder.json","role":"Defines the directory structure and metadata for a rules folder within the ArchSpine project, serving as a container for configuration documents.","fileKind":"config"}],"provenance":{"indexedAt":"2026-05-01T03:58:34.692Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 规则目录

此目录（`examples/demo-project/.spine/index/.spine/rules`）定义了 ArchSpine 镜像系统规则引擎的架构规则和目录结构。它共同建立了 `.spine/rules` 目录内规则文件的模式、元数据和组织框架，支持规则索引、漂移检测和配置管理。

## 重要子文件

- **`arch.yml.json`** – ArchSpine 镜像系统的架构规则定义。该文件作为配置文档，定义了核心架构规则。
- **`folder.json`** – 定义 ArchSpine 项目内规则文件夹的目录结构和元数据，作为配置文档的容器。

## 关键实现领域

此目录中最关键的实现领域包括：
- **规则索引**：支持高效索引和查询规则的模式和元数据结构。
- **漂移检测**：用于检测与定义架构之间偏差的规则和配置。
- **配置管理**：管理规则文件及其关系的组织框架。