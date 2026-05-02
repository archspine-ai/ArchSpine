<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":".github/workflows","role":"CI/CD workflow definitions for the ArchSpine project.","responsibility":"Automates the continuous integration and delivery pipeline, including linting, building, testing across Node.js versions, research-level test suites, documentation verification, and release readiness checks.","children":[{"filePath":".github/workflows/ci.yml","role":"Defines the automated CI pipeline for the ArchSpine project","fileKind":"document"},{"filePath":".github/workflows/research.yml","role":"CI workflow definition for running research-level test suites","fileKind":"document"},{"filePath":".github/workflows/test.yml","role":"Defines the continuous integration (CI) pipeline for the ArchSpine project, automating verification, testing, documentation building, and release readiness checks.","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T07:20:45.763Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
## `.github/workflows`

该目录包含了 **ArchSpine 项目的 CI/CD 工作流定义**。  
其职责是自动化整个持续集成与交付流水线 —— 从代码检查、构建、多 Node.js 版本下的测试，到运行研究级测试套件、验证文档以及检查发布就绪状态。

目前目录内包含三个具体的工作流文件：

- **`ci.yml`** —— 主要的 CI 流水线，在推送和拉取请求时触发。它负责编排标准的验证步骤。
- **`research.yml`** —— 专门用于执行研究级测试套件的工作流，这些测试可能涉及更密集的计算或探索性测试。
- **`test.yml`** —— 尽管名称通用，但该工作流定义了项目的完整 CI 流水线，包括文档构建和发布就绪检查。它与 `ci.yml` 协同工作。

最重要的实现领域包括：确保一致的 Node.js 版本覆盖范围、将研究测试与核心单元测试分离，以及将文档准确性作为构建验证过程的一部分来维护。