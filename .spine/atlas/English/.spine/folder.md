<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":".spine","role":"Root configuration and rule directory for the ArchSpine project mirror system.","responsibility":"Centralizes project-wide configuration (LLM, MCP, hooks, scanning, artifacts) and architectural rulebooks that enforce layered module structure, import boundaries, naming conventions, and coding standards across the entire monorepo.","children":[{"filePath":".spine/config.json","role":"Central configuration file for the ArchSpine project mirror system, defining project metadata, LLM/MCP settings, hook behavior, artifact strategy, scan policy, and initialization state.","fileKind":"config"},{"filePath":".spine/rules","role":"This directory contains the architectural and coding standard rulebooks that govern the structure and conventions of the ArchSpine project.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:57.227Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
---MARKDOWN:Simplified Chinese---
`.spine` 目录是 ArchSpine 项目镜像系统的根配置与规则仓库。它集中管理项目级配置，包括大语言模型 (LLM) 设置、主控程序 (MCP) 参数、钩子行为、扫描策略、工件策略以及初始化状态。此外，它还包含架构规则手册，用于在整个单体库中强制执行分层模块结构、导入边界、命名约定和编码标准。

值得注意的子项：
- `config.json`：中央配置文件，定义项目元数据、LLM/MCP 设置、钩子行为、工件策略、扫描策略和初始化状态。
- `rules/`：包含架构和编码标准规则手册的文件夹，用于管理项目的结构和约定。

最重要的实现领域是配置管理和规则执行系统，它们共同确保项目镜像的一致性以及架构指南的遵守。