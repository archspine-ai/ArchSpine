---
outline: deep
---

# MCP 工具、资源与提示词参考

ArchSpine MCP 服务器的完整参考文档。该服务器通过 STDIO 传输层基于 JSON-RPC 协议暴露 21 个工具、4 个资源 URI 模板和 2 个提示词。

**源码：** `src/infra/mcp/server.ts`、`src/infra/mcp/tools.ts`、`src/infra/mcp/resources.ts`、`src/infra/mcp/context.ts`。

## 服务器概览

| 属性           | 描述                                           |
| -------------- | ---------------------------------------------- |
| **传输层**     | STDIO                                          |
| **协议**       | JSON-RPC（via `@modelcontextprotocol/sdk`）    |
| **服务器名称** | `archspine-mcp`                                |
| **版本**       | 当前包版本（`src/types/protocol/versions.ts`） |
| **能力**       | `resources`、`tools`、`prompts`                |
| **只读**       | 是。所有工具均不会写入 `.spine/` 协议制品。    |
| **源码**       | `src/infra/mcp/server.ts`                      |

### 启动服务器

```bash
spine mcp start
```

该命令实例化 `ArchSpineMCPServer`，注册工具、资源和提示词处理器，并通过 `StdioServerTransport` 建立连接。启动信息输出至 stderr。

### 前置条件

大多数工具需要 `.spine/` 已存在并已初始化。例外情况是 `spine_get_baseline_status` 和 `spine_get_sync_status`，这两个元工具可在没有 `.spine/` 的情况下工作。使用服务器前请先运行 `spine init` 和 `spine build`。

---

## MCP 工具

所有工具定义在 `src/infra/mcp/tools.ts` 的 `SpineTools.getToolDefinitions()` 中。工具分为五类：查询、上下文、状态、视图和操作。

### 查询工具

#### 1. `spine_query_invariants`

查询代码库强制执行的不变量（规则）。在修改关键路径前使用此工具，以确保架构边界不被破坏。

**参数**

| 参数          | 类型     | 必填 | 默认值 | 描述                                                     |
| ------------- | -------- | ---- | ------ | -------------------------------------------------------- |
| `invariantId` | `string` | 否   | --     | 特定规则的 ID。不传时返回所有规则。                      |
| `filePath`    | `string` | 否   | --     | 相对文件路径。设置后将仅返回 glob 模式匹配该文件的规则。 |

**返回模式：** 格式化文本。当提供 `invariantId` 且找到时，返回包含所有字段（ID、标题、严重级别、适用范围、摘要、理由、bodyMarkdown）的单一规则。否则返回规则列表，格式为 `- ruleId (sourceFile) [severity]: summary`。

**校验：** `filePath` 通过 `normalizeToolFilePath` 进行安全处理——拒绝空字节、绝对路径和路径遍历（`..` 段）。

**前置条件：** `.spine/rules/` 目录必须存在。

---

#### 2. `spine_query_responsibilities`

搜索系统中处理特定职责或角色的文件。

**参数**

| 参数      | 类型     | 必填   | 默认值 | 描述                                 |
| --------- | -------- | ------ | ------ | ------------------------------------ |
| `keyword` | `string` | **是** | --     | 在文件语义角色和职责中搜索的关键词。 |

**返回格式：**

```
Files matching '<keyword>':
- /path/to/file.ts: Role name
```

**行为：**

1. 从 `manifest.json` 读取所有被追踪的文件。
2. 对每个文件，从 `.spine/index/<path>.json` 读取其索引条目。
3. 检查 `semantic.role` 和 `semantic.responsibilities[]` 中是否存在大小写不敏感的 substring 匹配。
4. 对无效、不兼容或不可读的索引条目报告警告。

**前置条件：** 需要运行时 baseline（`manifest.json`）。缺少时抛出 `MCP_RUNTIME_BASELINE_INCOMPLETE`。

---

#### 3. `spine_search_symbols`

按名称在代码库中搜索代码符号（导出项、函数、类）。优先使用精确匹配，失败时回退到模糊子串搜索。

**参数**

| 参数    | 类型      | 必填   | 默认值  | 描述                                                      |
| ------- | --------- | ------ | ------- | --------------------------------------------------------- |
| `query` | `string`  | **是** | --      | 要搜索的符号名称。执行子串匹配（LIKE %query%）。          |
| `exact` | `boolean` | 否     | `false` | 如果为 true，仅使用精确名称匹配（更快，使用数据库索引）。 |
| `limit` | `number`  | 否     | `50`    | 最大返回结果数。                                          |

