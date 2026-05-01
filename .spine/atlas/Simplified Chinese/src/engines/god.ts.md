<!-- spine-content-hash:185dfccc9ffea55cb9c7b559096bfe9bbca33bcfda76518f41c1124d1b07995d -->
# ArchSpine – 上帝模式 CLI 命令

## 角色
CLI 命令编排器，用于从 `.spine/index` 目录生成全面的架构档案（上帝模式报告）。

## 主要职责
- 使用 index-reader 工具读取并处理 `.spine/index` 目录中的 `SpineFolderUnit` 和 `SpineUnit` 条目。
- 将文件元数据转换为结构化账本（`FileLedgerEntry`），包含架构角色、职责、范围外、不变性、公共表面和依赖信息。
- 生成格式化的 Markdown 报告，总结整个代码库的架构，包括文件计数、角色分布和每个文件的详细信息。
- 使用 `OutputManager` 将报告输出到指定位置。

## 重要不变性与负面范围
- **不变性：** 引擎模块应提供可复用的分析和转换逻辑，而不导入 CLI 入口点，并在实际可行的情况下与服务层编排保持解耦。
- **范围外：** 不执行源代码的实际分析或 AST 解析。不执行或验证仓库中定义的架构规则。不处理版本控制或 git 元数据。不提供交互式或实时反馈。

## 最重要的导出行为
- `runGodMode(rootDir: string): { outputPath: string }` – 唯一的公共入口点，负责编排整个报告生成过程。