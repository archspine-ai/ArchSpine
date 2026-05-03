# ArchSpine 配置文件概述 (package.json)

本文解释 `package.json` 如何控制 ArchSpine CLI 工具链——包括包标识、运行时约束、构建流水线和发布工件。

## 项目标识
- **name**：`archspine`——用于 npm 注册表识别和项目引用。
- **version**：`1.0.0`——语义化版本号，影响发布兼容性。
- **description**："Architectural Governance & Semantic Layer for the AI Era"——项目用途的人类可读摘要。
- **author**：ArchSpine 团队。
- **license**：Apache-2.0——决定法律使用、分发和贡献条款。
- **repository**、**homepage**、**bugs**：指向 GitHub 项目主页和问题跟踪器。

## 入口点与 CLI
- **main**：`dist/cli/index.js`——包被引用时加载的入口模块；构建后必须存在。
- **bin**：将 `spine` 和 `archspine` 两个命令都映射到 `dist/cli/index.js`——定义 CLI 接口。
- **type**：`"module"`——强制 ES 模块，影响导入/导出的解析方式。

## 环境约束
- **engines**：`node >=20.18.1 <21 || >=22`——确保运行时稳定性；不满足条件会导致安装或执行失败。

## 发布文件控制
`files` 数组控制哪些文件随 npm 发布。它包括：
- `dist/`（排除 mock 和 source map 文件）
- `schemas/`——协议架构文件
- 文档：英文和中文 Markdown 文件、VitePress 文档源码等
- 许可证、变更日志、行为准则、贡献指南、安全政策、支持文件。

通过 `!` 前缀排除的内容防止测试 mock 和 source map 意外发布，从而减小包体积并避免敏感数据泄露。

## 脚本——自动化概览
脚本按用途分组：

### 构建
- `build`：生产构建（`scripts/build.mjs`）
- `dev:build`：开发构建

### 测试（CI 流水线）
- `test:ci`：先构建，再运行单元测试、架构合规测试和端到端测试
- `test:unit`：Vitest 单元测试
- `test:e2e`：Vitest 端到端测试
- `test:schema`：架构合规验证

### 文档
- `docs:dev`、`docs:build`、`docs:preview`：VitePress 相关工作流

### 代码格式与检查
- `lint` / `lint:fix`：ESLint 检查 TypeScript 文件
- `format:check`：Prettier 检查多种文件类型

### 发布与验证
- `validate`：协议资源验证
- `release:gate`：发布就绪检查
- `publish:placeholder`：占位发布脚本
- `pack:check`：试运行 `npm pack` 预览发布内容

### 快捷命令
- `spine:init`、`spine:sync`、`spine:publish`、`spine:check`、`spine:fix`——CLI 子命令的快捷方式
- `start`：直接运行编译后的 CLI
- `db:update-schema`：数据库架构更新脚本

## 依赖声明
- **devDependencies** 当前包括类型定义、测试工具（Vitest、ts-node）、代码格式与检查工具（ESLint、Prettier）、AJV 架构验证和 TypeScript 本身。
- **注意**：未声明 `dependencies` 字段。如果 CLI 有运行时依赖，必须添加，否则运行时将出现模块缺失错误。

## 操作风险与稳定性注意事项
- **引擎不匹配**：在低于 20.18.1 或处于 21.x 的 Node 版本上部署会失败。CI 必须强制使用正确的 Node 版本。
- **缺少构建产物**：`main` 和 `bin` 指向 `dist/`。如果未执行 `npm run build` 就运行 CLI，包将无法加载。
- **命令冲突**：`spine` 和 `archspine` 指向同一脚本。如果其他包也注册了 `spine`，可能发生冲突。
- **发布文件配置错误**：`files` 列表必须与实际构建输出和文档目录保持同步。列表过于严格可能导致 `npm pack` 失败。
- **依赖版本漂移**：`devDependencies` 使用语义化版本范围（如 `^5.0.0`）。这允许次要/补丁更新，但如果范围过宽可能引入破坏性变更。建议定期运行 `npm audit` 并更新。
- **缺少运行时依赖**：由于未声明 `dependencies`，任何运行时导入（例如 `better-sqlite3`、`commander`、`chalk`）都必须打包到构建产物中或在此列出。否则，用户安装包时会遇到模块缺失错误。
- **安全性**：排除 source map 和 mock 文件可减少数据暴露风险。但 README、LICENSE 和变更日志会被发布，需确保其中不包含敏感信息。

---