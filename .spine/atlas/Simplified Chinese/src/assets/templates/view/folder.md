<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets/templates/view","role":"This directory contains analysis and documentation files that describe the public surface and risk profile of the ArchSpine project.","responsibility":"Collectively, these files provide a machine-readable and human-readable inventory of all CLI commands, MCP endpoints, and exported module interfaces, alongside a ranked risk analysis of the most critical files in the codebase to support maintenance and review prioritization.","children":[{"filePath":"src/assets/templates/view/public-surface.md","role":"Public API surface inventory and entry point registry","fileKind":"document"},{"filePath":"src/assets/templates/view/risk-hotspots.md","role":"Risk analysis report for the ArchSpine project","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:43.419Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 视图模板目录

`src/assets/templates/view` 目录存放了 ArchSpine 项目公共接口与风险分析相关的文档和清单。这些文件既可供人类阅读，也可被机器解析，用于理解系统的外部暴露面以及维护和审查中需要重点关注的部分。

该目录目前包含两个核心文档，互为补充：

- **public-surface.md** – 全面记录 ArchSpine 的公共 API 表面，包括所有 CLI 命令、MCP 端点以及导出的模块接口。它是任何使用或扩展 ArchSpine 的开发者的入口注册表。
- **risk-hotspots.md** – 一份按风险等级排序的分析报告，基于代码复杂度、耦合度、变更频率等因素，识别代码库中最关键的文件。该报告有助于确定代码审查和重构的优先次序。

在实现层面，最重要的部分是 CLI 命令定义和 MCP 服务器端点，因为它们是用户和外部代理与系统交互的主要途径。风险分析报告特别指出了高风险模块，例如核心编排引擎和 AST 处理器，这些模块在审查时需要格外注意。

该目录通过公开公共接口和风险概况，满足了项目对透明度和可维护性的需求，使开发者和自动化分析工具都能即时访问这些信息。