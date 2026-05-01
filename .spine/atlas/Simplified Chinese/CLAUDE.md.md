<!-- spine-content-hash:6bf4d8bb67e0b32344c867a0012f555d6e2064ee80bf311468f4db7bf263c1df -->
# ArchSpine 项目概述

## 目的

本文档是 ArchSpine 项目的核心入门与治理参考。它阐述了 ArchSpine 存在的意义——在 Git 仓库内嵌入一个物理的 `.spine/` 控制平面，使代码库对 AI 辅助工程可查询、可治理、可审计。同时定义了技术栈、开发规范以及维护 `.spine/` 分发制品完整性所需的严格提交纪律。

## 上下文与目标读者

目标读者包括需要理解项目架构、贡献代码或运行 spine 同步管线的开发者、AI 代理和维护者。本文档假定读者熟悉 TypeScript、Node.js、Git 和 Conventional Commits，尤其适用于任何在 `.spine/` 控制平面文件上工作或与之交互的人员。

## 核心职责

- 描述 ArchSpine 项目作为 AI 辅助工程的架构治理与语义层的定位
- 记录技术栈、常用命令、代码规范和架构层次
- 定义 `.spine/` 控制平面的 Git 工作流、提交纪律和维护边界
- 规定双语文档要求及管线的使用方式

## 不涵盖的内容

- 详细的 API 参考或函数级文档
- 教程或分步使用指南
- 贡献者许可或社区治理政策
- 历史变更日志或发布说明

## 关键要点

- ArchSpine 是一个开源协议与工具链，通过在 Git 仓库内创建 `.spine/` 控制平面，实现面向 AI 时代的架构治理
- 技术栈包括 TypeScript 5（严格模式、ESM）、Node.js >=20、Vitest、ESLint、Prettier、VitePress、better-sqlite3、`@ast-grep/napi` 和 MCP SDK
- 代码规范要求使用带 `.js` 导入后缀的 ES 模块、2 空格缩进、camelCase/PascalCase 命名以及带可选作用域的 Conventional Commits
- 架构分为 `cli/`、`core/`、`engines/`、`services/`、`infra/`、`tasks/`、`types/`、`utils/` 和 `ast/` 等多个层次
- 提交纪律要求将源码变更与 `.spine/` 同步更新分两次独立提交，仅 `config.json` 和 `rules/` 等人工程序控制文件例外