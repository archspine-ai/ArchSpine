## 目录：仓库制品策略 CLI 命令适配器

本目录是 ArchSpine 系统中用于仓库制品策略操作的 CLI 命令适配层。它提供命令行接口，用于 **检查** 和 **设置** 仓库的制品策略（`"local"` 本地或 `"distributable"` 可分发型）。

### 结构与分组

目录中仅包含一个主模块：

- **`strategy.ts`** – 作为所有 CLI 交互的主入口点。它从命令行参数解析并规范化策略输入，通过 `checkRepositoryStrategy` 和 `applyRepositoryStrategy` 委托给核心逻辑执行，并利用 `printStep` 回调分步显示进度与结果。

所有逻辑集中在单个文件中，使适配层专注于输入/输出处理，而核心业务规则保持分离在独立的领域层中。

### 关键实现区域

1. **输入解析** – 从 CLI 参数验证并规范化用户提供的策略值（`"local"` 或 `"distributable"`）。
2. **策略检查** – 调用 `checkRepositoryStrategy` 报告当前策略状态，包括对缺失或不一致策略的警告。
3. **策略设置** – 通过进度回调（`printStep`）调用 `applyRepositoryStrategy`，在操作过程中提供实时反馈。
4. **配置报告** – 读取系统配置（`Config`），向用户展示持久化的制品策略和初始化策略。

### 具体子模块

- `strategy.ts` – 仓库制品策略检查/设置命令的完整 CLI 适配器实现。