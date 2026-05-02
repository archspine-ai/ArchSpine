<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets/templates/rules","role":"This directory defines the architectural and coding standards for the ArchSpine project.","responsibility":"Collectively, these files establish the layered architecture model (CLI, services, core, tasks, engines, infra) with boundary and dependency constraints, and define naming conventions (interface prefixes, test file suffixes) with severity levels and rationale to ensure codebase consistency.","children":[{"filePath":"src/assets/templates/rules/layered-architecture.yml","role":"Architectural constraint specification for the ArchSpine project's layered architecture","fileKind":"document"},{"filePath":"src/assets/templates/rules/naming-conventions.yml","role":"Defines naming conventions and coding standards for the ArchSpine monorepo codebase.","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:43.185Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
该目录定义了 ArchSpine 项目的架构与编码标准。两个文件共同确立了分层架构模型（CLI、services、core、tasks、engines、infra）及其边界与依赖约束，并规定了命名惯例（接口前缀、测试文件后缀）及其严重等级和制定理由。  

**核心子文件** 分为两个 YAML 约束文件：  
- `layered-architecture.yml` – 指定整个项目的分层架构边界与依赖规则。  
- `naming-conventions.yml` – 定义单体仓库代码库的命名与编码标准。  

最重要的实施领域包括：强制层隔离、防止循环依赖，以及确保所有模块的命名一致性。受影响的具体子模块涵盖 CLI、services、core、tasks、engines 以及基础设施等各层。