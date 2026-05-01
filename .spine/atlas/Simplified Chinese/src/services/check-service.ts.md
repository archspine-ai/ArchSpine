<!-- spine-content-hash:7f7810704c0660b198c5d7b6d6403e13185e9393662b7ca85c0b70a660857dd5 -->
# ArchSpine 检查服务

## 角色
服务外观层，负责编排 ArchSpine 'check' 命令的流水线，在受管理的运行时会话中协调扫描、AST 提取、验证和用量记录。

## 主要职责
- 通过 TaskRunner 编排扫描、清理、AST 提取和验证任务的顺序执行。
- 使用 `runWithRuntimeSession` 和 `deriveCheckResumeCandidateFiles` 管理运行时会话生命周期和可恢复操作的执行检查点。
- 通过 `context.manifest.recordUsage` 将用量指标和验证摘要记录到项目清单中。
- 处理错误，记录阶段特定指标（文件数量、字节大小），并将字节数格式化为人类可读的输出。

## 重要不变性与负范围
- 检查流水线必须在由 `runWithRuntimeSession` 管理的运行时会话内执行。
- 在开始运行之前，必须通过 `deriveCheckResumeCandidateFiles` 推导执行检查点。
- 流水线完成后，必须将用量指标记录到清单中。
- **不涉及范围：** 直接的文件系统 I/O 操作（委托给 RuntimeIO）、LLM 客户端配置和密钥解析（委托给 infra/llm 和 infra/secrets）、任务实现细节（扫描、AST 提取、验证逻辑）以及执行配置文件解析（委托给 runtime-execution-profile）。

## 公开接口
- `CheckService`
- `CheckServiceOptions`