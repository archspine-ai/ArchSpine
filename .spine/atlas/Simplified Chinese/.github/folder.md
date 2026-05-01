<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":".github","role":"This directory contains GitHub community health files, issue templates, and CI/CD workflow definitions for the ArchSpine project.","responsibility":"Collectively, these components standardize community contributions through issue and pull request templates, and automate the continuous integration and delivery pipeline including linting, building, testing, documentation verification, and release readiness checks.","children":[{"filePath":".github/FUNDING.yml","role":"Placeholder for project funding configuration","fileKind":"document"},{"filePath":".github/ISSUE_TEMPLATE","role":"Issue and feature request templates for the ArchSpine project.","fileKind":"folder"},{"filePath":".github/pull_request_template.md","role":"Pull request template for the ArchSpine project","fileKind":"document"},{"filePath":".github/workflows","role":"CI/CD workflow definitions for the ArchSpine project.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T07:20:51.979Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `.github` – 社区与CI/CD中心

此目录是 ArchSpine 项目在 GitHub 上开源运营的枢纽。它集中管理所有面向社区的运行健康文件、贡献模板以及自动化流水线定义。

## 结构与关键组件

- **`FUNDING.yml`** – 项目未来资金配置的占位文件（例如 GitHub Sponsors 链接）。
- **`ISSUE_TEMPLATE/`** – 包含问题报告和功能请求模板的文件夹。这些模板规范了贡献者提交缺陷或新功能建议的方式，确保信息一致且可操作。
- **`pull_request_template.md`** – 拉取请求模板，引导贡献者完成 PR 流程，包括测试、文档和代码审查的检查清单。
- **`workflows/`** – 存放所有 CI/CD 工作流定义（YAML 文件）的文件夹。这些工作流自动执行代码检查、构建、测试、文档验证以及发布就绪检查。

## 实施重点

最关键的领域是 **工作流**（关乎自动化可靠性）和 **问题/PR 模板**（关乎贡献质量）。`FUNDING.yml` 目前为占位文件，将在配置资金来源后激活。