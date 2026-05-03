# `src/infra` – 核心基础设施层

`src/infra` 目录为整个 ArchSpine 镜像系统提供了基础服务，涵盖配置管理、SQLite 数据库生命周期、多供应商大语言模型（LLM）客户端抽象、凭据存储、文件完整性追踪、面向外部 AI 代理的 MCP 服务器、提示词组装、运行时输入输出以及治理工具。

## 主要子模块及分组

- **`config/`** – 配置管理子系统。核心文件：`config-validation.ts`（`resolveSpineConfig` 与 `validateSpineConfig` 的门面）、`config.ts`（公开 API 总出口）。

- **`db/`** – SQLite 数据库基础设施。核心文件：`db.ts`（统一门面，提供文件追踪、符号导出、LLM 指标、规则违规记录、批量提交等功能）。

- **`llm/`** – LLM 客户端抽象层。核心文件：`llm.ts`（门面，导出 `createResolvedLLMClient`、`resolveLLMSettings` 及供应商工具函数）。

- **`credentials/`** – 跨平台凭据存储，支持 macOS 钥匙串、Linux secret-tool、Windows DPAPI 及内存后端。

- **`manifest/`** – 文件系统交互与完整性校验。核心文件：`manifest.ts`（公开 API，提供 `Manifest` 类和 `hasManifestBaseline` 查询）。

- **`mcp/`** – 模型上下文协议（MCP）服务器，向外部 AI 代理暴露内部资源与工具。

- **`prompt/`** – 提示词组装与编排。核心文件：`prompt.ts`（公开门面）、`renderer.ts`（Markdown 生成）、`repository-artifacts.ts`（Git 与文件操作）。

- **`prompt-context/`** – 提示词策略与构建基础设施。核心文件：`prompt-context.ts`（导出预算配置、验证策略、构建器函数）。

- **`src/infra/` 下的其他重要文件**：
  - `runtime-io.ts` – 标准化的 I/O 接口，用于日志、警告、错误、用户确认。
  - `spine-gate.ts` – 检测受保护输出目录中的未授权变更。
  - `repair-policy.ts` – 根据违规报告决定修复操作的逻辑。
  - `secrets.ts` – 安全获取 LLM 凭据的门面。
  - `output.ts` – 读写 Spine 索引 JSON 文件的数据访问对象。
  - `execution-checkpoint.ts` – 重试系统的检查点状态管理器。
  - `index-reader.ts` – 索引文档读取与校验，包含模式兼容性检查。
  - `lite-prompt.ts` – 面向低精度「精简模式」的令牌受限提示词构建器。
  - `writer-boundary.ts` – 对 `.spine/` 目录的写保护。
  - `rules-loader.ts` – 规则文档的加载与解析。
  - `ui.ts` – CLI 可折叠控制台输出工具。

## 关键实现领域

1. **配置管理** – 所有设置的安全解析与校验。
2. **数据库操作** – SQLite 生命周期、原子批量提交、语义漂移检测。
3. **大语言模型集成** – 统一的多供应商客户端，含重试与配置合并。
4. **凭据存储** – 跨平台安全秘密持久化。
5. **文件系统清单** – SHA-256 哈希、漂移追踪、基线检测。
6. **MCP 服务器** – 为外部 AI 代理提供带上下文门控的内部资源访问。
7. **提示词组装** – 流畅构建器、策略层级、预算计算、本地化支持。
8. **治理工具** – 变更检测（`spine-gate.ts`）、修复策略（`repair-policy.ts`）、写保护（`writer-boundary.ts`）、规则加载（`rules-loader.ts`）。