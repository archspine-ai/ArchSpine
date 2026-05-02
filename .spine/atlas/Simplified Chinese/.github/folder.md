<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":".github","role":"This directory contains GitHub community health files, issue templates, and CI/CD workflow definitions for the ArchSpine project.","responsibility":"Collectively, these components standardize community contributions through issue and pull request templates, and automate the continuous integration and delivery pipeline including linting, building, testing, documentation verification, and release readiness checks.","children":[{"filePath":".github/FUNDING.yml","role":"Placeholder for project funding configuration","fileKind":"document"},{"filePath":".github/ISSUE_TEMPLATE","role":"Issue and feature request templates for the ArchSpine project.","fileKind":"folder"},{"filePath":".github/pull_request_template.md","role":"Pull request template for the ArchSpine project","fileKind":"document"},{"filePath":".github/workflows","role":"CI/CD workflow definitions for the ArchSpine project.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T07:20:51.979Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# .github 目录摘要

该目录包含 ArchSpine 项目的社区健康文件以及自动化工作流定义。其主要目标是标准化社区贡献，并自动化开发流水线。

## 重要子项

- **ISSUE_TEMPLATE/** — 存放问题和功能请求模板的文件夹。这些模板引导贡献者提供结构化的报告，有助于问题分类和功能讨论。
- **pull_request_template.md** — 拉取请求模板，确保所有拉取请求包含必要的背景和检查项，简化代码审查流程。
- **workflows/** — 包含 CI/CD 工作流定义的文件夹（例如：代码检查、构建、测试、文档验证、发布就绪检查）。这些工作流自动化了质量门控和部署准备工作。
- **FUNDING.yml** — 用于配置项目资金链接（例如 GitHub Sponsors、Open Collective）的占位文件。

## 重点关注领域

最关键的区域是 CI/CD 工作流（用于自动化测试和部署）以及问题/拉取请求模板（用于一致的贡献者体验）。工作流子模块定义了实际的自动化流水线，而模板则强制执行贡献标准。

需要检查的关键子模块：
- `.github/workflows/` — 包含软件生命周期的所有操作定义。
- `.github/ISSUE_TEMPLATE/` — 包含针对错误、功能及其他请求类型的单个模板文件（`.yml` 或 `.md`）。

该目录确保 ArchSpine 通过社区指导方针和自动化检查保持高质量。