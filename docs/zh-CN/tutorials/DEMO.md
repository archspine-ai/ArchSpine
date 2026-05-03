# 官方 Demo

仓库中自带了一个故意违反分层规则的示例工程，用来在几分钟内展示完整的 ArchSpine 治理链路。

## 场景

`src/api/handler.ts` 直接导入 `src/infra/database.ts`，这会违反 `.spine/rules/arch.yml` 中声明的分层约束。

## 治理修复演示

```bash
npm run build
cd examples/demo-project
rm -rf .spine/index .spine/atlas
rm -f .spine/cache.db .spine/cache.db-shm .spine/cache.db-wal .spine/manifest.json .spine/languages.json .spine/.lock
node ../../dist/cli/index.js llm --project set provider mock
node ../../dist/cli/index.js build
node ../../dist/cli/index.js sync
node ../../dist/cli/index.js check
node ../../dist/cli/index.js fix
```

## 预期结果

- `build` 从干净状态初始化受信任的 demo `.spine/` 基线
- `sync` 在既有基线上执行增量运行态刷新
- `check` 稳定报出 `src/api/handler.ts` 中的 API -> Infra 违规
- `fix` 读取已记录的 active violation 并进入修复流程

## 项目能力演示

如果你只想展示索引与扫描能力，可以改用这条更短的路径：

```bash
npm run build
node dist/cli/index.js sync --hook
node dist/cli/index.js info
node dist/cli/index.js scan --dry-run
```

## 录制资产

- 治理演示脚本：[`scripts/demo.tape`](https://github.com/iZoy/archSpine/blob/main/scripts/demo.tape)
- 项目级演示脚本：[`scripts/project-demo.tape`](https://github.com/iZoy/archSpine/blob/main/scripts/project-demo.tape)

VHS 脚本是 demo 工作流的规范录制源。

如果需要切到真实模型，请先执行 `spine llm setup`，并准备好所需代理环境变量。

> 说明：view 层产物（`.spine/view/**`）目前仍为 **experimental**，不属于本治理 demo 的发布硬约束。
