# ArchSpine 文档概要

## 文档目的

本文档是 ArchSpine 的**主要项目文档**。ArchSpine 是一个开源协议与工具链，它在 Git 仓库内部建立一个物理的 `.spine/` 控制平面。文档阐述了项目的高层愿景——让代码库对 AI 辅助工程具有可查询、可治理和可审计的能力——并为贡献者和维护者提供了所有必要的约定、命令和纪律指南。

## 读者对象

-   ArchSpine 自身的**开发者与维护者**
-   与该仓库交互的 **AI 代理**（例如，辅助编程的 AI 工作流）
-   任何需要理解 `.spine/` 控制平面如何构建、维护和使用的人

读者应熟悉 TypeScript、Node.js 和现代 Git 工作流。本文档是了解项目结构、开发实践以及维护 `.spine/` 制品一致性所需的严格提交纪律的入口。

## 本文档锚定的关键决策与工作流

### 技术栈与代码约定
-   技术栈严格限定：TypeScript 5 ESM、Node.js ≥20，并使用 Vitest、ESLint、Prettier、VitePress、better-sqlite3、@ast-grep/napi 和 MCP SDK。
-   强制执行的约定：显式的 `.js` 导入后缀、严格类型、2空格缩进、`camelCase`/`PascalCase` 命名、带可选范围的约定式提交。

### 架构分层
源码分为九个清晰的层级：`cli`、`core`、`engines`、`services`、`infra`、`tasks`、`types`、`utils`、`ast`。每一层都有明确的职责，从 CLI 派发到基础设施和 AST 提取。

### Git 工作流与提交纪律
-   从 `main` 创建特性分支，使用约定式提交。
-   **关于 `.spine/` 的关键规则**：源码变更与 `.spine/` 同步提交**必须分开**——绝不可混入同一次提交。
-   管线流程：修改源码 → 构建 → 提交源码 → 运行 `spine sync` → 提交 `.spine/` 刷新。
-   AI 代理必须运行正式的 `spine sync` 命令（不得直接编辑生成文件），并在提交前检查暂存文件的分类是否正确。

### 双语文档
所有文档以**英文**和**简体中文**维护，入口点保持一致。设计、规划和存档文档位于独立目录，不会被提升到公开导航中。

### 自举使用协议
`.spine/` 目录本身使用 ArchSpine 自己的协议；`config.json` 和 `rules/**` 是人工审查的控制平面文件。生成的输出（`.spine/index/**`、`.spine/atlas/**`、`.spine/view/**`）绝不可直接编辑，必须通过 `spine sync` 刷新。

---

本文档是 ArchSpine 开发约定、工具链设置和操作纪律的唯一权威来源。所有贡献者，无论是人还是 AI，都应从这里开始。