<!-- spine-content-hash:6fbef8331f21b225768da576deb2de42e9aa14ae95d62cec75ab1b005caef80e -->
# ArchSpine RuntimeService — 服务层外观

## 角色
`RuntimeService` 是 ArchSpine 运行时的核心编排外观。它负责解析执行配置文件、LLM 设置和视图配置，并构建领域服务实例（`CheckService`、`FixService`、`SyncService`）。它将服务实例化与 CLI 或 UI 层解耦，提供一致的依赖注入。

## 主要职责
- **LLM 设置解析**：通过 `resolveLLMSettings` 和 `createResolvedLLMClient` 合并全局配置、密钥和运行时覆盖项，解析 LLM 客户端设置。
- **执行配置文件构建**：通过 `resolveExecutionProfileFromSettings` 整合提示策略、验证配置文件和生成策略，构建已解析的执行配置文件。
- **视图层确定**：通过 `resolveEnabledViews` 和 `resolveExperimentalViewLayer` 确定运行时环境中启用和实验性的视图层。
- **集中配置访问**：从全局配置中集中提供语言配置和扫描策略的访问。
- **领域服务实例化**：构建并公开 `CheckService`、`FixService` 和 `SyncService` 实例，并附带适当的运行时选项。
- **环境变量解析**：通过 `parsePositiveIntegerEnv` 解析用于运行时配置的正整数环境变量。

## 重要不变性
- `RuntimeService` 必须使用有效的根目录路径进行实例化。
- LLM 设置解析依赖于 `Config`、`Secrets`、`GlobalLLMConfig` 和 `GlobalLLMSecrets` 的正确初始化。
- 执行配置文件解析需要有效的 `RuntimeCommand` 和 LLM 设置。
- 视图层解析独立于 LLM 配置，但依赖于 `Config`。

## 不涉及范围
- 直接的数据库或持久化操作。
- 底层 LLM API 调用或令牌管理。
- 文件系统扫描或 AST 解析逻辑。
- 用户界面渲染或 CLI 命令处理。

## 公开接口
- `class RuntimeService`
- `RuntimeService.constructor(rootDir: string)`
- `RuntimeService.getResolvedLLMSettings(): ResolvedLLMSettings`
- `RuntimeService.getResolvedExecutionProfile(): ResolvedExecutionProfile`
- `RuntimeService.getEnabledViews(): string[]`
- `RuntimeService.getExperimentalViewLayer(): string | null`
- `RuntimeService.getLanguages(): string[]`
- `RuntimeService.getScanPolicy(): any`
- `RuntimeService.createCheckService(options?: CheckServiceOptions): CheckService`
- `RuntimeService.createFixService(options?: FixServiceOptions): FixService`
- `RuntimeService.createSyncService(): SyncService`

## 变更意图
架构意图是提供一个集中的运行时编排外观，将服务实例化与 CLI 或 UI 层解耦，从而为 Check、Fix 和 Sync 服务实现一致的依赖注入。最近的变更（例如 "gogogo"）表明正在进行快速迭代，通过连接实际的领域服务（而不仅仅是解析设置）来具体化该服务。