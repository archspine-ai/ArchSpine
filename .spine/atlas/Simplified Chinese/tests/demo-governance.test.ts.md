<!-- spine-content-hash:eeb2acb68544c963938be12864f64a62efbb17a0068e1f0093efe135ca7df566 -->
# ArchSpine 演示治理验收测试套件

## 角色
这是一个 Vitest 验收测试套件，用于验证 ArchSpine 系统端到端演示治理工作流的正确性。它确保核心 CLI 命令在真实、隔离的环境中正常运行。

## 主要职责
- 创建一个临时隔离的测试目录，复制演示项目结构。
- 将必要的演示项目源文件和配置复制到测试环境中。
- 以测试目录为目标，执行构建后的 ArchSpine CLI 命令（`sync`、`check`、`fix`）。
- 验证同步、架构规则检查和自动修复机制的正确性。

## 不涉及范围
- 单个服务或引擎的单元测试。
- 与外部 LLM API 的集成测试（本套件使用 `MockClient`）。
- 性能或负载测试。

## 重要不变规则
- 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾，以符合测试文件后缀规则。

## 导出/外部可见接口
- `describe('demo governance acceptance')` — 顶层测试套件块。
- `runBuiltCli(command, args)` — 一个辅助函数，用于运行构建后的 CLI 并传入参数。

## 变更意图
架构意图是提供一个全面的验收测试，确保 `sync`、`check` 和 `fix` 命令能够端到端正确工作。最近的变更解决了 lint 错误，并在 v1.0 之前完成了流水线修复，使验收测试稳定可靠。