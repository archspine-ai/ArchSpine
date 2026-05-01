<!-- spine-content-hash:b51a8022e11eb47172d04d6b43e80afbf6432f5f28375f224f8fd01e89956788 -->
# ArchSpine CLI 入口点

## 角色
ArchSpine 语义镜像系统的主 CLI 入口和命令路由器。

## 主要职责
- 在导入其他模块之前，基于环境变量通过 undici 配置全局 HTTP 代理。
- 通过初始化核心基础设施服务（Config、Secrets、LLM 配置）和 RuntimeService 来引导运行时环境。
- 解析命令行参数以确定请求的操作，并路由到相应的命令执行器（例如 init、sync、build、publish、check、fix、scan、history 等）。
- 显示系统 UI 横幅并提供命令帮助文本。

## 重要不变性与负面范围
- **不变性：** CLI 入口点必须保持精简，不吸收管道或持久化逻辑（规则：cli-entrypoint-separation）。
- **范围外：** 管道或持久化逻辑——委托给 services、core、engines 或 infra 模块。
- **范围外：** 单个命令的业务逻辑——委托给命令模块（例如 init、sync）。

## 最重要的导出/外部可见行为
- 该模块是主要的 CLI 入口点，直接从命令行调用。
- 它执行早期代理配置、运行时引导、参数解析和命令路由。
- 不暴露任何领域逻辑；所有业务操作都委托给专用的命令模块和服务。