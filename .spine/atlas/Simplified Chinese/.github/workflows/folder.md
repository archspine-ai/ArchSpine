<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":".github/workflows","role":"CI/CD workflow definitions for the ArchSpine project.","responsibility":"Automates the continuous integration and delivery pipeline, including linting, building, testing across Node.js versions, research-level test suites, documentation verification, and release readiness checks.","children":[{"filePath":".github/workflows/ci.yml","role":"Defines the automated CI pipeline for the ArchSpine project","fileKind":"document"},{"filePath":".github/workflows/research.yml","role":"CI workflow definition for running research-level test suites","fileKind":"document"},{"filePath":".github/workflows/test.yml","role":"Defines the continuous integration (CI) pipeline for the ArchSpine project, automating verification, testing, documentation building, and release readiness checks.","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T07:20:45.763Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
`.github/workflows` 目录包含了 ArchSpine 项目的完整 CI/CD 流水线定义。它自动化了持续集成和交付流程，涵盖代码质量检查、多版本 Node.js 构建、单元与集成测试、研究级测试套件、文档验证以及发布就绪性检查。该目录包含三个工作流文件：

- **`ci.yml`** – 核心 CI 流水线，负责代码检查、构建和基础测试。
- **`research.yml`** – 专门运行研究级测试套件的工作流。
- **`test.yml`** – 综合流水线，用于验证、测试、文档构建及发布就绪性检查。

这些工作流共同确保项目在开发过程中保持稳定，并为发布做好准备。