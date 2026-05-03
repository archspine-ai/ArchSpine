# `src/infra` – ArchSpine 的基础设施层

该目录是 ArchSpine 镜像系统的基础设施层，提供配置管理、LLM 客户端抽象、数据库操作、凭证存储、清单持久化、MCP 服务器集成和提示生成等核心服务，所有高层操作均依赖于此层。

## 主要子模块及其分组

各组件按逻辑领域组织如下：

| 领域 | 关键文件/子目录 | 用途 |
|------|-----------------|------|
| **配置管理** | `config/`、`config.ts`、`config-validation.ts` | 加载、验证并解析环境变量与默认值；提供 `resolveSpineConfig` 和 `validateSpineConfig` 的稳定 API。 |
| **凭证存储** | `credentials/`、`secrets.ts` | 可插拔的凭证存储系统，支持平台特定后端（macOS Keychain、Linux secret-tool、Windows DPAPI、内存）以安全管理 LLM API 密钥。 |
| **数据库** | `db/`、`db.ts`、`execution-checkpoint.ts` | 管理 SQLite 运行时数据库生命周期（WAL 日志模式、模式初始化、漂移检测、陈旧文件恢复）。`db.ts` 提供统一的 DAO 仓库，支持文件、漂移事件、符号缓存、令牌用量和违规记录的 CRUD 操作。 |
| **LLM 集成** | `llm/`、`llm.ts` | 客户端抽象、工厂模式、全局配置文件管理、指数退避重试机制以及具体提供商实现（OpenAI、Gemini 等）。 |
| **清单管理** | `manifest/`、`manifest.ts` | 文件状态追踪、SHA-256 哈希、确定性路径解析以及同步验证所需的状态持久化。 |
| **MCP 服务器** | `mcp/` | 实现模型上下文协议（MCP）服务器，使用 stdio 传输，向外部 AI 代理暴露项目元数据、文件内容、扫描、规则和历史漂移信息。 |
| **提示生成** | `prompt/`、`prompt-context/`、`prompt.ts`、`prompt-policy.ts`、`prompt-rendering.ts`、`lite-prompt.ts` | 流式提示构建器、策略解析、预算计算、裁剪、诊断工具以及针对 Markdown、源代码、配置、文档、文件夹和项目的专用提示生成器。`lite-prompt.ts` 提供令牌受限的“精简模式”提示。 |
| **运行时 I/O 与工具** | `runtime-io.ts`、`ui.ts`、`renderer.ts`、`index-reader.ts`、`output.ts`、`rules-loader.ts`、`writer-boundary.ts`、`spine-gate.ts`、`repository-artifacts.ts`、`repair-policy.ts`、`auth.ts` | 标准化的日志/警告/错误处理、可折叠的终端 UI、Markdown 文档渲染、索引文件读取与模式验证、`.spine` JSON 文件的输出 DAO、规则文档加载、写保护边界、未授权变更检测、仓库快照工具以及修复操作决策逻辑。 |
| **测试模拟** | `__mocks__/` | 提供 `MockClient` 的稳定公共导出，用于在测试中模拟 LLM 提供商交互。 |

## 重点实现领域

- **配置与凭证** – 控制其他所有基础设施行为的基础设置。
- **数据库（db/）** – 文件元数据、审计事件和系统状态的持久化核心。
- **LLM 抽象（llm/）** – 将系统与特定提供商解耦，并处理容错恢复。
- **提示系统（prompt/ + prompt-context/）** – 生成结构化、本地化且经过验证的提示，驱动 ArchSpine 的 AI 交互。
- **MCP 服务器（mcp/）** – 允许外部 AI 代理直接消费 ArchSpine 的资源与工具。
- **运行时 I/O（runtime-io.ts、ui.ts）** – 在整个应用程序中确保一致的用户交互体验与可测试性。

所有这些组件整合为一个统一的基础设施层，支撑着整个 ArchSpine 镜像系统的运行。