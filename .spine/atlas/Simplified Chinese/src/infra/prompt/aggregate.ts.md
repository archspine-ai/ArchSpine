<!-- spine-content-hash:896e26edc789c47b18d4f53498e1d58645225357d3fefb240591d301bcbbfa26 -->
# ArchSpine 提示词工厂

## 角色
提示词工厂是 ArchSpine 语义合成流水线中用于构建结构化提示词字符串的集中式、可复用层。它通过配置 `PromptBuilder`，为目标文档、配置文件、目录和项目单元生成提示词，包含目标特定的身份、指令、本地化、环境上下文、JSON 模式和源内容。

## 主要职责
- **文档提示词**：为文档分析构建提示词，包含文档特定的身份、指令、本地化语言指令、环境上下文、JSON 模式和源内容。
- **配置提示词**：为配置文件分析构建提示词，侧重于操作安全影响，使用配置特定的身份和模式。
- **文件夹提示词**：为目录（L2 聚合）分析构建提示词，使用简化的指令集和文件夹模式。
- **项目提示词**：为项目单元分析构建提示词，使用项目模式和适当的身份。
- **共享工具函数**：使用 `buildLocalizedLanguageInstructions` 和 `renderOutputContract` 强制执行输出合约并生成多语言指令。

## 重要不变性
- 所有生成的提示词通过 `renderOutputContract` 强制执行 JSON 输出合约。
- 当指定多种语言时，所有提示词都包含本地化语言指令。
- `PromptBuilder` 始终按照一致的流水线使用 `setIdentity`、`addInstructions`、`addEnvironmentalContext`、`addJSONSchema` 和 `addSourceContent`。
- 该模块保持为纯工厂，不涉及服务/任务/引擎编排。

## 不涉及范围
- 不执行或编排任何分析或服务逻辑。
- 不处理文件 I/O、扫描或运行时状态。
- 不定义或验证模式；从模板导入模式。
- 不管理提示词缓存或生命周期。

## 公开接口
- `generateDocumentPrompt`
- `generateConfigPrompt`
- `generateFolderPrompt`
- `generateProjectPrompt`

## 架构意图
为所有语义分析目标提供集中式、可复用的提示词生成层，确保输出格式、本地化和环境上下文注入的一致性。这与模块化 CLI 和解耦核心基础设施服务的更广泛目标一致，通过将提示词构建与服务编排分离来实现。