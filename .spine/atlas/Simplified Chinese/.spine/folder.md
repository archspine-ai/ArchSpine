<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":".spine","role":"Root configuration and rule directory for the ArchSpine project mirror system.","responsibility":"Centralizes project-wide configuration (LLM, MCP, hooks, scanning, artifacts) and architectural rulebooks that enforce layered module structure, import boundaries, naming conventions, and coding standards across the entire monorepo.","children":[{"filePath":".spine/config.json","role":"Central configuration file for the ArchSpine project mirror system, defining project metadata, LLM/MCP settings, hook behavior, artifact strategy, scan policy, and initialization state.","fileKind":"config"},{"filePath":".spine/rules","role":"This directory contains the architectural and coding standard rulebooks that govern the structure and conventions of the ArchSpine project.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:57.227Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `.spine` — 根配置与规则目录

`.spine` 目录是 ArchSpine 项目镜像系统的核心配置与规则中心。它集中管理所有项目级设置，包括 LLM 和 MCP 配置、钩子行为、工件策略、扫描策略以及初始化状态。此外，该目录还包含架构规则手册，用于在整个单体仓库中强制执行分层模块结构、导入边界、命名约定和编码标准。

## 重要子项

- **`config.json`** — ArchSpine 项目镜像系统的中央配置文件。它定义了项目元数据、LLM/MCP 设置、钩子行为、工件策略、扫描策略和初始化状态。这是自定义镜像系统行为的主要入口点。

- **`rules/`** — 包含架构和编码标准规则手册的目录，用于管理 ArchSpine 项目的结构和约定。这些规则在整个单体仓库中强制执行分层模块结构、导入边界、命名约定和编码标准。

## 关键实现领域

- **配置管理** — `config.json` 文件是所有系统设置的单一真实来源。对此文件的修改会影响 LLM 集成、MCP 行为、钩子执行、工件生成和扫描操作。

- **规则执行** — `rules/` 目录包含确保一致架构模式和编码标准的规则手册。这些规则对于维护分层模块结构和导入边界的完整性至关重要。

- **系统初始化** — 配置文件跟踪初始化状态，这对于了解当前设置和任何待处理的设置步骤至关重要。