**返回模式：**

```json
{
  "query": "<query-string>",
  "exact": false,
  "totalMatches": 5,
  "matches": [
    {
      "name": "Config",
      "filePath": "src/infra/config.ts"
    }
  ],
  "truncated": false
}
```

**行为：**

1. 在精确模式下调用 `manifest.resolveSymbol(query)` 进行 O(1) 查找。
2. 在模糊模式下调用 `manifest.searchSymbols(query, limit)` 在所有已索引符号中进行子串匹配。
3. 返回包含查询元数据、匹配计数和匹配数组的 JSON 对象。

**数据源：** 从 `manifest.json` 索引中解析符号。

**前置条件：** 需要运行时 baseline（`manifest.json`）。如果 `.spine/` 未初始化，则返回空匹配数组。

---

#### 4. `spine_match_semantic`

跨模块角色、职责和不变量进行语义关键词搜索。支持逗号分隔的 OR 组和空格分隔的 AND 条件。

**参数**

| 参数    | 类型     | 必填   | 默认值 | 描述                                                                                                            |
| ------- | -------- | ------ | ------ | --------------------------------------------------------------------------------------------------------------- |
| `query` | `string` | **是** | --     | 搜索查询。逗号 = OR，空格 = 组内 AND。示例：`"auth, database cache"` 匹配 auth 或 (database AND cache) 的模块。 |
| `limit` | `number` | 否     | `50`   | 最大返回匹配数。                                                                                                |

**返回模式：**

```json
{
  "query": "<query-string>",
  "totalMatches": 5,
  "matches": [
    {
      "moduleId": "src/infra/db",
      "path": "src/infra",
      "matchScore": 0.85,
      "matchFields": ["responsibilities", "role"]
    }
  ],
  "truncated": false
}
```

**查询语法：**

- 逗号分隔的组 = OR 逻辑：`"auth, database"` 匹配任一。
- 组内的空格 = AND 逻辑：`"database cache"` 两者均需匹配。
- 逗号 + 空格 = 包含 AND 条件的 OR 组：`"auth, database cache"` 匹配 auth 或 (database AND cache)。

**数据来源：** `.spine/view/data/knowledge-graph.json`。

**前置条件：** knowledge graph 必须存在（`spine sync`）。

---

#### 5. `spine_query_graph`

查询模块级别的 knowledge graph。按源模块、目标模块、边类型、合规状态或架构层过滤依赖边。

**参数**

| 参数        | 类型      | 必填 | 默认值     | 描述                                                     |
| ----------- | --------- | ---- | ---------- | -------------------------------------------------------- |
| `from`      | `string`  | 否   | --         | 源模块 ID 过滤器，例如 `src/engines`。                   |
| `to`        | `string`  | 否   | --         | 目标模块 ID 过滤器，例如 `src/core`。                    |
| `type`      | `string`  | 否   | `"import"` | 边类型过滤器。                                           |
| `compliant` | `boolean` | 否   | --         | 为 `true` 时仅返回合规边；为 `false` 时仅返回违规边。    |
| `layer`     | `string`  | 否   | --         | 筛选源或目标模块属于该架构层的边，例如 `core`、`infra`。 |
| `limit`     | `number`  | 否   | `50`       | 最大返回边数。                                           |

**返回模式：**

```json
{
  "totalEdges": 120,
  "returnedEdges": 3,
  "edges": [
    {
      "from": "src/services",
      "to": "src/infra",
      "type": "import",
      "compliant": true
    }
  ],
  "nodeSummary": [
    {
      "id": "src/services",
      "path": "src/services",
      "layer": "services",
      "role": "runtime-orchestration",
      "fanIn": 2,
      "fanOut": 5
    }
  ],
  "truncated": false
}
```

**数据来源：** `.spine/view/data/knowledge-graph.json`。如果 knowledge graph 文件缺失或不可读，则返回错误 JSON 对象。

**前置条件：** knowledge graph 必须存在（`spine sync`）。

---

#### 6. `spine_get_module_context`

获取单个模块的完整治理上下文：语义角色和职责、上游/下游依赖、活跃的规则违规以及诊断标记（循环依赖、死代码、hub 状态）。

**参数**

| 参数         | 类型     | 必填   | 默认值 | 描述                                                                        |
| ------------ | -------- | ------ | ------ | --------------------------------------------------------------------------- |
| `modulePath` | `string` | **是** | --     | 相对文件路径或模块 ID，例如 `src/engines/graph-query.ts` 或 `src/engines`。 |

**返回模式：**

