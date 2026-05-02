<!-- spine-content-hash:eeb0dc6b5e5ab29fd2812926b4437e12ca1ac91fb7218e1568c7833ef5b41ce4 -->
# ArchSpine 修复服务（`FixService`）

`FixService` 是 ArchSpine 架构修复管道的服务层编排器。它负责顺序执行四个阶段：扫描清理、AST 提取、LLM 驱动的校正和验证。该服务集成了运行时会话和检查点系统，以实现持久的执行状态跟踪，并支持可配置的重试逻辑（最多 `MAX_FIX_RETRIES = 2` 次尝试）。

## 主要职责

- **管道编排：** 使用 `TaskRunner` 运行多阶段修复管道。
- **重试管理：** 通过 `resetTaskState` 重置任务状态，并在达到最大重试次数前重新执行管道。
- **会话与检查点集成：** 使用 `executionCheckpoint.startRun` 跟踪和恢复执行状态。
- **上下文准备：** 为每次运行和重新检查创建任务上下文（`createTaskContext`）。
- **指标记录：** 在清单中记录修复操作的使用指标。
- **LLM 和执行配置解析：** 解析 LLM 设置（`GlobalLLMConfig`、`resolveLLMSettings`）和执行配置文件（`resolveExecutionProfileFromSettings`）。
- **错误规范化：** 通过 `toArchSpineError` 将错误转换为 `ArchSpineError`，以实现一致的错误报告。

## 关键不变量与职责范围

- **不变量：** 管道必须在 `MAX_FIX_RETRIES` 次重试后中止。必须始终使用运行时会话和检查点系统。该服务位于 `src/services/` 下，而非 `src/infra/`。
- **不负责：** 实现各个任务（`FixTask`、`ScanAndCleanupTask`、`ASTExtractionTask`、`ValidationTask`）、底层 LLM 客户端处理、文件系统扫描策略定义或配置加载。

## 导出的公共 API

主要的公开接口包括：
- `runFix` – 执行修复管道的入口点。
- `FixService` – 服务类。
- `FixRunSummary` – 修复运行结果摘要的返回类型。
- `FixServiceOptions` – 配置选项。