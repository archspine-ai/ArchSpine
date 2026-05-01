<!-- spine-content-hash:e24d3e25f9cef0e11b46e8684a4ea56674072b80cbc6e40fdd8477757ce66709 -->
# ArchSpine OpenAI 兼容 LLM 客户端

## 角色
该文件实现了 `LLMClient` 接口，作为一个 OpenAI 兼容的提供者客户端。它还内嵌了提示生成编排功能，用于 ArchSpine 的语义分析流水线。

## 主要职责
- 根据 `ProviderConfig` 配置 API 端点、API 密钥、模型和超时时间，初始化 OpenAI SDK 客户端。
- 实现 `LLMClient` 接口的所有方法，为所有 `FileKind` 类型（source、document、config、folder、project、markdown）生成语义摘要。
- 通过导入并使用提示生成器（来自 `../../prompt.js` 和 `../../lite-prompt.js` 的 `generateConfigPrompt`、`generateDocumentPrompt` 等）执行结构化提示。
- 使用工具函数将 LLM 响应解析为结构化 JSON 和 Markdown 块。
- 在单个摘要生成过程中，跨多次 LLM 调用累积并合并使用信息。

## 重要不变项与范围外事项
- **必须**实现来自 `../base.js` 的 `LLMClient` 接口。
- **必须**使用 OpenAI SDK 进行所有 API 通信。
- **必须**支持所有 `FileKind` 类型的提示生成。
- **必须**将 LLM 响应解析为结构化格式。
- **范围外：** 直接访问数据库或文件系统、用户认证或授权、超出 OpenAI API 调用的网络请求处理、LLM 响应的缓存或持久化。

## 最重要的导出行为
- **类：** `OpenAICompatibleClient`
- **构造函数：** `constructor(config: ProviderConfig)`
- **公开方法：** `generateSource`、`generateDocument`、`generateConfig`、`generateFolder`、`generateProject`、`generateMarkdown` — 每个方法对应一个 `FileKind` 类型。

## 架构说明
该客户端已偏离其原始纯 LLM 提供者的契约。它现在通过直接导入提示生成器来编排提示生成，这超出了其原始职责范围。这违反了基础设施模块不应吸收服务/任务/引擎编排关注点的规则。理想情况下，该客户端应接收预构建的提示，或将提示生成委托给独立的编排层。