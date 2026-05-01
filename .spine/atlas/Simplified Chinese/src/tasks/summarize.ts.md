<!-- spine-content-hash:f6d13151caa484955a2da150b4c980aebf2af0812d328fa1d0c8729c7e1f25df -->
# ArchSpine 摘要任务模块

## 角色
该模块实现 ArchSpine 流水线的摘要阶段，负责协调基于 LLM 的语义摘要生成，输入为源代码提取阶段的输出，在原始提取代码与结构化语义表示之间架起桥梁。

## 主要职责
- 实现 `SpineTask` 接口，驱动流水线的摘要阶段，消费 `ExtractionStageOutput` 并生成 `SummarizationStageOutput`。
- 从提取阶段输出中筛选并处理选定的源文件，通过 `LangRegistry.isSourceFile` 跳过不支持或非源文件。
- 使用 `buildSourcePromptArtifacts` 为每个文件构建提示工件，为 LLM 提供相关上下文。
- 使用 `pLimit` 管理并发，控制并行摘要任务的数量。
- 构建带有正确模式版本和生成器元数据的 `SpineSemantic` 和 `SpineSkeleton` 对象。
- 解析先前的语义上下文，用于摘要过程中的漂移检测。

## 不涉及范围
- CLI 命令解析或参数处理。
- 直接的文件系统遍历或源文件发现。
- 特定语言的 AST 提取或解析逻辑。
- 超出摘要流水线阶段的服务编排。

## 不变约束
- 必须实现 `core/task.js` 中的 `SpineTask` 接口。
- 必须消费 `ExtractionStageOutput` 并生成 `SummarizationStageOutput`。
- 必须使用 `LangRegistry` 验证源文件类型后再进行处理。
- 必须遵守任务阶段边界规则，专注于阶段本地工作。

## 公开接口
- `SpineTask` 接口实现
- `SummarizationStageOutput` 类型
- `buildSourcePromptArtifacts` 函数
- `LangRegistry.isSourceFile` 方法

## 变更意图
架构意图是提供一个可复用、支持并发控制的摘要流水线阶段任务模块，与核心契约集成，并通过先前的语义上下文支持漂移检测。最近的变更解决了 lint 错误并在 v1.0 前完成了流水线修复，确保与核心任务接口和协议类型保持一致。