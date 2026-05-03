# ArchSpine 根配置摘要

## 作用

ArchSpine 项目镜像系统的根配置文件，定义了核心运行参数、扫描策略、产物生成、钩子以及初始化默认值。

## 参数定义

| 参数 | 描述 |
|------|------|
| `schemaVersion` | 定义配置模式的版本号，必须遵循语义化版本以确保兼容性。 |
| `project.name` | 被镜像项目的规范名称，用于所有子系统中的身份标识。 |
| `project.locales` | 支持的地域列表，用于生成多语言文档；当前为英语和简体中文。 |
| `llm` | 大语言模型提供商配置；当前为空，可添加模型端点。 |
| `mcp.contextMode` | MCP 服务器的上下文聚合模式；`'off'` 表示不进行上下文增强。 |
| `hooks.preCommit` | 是否启用预提交钩子；`false` 表示钩子未激活。 |
| `hooks.syncMode` | 定义同步操作的触发方式；`'hook'` 表示通过 Git 钩子触发。 |
| `artifacts.strategy` | 产物分发模型；`'distributable'` 表示产物可独立发布。 |
| `artifacts.experimentalViewLayer` | 是否启用实验性视图层，用于高级架构视图渲染。 |
| `artifacts.enabledViews` | 需要生成的视图类型列表：公开表面、风险热点、架构图。 |
| `scanPolicy.fileSource` | 扫描器考虑的文件来源；`'git-tracked'` 仅扫描 Git 索引中的文件。 |
| `scanPolicy.ignoreChain.inheritGitIgnore` | 是否继承仓库 `.gitignore` 中的模式。 |
| `scanPolicy.ignoreChain.projectIgnore` | 项目级忽略文件路径 (`.spineignore`)。 |
| `scanPolicy.ignoreChain.localIgnore` | 本地覆盖忽略文件路径 (`.spineignore.local`)。 |
| `scanPolicy.protocolExclusions` | 默认排除的扫描路径；用于保护内部骨架目录不被扫描。 |
| `scanPolicy.protocolInclusions` | 从排除中重新包含的路径；确保关键骨架配置被扫描。 |
| `initState.artifactStrategy` | 首次初始化时使用的产物策略。 |
| `initState.agentInstructionsFile` | 代理指令文件名（默认为 `AGENTS.md`）。 |
| `initState.agentInstructionsCreatedByArchSpine` | 标记 `AGENTS.md` 是否由 ArchSpine 自动生成。 |
| `initState.spineIgnoreManaged` | 是否由 ArchSpine 管理 `.spineignore` 文件。 |
| `initState.spineIgnoreCreatedByArchSpine` | 标记 `.spineignore` 是否自动生成。 |
| `initState.searchIgnoreManaged` | 是否管理搜索忽略文件。 |
| `initState.searchIgnoreCreatedByArchSpine` | 标记搜索忽略文件是否自动生成。 |
| `initState.gitIgnoreManaged` | 是否由 ArchSpine 管理 `.gitignore`。 |
| `initState.gitIgnoreCreatedByArchSpine` | 标记 `.gitignore` 是否自动生成。 |
| `initState.gitAttributesManaged` | 是否由 ArchSpine 管理 `.gitattributes`。 |
| `initState.gitAttributesCreatedByArchSpine` | 标记 `.gitattributes` 是否自动生成。 |

## 稳定性与风险

此配置文件控制核心扫描和产物生成流程。如果错误配置 `scanPolicy`（例如移除 `protocolExclusions`），可能导致 ArchSpine 索引自己的内部文件，造成递归循环和数据损坏。将 `hooks.preCommit` 设置为 `true` 而未充分测试时，可能意外阻塞提交。`artifacts.experimentalViewLayer` 功能标记为实验性，启用后可能带来渲染不稳定。`initState` 标志对于升级和迁移工作流至关重要；错误的值可能导致系统覆盖用户管理的文件，或无法更新受管理的文件。`mcp.contextMode` 设为 `'off'` 会禁用所有上下文增强，降低 LLM 开销但也会降低代理交互的响应质量。总体而言，在设置和升级过程中必须仔细审查此文件。
---