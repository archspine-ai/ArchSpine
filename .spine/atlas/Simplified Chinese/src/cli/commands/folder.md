# CLI 子命令入口点（`src/cli/`）

此目录是 ArchSpine 所有命令行操作的单一入口。每个文件都是一个薄适配器，负责解析对应子命令的参数、验证参数，并将执行委托给相应的运行时服务或引擎。这种结构确保了关注点分离：CLI 逻辑（参数解析、用户提示、错误格式化）保留在此处，而核心业务逻辑则位于 `src/runtime/` 及其他层次。

## 子命令分组

- **初始化与配置**  
  `init.ts` – 引导整个 ArchSpine 环境（`.spine` 结构、代理文件、语言选择）。  
  `languages.ts` – 交互式文档语言管理。  
  `config.ts` – 获取/设置配置值（LLM 提供商、模型等）。  
  `llm.ts` – 交互式 LLM 提供商/模型/运行时配置。  
  `repo.ts` – 仓库级别操作（检查策略、设置制品策略）。

- **核心工作流**  
  `sync.ts` – 协调完整的同步过程（扫描、清单更新、spinal gate 保护、修复策略）。  
  `publish.ts` – 协调预检查、同步、文档回填和清单状态更新以进行发布。  
  `scan.ts` – 根据配置的策略扫描代码库。  
  `build.ts` – 委托构建工作流生成输出制品。  
  `check.ts` – 通过 `CheckService` 运行规则验证。  
  `fix.ts` – 触发自动架构违规修复。

- **状态与信息**  
  `status.ts` – 显示同步指标（总文件数、待同步文件数、失败数）。  
  `info.ts` – 运行信息报告引擎获取详细系统状态。  
  `usage.ts` – 执行使用报告。  
  `view.ts` – 管理视图选择、显示以及受保护输出的基线写入。  
  `history.ts` – 检索并显示指定文件的漂移历史记录和文件文档。

- **维护与钩子**  
  `hook.ts` – 安装、卸载、配置并触发预提交 git 钩子。  
  `remove.ts` – 从仓库中移除所有 ArchSpine 管理的制品（文件、钩子）。

- **实验性 / 高级**  
  `god.ts` – 危险的“上帝模式”，会覆盖文件（需确认）。  
  `mcp.ts` – 启动模型上下文协议服务器，用于 AI 代理集成。  
  `try.ts` – 预览命令，用于在指定目录中测试镜像输出。

## 关键实现模式

- 每个子命令文件导出一个类似 `executeXCommand(options)` 的函数，接受类型化的选项接口并返回 `Promise<void>`。
- 所有文件复用通用 CLI 工具函数（`throwCliUsage`、`displayUIBanner`、`toArchSpineError`），以实现一致的用户反馈和错误处理。
- `sync.ts` 文件尤为复杂：它通过 `detectProtectedOutputMutations` 强制执行 spinal gate 保护，应用修复策略，并管理执行检查点以从部分同步失败中恢复。
- 实验性功能（check、fix）会显示本地化警告，并鼓励通过 MCP 使用 AI 代理。
- 多个命令接受 `RuntimeService` 依赖，便于测试和与基础设施的解耦。

这种结构使得 ArchSpine 的命令行界面变得模块化、可测试且可扩展——新增子命令只需在此目录中添加一个新文件，并在主 CLI 路由器中注册即可。