## 测试套件摘要

`tests/` 目录包含了 ArchSpine 镜像系统的完整测试套件，覆盖了各个测试层次：单元测试、集成测试、端到端测试和验收测试。其主要职责是通过对 CLI 命令、配置、LLM 集成、数据库操作、安全性、错误处理及核心工作流的全面测试，验证 ArchSpine 系统的正确性、可靠性和架构完整性。

### 主要子项与分组

测试套件按逻辑分组组织如下：

- **CLI 与工作流测试** – 位于顶层，文件包括 `cli.test.ts`、`init-cli.test.ts`、`sync-command.test.ts`、`view-command.test.ts`、`publish-command.test.ts` 等。这些测试验证命令行执行、参数解析、退出码以及核心工作流（同步、检查、修复、发布、视图）的编排。

- **配置与 LLM 测试** – 文件如 `config.test.ts`、`config-validation.test.ts`、`llm-config.test.ts`、`llm.test.ts`、`llm-provider-utils.test.ts`、`llm-command-ui.test.ts` 等，验证配置持久化、语言设置、钩子同步模式、LLM 客户端解析、密钥注入及提供者工具函数。

- **数据库与索引测试** – `db-modules.test.ts`、`integrity.test.ts`、`index-reader.test.ts`、`manifest.test.ts` 验证数据库模式初始化、批量提交、事务完整性、索引文件模式强制及清单行为。

- **安全与错误处理测试** – `security.test.ts`、`error-system.test.ts`、`credentials-backend.test.ts`、`credentials-store.test.ts`、`help-boundary-contract.test.ts`、`schema-compliance.test.ts` 覆盖凭据存储、错误传播、锁序列化、模式验证及安全敏感的提示流行为。

- **引擎与核心逻辑测试** – `scanner.test.ts`、`scan-policy.test.ts`、`context-engine.test.ts`、`prompt-engine.test.ts`、`post-commit-derivation.test.ts`、`runtime-service.test.ts`、`runtime-session.test.ts`、`task-runtime.test.ts`、`task-state-guard.test.ts`、`validate-task.test.ts` 等测试文件扫描、依赖解析、提示预算计算、任务编排、运行时配置及状态管理。

- **子目录** – `tests/e2e/` 包含在隔离环境中对 CLI 命令的端到端集成测试。`tests/engines/` 存放 Scanner 引擎的集成测试。`tests/helpers/` 提供并发锁测试的工具（如锁工作脚本）。`tests/infra/` 测试基于索引的恢复恢复机制和 LLM 重试逻辑。

### 关键实现领域

以下是最受关注的测试领域：

- **同步与修复** – `sync-cli-built.test.ts`、`sync-command.test.ts`、`repair-policy.test.ts`、`repair-forced-processing.test.ts` 确保同步工作流正确处理文件同步、修复策略及强制处理。
- **架构完整性** – `infra-facade-boundary.test.ts`、`view-module-boundary.test.ts`、`footprint.test.ts` 强制层分离、导入规则以及结构与语义足迹的稳定性。
- **弹性与恢复** – `execution-checkpoint.test.ts`、`resume-services.test.ts`、`robustness.test.ts`、`index-reader.test.ts` 测试检查点恢复、跨进程锁管理及从损坏索引中恢复的能力。
- **演示与验收** – `demo-governance.test.ts` 使用构建好的 CLI 验证完整的端到端治理工作流，确保同步、检查和修复在真实的项目结构上正确运行。
- **平台支持** – `windows-platform.test.ts` 测试 Windows 与非 Windows 系统上的平台特定全局目录解析。