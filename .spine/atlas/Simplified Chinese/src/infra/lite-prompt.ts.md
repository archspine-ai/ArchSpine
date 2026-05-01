<!-- spine-content-hash:d7cd4aa65cdf6260b475fd286a98a6fbd8c01139ea55c0b2f76f6240bea3efd3 -->
# LitePromptBuilder — 轻量级提示词构建器（Lite 模式）

**角色：**  
用于在低精度“Lite 模式”结构索引中，为受令牌约束的 API 构建轻量级 LLM 提示词的实用工具类。

**主要职责：**
- 在低精度结构索引模式下，构建用于高层文件摘要的简洁提示词字符串。
- 支持可配置的响应模式：仅 JSON 或 JSON 加 Markdown。
- 为指定语言生成本地化的 Markdown 指令。
- 提供流畅的构建器 API 用于组装提示词各部分。

**重要不变项与负面范围：**
- 导出一个具有流畅接口的公共类 `LitePromptBuilder`。
- 导出一个定义允许响应模式的类型 `LitePromptResponseMode`。
- 内部状态维护为一个私有的字符串片段数组。
- 生成的提示词专注于结构索引，且上下文开销最小。
- **不**编排 LLM API 调用或管理令牌计数。
- **不**处理高精度或全上下文分析提示词。
- **不**涉及网络、日志或配置管理等基础设施层面的问题。

**最重要的导出/外部可见行为：**
- `LitePromptBuilder` — 通过流畅 API 构建提示词的主要类。
- `LitePromptResponseMode` — 将响应格式限制为仅 JSON 或 JSON 加 Markdown 的类型。