```json
{
  "moduleId": "src/engines",
  "semantic": {
    "role": "business-logic",
    "responsibilities": ["graph-querying", "rule-checking"],
    "invariants": ["no-direct-db-access"],
    "publicSurface": ["queryGraph", "matchSemantic"]
  },
  "graph": {
    "fanIn": 3,
    "fanOut": 7,
    "violationCount": 1
  },
  "upstream": [
    {
      "moduleId": "src/core",
      "path": "src/core",
      "layer": "core",
      "role": "domain-types",
      "distance": 1
    }
  ],
  "downstream": [
    {
      "moduleId": "src/services",
      "path": "src/services",
      "layer": "services",
      "role": "runtime-orchestration",
      "distance": 1
    }
  ],
  "violations": [
    {
      "from": "src/engines",
      "to": "src/infra/db",
      "ruleRef": "no-direct-db-access",
      "compliant": false
    }
  ],
  "diagnostics": {
    "cycles": [],
    "deadCode": [],
    "hubs": [{ "fanIn": 15, "percentile": 92 }]
  }
}
```

**模块解析：** 使用最长前缀匹配将文件路径解析为 knowledge graph 中的模块 ID。如果未找到匹配的模块，则返回错误。

**数据来源：** knowledge graph、诊断目录（`cycles.json`、`dead-code.json`、`hubs.json`）以及来自 `violationEdges()` 的违规边。

**前置条件：** knowledge graph 和诊断数据必须存在（`spine sync`）。

---

### 上下文工具

#### 7. `spine_get_file_context`

获取单个文件的完整治理上下文：匹配的规则、语义角色和职责、依赖、公共接口、导出和 drift 信息。在修改任何文件之前使用此工具，以了解其架构约束。

**参数**

| 参数       | 类型     | 必填   | 默认值 | 描述                                   |
| ---------- | -------- | ------ | ------ | -------------------------------------- |
| `filePath` | `string` | **是** | --     | 仓库相对路径，例如 `src/infra/db.ts`。 |

**返回模式：**

```json
{
  "filePath": "src/infra/db.ts",
  "identity": {
    "language": "typescript",
    "fileKind": "source"
  },
  "rules": [
    "[Rule: no-direct-db-access] (Severity: error)\nTitle: ...\nSummary: ...\nContent: ..."
  ],
  "semantic": {
    "role": "database-access-layer",
    "responsibilities": ["connection-management", "query-execution"],
    "publicSurface": ["connect", "query", "transaction"],
    "driftDetected": false,
    "driftReason": null,
    "ruleViolations": []
  },
  "dependencies": {
    "dependsOn": [{ "targetPath": "src/core/config.ts", "relation": "imports" }],
    "dependedBy": [{ "targetPath": "src/services/user-service.ts", "relation": "imported-by" }],
    "fanIn": 3,
    "fanOut": 2
  },
  "skeleton": {
    "exports": ["connect", "query", "transaction", "close"],
    "structuralHints": "class-based with singleton pattern"
  }
}
```

**校验：** `filePath` 经过安全处理，并确保其限制在 `.spine/index/` 目录范围内。

**前置条件：** `.spine/index/<filePath>.json` 必须存在（`spine sync`）。

---

#### 8. `spine_get_change_impact`

分析修改文件或模块的下游影响。返回直接或间接依赖目标的所有模块，按距离分组。

**参数**

| 参数       | 类型     | 必填   | 默认值 | 描述                                                             |
| ---------- | -------- | ------ | ------ | ---------------------------------------------------------------- |
| `file`     | `string` | **是** | --     | 相对文件路径或模块 ID，例如 `src/core/errors.ts` 或 `src/core`。 |
| `maxDepth` | `number` | 否     | `3`    | 传递依赖遍历的最大 BFS 深度。                                    |

**返回模式：** 来自 `src/engines/graph-query.ts` 中 `changeImpact()` 的 JSON 影响报告。包含直接或传递依赖该目标的所有模块，按距离分组。

**数据来源：** `.spine/view/data/knowledge-graph.json`。

**校验：** `file` 通过 `normalizeToolFilePath` 进行安全处理。

**前置条件：** knowledge graph 必须存在（`spine sync`）。

---

#### 9. `spine_get_drift_history`

按时间倒序获取文件的语义演化历史。当文件的索引中出现 `driftDetected: true` 时调用此工具，以了解其职责如何随时间变化。

**参数**

