<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":".spine/rules","role":"This directory contains the architectural and coding standard rulebooks that govern the structure and conventions of the ArchSpine project.","responsibility":"Collectively, these files define and enforce the layered module architecture, import boundaries, naming conventions, and coding standards for the entire ArchSpine monorepo, ensuring consistency and maintainability across all contributions.","children":[{"filePath":".spine/rules/layered-architecture.yml","role":"Architectural constraint rulebook for the ArchSpine project's layered module structure","fileKind":"document"},{"filePath":".spine/rules/naming-conventions.yml","role":"Defines naming conventions and coding standards for the ArchSpine monorepo codebase.","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:52.132Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `.spine/rules` — 架构与编码规范规则手册

该目录是 ArchSpine 项目的核心规则库，负责规定项目的分层模块架构、导入边界、命名规范及编码标准，确保整个单体仓库的一致性和可维护性。两个核心规则文件如下：

- **`layered-architecture.yml`** — 定义了严格的分层模块结构（例如领域层、应用层、基础设施层）以及相关约束，如依赖方向和包可见性。
- **`naming-conventions.yml`** — 规定文件、目录和符号的命名模式以及编码风格指南，确保代码库的统一性。

这些规则共同构成了项目架构的强制机制，所有新的模块、重构或贡献都必须遵守。管道阶段（`ast`、`llm`）表明规则既通过静态分析应用，也通过 AI 辅助验证来执行。