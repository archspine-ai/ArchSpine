# View Layer 指南

`.spine/view/` 是一层实验性的派生阅读层，用来帮助你更快理解仓库。

当前 `v1.0.x` 只实现了两个产物：

- `.spine/view/public-surface.json`
- `.spine/view/public-surface.md`
- `.spine/view/risk-hotspots.json`
- `.spine/view/risk-hotspots.md`
- `.spine/view/architecture-diagram.json`
- `.spine/view/architecture-diagram.html`

这一层目前的定位是：

- 需要显式开启
- 属于派生结果，不是权威真相源
- 位于 aggregation 之后
- 在首个开源 `v1.0` 中不属于稳定公共产物契约

## 如何开启

可以通过项目配置或环境变量开启。

项目配置：

```json
{
  "artifacts": {
    "experimentalViewLayer": true
  }
}
```

环境变量：

```bash
SPINE_EXPERIMENTAL_VIEW_LAYER=true spine sync
```

如果不开开关，`sync` 行为与之前一致，不会生成 `.spine/view/**`。

## 会生成什么

开启后，`spine sync` 会额外写入：

- `.spine/view/public-surface.json`
- `.spine/view/public-surface.md`
- `.spine/view/risk-hotspots.json`
- `.spine/view/risk-hotspots.md`

在支持 full sync 的路径上，ArchSpine 还可以派生：

- `.spine/view/architecture-diagram.json`
- `.spine/view/architecture-diagram.html`

这些文件和其它正式 `.spine` 产物一样，通过受信 writer path 生成，并纳入受保护输出边界。

## public-surface

`public-surface.json` 主要回答两个问题：

- 哪些文件更像仓库的真实公开入口
- 哪些文件值得 Agent 在建立上下文时优先阅读

当前排序信号包括：

- 语义 `publicSurface`
- 显式路径形态，例如 CLI、MCP、route、config、schema
- 导出数量
- 内部消费数量
- re-export 与 barrel 放大信号

这个产物的用途是帮助理解，不用于治理裁决。

## risk-hotspots

`risk-hotspots.json` 主要回答两个问题：

- 哪些文件在结构上更敏感、更容易引发连锁影响
- 哪些文件值得更早进入 review 视野

当前透明加分项包括：

- `fan-in`
- `fan-out`
- 跨边界依赖密度
- surface exposure
- semantic drift
- rule violations
- 大文件权重
- 缺少相邻测试

每个热点都会保留 score breakdown，因此结果是可解释的，而不是黑盒分数。

## 当前限制

这轮实验实现有明确边界：

- 默认的轻量 view 仍然只围绕 `public-surface` 和 `risk-hotspots`
- 输出格式在 `v1.0` 之后仍可能继续演化
- 不应让 CI 或治理决策依赖 `.spine/view/**`
- 应把它当作阅读辅助层，而不是唯一真相源

像 `api-chains`、`dependency-summary`、`structure` 这类后续 view，当前版本仍然明确不在范围内。
