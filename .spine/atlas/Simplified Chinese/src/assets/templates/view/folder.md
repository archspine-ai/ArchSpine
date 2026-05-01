<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets/templates/view","role":"This directory contains analysis and documentation files that describe the public surface and risk profile of the ArchSpine project.","responsibility":"Collectively, these files provide a machine-readable and human-readable inventory of all CLI commands, MCP endpoints, and exported module interfaces, alongside a ranked risk analysis of the most critical files in the codebase to support maintenance and review prioritization.","children":[{"filePath":"src/assets/templates/view/public-surface.md","role":"Public API surface inventory and entry point registry","fileKind":"document"},{"filePath":"src/assets/templates/view/risk-hotspots.md","role":"Risk analysis report for the ArchSpine project","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:43.419Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine – 视图模板目录

本目录包含定义 ArchSpine 项目公共接口与风险概况的分析和文档文件。它既可作为人类可读的参考手册，也可作为机器可读的清单，供维护者和审查者使用。

## 内容

- **public-surface.md** – 全面收录所有 CLI 命令、MCP 端点以及导出的模块接口。该文件作为项目公共 API 的官方入口注册表。
- **risk-hotspots.md** – 一份按优先级排序的风险分析报告，识别代码库中最关键的文件，帮助团队确定维护和审查工作的优先级。

## 关键实现领域

- **CLI 与 MCP 接口** – public-surface 文档记录了每一个命令和端点，便于审计项目的外部契约。
- **风险优先级排序** – risk-hotspots 报告采用排序方法，突出显示维护或安全风险最高的文件，从而实现聚焦的代码审查。
- **双格式实用工具** – 两份文档均设计为可供人类（通过 Markdown）和 AI 代理（通过 JSON）使用，确保无缝集成到自动化流水线中。

## 重要子模块

- `public-surface.md` – 所有公共接口的入口注册表。
- `risk-hotspots.md` – 包含按优先级排序的文件风险分析报告。