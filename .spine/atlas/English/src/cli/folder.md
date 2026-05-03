---MARKDOWN:Simplified Chinese---
`src/cli` 目录是 ArchSpine 语义镜像系统的命令行界面层，负责处理用户交互、参数解析、命令路由、帮助显示、输出格式化和 UI 呈现。该目录以 `index.ts` 作为主入口，包含通用工具模块（`cli-utils.ts`、`document-languages.ts`、`help.ts`），以及三个子目录来分组管理特定命令族的适配器和引导逻辑。

- **`index.ts`** 是主 CLI 路由器：配置全局代理设置，引导运行时服务（Config、Secrets、GlobalLLMConfig、RuntimeService），解析 `process.argv` 并将执行分派到相应的子命令模块（如 init、sync、build、publish、check、fix、scan、history 等），同时提供帮助和用法错误处理。

- **`cli-utils.ts`** 提供展示工具：横幅显示（完整版 vs. 精简版）、步骤打印、语言发现报告格式化、文本换行、配置值解析与格式化，以及针对无效 CLI 用法的类型化错误生成。

- **`document-languages.ts`** 定义了多语言文档选择的类型和构建函数，包括高容量语言等级的分离器。

- **`help.ts`** 渲染通用帮助（按类别列出所有命令）以及特定命令（init、try、sync 等）的详细帮助。

- **`src/cli/commands/`** 包含每个子命令（build、check、config、fix、god、history、hook、info、init、languages、llm、mcp、publish、remove、repo、scan、status、sync、try、usage、view）的独立命令适配器模块，每个适配器处理参数验证并委托执行给核心服务。

- **`src/cli/init/`** 实现仓库和运行时的引导：制品策略选择、LLM 凭据配置、文件扫描、语言发现、清单更新以及 Git 钩子安装。

- **`src/cli/repo/`** 通过 `check` 和 `set` 命令管理制品策略操作，解析策略输入、提供进度反馈并读取系统配置。

需要关注的关键实现区域：`index.ts` 中的代理配置和服务引导顺序；`cli-utils.ts` 中尊重 `SPINE_INTERNAL_HOOK` 环境变量的双横幅系统；以及将命令适配器分离到 `commands/` 下的独立文件中以实现模块化和可测试性。