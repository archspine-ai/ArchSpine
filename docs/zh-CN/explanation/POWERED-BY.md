# Powered by ArchSpine

如果你的仓库正在使用 ArchSpine，可以把下面这个徽章放进 README：

```md
[![Powered by ArchSpine](https://img.shields.io/badge/%F0%9F%A6%B4_Powered_by-ArchSpine-0f766e)](https://github.com/archspine-ai/archspine)
```

## 建议用法

- 把徽章放在构建或文档徽章附近
- 链接到你自己的 ArchSpine 接入说明或仓库主页
- 仅在仓库确实使用 `.spine/` 资产或相关工作流时展示

## 这个徽章的作用

它给采用者一个轻量信号，表明该仓库已经为 AI 辅助工程协作做了结构化适配。

## ArchSpine 提供了什么

当你的仓库展示这个徽章时，意味着：

- **语义索引** — `.spine/index/` 提供结构化的代码库元数据，AI 工具无需读取全部源码即可理解项目
- **架构规则** — `.spine/rules/` 声明不变量，`spine check` 在架构漂移扩散前进行审计
- **MCP 接入** — `spine mcp start` 以只读 STDIO 端点暴露项目结构，可直接接入 Cursor、Claude 等 MCP 客户端
- **可重复治理** — `spine sync` → `spine check` → `spine fix` 是一条确定性流水线，不是一次性脚本
- **Git 原生分发** — `.spine/` 快照随仓库一起分发，下游消费者无需自行安装工具链