| 参数       | 类型     | 必填   | 默认值 | 描述                                       |
| ---------- | -------- | ------ | ------ | ------------------------------------------ |
| `filePath` | `string` | **是** | --     | 仓库相对文件路径，例如 `src/infra/db.ts`。 |
| `limit`    | `number` | 否     | `5`    | 最大返回事件数。必须为正整数。             |

**返回模式：**

```json
[
  {
    "id": "drift-abc123",
    "timestamp": "2026-04-15T10:30:00.000Z",
    "previousRole": "data-access",
    "newRole": "cache-layer",
    "reason": "Responsibility shift from direct DB access to caching"
  }
]
```

**校验：** `filePath` 通过 `normalizeToolFilePath` 进行安全处理。`limit` 在提供时必须为有限的正整数。

**前置条件：** drift 事件必须已记录在 manifest 中。

---

### 状态工具

#### 10. `spine_get_sync_status`

检查本地 `.spine/` 索引是否为最新。返回自上次 sync 以来发生变更的文件数量，以及语义分发快照是否已过期。

**参数**

无。

**返回模式：**

```json
{
  "totalTracked": 142,
  "needingSync": 3,
  "isFresh": false,
  "recommendation": "3 file(s) changed since last sync -> run 'spine sync'."
}
```

**元工具：** 无需 `.spine/` 即可工作。如果 `.spine/` 缺失，`totalTracked` 和 `needingSync` 为 0。

---

#### 11. `spine_get_baseline_status`

获取本地 `.spine/` 语义 baseline 和分发快照的健康状态。显示 baseline 是否存在、分发快照是否过期、上次 sync 运行时间以及维护者应采取的操作。

**参数**

无。

**返回模式：**

```json
{
  "baselineExists": true,
  "isVirginState": false,
  "publishSnapshotReady": true,
  "lastSyncAt": "2026-05-08T14:30:00.000Z",
  "lastSyncMode": "incremental",
  "indexedUnitCount": 142,
  "activeViolations": 5,
  "pendingAction": null
}
```

**元工具：** 无需 `.spine/` 即可工作。读取 `manifest.json` 并检查 `index/` 和 `project.json` 是否存在。

---

#### 12. `spine_get_violations_summary`

获取 `.spine/` 运行时中所有活跃的架构规则违规摘要。返回按规则 ID 分组的违规计数以及违规最多的文件。

**参数**

无。

**返回模式：**

```json
{
  "totalViolations": 5,
  "byRuleId": {
    "no-direct-db-access": { "count": 3, "severity": "error" },
    "layered-imports": { "count": 2, "severity": "warning" }
  },
  "topFiles": [
    { "filePath": "src/engines/query.ts", "count": 2 },
    { "filePath": "src/services/legacy.ts", "count": 1 }
  ],
  "recommendation": "5 active violation(s). Call spine_get_file_context on top files for details, or run 'spine check' for the full report."
}
```

**行为：** 从 `manifest.json` 读取活跃违规。按规则 ID 分组，按计数排序取前 5 个违规文件。当没有活跃违规时返回零违规响应。

---

#### 13. `spine_get_diagnostics`

检索代码库的结构诊断信息：依赖循环、死代码候选和架构 hub。在进行大型重构之前使用此工具识别架构健康风险。

**参数**

| 参数    | 类型                                               | 必填   | 默认值 | 描述               |
| ------- | -------------------------------------------------- | ------ | ------ | ------------------ |
| `type`  | `"cycles"` \| `"dead-code"` \| `"hubs"` \| `"all"` | **是** | --     | 要检索的诊断类别。 |
| `limit` | `number`                                           | 否     | `200`  | 每类最大条目数。   |

**返回模式：**

```json
{
  "type": "all",
  "cycles": [{ "cycleId": "cycle-1", "nodes": ["src/a", "src/b", "src/c"] }],
  "cycleCount": 1,
  "deadCode": [
    { "moduleId": "src/legacy", "confidence": "high", "reason": "No incoming dependencies" }
  ],
  "deadCodeCount": 3,
  "hubs": [{ "moduleId": "src/core/config", "fanIn": 25, "percentile": 95 }],
  "hubCount": 5,
  "truncated": false
}
```

**数据来源：** `.spine/view/data/diagnostics/cycles.json`、`dead-code.json`、`hubs.json`。如果诊断目录缺失则返回错误 JSON 对象。

**前置条件：** 诊断数据必须存在（`spine sync`）。

---

#### 14. `spine_get_config`

读取 ArchSpine 配置设置。未指定 key 时返回完整的配置摘要，指定 key 时返回特定配置值。

**参数**

