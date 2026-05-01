<!-- spine-content-hash:4234ccf343b7fcd33f546c8b735ced41145f80aa186c3612013e2bb872d66562 -->
# ArchSpine 初始化类型契约

该 TypeScript 模块定义了 ArchSpine 初始化与仓库引导子系统的共享类型契约。作为纯类型定义层，它提供集中化的接口和类型别名，确保 CLI 命令与服务层在项目设置过程中的一致性。

## 主要职责

- **InitSharedOptions 接口** – 封装初始化步骤所需的依赖（如 `Config`、`RuntimeService`）及工具函数。
- **RepositoryBootstrapResult 接口** – 定义仓库引导操作的结构化结果类型。
- **类型别名** – 导出 `LLMScope`、`HookSetupStatus` 和 `ArtifactStrategy`，标准化初始化 CLI 中的配置域。
- **集中化类型定义** – 确保项目设置过程中 CLI 命令与服务层之间的数据结构一致。

## 不涉及范围

- 不实现初始化逻辑或业务规则。
- 不提供运行时函数或类。
- 不处理 CLI 命令解析或执行。
- 不管理持久化或管道操作。

## 不变约束

- 必须保持为纯类型定义模块，不包含任何可执行代码。
- 不得导入或依赖类型引用之外的具体实现。
- 必须作为初始化相关数据结构的中心契约。

## 架构意图

该模块将类型定义与实现解耦，使 CLI 和服务层能够共享契约，从而支持一致的项目初始化。最近的变更收紧了初始化类型的模式处理，提升了类型安全性和契约定义的严谨性。

## 公开接口

- `InitSharedOptions`
- `RepositoryBootstrapResult`
- `LLMScope`
- `HookSetupStatus`
- `ArtifactStrategy`