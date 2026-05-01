<!-- spine-content-hash:a814574705985da22e3e13bcef2cb71927da66649e69a4f5deb7ca1f2f9ae522 -->
# ArchSpine 管道类型契约

## 角色
ArchSpine 管道任务状态、指标和阶段边界的核心 TypeScript 契约定义。

## 职责
- 定义任务处理指标的统计接口（`TaskStats`、`TaskStageMetric`）。
- 为不同管道关注点（诊断、选择、工件、遥测）提供状态容器接口。
- 建立管道阶段（扫描、提取、修复、提交、视图派生）的输入/输出契约。
- 作为 ArchSpine 系统中跨阶段数据交换的中心类型定义枢纽。

## 范围外
- 管道逻辑或业务规则的实现。
- CLI 命令处理或用户交互。
- 具体的数据处理或转换函数。

## 不变性
- 必须保持无 CLI 或运行时依赖，以维护管道核心隔离。
- 仅定义 TypeScript 接口和类型，不包含可执行代码。

## 公开表面
- `TaskStats`
- `TaskStageMetric`
- `TaskDiagnosticsState`
- `TaskSelectionState`
- `TaskArtifactsState`
- `TaskTelemetryState`
- `TaskState`
- `ScanStageInput`
- `ScanStageOutput`
- `ExtractionStageOutput`
- `FixViolation`
- `FixStageInput`
- `FixStageOutput`
- `CommitStageOutput`
- `ViewDerivationStageOutput`