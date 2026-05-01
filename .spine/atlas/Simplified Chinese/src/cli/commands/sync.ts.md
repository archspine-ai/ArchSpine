<!-- spine-content-hash:a31ce59c19f341c1db2b74644afceee5e50a3c0eaec445ef07c0499fc258eb9a -->
# ArchSpine 同步命令适配器

## 角色
ArchSpine 镜像系统的 CLI 命令适配器，负责编排同步工作流。

## 主要职责
- 解析 CLI 参数以确定同步模式标志（如 `--force`、`--dry-run`、`--repair`），并验证参数组合的有效性。
- 通过委托 Scanner、Manifest、RuntimeService 和语言发现模块来协调同步工作流。
- 在继续同步之前，调用 `detectProtectedOutputMutations` 强制执行脊柱门保护。
- 当受保护输出发生变异或损坏时，通过 `evaluateRepairPolicy` 评估并应用修复策略。
- 格式化同步 LLM 解析输出以供用户界面显示。

## 重要不变性与负面范围
- **必须保持为薄 CLI 适配器** – 不得吸收属于服务、核心、引擎或基础设施的管道或持久化逻辑（遵循 `cli-entrypoint-separation` 规则）。
- **必须验证 CLI 参数组合**，然后才能继续同步工作流。
- **必须强制执行脊柱门保护**，然后才能允许同步变异。
- **必须将所有领域逻辑委托**给适当的服务/引擎/基础设施模块。
- **不涉及范围：** 直接文件系统扫描、清单文件 I/O、运行时服务执行、语言发现、差异计算、受保护输出变异检测、修复策略评估以及执行检查点存储。

## 最重要的导出行为
- `formatSyncLLMResolution` – 格式化同步 LLM 解析输出以供用户界面显示。