# ArchSpine v1.0.0 发布验证指南

这份指南定义 `v1.0.0` release candidate 的可重复验证路径。它是公开检查清单，用于在发布前核对已交付的 CLI、文档、npm 包内容和发布元数据。

## 产品门禁

在 release candidate commit 上，从仓库根目录执行：

```bash
npm run build
npm run test:unit
npm run validate
npm run docs:build
npm run pack:check
```

预期结果：

- TypeScript 源码能编译到 `dist/`。
- 产品测试通过。
- 协议 schema 与示例校验通过。
- 公开文档能完成构建。
- `npm pack --dry-run` 只包含预期的发布文件。

## 公开契约核对

确认公开文档和运行时入口描述的是同一套行为：

- README、docs 首页、Runbook、CLI help 和中文镜像使用同一套 `sync` / `publish` / `build` 边界。
- `spine sync` 被描述为机器优先的 JSON 刷新路径。
- `spine publish` 被描述为 Atlas 回填边界。
- `.spine/view/**` 明确标记为 experimental。
- `spine mcp start` 被描述为只读语义面。
- `spine sync --retry-failed` 与 `spine sync --repair-violations` 被描述为恢复命令，而不是常规首次运行命令。

## 外部仓库冒烟

发布前至少对一个真实外部仓库执行冒烟验证。更理想的做法是选择两个形态不同的仓库，例如一个小型库和一个应用仓库。

推荐命令路径：

```bash
npx --yes archspine@latest try
npx --yes archspine@latest init
npx --yes archspine@latest build
npx --yes archspine@latest check
```

记录：

- 仓库类型和主要语言
- Node.js 版本
- 执行过的命令
- `.spine/index/**` 是否生成
- `check` 输出是否可操作
- 文档不一致或提示不清楚的地方

## 发布元数据核对

发布前确认：

- `package.json` 版本是 `1.0.0`。
- `CHANGELOG.md` 包含 `1.0.0` 条目。
- GitHub release notes 与 changelog、README 范围一致。
- `npm pack --dry-run` 输出符合预期包内容。
- npm dist tag 和访问范围是有意选择的。

## 非目标

这份指南不创建 release tag，不执行 npm publish，也不修改 package 版本。它只定义这些动作之前应该通过的检查。
