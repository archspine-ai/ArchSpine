<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets/templates/view","role":"This directory contains analysis and documentation files that describe the public surface and risk profile of the ArchSpine project.","responsibility":"Collectively, these files provide a machine-readable and human-readable inventory of all CLI commands, MCP endpoints, and exported module interfaces, alongside a ranked risk analysis of the most critical files in the codebase to support maintenance and review prioritization.","children":[{"filePath":"src/assets/templates/view/public-surface.md","role":"Public API surface inventory and entry point registry","fileKind":"document"},{"filePath":"src/assets/templates/view/risk-hotspots.md","role":"Risk analysis report for the ArchSpine project","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:43.419Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
`src/assets/templates/view` 目录是 ArchSpine 项目的公共接口与风险概况的文档中心。该目录包含两份关键文档，共同构成全面的清单与评估：`public-surface.md` 和 `risk-hotspots.md`。

- **`public-surface.md`** 是所有导出的 CLI 命令、MCP 端点以及模块接口的权威注册表，是理解项目 API 表面的机器可读与人类可读的入口点。
- **`risk-hotspots.md`** 是一份按风险等级排序的分析报告，突出代码库中最关键的文件，以支持维护和审查优先级的确定。

这两个文件是该目录仅有的子项，按照互补的职能分组：一个定义暴露的内容，另一个评估存在的风险。最重要的实现领域包括面向公共的命令行界面、MCP 协议层、导出的模块边界以及文件级风险评分方法。

具体引用的子模块包括 CLI 子命令、MCP 路由处理器和模块导出语句，所有这些都在这两个文件中进行了编目和评估。