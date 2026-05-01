# ArchSpine 项目概述

## 文档目的

本文档是 ArchSpine 项目的核心入门与治理参考。它阐述了 ArchSpine 存在的意义——在 Git 仓库内嵌入一个物理的 `.spine/` 控制平面，使代码库对 AI 辅助工程可查询、可治理、可审计。同时定义了技术栈、开发规范以及维护 `.spine/` 分发制品完整性所需的严格提交纪律。

## 目标读者

目标读者包括需要理解项目架构、贡献代码或运行 spine 同步管线的开发者、AI 代理和维护者。本文档假定读者熟悉 TypeScript、Node.js、Git 和 Conventional Commits，尤其适用于任何在 `.spine/` 控制平面文件上工作或与之交互的人员。

## 关键决策与工作流程

### 技术栈与规范

项目采用 TypeScript 5（严格模式、ESM）、Node.js >=20、Vitest 进行测试、ESLint 配合 Prettier 进行代码检查、VitePress 构建文档、better-sqlite3 实现本地缓存、@ast-grep/napi 支持多语言 AST 提取，以及 MCP SDK 实现 STDIO 服务器通信。代码规范要求使用带 `.js` 导入后缀的 ES 模块、2 空格缩进、camelCase/PascalCase 命名以及带可选作用域的 Conventional Commits。

### 架构分层

源代码按九个层次组织在 `src/` 目录下：

- **cli/** — 入口与命令分发（薄层）
- **core/** — 领域类型、错误处理、管线、任务状态
- **engines/** — 业务逻辑（扫描器、规则、检查器、修复器、上下文）
- **services/** — 运行时编排（同步、检查、修复、查看）
- **infra/** — 基础设施（配置、数据库、LLM、MCP、输入输出、提示）
- **tasks/** — 独立任务实现
- **types/** — 协议类型定义
- **utils/** — 共享工具函数
- **ast/** — AST 提取与语言发现

### 提交纪律

`.spine/` 目录是一个分发制品，需要纳入 Git 跟踪。它必须遵循严格的提交纪律：

1. **先改源码，再同步**：修改逻辑（src/、rules/ 等）→ `npm run build` → 提交源码改动。然后单独运行 `spine sync` → 提交 `.spine/` 刷新。这两个步骤必须分两次独立提交，不得混入同一次提交。
2. **源码提交中不得夹带 `.spine/` 噪音**：如果工作区里的 `.spine/` 已有脏改动（格式、缓存等），在提交源码前先用 `git checkout -- .spine/` 还原，让 `.spine/` 跟随 sync 单独提交。例外：`.spine/config.json` 和 `.spine/rules/**` 等人工程序控制文件可以随源码修改一起提交。
3. **AI 代理操作规范**：AI 代理必须使用 `node dist/cli/index.js sync` 来刷新 `.spine/`，不得直接编辑生成文件。提交前必须运行 `git status` 确认暂存文件的分类正确。

### 文档要求

所有文档必须提供英文和简体中文双语版本，并保持入口点对齐。`docs/design/`、`docs/planning/` 和 `docs/archive/` 下的设计与规划文档不应被提升到公共导航中。文档的临时变更记录应首先保存在 `docs/temporary-to-be-cleared/` 目录下，由定期运行的同步代理负责后续整合。