| 参数  | 类型     | 必填 | 默认值 | 描述                                                                                        |
| ----- | -------- | ---- | ------ | ------------------------------------------------------------------------------------------- |
| `key` | `string` | 否   | --     | 可选的配置 key。可选值为 `viewLayer`、`enabledViews`、`llmProvider`、`languages` 或 `all`。 |

**返回模式：**

```json
{
  "viewLayer": "full",
  "enabledViews": ["public-surface", "risk-hotspots", "architecture-diagram"],
  "llmProvider": "anthropic",
  "languages": ["typescript", "python"]
}
```

当指定特定 key 时，仅返回该 key 的值：

```json
{
  "llmProvider": "anthropic"
}
```

**数据来源：** `.spine/config.json`。

---

### 视图工具

#### 15. `spine_get_view_data`

读取任何已启用视图类型的预计算视图数据。视图由确定性算法生成，无需 LLM 开销。

**参数**

| 参数       | 类型     | 必填   | 默认值 | 描述                                                                                                                         |
| ---------- | -------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `viewType` | `string` | **是** | --     | 可选值：`public-surface`、`risk-hotspots`、`architecture-diagram`、`project-health`、`agent-briefing`、`change-impact`。     |
| `limit`    | `number` | 否     | --     | 最大返回条目数（仅适用于包含 `items` 或 `modules` 数组的视图）。                                                             |
| `filter`   | `object` | 否     | --     | 可选的过滤器。属性：`kind`（string）、`layer`（string）、`minScore`（number）、`search`（string，自由文本 substring 匹配）。 |
| `sort`     | `object` | 否     | --     | 排序配置。属性：`field` — 可选 `"score"`、`"name"`、`"confidence"`。                                                         |
| `offset`   | `number` | 否     | `0`    | 返回结果前跳过的条目数（用于分页）。                                                                                         |

**返回模式：**

```json
{
  "viewType": "risk-hotspots",
  "generatedAt": "2026-05-08T14:30:00.000Z",
  "summary": "Top risk hotspots by structural complexity",
  "itemsCount": 10,
  "totalCount": 25,
  "offset": 0,
  "truncated": true,
  "appliedFilters": {
    "minScore": 0.5
  },
  "appliedSort": "score",
  "items": [
    {
      "hotspotPath": "src/core/parser.ts",
      "totalScore": 0.85,
      "riskFactors": ["high-cyclomatic-complexity", "many-dependents"]
    }
  ]
}
```

**校验：** `viewType` 必须是六种有效类型之一。如果视图文件不存在则返回错误。

**数据来源：** `.spine/view/data/<viewType>.json`。

**视图类型：**

| 视图类型               | 描述                                             |
| ---------------------- | ------------------------------------------------ |
| `public-surface`       | 面向读者和 agent 的快速仓库入口表面映射。        |
| `risk-hotspots`        | 结构上有风险的文件，附带透明的分数分解。         |
| `architecture-diagram` | 全 sync 确定性架构图元数据。                     |
| `project-health`       | 面向人类阅读的项目健康报告，包含拓扑和度量指标。 |
| `agent-briefing`       | 面向 AI agent 的一页项目简报。                   |
| `change-impact`        | 每个模块的预计算 BFS 影响半径。                  |

---

#### 16. `spine_list_resource_templates`

列出 MCP 服务器暴露的可发现的 `spine://` URI 模板。在读取资源之前使用此工具发现文件夹和文件的资源模式。

**参数**

无。

**返回模式：**

```json
[
  {
    "uriTemplate": "spine://project",
    "name": "Project Architecture topology",
    "description": "Get the full project-level architecture overview."
  },
  {
    "uriTemplate": "spine://folder/{dirPath}",
    "name": "Folder Level Architecture",
    "description": "Get the architecture and file responsibilities within a specific directory."
  },
  {
    "uriTemplate": "spine://file/{filePath}",
    "name": "File Semantic Contract",
    "description": "Get the semantic contract, architectural invariants, and structural skeleton for a specific file."
  },
  {
    "uriTemplate": "spine://view/{viewType}",
    "name": "View Data",
    "description": "Get the pre-computed view data for any enabled view type."
  }
]
```

---

#### 17. `spine_preview_scan`

在运行大型分析或索引操作之前，预览有效的 ScanPolicy、ignore-chain 顺序和当前扫描边界。

**参数**

无。

**返回模式：** 来自 `Scanner.formatDryRunReport()` 的文本报告。显示哪些文件和目录被包含或排除、有效的 ignore-chain 顺序以及当前的扫描边界。

**行为：** 使用当前配置的扫描策略实例化 `Scanner` 并输出 dry-run 报告。无需 `.spine/` 即可工作。

