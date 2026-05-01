<!-- spine-content-hash:99ed34c4f9bf9d7b786c12f9dd119990791549aa0af1a003805bdca66359ddde -->
# ArchSpine FixService

## 角色
ArchSpine 架构修复管道的服务层编排器，负责管理扫描、AST 提取、LLM 驱动的修正和验证任务的顺序执行，并与运行时会话集成。

## 主要职责
- 通过 TaskRunner 编排多阶段修复管道，包括扫描、AST 提取、LLM 驱动的修正和验证。
- 管理修复重试逻辑，具有可配置的最大尝试次数（`MAX_FIX_RETRIES = 2`）。
- 与运行时会话和检查点系统集成，以跟踪修复执行状态。
- 在清单中记录修复操作的使用指标。
- 从配置和密钥中解析 LLM 设置和执行配置文件。
- 通过将通用错误转换为带有适当错误代码的 `ArchSpineError` 来处理错误恢复。

## 不涉及范围
- 直接调用 LLM 或构建提示词（委托给 `FixTask` 和 `ASTExtractionTask`）。
- 底层文件 I/O 或数据库操作（由 infra 模块处理）。
- 用户界面或 CLI 命令处理。

## 不变约束
- `FixService` 必须使用有效的 `FixServiceOptions`（包含 `Config`、`Secrets` 和 `RuntimeIO`）进行实例化。
- 修复管道始终在运行时会话（`runWithRuntimeSession`）内执行。
- 重试逻辑受限于 `MAX_FIX_RETRIES`（2）。
- 所有错误在传播前都会被规范化为 `ArchSpineError`。

## 公开接口
- `FixService` 类（已导出）
- `FixRunSummary` 接口（已导出）
- `FixServiceOptions` 接口（已导出）