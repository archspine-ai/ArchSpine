`src/services` 目录实现了 ArchSpine 镜像系统的服务编排层，负责协调多阶段的分析、修复、同步、大语言模型配置及视图生成管线。该层作为 CLI 命令与基础设施组件之间的桥梁，通过带断点恢复功能的运行时会话，管理执行状态、错误处理与配置解析。

主要子模块包括：
- **check-service**：编排检查管线（扫描、AST 提取、校验），管理会话生命周期并记录使用指标。
- **fix-service**：管理修复管线，支持最多 2 次重试、重新检查环节，并与运行时会话集成。
- **sync-service**：协调完整同步管线（调和、扫描、AST 提取、摘要生成、状态提交、后提交推导），并集成视图服务注册表。
- **llm-admin-service**：将 LLM 配置相关的 CLI 命令与配置/密钥存储桥接，并解析状态视图。
- **runtime-service**：统一入口门面，解析 LLM 设置、执行配置文件、视图配置，并构建 `CheckService`、`FixService` 和 `SyncService` 实例。
- **view-service**（位于 `src/services/view`）：从索引的代码库数据中生成并渲染架构视图（架构图、风险热点、公共表面等），使用 LLM 规约和 Markdown 模板。
- **task-runtime**：工厂模块，准备预配置的任务上下文，包括扫描器、聚合器、AST 提取器、规则引擎、上下文引擎和输出管理器。
- **repository-admin-service**：管理仓库工件策略、智能体指令，以及同步管理文件（Git 属性、Git 忽略、包脚本）。
- **runtime-session**：提供可恢复的命令执行会话，支持检查点验证、锁管理以及保护输出的写入安全。
- **publish-preflight**：验证发布前提条件（目录存在、清单完整性、锁文件有效性、快照就绪状态）。
- **runtime-execution-profile**：从 LLM 设置和运行时命令解析执行配置文件，处理默认值和命令特定覆盖。

这些组件共同确保整个 ArchSpine 镜像工作流程的一致、可恢复且合规执行。