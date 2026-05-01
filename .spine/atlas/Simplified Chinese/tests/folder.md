<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"tests","role":"Test suite directory for the ArchSpine system, containing unit, integration, and end-to-end tests for all core components.","responsibility":"Provides comprehensive test coverage for ArchSpine's CLI, configuration, credential management, database operations, LLM integration, synchronization, scanning, repair, view rendering, and infrastructure modules, ensuring system reliability and correctness through isolated test environments.","children":[{"filePath":"tests/agent-host-init.test.ts","role":"Vitest unit test suite for the ArchSpine repository bootstrap and managed file synchronization system.","fileKind":"source"},{"filePath":"tests/aggregation-resume.test.ts","role":"Vitest test suite for verifying the Aggregator engine's resume functionality and directory aggregation needs.","fileKind":"source"},{"filePath":"tests/arch-diagram-renderer.test.ts","role":"Vitest unit test suite for the ArchitectureDiagramRenderer component.","fileKind":"source"},{"filePath":"tests/build-script.test.ts","role":"Unit test suite for the build script's dist packaging filter function.","fileKind":"source"},{"filePath":"tests/cli.test.ts","role":"Vitest end-to-end integration test suite for ArchSpine's CLI command workflow and service orchestration, validating real command-line behavior and engine interactions.","fileKind":"source"},{"filePath":"tests/config-validation.test.ts","role":"Vitest unit test suite validating the configuration loading, language settings, hook synchronization mode, and warning emissions for the ArchSpine config system.","fileKind":"source"},{"filePath":"tests/config.test.ts","role":"Vitest unit test suite for the Config infrastructure class, validating configuration persistence and LLM provider/model settings.","fileKind":"source"},{"filePath":"tests/context-engine.test.ts","role":"Vitest unit test suite for validating the ContextEngine's lightweight relevance sorting algorithm and dependency resolution.","fileKind":"source"},{"filePath":"tests/credentials-backend.test.ts","role":"Vitest test suite for the Windows DPAPI credential backend, validating secure secret storage behavior.","fileKind":"source"},{"filePath":"tests/credentials-store.test.ts","role":"Vitest test suite for the CredentialStore component, verifying backend integration and fallback file safety.","fileKind":"source"},{"filePath":"tests/db-modules.test.ts","role":"Vitest integration test suite for validating the runtime database schema initialization and batch commit operations.","fileKind":"source"},{"filePath":"tests/demo-governance.test.ts","role":"Vitest acceptance test suite for validating the end-to-end demo governance workflow of the ArchSpine system.","fileKind":"source"},{"filePath":"tests/document-languages.test.ts","role":"Vitest unit test suite for validating the document language selection and ordering logic.","fileKind":"source"},{"filePath":"tests/engines","role":"This directory contains the test suite for the Scanner engine.","fileKind":"folder"},{"filePath":"tests/error-system.test.ts","role":"Vitest integration test suite validating error handling consistency and convergence across ArchSpine's service and infrastructure facade modules.","fileKind":"source"},{"filePath":"tests/execution-checkpoint.test.ts","role":"Vitest test suite for validating execution checkpoint resume candidate derivation logic during sync and check operations.","fileKind":"source"},{"filePath":"tests/footprint.test.ts","role":"Vitest test specification for footprint stability invariants","fileKind":"source"},{"filePath":"tests/god-mode.test.ts","role":"Vitest integration test suite for the God mode dossier feature in ArchSpine.","fileKind":"source"},{"filePath":"tests/help-boundary-contract.test.ts","role":"Vitest unit test suite for CLI help command boundary contracts.","fileKind":"source"},{"filePath":"tests/helpers","role":"Contains the lock worker script for testing the distributed lock mechanism.","fileKind":"folder"},{"filePath":"tests/index-reader.test.ts","role":"Vitest test suite for validating index reader schema enforcement and compatibility behavior.","fileKind":"source"},{"filePath":"tests/infra","role":"This directory contains test suites for validating index-based recovery and LLM retry mechanisms.","fileKind":"folder"},{"filePath":"tests/infra-facade-boundary.test.ts","role":"Vitest test infrastructure utility for validating architectural boundary rules through import analysis.","fileKind":"source"},{"filePath":"tests/init-cli.test.ts","role":"Vitest test utility module for CLI initialization integration tests.","fileKind":"source"},{"filePath":"tests/integrity.test.ts","role":"Vitest test suite for SpineDB batch commit operations and transaction integrity.","fileKind":"source"},{"filePath":"tests/llm-command-ui.test.ts","role":"Vitest unit test suite for validating the LLM command's user interface and configuration surface.","fileKind":"source"},{"filePath":"tests/llm-config.test.ts","role":"Vitest integration test suite for credential backend availability and LLM configuration resolution.","fileKind":"source"},{"filePath":"tests/llm-provider-utils.test.ts","role":"Vitest unit test suite for LLM provider utility functions (parsing and context building).","fileKind":"source"},{"filePath":"tests/llm.test.ts","role":"Vitest unit test suite validating the structural integrity and public API surface of the LLM Facade infrastructure module.","fileKind":"source"},{"filePath":"tests/manifest.test.ts","role":"Vitest unit test suite for the Manifest infrastructure component, isolating database interactions via mocked SpineDB.","fileKind":"source"},{"filePath":"tests/mcp-context-mode.test.ts","role":"Vitest integration test suite for MCP context modes, validating resource and tool access control under different initialization states.","fileKind":"source"},{"filePath":"tests/output-manager.test.ts","role":"Unit test suite for the OutputManager class, specifically testing the pruneAtlasLocales method.","fileKind":"source"},{"filePath":"tests/post-commit-derivation.test.ts","role":"Vitest integration test suite for the PostCommitDerivationTask orchestration pipeline.","fileKind":"source"},{"filePath":"tests/pre-commit-config.test.ts","role":"Vitest unit test suite for validating ArchSpine's pre-commit hook configuration and resolution logic.","fileKind":"source"},{"filePath":"tests/prompt-context-modules.test.ts","role":"Vitest test suite for validating prompt-context infrastructure modules (budget calculation and dependency diagnostics).","fileKind":"source"},{"filePath":"tests/prompt-engine.test.ts","role":"Vitest benchmark test suite for evaluating prompt engine performance and scaling characteristics under large inputs.","fileKind":"source"},{"filePath":"tests/publish-command.test.ts","role":"Vitest test suite for the publish workflow command (runPublishWorkflow).","fileKind":"source"},{"filePath":"tests/publish-preflight.test.ts","role":"Vitest integration test suite for the publish-preflight service, validating runtime assertions and lock serialization in isolated project environments.","fileKind":"source"},{"filePath":"tests/renderer.test.ts","role":"Vitest unit test suite for the DocumentationRenderer component in the ArchSpine infrastructure layer.","fileKind":"source"},{"filePath":"tests/repair-forced-processing.test.ts","role":"Vitest test suite validating forced processing behavior of ArchSpine tasks under repair policy conditions.","fileKind":"source"},{"filePath":"tests/repair-policy.test.ts","role":"Vitest unit test suite for the repair policy evaluation logic.","fileKind":"source"},{"filePath":"tests/repo-strategy.test.ts","role":"Vitest test suite validating repository strategy configuration and drift detection.","fileKind":"source"},{"filePath":"tests/resume-services.test.ts","role":"Vitest unit test suite for validating resume-aware aggregation service behavior in the ArchSpine system.","fileKind":"source"},{"filePath":"tests/robustness.test.ts","role":"Vitest test suite for validating cross-process lock acquisition and release behaviors using an isolated worker script.","fileKind":"source"},{"filePath":"tests/rules-loader.test.ts","role":"Vitest unit test suite validating the rule loading subsystem.","fileKind":"source"},{"filePath":"tests/runtime-compat-matrix.test.ts","role":"Vitest test suite for validating the runtime compatibility matrix and configuration schema version resolution in the ArchSpine system.","fileKind":"source"},{"filePath":"tests/runtime-service.test.ts","role":"Vitest unit test suite for RuntimeService, validating LLM configuration resolution, secret injection, and runtime override behavior.","fileKind":"source"},{"filePath":"tests/runtime-session.test.ts","role":"Vitest unit test for the runtime session helper's error handling, checkpoint management, and lock cleanup.","fileKind":"source"},{"filePath":"tests/scan-policy.test.ts","role":"Vitest integration test suite for validating the ScanPolicy module's behavior with temporary file structures and configuration schema.","fileKind":"source"},{"filePath":"tests/scanner.test.ts","role":"Vitest test suite for the Scanner engine, validating file scanning behavior in isolated temporary directories.","fileKind":"source"},{"filePath":"tests/schema-compliance.test.ts","role":"Vitest integration test suite for ArchSpine's JSON schema validation and synchronization service orchestration.","fileKind":"source"},{"filePath":"tests/semantic-drift.test.ts","role":"Vitest integration test suite for semantic drift detection and LLM client behavior in the ArchSpine sync system.","fileKind":"source"},{"filePath":"tests/spine-gate.test.ts","role":"Vitest unit test suite for the spine-gate module's protected output mutation detection.","fileKind":"source"},{"filePath":"tests/sync-cli-built.test.ts","role":"Vitest integration test for the ArchSpine CLI sync command using the built executable.","fileKind":"source"},{"filePath":"tests/sync-command.test.ts","role":"Vitest test suite validating the sync command's repair mode behavior and runtime service interactions.","fileKind":"source"},{"filePath":"tests/syntax.test.ts","role":"Vitest unit test suite validating the FixTask's TypeScript syntax validation guardrail.","fileKind":"source"},{"filePath":"tests/task-runtime.test.ts","role":"Vitest unit test suite for ArchSpine's core task state management, runtime cache, and telemetry statistics.","fileKind":"source"},{"filePath":"tests/task-state-guard.test.ts","role":"Vitest unit test suite validating the task-state module and TypeScript file collection utilities.","fileKind":"source"},{"filePath":"tests/validate-protocol-assets.mjs","role":"Validation script for ArchSpine protocol schema conformance","fileKind":"document"},{"filePath":"tests/validate-task.test.ts","role":"Vitest unit test suite for the ValidationTask class, validating its file selection and summary generation logic.","fileKind":"source"},{"filePath":"tests/view-command.test.ts","role":"Vitest unit test suite for the view command CLI functionality.","fileKind":"source"},{"filePath":"tests/view-module-boundary.test.ts","role":"Vitest unit test enforcing architectural module boundaries for the view service layer.","fileKind":"source"},{"filePath":"tests/view-renderer.test.ts","role":"Vitest unit test suite for the ViewRenderer service's deterministic rendering of architectural view artifacts for risk-hotspots and public-surface.","fileKind":"source"},{"filePath":"tests/view-runtime.test.ts","role":"Vitest integration test suite for experimental view layer configuration resolution.","fileKind":"source"},{"filePath":"tests/view-service.test.ts","role":"Vitest integration test suite for the ViewService module, validating its behavior with mocked LLM clients and file system fixtures.","fileKind":"source"},{"filePath":"tests/writer-boundary.test.ts","role":"Vitest integration test suite for the SpineWriterBoundary component's write protection and file system interaction.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:58.016Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 测试套件目录

`tests/` 目录是 ArchSpine 系统的质量保障核心，包含超过 60 个测试文件，覆盖所有核心组件。该套件分为三个主要测试层次：**单元测试**用于独立模块验证，**集成测试**用于验证组件交互，**端到端测试**通过 CLI 执行完整工作流。

## 关键测试领域

### CLI 与命令工作流
- **`cli.test.ts`** – 验证真实命令行行为和服务编排的端到端集成测试。
- **`sync-command.test.ts`** 和 **`sync-cli-built.test.ts`** – 测试同步命令的修复模式和可执行文件行为。
- **`publish-command.test.ts`** 和 **`publish-preflight.test.ts`** – 验证发布工作流和带有锁序列化的预检服务。
- **`view-command.test.ts`** 和 **`view-service.test.ts`** – 测试视图渲染和服务层行为。
- **`init-cli.test.ts`** – CLI 初始化集成测试工具。

### 配置与凭据
- **`config.test.ts`** 和 **`config-validation.test.ts`** – 验证配置持久化、语言设置和钩子同步。
- **`credentials-store.test.ts`** 和 **`credentials-backend.test.ts`** – 测试使用 Windows DPAPI 后端的安全秘密存储和回退安全机制。
- **`pre-commit-config.test.ts`** – 验证预提交钩子配置解析。

### 数据库与存储
- **`db-modules.test.ts`** – 运行时数据库模式初始化和批量提交的集成测试。
- **`integrity.test.ts`** – 测试 SpineDB 批量提交操作和事务完整性。
- **`index-reader.test.ts`** – 验证索引读取器模式强制和兼容性。

### LLM 集成
- **`llm.test.ts`** – 验证 LLM Facade 基础设施模块的公共 API 表面。
- **`llm-config.test.ts`** – 测试凭据后端可用性和 LLM 配置解析。
- **`llm-provider-utils.test.ts`** – 测试提供者工具函数（解析和上下文构建）。
- **`llm-command-ui.test.ts`** – 验证 LLM 命令的用户界面和配置表面。
- **`prompt-engine.test.ts`** – 大型输入下提示引擎性能的基准测试。
- **`prompt-context-modules.test.ts`** – 测试预算计算和依赖诊断。

### 同步与扫描
- **`scanner.test.ts`** 和 **`engines/`** – 使用隔离临时目录测试扫描器引擎。
- **`scan-policy.test.ts`** – 验证扫描策略在临时文件结构下的行为。
- **`semantic-drift.test.ts`** – 同步系统中语义漂移检测的集成测试。
- **`schema-compliance.test.ts`** – 测试 JSON 模式验证和同步服务编排。

### 修复与恢复
- **`repair-policy.test.ts`** 和 **`repair-forced-processing.test.ts`** – 验证修复策略评估和强制处理行为。
- **`execution-checkpoint.test.ts`** – 测试同步和检查操作期间的检查点恢复候选推导。
- **`resume-services.test.ts`** – 验证支持恢复的聚合服务行为。
- **`aggregation-resume.test.ts`** – 测试聚合器引擎的恢复功能。

### 视图与渲染
- **`view-renderer.test.ts`** – 测试风险热点和公共表面架构视图工件的确定性渲染。
- **`view-module-boundary.test.ts`** – 强制视图服务层的架构模块边界。
- **`view-runtime.test.ts`** – 实验性视图层配置解析的集成测试。
- **`arch-diagram-renderer.test.ts`** 和 **`renderer.test.ts`** – 测试架构图和文档渲染器。

### 基础设施与边界
- **`infra-facade-boundary.test.ts`** – 通过导入分析验证架构边界规则。
- **`writer-boundary.test.ts`** – 测试 SpineWriterBoundary 的写保护和文件系统交互。
- **`spine-gate.test.ts`** – 测试受保护输出变异检测。
- **`error-system.test.ts`** – 验证服务和基础设施外观模块的错误处理一致性。

### 任务管理与运行时
- **`task-runtime.test.ts`** – 测试核心任务状态管理、运行时缓存和遥测统计。
- **`task-state-guard.test.ts`** – 验证任务状态模块和 TypeScript 文件收集工具。
- **`validate-task.test.ts`** – 测试 ValidationTask 类的文件选择和摘要生成。
- **`runtime-service.test.ts`** 和 **`runtime-session.test.ts`** – 测试 LLM 配置解析、秘密注入和检查点管理。

### 专项测试
- **`mcp-context-mode.test.ts`** – MCP 上下文模式的集成测试，包含资源和工具访问控制。
- **`god-mode.test.ts`** – 测试上帝模式档案功能。
- **`demo-governance.test.ts`** – 端到端演示治理工作流的验收测试。
- **`robustness.test.ts`** – 使用隔离工作脚本测试跨进程锁获取和释放。
- **`footprint.test.ts`** – 验证足迹稳定性不变量。
- **`syntax.test.ts`** – 测试 FixTask 的 TypeScript 语法验证护栏。
- **`document-languages.test.ts`** – 验证文档语言选择和排序逻辑。
- **`repo-strategy.test.ts`** – 测试仓库策略配置和漂移检测。
- **`rules-loader.test.ts`** – 验证规则加载子系统。
- **`runtime-compat-matrix.test.ts`** – 测试运行时兼容性矩阵和配置模式版本解析。
- **`agent-host-init.test.ts`** – 测试仓库引导和托管文件同步。
- **`build-script.test.ts`** – 测试分发打包过滤函数。
- **`output-manager.test.ts`** – 测试 pruneAtlasLocales 方法。
- **`manifest.test.ts`** – 使用模拟 SpineDB 测试 Manifest 基础设施。
- **`help-boundary-contract.test.ts`** – 测试 CLI 帮助命令边界契约。
- **`post-commit-derivation.test.ts`** – 测试 PostCommitDerivationTask 编排管道。
- **`context-engine.test.ts`** – 验证 ContextEngine 的相关性排序和依赖解析。

## 支持文件夹

- **`helpers/`** – 包含用于测试分布式锁机制的工作脚本。
- **`infra/`** – 包含基于索引的恢复和 LLM 重试机制的测试套件。
- **`engines/`** – 包含扫描器引擎测试套件。
- **`validate-protocol-assets.mjs`** – 协议模式合规性验证脚本。

## 测试基础设施

所有测试均使用 **Vitest** 作为测试运行器和框架编写。该套件利用隔离的临时目录、模拟依赖项（特别是 LLM 客户端和数据库交互）以及用于跨进程测试场景的工作脚本。测试的组织方式与项目的模块结构相对应，确保每个组件在适当的集成级别都有相应的测试覆盖。