---

### 操作工具

#### 18. `spine_run_scan`

运行代码库扫描。快速模式（默认）使用基于 AST 的分析，在 30 秒内完成。完整模式运行完整的扫描管线，包括 gitignore 和协议规则。

**参数**

| 参数   | 类型     | 必填 | 默认值    | 描述                                                               |
| ------ | -------- | ---- | --------- | ------------------------------------------------------------------ |
| `mode` | `string` | 否   | `"quick"` | 扫描模式：`"quick"`（仅 AST，约 30s）或 `"full"`（完整扫描管线）。 |

**返回模式：**

```json
{
  "mode": "quick",
  "scannedAt": "2026-05-09T10:00:00.000Z",
  "fileCount": 142,
  "languageStats": {
    ".ts": 120,
    ".json": 22
  },
  "status": "ok"
}
```

失败时：

```json
{
  "mode": "full",
  "status": "error",
  "error": "Error message"
}
```

**前置条件：** 完整模式需要 `.spine/` 存在。

---

#### 19. `spine_run_sync`

触发增量 sync 以刷新语义索引（`.spine/index/`）并重新生成已启用的视图（`.spine/view/`）。在 `spine_get_sync_status` 显示有文件需要 sync 之后，或在当前会话之外修改代码之后调用此工具。

**参数**

无。

**返回模式：**

```json
{
  "status": "ok",
  "message": "Sync complete: 142 processed, 0 skipped, 0 failed",
  "stats": {
    "processed": 142,
    "skipped": 0,
    "failed": 0
  }
}
```

失败时：

```json
{
  "status": "error",
  "error": "Error message"
}
```

**前置条件：** 需要 `.spine/` 存在。

---

#### 20. `spine_get_semantic_diff`

比较两个 git ref（提交、分支、标签）之间的语义架构。显示哪些文件的角色、职责、公共接口发生了变更，或发生了 drift 事件。在合并 PR 之前使用此工具以了解架构影响。

**参数**

| 参数       | 类型     | 必填   | 默认值 | 描述                                                                  |
| ---------- | -------- | ------ | ------ | --------------------------------------------------------------------- |
| `oldRef`   | `string` | **是** | --     | 基准 git ref（提交 SHA、分支名或标签），例如 `"main"` 或 `"HEAD~1"`。 |
| `newRef`   | `string` | **是** | --     | 目标 git ref，例如 `"feature/my-change"` 或 `"HEAD"`。                |
| `filePath` | `string` | 否     | --     | 可选的文件路径过滤器。设置后将仅返回该特定文件的结果。                |

**返回模式：**

```json
{
  "oldRef": "main",
  "newRef": "feature/my-change",
  "changedFiles": [
    {
      "filePath": "src/services/user-service.ts",
      "type": "modified",
      "roleChanged": true,
      "oldRole": "data-access",
      "newRole": "business-logic",
      "responsibilitiesChanged": true,
      "publicSurfaceChanged": false,
      "dependencyChanged": true,
      "driftDetected": true,
      "driftReason": "Responsibility migration"
    }
  ],
  "summary": {
    "totalChanges": 5,
    "roleChanges": 1,
    "surfaceChanges": 2,
    "dependencyChanges": 3,
    "driftEvents": 1
  }
}
```

**行为：** 运行两个 ref 之间的 `git diff --name-status`，然后通过 `git show` 比较两个 ref 的修改文件在 `.spine/index/` 中的数据。仅分析 `src/` 和 `tests/` 下的源文件。

**前置条件：** 必须在 git 仓库中，且 `.spine/` 数据已提交。

---

#### 21. `spine_check_operation`

在读取或修改文件之前，检查该操作是否会违反任何架构规则。返回操作是否被允许，以及警告和违规信息。

**参数**

| 参数           | 类型     | 必填   | 默认值 | 描述                                                                      |
| -------------- | -------- | ------ | ------ | ------------------------------------------------------------------------- |
| `filePath`     | `string` | **是** | --     | 被操作文件的仓库相对路径。                                                |
| `operation`    | `string` | **是** | --     | 操作类型，可选：`"read"`、`"write"`、`"delete"`、`"rename"`、`"import"`。 |
| `importTarget` | `string` | 否     | --     | 当 `operation` 为 `"import"` 时必须提供。被导入的目标文件路径。           |

**返回模式：**

```json
{
  "allowed": true,
  "warnings": [],
  "violations": []
}
```

检测到违规时：

