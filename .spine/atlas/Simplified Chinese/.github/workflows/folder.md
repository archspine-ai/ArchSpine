<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":".github/workflows","role":"CI/CD workflow definitions for the ArchSpine project.","responsibility":"Automates the continuous integration and delivery pipeline, including linting, building, testing across Node.js versions, research-level test suites, documentation verification, and release readiness checks.","children":[{"filePath":".github/workflows/ci.yml","role":"Defines the automated CI pipeline for the ArchSpine project","fileKind":"document"},{"filePath":".github/workflows/research.yml","role":"CI workflow definition for running research-level test suites","fileKind":"document"},{"filePath":".github/workflows/test.yml","role":"Defines the continuous integration (CI) pipeline for the ArchSpine project, automating verification, testing, documentation building, and release readiness checks.","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T07:20:45.763Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `.github/workflows` — CI/CD 工作流定义

此目录包含驱动 ArchSpine 项目持续集成与持续交付流水线的工作流定义。这些 YAML 文件自动化了开发生命周期的每个阶段，包括代码检查、构建、多版本 Node.js 测试、研究级测试套件、文档验证以及发布就绪检查。

目录围绕三个主要工作流组织：

- **`ci.yml`** — 主 CI 流水线，在每次推送和拉取请求时运行。它处理跨多个 Node.js 版本的代码检查、构建和核心测试套件执行。
- **`research.yml`** — 专门用于执行研究级测试套件的工作流，可能包含不属于标准 CI 的实验性或计算密集型测试。
- **`test.yml`** — 综合性流水线，自动化验证、测试、文档构建和发布就绪检查，确保项目始终处于可部署状态。

最关键的实施领域包括 `ci.yml` 中的多版本 Node.js 测试矩阵、`research.yml` 中研究测试的隔离，以及 `test.yml` 中的发布就绪验证。这些工作流共同保障了代码质量、文档准确性和部署可靠性。