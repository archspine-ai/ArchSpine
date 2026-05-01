<!-- spine-content-hash:387c5a330eacb07a93081dd124c2f42a422cd30e83d8074cd8e4cdb35be89554 -->
# ArchSpine 上下文引擎

**上下文引擎** 是一个纯分析模块，负责 ArchSpine 镜像系统中的架构上下文解析。它通过项目清单和路径解析工具将相对导入目标解析为绝对文件路径，从源文件骨架中提取架构规则关键词，并基于规则关键词、符号使用和目标路径计算依赖候选的相关性分数。该引擎为依赖候选、符号目标和使用目标生成结构化诊断，供下游扫描器和展示层使用。

## 主要职责

- 使用项目清单和路径解析工具将相对导入目标解析为绝对文件路径。
- 从源文件骨架中提取架构规则关键词以评估相关性。
- 基于规则关键词、符号使用和目标路径计算依赖候选的相关性分数。
- 为依赖候选、符号目标和使用目标生成诊断接口。
- 通过聚合候选依赖并生成结构化诊断来协调上下文解析。

## 不涉及范围

- 直接用户交互或 CLI 命令执行。
- 超出文件系统路径解析的持久化或网络 I/O。
- 图形可视化或 UI 渲染。
- 服务生命周期管理或其他引擎的编排。

## 不变约束

- 必须保持为无副作用的纯分析引擎。
- 只能依赖其他引擎模块、核心类型和基础设施工具。
- 必须导出诊断接口供扫描器或展示层使用。

## 公开接口

- `ContextEngine`
- `RelevanceScoreContribution`
- `DependencyCandidateDiagnostics`
- `SymbolTargetDiagnostics`
- `UsageTargetDiagnostics`
- `ContextResolutionDiagnostics`
- `ContextResolutionResult`
- `ContextResolutionOptions`

## 变更意图

架构意图是提供一个可复用、解耦的架构上下文解析引擎，支持 ArchSpine 系统中的依赖分析和相关性评分。最近的变更重构了系统，将扫描器和上下文职责分离，很可能将上下文解析逻辑提取到专用的引擎模块中。