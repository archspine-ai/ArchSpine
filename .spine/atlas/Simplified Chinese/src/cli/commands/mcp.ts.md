<!-- spine-content-hash:e117a8dd04548fde000352fe2cad7d3e0e865d22cba8b9f04f46f3e0a1bfd42d -->
# ArchSpine MCP CLI 适配器

## 角色
用于启动 ArchSpine 模型上下文协议（MCP）服务器的 CLI 命令适配器。

## 主要职责
- 解析 `mcp` 子命令的命令行参数。
- 当调用 `start` 子命令时，实例化并启动 `ArchSpineMCPServer`。
- 提供结构化接口（`ExecuteMcpCommandOptions`）用于 MCP 命令执行选项。
- 将服务器生命周期管理委托给基础设施层中专用的 MCP 服务器实现。

## 重要不变性与负面范围
- **必须保持为薄适配器** – 所有 MCP 服务器逻辑属于基础设施层（`infra/mcp/server`）。
- **不得吸收** 业务逻辑、流水线或持久化职责。
- **范围外**：实现 MCP 服务器逻辑、持久化或流水线操作，以及超出基本子命令路由的复杂命令行参数验证。

## 最重要的导出/外部可见行为
- `ExecuteMcpCommandOptions` 接口
- `executeMcpCommand` 函数