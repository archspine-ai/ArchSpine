# ArchSpine 1.0 收口计划

本计划记录 ArchSpine 如何收口到接口稳定、公开契约清晰的 `1.0.0` 版本。

核心原则：

- 可以少功能，不能假语义
- 如果契约不清晰，就宁可延后 `1.0.0`
- 先消除实现、文档、schema、示例之间的矛盾，再扩展能力

## 完成标准

只有当下面这些对外契约稳定后，`1.0.0` 才算 ready：

1. CLI 行为与 README / Runbook 一致
2. MCP 工具名、资源 URI 和语义与运行时一致
3. 规则格式和解析行为稳定
4. `.spine` 布局、schema、示例和协议文档一致
5. 中英文文档描述的是同一套已发布行为

## 当前状态（2026-04-06）

已完成：

- 对外版本统一到 `1.0.0`
- README、Runbook、Protocol 和中文入口基本对齐当前运行时
- 规则系统文档已围绕 YAML 收口
- `init` 在新仓库中可以无 `HEAD` 噪音完成 bootstrap
- pre-commit hook 不再硬依赖消费仓库自带 `dist/cli/index.js`
- `spine info` 已提供只读诊断摘要
- 已在样例仓库上完成多轮 CLI / MCP 冒烟

`1.0.0` 前仍建议继续处理：

- 清理包预览里暴露出的历史 `dist/` 残留
- 在更真实的外部仓库上再做一轮完整验证
- 冻结“哪些命令依赖 LLM，哪些不依赖”的公开契约

## 工作批次

### Batch 1：公开文档与入口

- 统一 README、Runbook、Protocol 的版本话术
- 移除对不存在 MCP 能力或未支持 provider 的描述
- 统一 `.spine/atlas/` 命名
- 保证首页入口反映当前产品

### Batch 2：规则系统与 MCP 契约

- 固定 YAML 为唯一权威规则格式
- 校验当前 MCP 工具的规则查询行为
- 让文档、测试、示例围绕同一套 MCP 表面

### Batch 3：协议、Schema、Examples

- 对齐 `src/types/protocol.ts`、schemas 和 examples
- 清晰区分当前规范与历史规范
- 保持 machine-readable examples 持续通过验证

### Batch 4：运行时与 E2E 验证

- 保持 `init`、`sync`、`status`、`check`、`fix`、`mcp start` 的冒烟覆盖
- 在干净样例仓库上验证
- 校验文档里的 `mode` 默认路径、高级 `prompt-tier=lite` 覆盖项、legacy 兼容 shim 与 hook 行为是否一致

### Batch 5：发布收口

- 清理公共入口中的历史链接
- 冻结公共接口
- 更新包元数据与 release notes

## 发布闸门

在下列条件全部满足前，不发布 `1.0.0`：

- `npm run build`
- `npm test`
- `npm run validate`
- README、首页、Runbook、Protocol 不互相冲突
- MCP 契约冻结
- 规则格式与加载行为冻结
- `.spine` 目录语义冻结
- examples 与 schema 对齐
- 至少一轮真实外部仓库验证通过

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
