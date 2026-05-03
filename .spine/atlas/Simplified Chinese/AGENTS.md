# ArchSpine 仓库指南

## 目的

本文档旨在为开发者和AI代理介绍ArchSpine仓库的目录结构、开发工作流、编码规范以及控制AI交互的ArchSpine上下文层，从而帮助新成员快速上手并保证贡献的一致性，同时支持维护者执行质量标准。通过集中化这些信息，本文档确保贡献的一致性，并帮助维护者落实质量标准。

## 读者对象

目标读者包括：

- **软件开发者**：需要理解如何浏览、构建、测试和贡献ArchSpine代码库。
- **维护者**：负责审查贡献并执行仓库标准。
- **AI代理**（如Claude或Copilot）：需要结构化指导以了解如何与仓库交互，包括ArchSpine控制平面和保护输出。

本文档是一份活的参考，在进行任何改动前应当查阅。

## 本文档所锚定的关键决策与工作流

以下决策与工作流已明确定义，所有贡献者应当遵循：

### 项目结构

- 源代码位于 `src/` 下，关键目录包括 `cli`、`core`、`engines`、`services`、`infra`、`assets/templates` 和 `ast/rules`。
- 测试代码位于 `tests/`（使用Vitest），研究和基准资产位于 `research/bench/`。
- 公共文档配有英文和中文镜像；`docs/zh-CN/` 必须保持与英文同步。
- JSON模式文件位于 `schemas/`，`examples/demo-project/` 作为参考演示工作区。

### 开发工作流

- 需要Node.js 20+。
- 标准命令：`npm install`、`npm run build`、`npm test`。
- 附加命令：`npm run test:schema`、`npm run validate`、`npm run docs:dev`，以及通过 `node dist/cli/index.js` 直接运行CLI。

### 编码规范与命名约定

- 严格使用TypeScript、ES模块、明确的 `.js` 导入后缀、`strict` 类型检查，以及2空格缩进。
- 命名规则：变量/函数使用 `camelCase`，类/类型使用 `PascalCase`，文档/资产文件名使用kebab-case。
- 通过ESLint、Prettier和EditorConfig强制格式和 lint；提交前运行 `npm run lint` 和 `npm run format:check`。

### 测试指南

- 使用Vitest作为测试运行器，配置在 `vitest.config.ts` 中。
- 测试文件遵循 `tests/` 下的 `*.test.ts` 模式。
- 每次行为变更都需添加或更新测试，特别是CLI流程、模式验证和运行时服务。
- 提供独立的模式合规性和协议验证测试套件。

### 提交与拉取请求约定

- 提交信息必须遵循Conventional Commits格式（例如 `fix:`、`feat:`、`feat(cli):`）。
- 拉取请求必须包含行为变更说明、验证步骤以及相关issue的链接。
- 若变更涉及文档、演示或CLI用户体验，需附上截图或终端输出。

### AI代理的ArchSpine上下文

- `.spine/` 目录充当控制平面：
  - `.spine/atlas/`：文件级语义摘要。
  - `.spine/view/pages/`：系统级架构摘要。
  - `.spine/index/`：精确的结构化数据。
- AI代理应优先通过MCP服务器读取，而非手动搜索文件。
- 切勿直接编辑 `.spine/atlas/`、`.spine/view/` 或 `.spine/index/` 中的生成内容；应使用 `spine sync` 刷新。
- `.spine/config.json` 和 `.spine/rules/` 是人工审查的控制平面文件。

### 文档维护

- 公共文档需保持英文和中文入口同步。
- `docs/design/`、`docs/planning/` 和 `docs/archive/` 下的规划和设计资料，除非有意，否则不应提升至公共导航。