```json
{
  "allowed": false,
  "warnings": [],
  "violations": [
    {
      "ruleId": "no-direct-db-access",
      "severity": "error",
      "reason": "Import from \"src/services\" to \"src/infra/db\" violates architectural rules."
    }
  ]
}
```

**校验检查：**

1. 对不存在的文件执行 `read` 操作时发出文件存在性警告。
2. 高 fan-in hub 检测：在依赖数超过 10 的模块中写入或删除文件时发出警告。
3. 跨层导入违规检测：通过预计算的 knowledge graph 边进行（仅适用于带 `importTarget` 的 `import` 操作）。

**前置条件：** hub 和导入检查需要 knowledge graph 存在。

---

## MCP 资源

MCP 服务器注册了 4 个 `spine://` URI 模板，定义在 `src/infra/mcp/resources.ts` 中。资源通过 `ReadResourceRequestSchema` 读取。

### 资源列表

| URI                        | 名称                          | MIME 类型          | 描述                                 |
| -------------------------- | ----------------------------- | ------------------ | ------------------------------------ |
| `spine://project`          | Project Architecture topology | `application/json` | 完整的项目级架构概览。               |
| `spine://folder/{dirPath}` | Folder Level Architecture     | `application/json` | 指定目录内的架构和文件职责。         |
| `spine://file/{filePath}`  | File Semantic Contract        | `application/json` | 文件的语义契约、不变量和结构骨架。   |
| `spine://view/{viewType}`  | View Data                     | `application/json` | 任何已启用视图类型的预计算视图数据。 |

### 资源路径解析

每个资源 URI 解析为 `.spine/` 中的一个文件：

| URI                        | 解析路径                                                                        |
| -------------------------- | ------------------------------------------------------------------------------- |
| `spine://project`          | `.spine/docs/en-US/project.md`（优先）或 `.spine/index/project.json`            |
| `spine://folder/{dirPath}` | `.spine/docs/en-US/<dirPath>/folder.md` 或 `.spine/index/<dirPath>/folder.json` |
| `spine://file/{filePath}`  | `.spine/index/<filePath>.json`                                                  |
| `spine://view/{viewType}`  | `.spine/view/data/<viewType>.json`                                              |

### `spine://view/{viewType}` 的视图类型

视图资源支持的视图类型：

| 视图类型               | 描述                                             |
| ---------------------- | ------------------------------------------------ |
| `public-surface`       | 面向读者和 agent 的快速仓库入口表面映射。        |
| `risk-hotspots`        | 结构上有风险的文件，附带透明的分数分解。         |
| `architecture-diagram` | 全 sync 确定性架构图元数据。                     |
| `project-health`       | 面向人类阅读的项目健康报告，包含拓扑和度量指标。 |
| `agent-briefing`       | 面向 AI agent 的一页项目简报。                   |
| `change-impact`        | 每个模块的预计算 BFS 影响半径。                  |

### 资源校验

所有路径参数（dirPath、filePath、viewType）均经过以下校验：

- 空字节注入。
- 无效的百分号编码。
- 绝对路径（POSIX 和 Windows）。
- 路径遍历（`..` 段）。
- 解析路径超出 `.spine/` 目录。

对于 `spine://file/{filePath}`，索引文档会校验 schema 兼容性。应用数据剥离以移除 `provenance`、`skeleton.declaredSymbols` 和空的 `graph.symbolEdges`，防止 agent 上下文膨胀。

### 资源错误码

| 错误码                         | 条件                                     |
| ------------------------------ | ---------------------------------------- |
| `MCP_RESOURCE_INVALID_URI`     | URI 格式错误、空字节、绝对路径或路径遍历 |
| `MCP_RESOURCE_NOT_FOUND`       | 解析后的文件不存在                       |
| `MCP_RESOURCE_INVALID_CONTENT` | 文件存在但内容无效或 schema 不兼容       |
| `MCP_CONTEXT_ACCESS_DENIED`    | context gate 阻止了访问                  |
| `MCP_READ_FAILED`              | 通用读取失败                             |

---

## MCP 提示词

MCP 服务器注册了两个提示词，定义在 `src/infra/mcp/server.ts` 中。提示词通过 `GetPromptRequestSchema` 调用。

### `architectural_context`

引导 agent 在修改文件之前收集架构上下文。返回的消息指示 agent 按顺序调用三个工具。

**参数**

| 参数       | 类型     | 必填   | 描述                                                       |
| ---------- | -------- | ------ | ---------------------------------------------------------- |
| `filePath` | `string` | **是** | 需要获取上下文的相对文件路径，例如 `src/services/foo.ts`。 |

