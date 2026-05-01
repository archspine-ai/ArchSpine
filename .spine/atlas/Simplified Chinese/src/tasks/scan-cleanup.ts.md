<!-- spine-content-hash:67eb7dc064be9ecd6afd80adb5611f10aefd95dac66a99dfadc35091c086ca65 -->
# ArchSpine – 扫描与清理孤立文件（管道阶段）

## 角色
这是一个专用的管道阶段任务，负责扫描文件系统并清理 ArchSpine 跟踪状态中的孤立或过时文件。它通过移除磁盘上已不存在文件的条目，确保跟踪状态与实际文件系统保持一致。

## 主要职责
- 通过 `LangRegistry` 加载语言快照，确定哪些文件扩展名被跟踪。
- 使用扫描服务扫描所有跟踪文件和已更改的文件。
- 通过文件系统检查过滤掉磁盘上不再存在的文件（孤立文件）。
- 计算文件哈希，并通过清单服务判断是否需要更新。

## 不包含范围
- CLI 命令解析或参数处理。
- 其他管道阶段或服务的编排。
- 超出清理孤立条目范围的文件系统直接修改。

## 重要不变规则
- 仅操作由语言快照或 `LangRegistry` 定义的跟踪文件。
- 不得执行 CLI 命令解析或无关的服务编排（遵循任务阶段边界规则）。

## 公开接口
- **类**：`ScanAndCleanupTask`（继承自 `SpineTask<ScanStageInput, ScanStageOutput>`）
- **属性**：
  - `name`：`'Scan & Cleanup Orphan Files'`
  - `checkpointId`：`'scan-cleanup'`
- **方法**：`execute(ctx: TaskContext, input: ScanStageInput): Promise<ScanStageOutput>`

## 变更意图
- **架构意图**：提供一个专用的管道阶段，用于扫描和清理孤立文件，保持跟踪状态与文件系统之间的一致性。
- **近期变更意图**：解决 lint 错误并在 v1.0 前完成管道修复，确保扫描清理阶段与任务执行框架无缝集成。