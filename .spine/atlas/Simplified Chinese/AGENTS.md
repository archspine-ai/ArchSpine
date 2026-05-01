# ArchSpine 仓库指南

## 文档目的

本文档是 ArchSpine 项目贡献者的核心参考指南，定义了仓库结构、开发流程、编码规范、测试要求以及文档维护惯例，以确保所有贡献的一致性。

## 目标读者

目标读者为 ArchSpine 代码库的开发者和维护者，尤其适合新贡献者了解项目组织方式、如何运行构建与测试、以及如何遵循提交、拉取请求和文档更新的既定规范。文档还包含针对 AI 代理和开发者的 ArchSpine 专用指令，指导如何与仓库的语义索引及控制平面交互。

## 关键决策与工作流程

### 项目结构

源代码位于 `src/` 目录下，清晰划分为 CLI、核心、引擎、服务、基础设施和资产等模块。测试代码位于 `tests/`，公开文档位于 `docs/`（中文镜像位于 `docs/zh-CN/`），JSON 模式定义位于 `schemas/`。`examples/demo-project/` 目录作为参考演示工作区。

### 开发环境

使用 Node.js 20+、ES 模块和严格 TypeScript。关键命令包括 `npm install` 安装依赖、`npm run build` 编译代码、`npm test` 运行完整的 Vitest 测试套件，以及 `npm run docs:dev` 启动本地文档服务器。

### 编码规范

遵循现有 TypeScript 风格：ES 模块、显式 `.js` 导入后缀、严格类型检查和 2 空格缩进。变量和函数使用 `camelCase` 命名，类和类型使用 `PascalCase` 命名，文档和资产文件名使用 kebab-case。由于仓库未提交专用的格式化或 lint 配置，提交前请紧密匹配周围代码风格。

### 测试要求

每次行为变更都需添加或更新 Vitest 测试。默认产品测试套件覆盖 `tests/**/*.test.ts` 和 `tests/**/*.bench.ts`。重点测试 CLI 流程、模式验证和运行时服务。

### 提交与拉取请求规范

遵循 Conventional Commits 格式（例如 `fix:`、`feat:`、`feat(cli):`）。保持提交聚焦且描述清晰。拉取请求应说明行为变更、列出验证步骤、关联相关问题，并在更改文档、演示或 CLI 用户体验时附上截图或终端输出。

### 文档维护

修改文档时保持英文和中文版本同步。使用 `docs/temporary-to-be-cleared/` 目录作为临时变更日志，记录新功能和架构变更。后续由定期清理代理将相关内容整合到正式文档中。

### ArchSpine 上下文管理

ArchSpine 上下文通过 `.spine/` 文件管理。在进行广泛的仓库搜索前，优先查阅 `.spine/atlas/` 获取文件级语义摘要，以及 `.spine/view/pages/` 获取系统级架构摘要。使用 `spine sync` 刷新生成内容，切勿直接编辑 `.spine/index/**`、`.spine/atlas/**` 或 `.spine/view/**`。将 `.spine/config.json` 和 `.spine/rules/**` 视为主要的人工审核控制平面文件。