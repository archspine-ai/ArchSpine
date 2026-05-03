`init` 目录包含了 ArchSpine 的初始化与引导子系统，负责仓库和运行时的启动设置。该目录由三个核心模块组成：

- **`repository-bootstrap.ts`** – 一个 CLI 命令适配器，用于编排仓库级别的初始化流程，包括工件策略选择（index、atlas、hybrid）、规则模板安装以及用于预提交完整性检查的 Git 钩子配置。它处理用户交互提示以及关键步骤的取消与回退逻辑。
- **`runtime-bootstrap.ts`** – 一个服务模块，驱动运行时的引导序列：大语言模型凭据配置与作用域确认、文件系统扫描、语言检测、清单更新，以及向构建工作流的交接。它还支持可选的初始同步用户确认提示。
- **`types.ts`** – 提供共享的类型契约（`InitSharedOptions`、`RepositoryBootstrapResult`）和类型别名（`LLMScope`、`HookSetupStatus`、`ArtifactStrategy`），用于标准化 CLI 与服务层之间的数据结构。

最重要的实现关注点包括工件策略配置、安全的大语言模型凭据设置，以及扫描、语言检测和清单更新在可靠且交互式的序列中的协调。