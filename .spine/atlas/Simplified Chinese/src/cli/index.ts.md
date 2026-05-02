<!-- spine-content-hash:7c89318ecab35bf20d89fdd03d7e2969d76e03580a0545ccf47acf6163b7f417 -->
## ArchSpine CLI 入口总结

**角色：**  
ArchSpine 语义镜像系统的主 CLI 入口和命令路由模块。

**主要职责：**
- 根据环境变量（`https_proxy` / `http_proxy`）在引入任何应用模块之前通过 undici 配置全局 HTTP 代理。
- 初始化核心基础设施服务（Config、Secrets、GlobalLLMConfig、RuntimeService）并检查 manifest baseline，从而引导运行时环境。
- 解析命令行参数（`process.argv`）以确定用户请求的操作，并路由执行到对应的命令执行模块（例如 init、sync、build、publish、check、fix、scan、history 等）。
- 显示系统 UI 横幅，提供帮助文本（`printGeneralHelp`、`printCommandHelp`），并通过 `throwCliUsage` 处理使用错误。
- 与 RuntimeService 交互以获取已解析的执行配置文件和配置状态，用于路由决策。

**重要不变性与负作用域：**
- CLI 必须保持为薄入口和路由，不能吸收本属于服务层、核心层或基础设施层的管道、持久化或业务逻辑。
- 所有命令实现必须位于 `./commands/` 下的独立模块中，并静态或动态导入，不得内联实现。
- 基于环境变量的代理配置必须在任何可能发起网络调用的其他导入之前进行。
- **不**实现任何具体命令（如 build、fix、scan）的实际逻辑；这些逻辑委托给 `./commands/` 下的专用模块。
- **不**直接执行数据持久化、LLM 交互或流水线执行。
- **不**管理除初始代理配置外的文件 I/O 或网络请求。
- **不**直接处理 git 操作或 manifest 修改。

**导出 / 外部可见行为：**
- CLI 可执行文件通过命令行调用（例如 `node main.js <命令> [选项]`）。
- 环境变量：`https_proxy`、`http_proxy`（用于 HTTP 代理配置）。
- 进程退出码（通过 `ErrorCodes` 和 `toArchSpineError`）。
- stdout/stderr 输出：横幅、帮助文本和进度消息。