# ArchSpine 仓库贡献与维护规范

## 文档目的

本文档是 ArchSpine 项目的核心守则，统一了代码结构、构建工具、编码风格、测试实践、提交约定以及文档同步的规范。它同时介绍了仓库内置的上下文系统（ArchSpine），帮助贡献者高效理解和使用项目资源。

## 目标读者

本文档面向 **实际参与 ArchSpine 代码库的开发者**，包括贡献者、维护者和审核者。读者应熟悉 TypeScript、Node.js 20+ 以及常见的 CLI 工作流。文档是新手入职与日常开发决策的唯一参考。

## 核心要点与决策锚点

以下要点锚定了关键的开发工作流和判断依据：

### 1. 仓库结构
- `src/`: TypeScript 源码（CLI 入口、核心引擎、服务、基础设施等）
- `tests/`: Vitest 测试套件（功能测试与隔离的基准测试）
- `research/`: 研究基准与语料（`research/bench/corpus/`）
- `docs/`: 公共文档（英文 + `docs/zh-CN/` 中文镜像）
- `schemas/`: JSON 模式定义
- `examples/demo-project/`: 参考演示工作区

### 2. 开发和构建命令
- 环境要求: Node.js 20+
- 核心命令: `npm install`, `npm run build`, `npm test`, `npm run validate`, `npm run docs:dev`
- CLI 示例: `node dist/cli/index.js sync`

### 3. 编码风格
- ES 模块、严格 TypeScript、2 空格缩进
- 命名: 变量/函数 `camelCase`，类/类型 `PascalCase`，文档/资源文件 `kebab-case`
- 导入使用显式 `.js` 后缀
- 提交前运行 `npm run lint` 和 `npm run format:check`

### 4. 测试要求
- 所有行为变更必须附带对应的 `*.test.ts` 测试
- CLI 流程、模式验证、运行时服务为重点测试区域
- 基准测试应隔离在 `research/bench/` 下，避免进入开源 CI 默认路径

### 5. 提交与 PR 规范
- 遵循 Conventional Commits（例如 `fix:`、`feat:`，可选作用域如 `feat(cli):`）
- PR 需说明变更内容、验证步骤、关联议题，并附上截图或终端输出（影响文档或 UX 时）

### 6. 文档同步
- 修改公共文档时，保持英文与中文（`docs/zh-CN/`）条目对齐
- 设计与规划文档位于 `docs/design/`、`docs/planning/`、`docs/archive/`，不应随意推广到公共导航

### 7. ArchSpine 上下文系统使用规则
- **优先阅读** `.spine/atlas/`（文件语义摘要）和 `.spine/view/pages/`（系统架构摘要）
- **精确数据需求** 时使用 `.spine/index/**`
- **首选** 本地 MCP 服务器访问仓库结构与上下文
- **控制面** 为 `.spine/config.json` 和 `.spine/rules/**`（人工审核）
- **禁止直接编辑** 生成的 `.spine/index/**`、`.spine/atlas/**`、`.spine/view/**`
- **刷新方式** 使用 `spine sync` 命令而非手动修改

本文档是开发团队达成一致的工作基准，所有贡献者应在其指导下协作，确保项目的一致性和可维护性。