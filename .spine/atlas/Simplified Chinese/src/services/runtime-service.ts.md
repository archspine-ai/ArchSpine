<!-- spine-content-hash:0f9da658177ecf6ab39e4b4a74d6dd6c50c78e54f02a62c3b5c5974b63c46344 -->
# RuntimeService - ArchSpine 运行时编排外观

**角色**：ArchSpine 系统中的运行时编排服务层外观，负责解析执行配置文件、LLM 设置、视图配置，并构建领域服务实例（Check、Fix、Sync）。

## 主要职责

- 通过 `resolveLLMSettings` 和 `createResolvedLLMClient` 合并全局配置、密钥和运行时覆盖项，解析 LLM 客户端设置。
- 通过 `resolveExecutionProfileFromSettings` 整合提示策略、验证配置文件和生成策略，构建已解析的执行配置文件。
- 通过 `resolveEnabledViews` 和 `resolveExperimentalViewLayer` 确定运行时环境中启用和实验性的视图层。
- 从全局配置中集中提供语言配置和扫描策略的访问。
- 构建并公开 `CheckService`、`FixService` 和 `SyncService` 实例，并附带适当的运行时选项。
- 通过 `parsePositiveIntegerEnv` 解析用于运行时配置的正整数环境变量。

## 不在范围内

- 直接的数据库或持久化操作。
- 底层 LLM API 调用或令牌管理。
- 文件系统扫描或 AST 解析逻辑。
- 用户界面渲染或 CLI 命令处理。

## 不变约束

- `RuntimeService` 必须使用有效的根目录路径进行实例化。
- LLM 设置解析依赖于 `Config`、`Secrets`、`GlobalLLMConfig` 和 `GlobalLLMSecrets` 的正确初始化。
- 执行配置文件解析需要有效的 `RuntimeCommand` 和 LLM 设置。
- 视图层解析独立于 LLM 配置，但依赖于 `Config`。

## 公开表面（外部可见行为）

- 类 `RuntimeService`
- 构造函数 `RuntimeService.constructor(rootDir: string)`
- `RuntimeService.getResolvedLLMSettings(): ResolvedLLMSettings` — 获取已解析的 LLM 设置
- `RuntimeService.getResolvedExecutionProfile(): ResolvedExecutionProfile` — 获取已解析的执行配置文件
- `RuntimeService.getEnabledViews(): string[]` — 获取启用的视图列表
- `RuntimeService.getExperimentalViewLayer(): string | null` — 获取实验性视图层
- `RuntimeService.getLanguages(): string[]` — 获取支持的语言列表
- `RuntimeService.getScanPolicy(): any` — 获取扫描策略
- `RuntimeService.createCheckService(options?: CheckServiceOptions): CheckService` — 创建 Check 服务
- `RuntimeService.createFixService(options?: FixServiceOptions): FixService` — 创建 Fix 服务
- `RuntimeService.createSyncService(): SyncService` — 创建 Sync 服务