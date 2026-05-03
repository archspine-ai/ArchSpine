# MCP 接入指南

ArchSpine 可以通过 STDIO MCP 服务，把本地 `.spine` 控制面暴露给兼容 MCP 的 AI 工具。

边界说明：该 MCP 面默认是只读语义面，不提供 `.spine` 写接口，也不提供通用仓库写接口。ArchSpine CLI/runtime 仍是正式 `.spine` 产物的 authoritative writer。这属于当前的协作边界与运行时安全模型，不宣称提供对同权限进程的强宿主隔离。

## 启动服务

```bash
spine mcp start
```

## Claude Desktop

将下面配置加入 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "archspine": {
      "command": "node",
      "args": ["/absolute/path/to/archspine/dist/cli/index.js", "mcp", "start"]
    }
  }
}
```

## Cursor

在 `Settings -> Features -> MCP` 中添加一个 `stdio` server：

```json
{
  "name": "ArchSpine",
  "type": "stdio",
  "command": "node",
  "args": ["/absolute/path/to/archspine/dist/cli/index.js", "mcp", "start"]
}
```

## Claude Code / CLI

```bash
claude mcp add archspine node /absolute/path/to/archspine/dist/cli/index.js mcp start
```

## Agent 可访问的内容

### Resources

- `spine://project`

### 可读取的 URI 模式

- `spine://folder/{path}`
- `spine://file/{filePath}`

### Tools

- `spine_query_invariants`
- `spine_query_responsibilities`
- `spine_preview_scan`
- `spine_get_drift_history`
- `spine_get_sync_status`
- `spine_get_baseline_status`
- `spine_get_violations_summary`
- `spine_list_resource_templates`

folder / file URI 在客户端已知模式后即可读取；当前服务公开列出的 resource 仍然只有 `spine://project`。
如果客户端需要用机器可读方式先发现 folder/file 的 URI 模式，可以调用 `spine_list_resource_templates`。

## 为什么用 MCP，而不是把整个仓库塞进 prompt

- 只按需获取 Agent 真正需要的仓库片段
- 让规则和职责信息始终贴近本地仓库
- 降低大型工程中的上下文漂移

进一步的运行说明见 [中文 Runbook](../how-to/RUNBOOK) 与 [中文 Specs 导航](../reference/)。
