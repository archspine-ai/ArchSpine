# ArchSpine MCP 架构

本文档说明 ArchSpine 如何把 `.spine` 资产转成一个本地 MCP 表面，让 AI Agent 不需要把整个仓库塞进 prompt，也能查询仓库结构。

## 为什么这里需要 MCP

当 Agent 在复杂仓库里没有可靠结构时，最常见的问题就是实现错误。ArchSpine 用 MCP 暴露一个可查询的控制面，而不是让模型在全量源码中盲猜。

优势：

- 只取真正需要的上下文，降低 token 压力
- 数据来自确定性提取，语法和架构锚点更稳定
- Cursor、Claude Desktop、Claude Code 等工具都能走同一条接入路径

## `v0.4` 当前架构

当前 MCP Server 是本地 STDIO 服务，不需要额外基础设施。

当前版本的边界姿态：

- ArchSpine CLI/runtime 仍是 `.spine` 正式产物的 authoritative writer。
- MCP 刻意保持只读，不属于 writer path inventory。
- 普通本地 Agent 可以消费 MCP 数据、修改仓库源码，但不是 `.spine/index/**`、`.spine/atlas/**`、`.spine/cache.db*`、`.spine/.lock` 的正式 writer。

### Resources

当前运行时行为：

- 列出的 resource：`spine://project`
- 可读取的 URI 模式：
  - `spine://folder/{dirPath}`
  - `spine://file/{filePath}`

这些资源最终都映射到 `.spine/index/` 里的 JSON 契约；文件级读取会在返回前剥离部分噪音字段。

### Tools

当前已发布的工具：

- `spine_query_invariants`
- `spine_query_responsibilities`
- `spine_preview_scan`
- `spine_get_drift_history`

这组工具让 Agent 可以查询规则、定位职责文件、检查扫描边界、读取漂移历史，而不必手工遍历整个仓库。

### 失败模式

如果 `.spine` 资产还不存在，MCP 层会返回明确错误，引导用户先执行 `spine init` 和 `spine sync`，而不是直接让进程崩溃。

## 接入方式

### Cursor

配置一个 `stdio` MCP server，运行：

```bash
node /absolute/path/to/archspine/dist/cli/index.js mcp start
```

### Claude Desktop

在 `claude_desktop_config.json` 里挂载同样的命令。

### Claude Code / 终端客户端

使用：

```bash
claude mcp add archspine node /absolute/path/to/archspine/dist/cli/index.js mcp start
```

## 宿主部署约定

当前建议的部署契约是：

- Agent 在普通可写仓库里进行日常源码修改
- 受保护的 `.spine` 输出默认保持只读
- `spine` 受信命令在写入前临时解锁 protected outputs，写完后再次回锁
- 这是一条依赖宿主协助的安全边界，面向同权限正常工作流；它不是针对同权限恶意进程的强隔离模型

## 设计方向

本地 MCP Server 的作用，是让仓库语义直接成为 Agent 可消费的工程上下文：

- `spine://project` 提供全局拓扑
- folder / file URI 支持按需下钻
- MCP 工具暴露治理和搜索路径，而不是依赖 raw-code 猜测

这与 ArchSpine 的核心定位一致：在明确约束下实现确定性的仓库理解。
