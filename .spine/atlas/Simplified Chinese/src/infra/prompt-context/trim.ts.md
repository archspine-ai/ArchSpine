<!-- spine-content-hash:4bdec71f382e487fcfe963f9682f9674bac417db16fa3136a005001d175169e4 -->
# ArchSpine – 文本工具模块

## 角色
ArchSpine 系统的核心工具模块，提供文本修剪和格式化功能。

## 主要职责
- 将字符串修剪到指定的最大行数，如果被截断则添加省略号。
- 将字符串修剪到指定的最大字符数，同时尽量保留行边界。
- 提供文本操作工具，供其他模块使用（例如，用于格式化规则块、上下文数据）。

## 重要不变性与负面范围
- 所有函数都是纯函数，无副作用。
- 函数仅操作字符串输入并返回字符串输出。
- 不依赖基础设施、服务、任务或引擎模块。
- **不**处理文件 I/O 或数据持久化。
- **不**实现业务逻辑或编排工作流。
- **不**与外部服务或 API 交互。

## 公开接口（导出函数）
- `trimLines(value: string, maxLines: number): string`
- `trimTextByChars(value: string, maxChars: number): string`