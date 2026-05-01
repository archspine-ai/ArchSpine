<!-- spine-content-hash:8284bb33192599f227cc151b55510c51b9020ae389655da165d2a8fe11a56bd4 -->
# ArchSpine – 研究测试工作流

## 目的
本文档定义了一个名为“Research Bench”的 GitHub Actions 工作流，为运行研究级别的测试套件提供一个可控的手动触发环境。它确保实验性或探索性测试可以在隔离环境中执行，而不会干扰标准的 CI 流水线。

## 上下文与受众
该工作流面向 ArchSpine 项目的开发者和研究人员，他们需要运行不属于常规构建或测试流程的特殊测试套件。它设计为通过 GitHub 界面或 API 手动调用，适用于临时性的测试场景。

## 关键要点
- 工作流仅支持手动触发（`workflow_dispatch`），非自动触发
- 在 Ubuntu 上运行，使用 Node.js 20 和 npm 依赖缓存
- 通过 `npm run test:research` 命令执行研究测试套件
- 超时时间为 15 分钟，并会取消同一工作流/分支的正在运行的任务