该目录实现了 ArchSpine 镜像系统的 CLI 命令适配器层。每个文件对应一个具体的子命令（如 `build`、`check`、`config`、`fix`、`god`、`history`、`hook`、`info`、`init`、`languages`、`llm`、`mcp`、`publish`、`remove`、`repo`、`scan`、`status`、`sync`、`try`、`usage`、`view`），作为用户终端输入与核心服务层之间的薄中介。

所有适配器遵循相同的模式：解析并验证命令行参数，将实际工作委托给专用核心服务（例如 `RuntimeService`、`Config`、`Manifest` 或引擎函数如 `runGodMode`），并将结果格式化为控制台输出。统一的错误处理机制贯穿始终——大多数适配器将内部失败转换为结构化的 `ArchSpineError` 实例，并使用 `throwCliUsage` 和 `displayUIBanner` 等辅助工具提供一致的用户引导。

这些文件可按功能分为以下几组：

- **核心构建与验证管线**：`build.ts`、`check.ts`、`fix.ts` —— 编排构建工作流、执行规则检查、应用自动修复。
- **配置与钩子管理**：`config.ts`、`hook.ts`、`languages.ts`、`llm.ts` —— 负责读取和写入配置值、管理 Git 钩子、以及交互式语言和 LLM 设置。
- **仓库状态与信息**：`history.ts`、`info.ts`、`status.ts`、`usage.ts` —— 查询清单（Manifest）和运行时，显示变更历史、报告状态、输出使用统计。
- **特殊功能与初始化**：`god.ts`、`mcp.ts`、`init.ts` —— 带有破坏性警告的 God 模式、MCP 服务器启动、完整环境引导。
- **仓库维护**：`publish.ts`、`remove.ts`、`repo.ts`、`scan.ts`、`sync.ts` —— 发布工作流、清理操作、构件策略配置、扫描、以及关键的同步管线（含脊柱门保护、修复策略、执行检查点）。
- **工具与预览**：`try.ts`、`view.ts` —— 验证目录和配置文件的存在性、交互式视图选择及受保护输出基线写入。

在具体子模块中，`sync.ts` 复杂度最高：它强制执行脊柱门保护、评估修复策略、管理部分失败检查点、并协调多个核心服务。`build.ts` 是构建工作流的入口点；`check.ts` 直接将任务委托给 `RuntimeService` 中的 `CheckService`；`config.ts` 支持对一组固定配置键（如 `llm.provider`）进行读取和写入操作；`god.ts` 在调用 God 引擎之前增加了用户确认提示；`llm.ts` 提供了针对 LLM 提供商和模型的交互式配置向导。

整个目录中最重要的实现领域包括：参数验证（确保错误输入及早捕获）、向正确核心服务的委托（保持关注点分离）、通过 `ArchSpineError` 和 CLI 辅助函数实现一致的错误处理与用户反馈、以及清晰地在终端中呈现信息的输出格式化。