`init/` 目录是 ArchSpine 的中央引导子系统，负责初始化仓库配置和运行时环境。它统筹完整的设置序列——从工件策略选择、规则模板安装，到 Git 钩子配置、LLM 凭据设置、文件系统扫描、语言发现、清单更新，最后交接给构建工作流。

该目录将逻辑组织为三个具体子模块：

- **repository-bootstrap.ts** —— CLI 命令适配器，引导用户完成仓库初始化。它提示用户选择或确认工件策略（index、atlas 或 hybrid），通过 repository-admin-service 安装推荐的规则模板，配置 Git 钩子以进行预提交完整性检查，并处理取消与回退逻辑。
- **runtime-bootstrap.ts** —— 服务模块，在仓库设置完成后运行运行时引导序列。它协调 LLM 凭据设置和范围确认、触发 Scanner 引擎进行文件系统扫描、执行语言发现以检测代码库中的编程语言、将发现的语言快照更新到系统清单，并调用构建工作流命令。同时还提供用户驱动的初始同步确认提示。
- **types.ts** —— 共享类型契约模块，定义接口（`InitSharedOptions`、`RepositoryBootstrapResult`）和类型别名（`LLMScope`、`HookSetupStatus`、`ArtifactStrategy`），确保 CLI 命令和服务层在整个设置过程中使用一致的数据结构。

最重要的实现要点包括：仓库配置与运行时引导的分离、通过共享类型契约保证一致性，以及协调涉及用户提示、文件系统操作和服务编排的异步步骤。