**返回消息：** 一条包含逐步说明的用户消息：

1. 使用指定的文件路径调用 `spine_get_file_context`，以了解文件的用途和适用的规则。
2. 使用指定的文件路径调用 `spine_get_change_impact`，以了解哪些其他模块依赖此文件。
3. 使用指定的文件路径和 `operation="write"` 调用 `spine_check_operation`，以检查规则违规。

### `pre_write_checklist`

在写入文件之前执行标准安全检查清单。返回的消息指示 agent 验证操作、检查上下文并评估影响。

**参数**

| 参数           | 类型     | 必填   | 描述                                                          |
| -------------- | -------- | ------ | ------------------------------------------------------------- |
| `filePath`     | `string` | **是** | 要检查的相对文件路径。                                        |
| `operation`    | `string` | **是** | 要执行的操作：`read`、`write`、`delete`、`rename`、`import`。 |
| `importTarget` | `string` | 否     | 当 `operation` 为 `"import"` 时必须提供。被导入的文件。       |

**返回消息：** 一条包含检查清单的用户消息：

1. 使用指定的文件路径和操作调用 `spine_check_operation`。如果返回违规信息，则不要继续。
2. 使用指定的文件路径调用 `spine_get_file_context`，以读取文件的角色、职责和匹配的架构规则。
3. （仅适用于 `write` 或 `delete` 操作）使用指定的文件路径调用 `spine_get_change_impact`，以了解受影响的模块。

---

## MCP Context Gate

Context gate 控制是否可以在未先预热上下文的情况下读取资源。定义在 `src/infra/mcp/context.ts` 中。

### 模式

| 模式            | 行为                                                         |
| --------------- | ------------------------------------------------------------ |
| `off`           | 无需预热。所有资源立即可访问。                               |
| `project-first` | 必须先读取 `spine://project`，然后才能访问文件夹或文件资源。 |
| `search-first`  | 必须先调用搜索预热工具之一，然后才能访问文件夹或文件资源。   |

### 搜索预热工具

当 context 模式为 `search-first` 时，调用以下任一工具即可预热 context：

1. `spine_query_invariants`
2. `spine_query_responsibilities`
3. `spine_preview_scan`
4. `spine_get_sync_status`
5. `spine_get_baseline_status`
6. `spine_get_violations_summary`

Context 模式在 `.spine/config.json` 的 `mcp.contextMode` 中设置，默认为 `"off"`。

### Gate 规则

| 资源类型  | `off` | `project-first`（未预热） | `project-first`（已预热） | `search-first`（未预热） | `search-first`（已预热） |
| --------- | ----- | ------------------------- | ------------------------- | ------------------------ | ------------------------ |
| `project` | 允许  | 允许 + 预热               | 允许                      | 允许                     | 允许                     |
| `folder`  | 允许  | 阻止                      | 允许                      | 阻止                     | 允许                     |
| `file`    | 允许  | 阻止                      | 允许                      | 阻止                     | 允许                     |

---

## 错误码

所有 MCP 错误码定义在 `src/core/errors.ts` 中。

### 工具错误码

| 错误码                            | 条件                                             |
| --------------------------------- | ------------------------------------------------ |
| `MCP_RUNTIME_MISSING`             | `.spine/` 目录不存在。                           |
| `MCP_RUNTIME_BASELINE_INCOMPLETE` | 运行时 baseline 不完整（缺少 `manifest.json`）。 |
| `MCP_TOOL_UNKNOWN`                | 传递给 `executeTool` 的工具名称未知。            |
| `MCP_TOOL_INVALID_ARGUMENTS`      | 无效或缺少必填参数。                             |
| `MCP_TOOL_INDEX_READ_FAILED`      | 读取索引条目失败。                               |
| `MCP_TOOL_INDEX_INVALID_CONTENT`  | 索引中的 JSON 无效或 schema 不兼容。             |
| `MCP_TOOL_EXECUTION_FAILED`       | 通用工具执行失败。                               |

### 资源错误码

| 错误码                         | 条件                                     |
| ------------------------------ | ---------------------------------------- |
| `MCP_RESOURCE_INVALID_URI`     | URI 格式错误、空字节、绝对路径或路径遍历 |
| `MCP_RESOURCE_NOT_FOUND`       | 解析后的文件不存在                       |
| `MCP_RESOURCE_INVALID_CONTENT` | 文件存在但内容无效或 schema 不兼容       |
| `MCP_CONTEXT_ACCESS_DENIED`    | context gate 阻止了访问                  |
| `MCP_READ_FAILED`              | 通用读取失败                             |
