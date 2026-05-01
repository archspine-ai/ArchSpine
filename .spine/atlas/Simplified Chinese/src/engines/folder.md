<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/engines","role":"Core engine and CLI command modules for scanning, aggregating, analyzing, and reporting on architectural data within the ArchSpine mirror system.","responsibility":"Provides the foundational scanning engine, aggregation logic, architectural rule enforcement, context resolution, fix generation, and CLI reporting commands that collectively discover, validate, and document the codebase architecture.","children":[{"filePath":"src/engines/aggregator.ts","role":"Core engine class for traversing the spine filesystem and aggregating index and atlas data into structured SpineUnit collections for downstream sync and view operations.","fileKind":"source"},{"filePath":"src/engines/check.ts","role":"Public API barrel module for the check subsystem, re-exporting core service and CLI runner.","fileKind":"source"},{"filePath":"src/engines/context-path-resolver.ts","role":"Path resolution utility for the scanning engine, specializing in resolving relative import targets within a source tree.","fileKind":"source"},{"filePath":"src/engines/context-relevance.ts","role":"Engine utility function for extracting and filtering keywords from architectural rule text.","fileKind":"source"},{"filePath":"src/engines/context.ts","role":"Architectural context resolution engine for dependency analysis and relevance scoring in the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/engines/fix-prompt.ts","role":"LLM prompt template generator for architectural violation fixes.","fileKind":"source"},{"filePath":"src/engines/fix.ts","role":"Public API facade barrel file for the fix service module.","fileKind":"source"},{"filePath":"src/engines/god.ts","role":"CLI command orchestrator for generating a comprehensive architectural dossier (God Mode report) from the .spine/index directory.","fileKind":"source"},{"filePath":"src/engines/info.ts","role":"CLI command module for checking project sync status, validating protected outputs, and reporting system health.","fileKind":"source"},{"filePath":"src/engines/rules.ts","role":"Core rule engine for loading, storing, and matching architectural rules against file paths within the ArchSpine system.","fileKind":"source"},{"filePath":"src/engines/scanner-git.ts","role":"Reusable engine utility providing a git command execution client for scanner modules.","fileKind":"source"},{"filePath":"src/engines/scanner-utils.ts","role":"Scanner engine utility module providing path and pattern normalization for file scanning operations.","fileKind":"source"},{"filePath":"src/engines/scanner.ts","role":"Core file system scanner engine that discovers, filters, and reports on repository files using layered ignore rules, git diff integration, and configurable scan policies.","fileKind":"source"},{"filePath":"src/engines/usage.ts","role":"ArchSpine CLI utility function generating formatted usage and audit reports from the manifest database.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T07:20:46.509Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/engines` — 核心引擎与 CLI 命令模块

此目录包含 ArchSpine 镜像系统的运行核心，集成了所有扫描、聚合、分析、规则执行、上下文解析、修复生成以及 CLI 报告逻辑。这些模块共同负责发现、验证和记录代码库的架构。

## 主要子模块

- **扫描子系统**（`scanner.ts`、`scanner-utils.ts`、`scanner-git.ts`）：核心文件系统扫描器，通过分层忽略规则、git diff 集成和可配置的扫描策略来发现和过滤仓库文件。`scanner-git.ts` 提供可复用的 git 命令执行客户端，`scanner-utils.ts` 提供路径和模式归一化工具。

- **聚合器**（`aggregator.ts`）：核心引擎类，遍历 spine 文件系统并将索引和地图数据聚合为结构化的 `SpineUnit` 集合，供下游同步和视图操作使用。

- **规则引擎**（`rules.ts`）：负责加载、存储和匹配架构规则与文件路径，是架构合规性的执行支柱。

- **上下文解析**（`context.ts`、`context-path-resolver.ts`、`context-relevance.ts`）：提供架构上下文解析，用于依赖分析和相关性评分。`context-path-resolver.ts` 专门解析源码树中的相对导入目标，`context-relevance.ts` 从架构规则文本中提取和过滤关键词。

- **修复生成**（`fix.ts`、`fix-prompt.ts`）：修复服务模块的公共 API 外观，`fix-prompt.ts` 提供用于架构违规修复的 LLM 提示模板生成器。

- **CLI 命令**（`god.ts`、`info.ts`、`usage.ts`）：CLI 编排器，用于生成全面的架构档案（上帝模式报告）、检查项目同步状态和系统健康度，以及从清单数据库生成格式化的使用/审计报告。

## 关键实现领域

- **扫描与发现**：扫描子系统是所有文件发现的入口，使用分层忽略规则和 git 集成。
- **聚合与结构化**：聚合器将原始索引/地图数据转换为结构化集合。
- **规则执行**：规则引擎将架构规则与文件路径进行匹配。
- **上下文与相关性**：上下文解析引擎提供依赖分析和相关性评分。
- **修复生成**：基于 LLM 的修复提示生成，用于架构违规。
- **CLI 报告**：上帝模式报告、系统健康检查和用法审计。