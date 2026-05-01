<!-- spine-content-hash:5486caab8832c4aae64ec1f16ca05b9f7d50caa2b8a702818ccbfcaeca2ecc4d -->
# ArchSpine 基础设施工具模块

## 角色
该模块为 ArchSpine 镜像系统提供底层基础设施工具，专注于内容组装、结构化响应解析和用量合并。它为需要处理 LLM 输出或构建上下文字符串的调用方提供稳定的公共外观接口，避免直接访问内部实现细节。

## 主要职责
- **构建支持性上下文**：根据文件类型，有条件地拼接内容和上下文数据，为源文件组装支持性上下文字符串。
- **解析 Markdown 块**：使用正则表达式将完整的 LLM 响应拆分为符合 ArchSpine 输出合约的本地化 Markdown 块。
- **从响应中提取 JSON**：从 LLM 响应中提取并清理 JSON 块，处理可选的代码围栏标记和回退逻辑。
- **合并用量信息**：将多个可选的 `UsageInfo` 对象合并为一个聚合对象，通过汇总令牌计数和合并字段实现。
- **提供公共外观接口**：暴露稳定的公共 API 用于响应解析和用量聚合，避免深层内部导入。

## 重要不变性
- 基础设施模块必须暴露稳定的底层能力和外观接口，不应吸收服务、任务或引擎编排的关注点。
- 当存在外观接口时，调用方应优先使用公共基础设施外观，而非深入私有实现路径。

## 负面范围（不包含）
- **不**处理网络请求或 API 调用。
- **不**管理文件 I/O 或磁盘操作。
- **不**实现编排逻辑或工作流控制。
- **不**执行超出结构解析范围的 LLM 响应内容验证。

## 公共接口
- `buildSupportingContext(fileKind, content, contextData?)`
- `parseMarkdownBlocks(fullResponse, languages)`
- `parseStructuredResponse(fullResponse, languages, logContext)`
- `mergeUsage(...usages)`

## 漂移检测
检测到一次漂移：先前的语义合约未包含 `mergeUsage` 职责或 `parseStructuredResponse` 的完整 JSON 提取逻辑范围。本摘要反映了修正后的理解。