# 项目：archspine-demo

## 概览
ArchSpine 协议的极简演示项目。

## 架构亮点
- **领域驱动设计**：将领域逻辑 (`src/domain`) 与基础设施 (`src/infra`) 分离开来。
- **边界强化**：包含故意的架构违规（例如 API 直接调用 Infra），用以演示 ArchSpine 的规则检查能力。
- **本地控制面**：演示 `.spine/` 如何在本地仓库中存储语义上下文。