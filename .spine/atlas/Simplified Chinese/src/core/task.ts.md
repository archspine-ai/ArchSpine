<!-- spine-content-hash:d263b409ce94ca18dc94122ca1961ff8d677b56d0d9c91c050a29a6c3a41da05 -->
# TaskContext 接口

## 角色
定义 ArchSpine 任务执行依赖注入的核心接口。

## 主要职责
- 定义 `TaskContext` 接口，为任务实现提供对共享引擎（Scanner、Aggregator、ContextEngine、RuleEngine、ASTExtractor）和基础设施（Manifest、OutputManager）的访问。
- 声明仅类型依赖，包括 LLM 客户端、提示策略、运行时 I/O、执行检查点存储、视图标识符和任务状态类型，以支持任务执行契约。

## 重要不变性与负面范围
- 必须保持为纯 TypeScript 接口，不包含运行时实现。
- 仅依赖核心引擎、基础设施和类型定义，不依赖 CLI 或 UI 层。
- **不涉及范围：** 实现具体任务逻辑、提供 CLI 命令处理程序或入口点、管理管道编排或阶段转换。

## 最重要的导出行为
- 导出 `TaskContext` 接口，作为任务实现所需所有依赖的集中注入点。