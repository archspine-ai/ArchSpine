<!-- spine-content-hash:e3ea23fa5bc5a6849155c992983edbc9ff6274d6b303b4f9d7c462ed4b2c570e -->
# ArchSpine – 提示上下文基础设施测试套件

## 角色
该文件是一个 **Vitest 测试套件**，用于验证核心提示上下文基础设施模块：预算计算和依赖诊断。

## 主要职责
- 测试 `calculateSourcePromptBudgets` 函数，确保根据输入内容和骨架正确分配验证预算。
- 测试 `buildDependencySelectionDiagnostics` 函数，确保准确的依赖候选过滤和诊断报告。
- 测试 `buildRuleBlockDiagnostics` 函数，确保规则块诊断生成。
- 使用 Vitest 的 `describe`/`it`/`expect` 模式断言基础设施模块的预期行为。

## 重要不变性与负面范围
- **不变性：** 使用 Vitest 测试框架；导入特定的提示上下文模块（`budgets.js`、`diagnostics.js`）；遵循项目命名约定（`.test.ts` 或 `.spec.ts`）。
- **负面范围：** 不实现预算计算或诊断的生产逻辑；不提供 CLI 或运行时服务；不处理非测试相关基础设施。

## 最重要的导出行为
- 不导出任何公共接口；所有测试均为套件内部。
- 通过单元测试确保提示上下文基础设施的可靠性。