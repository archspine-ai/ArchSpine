---MARKDOWN:Simplified Chinese---
# ArchSpine 仓库指南摘要

## 目的
本文档是开发和维护 ArchSpine 镜像系统仓库的权威参考。它定义了项目结构、开发规范、构建和测试命令、编码标准，以及 AI 代理交互的关键协议。ArchSpine 镜像系统是一个上下文感知层，旨在帮助 AI 代理理解代码库，因此本文档对于人类开发者与 AI 助手之间的一致性协作至关重要。

## 目标读者
指南主要面向两类群体：
- **人类开发者**：贡献于 ArchSpine 项目，包括修改 CLI、核心引擎、服务、基础设施、文档或架构图的开发者。
- **AI 代理**（如代码助手）：需要高效浏览仓库，并遵循关于上下文检索、MCP 使用和输出保护既定协议的代理。

## 本文档锚定的关键决策与工作流
- **项目结构**：仓库组织为 `src/`、`tests/`、`research/`、`docs/`、`schemas/` 和 `examples/`，各有特定用途。理解此布局对于定位代码和添加新功能至关重要。
- **开发命令**：需要 Node.js 20+。标准命令包括 `npm run build`、`npm test`、`npm run test:schema`、`npm run validate` 和 `npm run docs:dev`，构成核心开发工作流。
- **编码规范**：TypeScript ES 模块，严格类型检查，2 空格缩进，导入使用显式 `.js` 后缀，以及特定的命名约定（`camelCase`、`PascalCase`、`kebab-case`）。这确保代码一致性。
- **测试指南**：基于 Vitest 的测试必须伴随行为变更，特别是 CLI 流程、架构验证和运行时服务。
- **提交和 PR 约定**：采用常规提交风格（例如 `fix:`、`feat:`），可选作用域。PR 描述必须包括行为变更、验证步骤和问题链接。
- **文档对齐**：英文和中文文档必须保持一致；`.spine/` 目录为生成内容，不得手动编辑。
- **AI 代理协议**：代理应优先使用 `.spine/atlas/` 和 `.spine/view/pages/` 而非全局搜索，使用本地 MCP 服务器，并避免修改生成内容。使用 `spine sync` 命令刷新托管输出。