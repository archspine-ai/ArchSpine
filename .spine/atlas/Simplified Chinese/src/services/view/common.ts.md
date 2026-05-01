<!-- spine-content-hash:db976f85ed4617024f1e31634632f541907bbbf5aabf0377a5cb02ac534471de -->
# ArchSpine – 视图工具模块

## 角色
纯工具模块，为视图层提供评分和路径过滤功能。

## 主要职责
- 基于正则表达式模式检测被屏蔽的文件路径，涵盖测试、夹具、示例、文档、dist 和 build 目录。
- 对视图评分贡献的分解结果进行求和。
- 根据总分和支持计数计算置信度分数，并进行归一化和钳位处理。

## 重要不变性与负面范围
- 所有导出的函数均为纯函数，无副作用。
- 路径屏蔽逻辑使用固定的正则表达式模式，不依赖外部配置。
- 置信度分数被钳位在 0 到 0.99 之间。
- 本模块**不**处理视图渲染、数据访问、持久化、架构图生成或风险热点分析。

## 公开接口（导出的函数）
- `isSuppressedPath(filePath: string): boolean`
- `sumScores(scoreBreakdown: ViewScoreContribution[]): number`
- `toConfidence(totalScore: number, supportCount: number): number`