# 案例展示

这个页面保持保守，只展示已经验证过的真实案例。

## 当前案例

- **官方 demo 工程**：一个最小化仓库，用来演示规则违规、`spine check` 与 `spine fix`
- **协议文档**：公开的 `.spine` 协议与 MCP 接入文档，作为当前集成参考实现

## 提交规则

如果你在公开仓库里使用了 ArchSpine，请提交一个文档 issue，并附上：

- 仓库链接
- 一段简短描述，说明 ArchSpine 是如何被使用的
- 是否希望以名称形式出现在案例列表里

在外部案例被验证之前，这个页面不会暗示第三方品牌或团队已经采用。

## Demo 工程覆盖范围

内置 Demo（`examples/demo-project/`）展示了完整的治理闭环：

- **`spine init`** — 在新仓库中初始化 `.spine/`，默认采用 distributable 策略
- **`spine sync`** — 扫描代码库，构建 `.spine/index/` 语义镜像
- **`spine check`** — 对照 `.spine/rules/` 检查架构违规
- **`spine fix`** — 对已知违规模式执行自动修复
- **`spine mcp start`** — 将项目结构暴露为只读 MCP 服务
- **`spine publish`** — 回填 `.spine/atlas/` 和 `.spine/view/` 可读快照

每条命令的输出都限定在 Demo 仓库范围内，可作为 CI 和新人接入的可重复验证路径。
