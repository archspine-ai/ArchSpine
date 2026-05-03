# God Mode

God mode 是 ArchSpine 的“故意过量”模式。

它是纯人类阅读、刻意非生产的模式，本身就是一个 joke mode。

既然 vibe coding 都能拥有离谱巨大的上帝文件，那 ArchSpine 作为代码库语义地图，当然也要有一个镜像版的上帝文件。

## 它会写什么

执行：

```bash
spine god
```

God mode 不会扩展 `sync`。

它读取当前 `.spine/index/` 状态，只写出一个文件：

- `.spine/<repo-name>-god.md`

## 适合什么时候用

适合以下场景：

- 想把整个仓库压成一份 Markdown 大档案
- 想在 demo 或实验里跑一个夸张的一文件仓库读物
- 想快速浏览项目全貌，而不是逐个打开文件级文档

它不是默认索引路径。正常的结构层映射仍然是主流程。

## 说明

- God mode 是独立的一次性命令。
- CLI 在运行前会明确提示它不是生产模式。
- 重复运行会覆盖之前的 `.spine/<repo-name>-god.md`。
- 生成出来的档案是确定性的，基于当前 `.spine/index` 状态汇编。
