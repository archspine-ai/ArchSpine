<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":".spine","role":"Root configuration and rule directory for the ArchSpine project mirror system.","responsibility":"Centralizes project-wide configuration (LLM, MCP, hooks, scanning, artifacts) and architectural rulebooks that enforce layered module structure, import boundaries, naming conventions, and coding standards across the entire monorepo.","children":[{"filePath":".spine/config.json","role":"Central configuration file for the ArchSpine project mirror system, defining project metadata, LLM/MCP settings, hook behavior, artifact strategy, scan policy, and initialization state.","fileKind":"config"},{"filePath":".spine/rules","role":"This directory contains the architectural and coding standard rulebooks that govern the structure and conventions of the ArchSpine project.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:57.227Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
`.spine` 目录是 ArchSpine 项目镜像系统的根配置与规则目录。它集中管理全局的 LLM（大语言模型）、MCP（模型上下文协议）、钩子、扫描和工件策略等配置，以及定义项目的分层模块结构、导入边界、命名规范和编码标准的架构规则手册。

其中主要的子项包括：
- `config.json`：集中配置文件，定义项目元数据、LLM/MCP 设置、钩子行为、工件策略、扫描策略和初始化状态。
- `rules/`：包含项目架构和编码标准规则手册的目录，用于规范整个项目的结构与约定。

关键实施领域包括 LLM 与 MCP 配置管理、钩子行为、工件策略，以及通过 `rules/` 子模块中的规则手册强制执行的架构规则。