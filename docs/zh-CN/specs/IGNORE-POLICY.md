# ArchSpine Ignore Policy

本文档定义 ArchSpine 使用的扫描边界模型。目标不是“尽可能多地忽略”，而是让扫描决策可配置、可审计、可预测。

## 1. ScanPolicy 模型

ArchSpine 通过 `scanPolicy` 描述文件可见性：

```json
{
  "scanPolicy": {
    "fileSource": "git-tracked",
    "ignoreChain": {
      "inheritGitIgnore": true,
      "projectIgnore": ".spineignore",
      "localIgnore": ".spineignore.local"
    }
  }
}
```

默认值：

- `fileSource: "git-tracked"`
- `ignoreChain.inheritGitIgnore: true`
- `ignoreChain.projectIgnore: ".spineignore"`
- `ignoreChain.localIgnore: ".spineignore.local"`

支持的 `fileSource`：

- `git-tracked`：只扫描 `git ls-files`
- `git-tracked-plus-untracked`：在 tracked 文件基础上追加未跟踪文件
- `filesystem`：直接遍历文件系统，适合非 Git 环境

## 2. Ignore chain

当 `inheritGitIgnore=true` 时，实际扫描边界按以下顺序计算：

1. 协议级排除项
2. `.gitignore`
3. `.spineignore`
4. `.spineignore.local`（如果存在）

职责分工：

- `.gitignore` 负责仓库卫生
- `.spineignore` 负责 ArchSpine 语义层独有的排除规则，也可以承载初始化时写入的一小段通用低价值语义噪音建议模板，例如 secrets、缓存、生成产物或仓库内的次级镜像
- `.spineignore.local` 只用于本地个人覆盖，不应提交

如果 `inheritGitIgnore=false`，则跳过 `.gitignore` 这一步。

## 3. 协议级硬边界

这些包含和排除属于运行时契约，不应被用户规则覆盖。

协议级排除：

- `.spine/cache.db*`
- `.spine/.lock`
- `.spine/index/`
- `.spine/atlas/`

协议级包含：

- `.spine/rules/`
- `.spine/config.json`

含义：

- `.spine/` 不再整体排除
- 运行态缓存和生成索引永远不进入扫描
- 规则和配置必须保持可见，因为它们是治理输入

## 4. `.spineignore` 的职责

`.spineignore` 只应包含语义索引层独有的规则，例如：

- 已提交但不应被索引的大型基准数据目录
- 已提交但没有架构价值的快照或镜像目录
- 通过 `!` 从 Git ignore 规则中重新纳入的少量例外路径
- 少量需要在 ArchSpine 边界中显式可见、可审查的敏感本地文件排除项，例如 `.env`

执行 `spine init` 时，ArchSpine 可能会在 `.spineignore` 中创建一段带注释的起始模板，默认放入少量推荐的语义排除项。这个默认块的目标是提高 agent 读仓库时的语义压缩比，而不是追求“排除越多越好”。其中可能包括：

- 常见本地 secrets，例如 `.env`、`.env.*` 和证书/密钥模式
- 对代码理解通常价值较低的生成目录和缓存目录
- 在某些仓库中明显属于次级产物的镜像或日志目录
- 已经作为权威可读面的仓库说明文档

这段模板刻意保持可编辑；它是接入默认值，不是协议级硬边界。

`.spineignore` 通常不应该：

- 重复 `.gitignore` 已处理的通用噪音
- 排除会实质影响运行时或发布行为的仓库自动化文件，例如 `.github/workflows/**`
- 排除 `tests/` 或 `__tests__/`
- 排除主源码根目录，如 `src/`、`app/`、`packages/`、`modules/`

## 5. 可见性与审计

使用下面的命令预览当前实际边界：

```bash
spine scan --dry-run
```

命令会输出：

- 当前 `fileSource`
- 是否继承 `.gitignore`
- ignore-chain 顺序和规则数量
- 实际会被扫描的文件总数
- 关键排除项以及来源

相同能力也通过 MCP 工具 `spine_preview_scan` 暴露给 Agent。
