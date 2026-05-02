<!-- spine-content-hash:e18ad0df80bb255d03ec240985e11aee07fe33b489e815c10fe4f6a10b5ab32e -->
# ArchSpine TaskContext 接口

`TaskContext` 接口是 ArchSpine 任务执行的核心依赖注入上下文。它定义了一个契约，为任务实现提供对共享引擎（Scanner、Aggregator、ContextEngine、RuleEngine、ASTExtractor）和基础设施（Manifest、OutputManager）的访问。此外，它还声明了对 LLM 客户端、提示策略、运行时 I/O、执行检查点存储、视图标识符和任务状态类型的仅类型依赖，从而支持任务执行契约。

**主要职责：**
- 定义 `TaskContext` 接口作为集中式注入点。
- 为任务实现提供对全部核心引擎和基础设施的访问。
- 声明支持任务执行契约的仅类型依赖，不包含运行时行为。

**范围之外：**
- 实现具体的任务逻辑。
- 提供 CLI 命令处理程序或入口点。
- 管理流水线编排或阶段转换。

**关键不变性：**
- 必须保持为纯 TypeScript 接口，不含任何运行时实现。
- 仅能依赖核心引擎、基础设施和类型定义，不得依赖 CLI 或 UI 层。

**公开表面：**  
唯一导出的符号是 `TaskContext` 接口。

该接口将任务实现与具体依赖解耦，保证了关注点分离，并提升了 ArchSpine 系统的可测试性。