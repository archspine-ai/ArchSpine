`tests/` 目录是 ArchSpine 系统的测试套件。它验证了所有核心子系统，包括 CLI 命令、配置管理、LLM 集成、同步工作流、仓库引导、凭证存储、数据库操作、错误处理以及架构边界强制。测试通过隔离的单元测试、集成测试和端到端工作流执行。

测试按功能组织为多个子目录：
- **`tests/e2e/`** – CLI 命令的端到端集成测试（初始化、流水线执行、规则违规检测），使用隔离的 git 仓库和模拟提示。
- **`tests/engines/`** – Scanner 引擎的集成测试，验证文件发现和排除逻辑。
- **`tests/helpers/`** – 实用脚本，包括用于多进程锁行为的锁管理器测试框架。
- **`tests/infra/`** – 基于索引的恢复恢复和 LLM 重试机制的测试，覆盖部分或损坏的索引状态以及失败模拟。

需要注意的具体子模块和测试文件包括：
- `cli.test.ts` – 使用自定义模拟 LLM 客户端对 CLI 命令工作流和核心引擎编排进行端到端测试。
- `schema-compliance.test.ts` – 使用 Ajv 验证 JSON 模式和 SyncService 集成。
- `integrity.test.ts` – 测试 SpineDB 批量提交的原子性和约束违反时的回滚。
- `robustness.test.ts` – 通过隔离工作进程脚本验证跨进程锁的获取和释放行为。
- `credentials-store.test.ts` – 使用多种后端（内存、Windows DPAPI、不可读后端）测试 CredentialStore，包括回退文件安全和 gitignore 加固。
- `config-validation.test.ts` – 验证配置加载、语言默认值、钩子同步模式和警告触发。
- `error-system.test.ts` – 确保跨服务和基础设施外观模块的错误传播一致性。
- `infra-facade-boundary.test.ts` – 通过导入分析强制架构边界规则。
- `view-module-boundary.test.ts` – 验证视图模块是否放置在 `src/services/view` 下，以保持层分离。

该测试套件强调通过临时隔离目录避免副作用，广泛使用模拟（Vitest），并全面覆盖所有主要子系统的正常路径和错误/边缘情况。