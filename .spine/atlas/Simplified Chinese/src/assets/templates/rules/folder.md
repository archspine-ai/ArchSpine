<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets/templates/rules","role":"This directory defines the architectural and coding standards for the ArchSpine project.","responsibility":"Collectively, these files establish the layered architecture model (CLI, services, core, tasks, engines, infra) with boundary and dependency constraints, and define naming conventions (interface prefixes, test file suffixes) with severity levels and rationale to ensure codebase consistency.","children":[{"filePath":"src/assets/templates/rules/layered-architecture.yml","role":"Architectural constraint specification for the ArchSpine project's layered architecture","fileKind":"document"},{"filePath":"src/assets/templates/rules/naming-conventions.yml","role":"Defines naming conventions and coding standards for the ArchSpine monorepo codebase.","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:43.185Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 规则目录

本目录（`src/assets/templates/rules`）定义了 ArchSpine 项目的架构与编码标准。目录中包含两份核心规范文件，共同确保项目的结构完整性和代码库一致性。

## 分层架构规范

`layered-architecture.yml` 文件定义了项目的分层架构模型，包含六个明确的层级：CLI、服务层、核心层、任务层、引擎层和基础设施层。该规范强制执行各层之间的边界与依赖约束，确保代码依赖关系沿正确方向流动，每个层级都保持其预期的职责。该架构模型防止循环依赖，并在整个代码库中强制执行关注点分离原则。

## 命名约定规范

`naming-conventions.yml` 文件建立了 ArchSpine 单体仓库的命名标准。它定义了接口前缀（如接口的 `I` 前缀）、测试文件后缀以及其他命名模式的约定。每条约定都包含严重级别和设计理由，为开发者提供清晰指导，并支持通过代码检查工具进行自动化强制执行。

## 关键实施领域

这些规则覆盖的最关键实施领域包括：
- **层级边界强制**：确保较高层级（CLI、服务层）的代码不直接依赖较低层级（基础设施层），而是通过适当的抽象层进行交互
- **依赖方向**：维护从外层到内层的正确依赖流向
- **接口命名**：对接口定义统一使用 `I` 前缀
- **测试文件组织**：使用适当的后缀对测试文件进行标准化命名
- **基于严重级别的强制执行**：清晰区分错误、警告和信息性规则