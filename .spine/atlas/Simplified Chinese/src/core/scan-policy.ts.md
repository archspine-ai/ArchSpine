<!-- spine-content-hash:39b0b10f62b997886a2462d9171d0c8f91c81366a826081b9ce0184be586ad17 -->
# ArchSpine – 扫描策略类型定义

本模块定义了 ArchSpine 镜像系统中扫描策略配置的核心 TypeScript 类型契约。它规定了允许的文件来源、完整扫描策略的结构以及用于增量更新的部分策略变体。

## 角色

核心 TypeScript 类型定义模块，为 ArchSpine 镜像系统建立扫描策略配置契约。

## 主要职责

- 定义 `FileSource` 联合类型，指定允许的扫描文件来源：`git-tracked`（Git 跟踪）、`git-tracked-plus-untracked`（Git 跟踪加未跟踪）和 `filesystem`（文件系统）。
- 声明 `ScanPolicy` 接口，结构化扫描配置，包括文件来源、忽略链配置以及协议包含/排除列表。
- 提供 `PartialScanPolicy` 接口，用于可选的策略更新，支持部分配置覆盖。

## 重要不变项与负面范围

- **不变项：** 本模块定义纯 TypeScript 类型和接口，无副作用。它作为核心扫描管道配置的稳定契约，并与 CLI 入口点和实现细节保持隔离。
- **负面范围：** 本模块**不**实现扫描逻辑或管道执行，不处理 CLI 命令解析或调用，也不提供运行时验证或策略字段的默认值。

## 最重要的导出/外部可见行为

公共表面包含三个导出项：`FileSource`、`ScanPolicy` 和 `PartialScanPolicy`。这些类型是配置扫描管道的唯一契约，任何希望指定或修改扫描行为的消费者都必须使用它们。